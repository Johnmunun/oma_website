/**
 * OTP email pour confirmer un vote public
 */

import { createHash, randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'
import { normalizeCandidateEmail } from '@/lib/candidates/candidate-schema'
import { sendTransactionalEmail } from '@/lib/nodemailer'
import { PublicVoteError } from '@/lib/votes/public-vote-error'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashOtpCode(code: string): string {
  return createHash('sha256').update(`oma-vote-otp:${code}`).digest('hex')
}

function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export async function issueVoteOtp(opts: {
  challengeId: string
  challengeName: string
  phaseKey: string
  email: string
  structureName?: string
}): Promise<{ sent: boolean }> {
  const email = normalizeCandidateEmail(opts.email)
  if (!email) {
    throw new PublicVoteError('Email invalide', 400)
  }

  const existingVote = await prisma.challengeVote.findUnique({
    where: {
      challengeId_voterKey_phaseId: {
        challengeId: opts.challengeId,
        voterKey: email,
        phaseId: opts.phaseKey,
      },
    },
    select: { id: true },
  })
  if (existingVote) {
    throw new PublicVoteError(
      opts.phaseKey
        ? 'Vous avez déjà voté pour cette phase avec cet email'
        : 'Vous avez déjà voté pour ce concours avec cet email',
      409
    )
  }

  const code = generateOtpCode()
  const codeHash = hashOtpCode(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await prisma.challengeVoteOtp.upsert({
    where: {
      challengeId_phaseId_email: {
        challengeId: opts.challengeId,
        phaseId: opts.phaseKey,
        email,
      },
    },
    create: {
      challengeId: opts.challengeId,
      phaseId: opts.phaseKey,
      email,
      codeHash,
      expiresAt,
      attempts: 0,
    },
    update: {
      codeHash,
      expiresAt,
      attempts: 0,
    },
  })

  const fromName = opts.structureName?.trim() || 'Réseau OMA'
  const html = `
<!DOCTYPE html>
<html lang="fr"><body style="font-family:sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Confirmation de vote</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">${opts.challengeName}</h1>
    <p style="color:#475569;font-size:15px;line-height:1.5;">
      Voici votre code pour confirmer votre vote. Il expire dans <strong>10 minutes</strong>.
    </p>
    <p style="margin:24px 0;text-align:center;font-size:32px;letter-spacing:.35em;font-weight:700;color:#0f172a;">
      ${code}
    </p>
    <p style="color:#94a3b8;font-size:12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
  </div>
</body></html>`

  const sent = await sendTransactionalEmail({
    to: email,
    subject: `Code de vote — ${opts.challengeName}`,
    html,
    text: `Votre code de vote pour ${opts.challengeName} : ${code} (valable 10 minutes)`,
    fromName,
  })

  if (!sent) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[VoteOTP] SMTP indisponible — code dev pour ${email}: ${code}`)
      return { sent: true }
    }
    throw new PublicVoteError(
      "Impossible d'envoyer le code par email. Réessayez dans un instant.",
      503
    )
  }

  return { sent: true }
}

/** Vérifie et consomme l'OTP. Lève PublicVoteError si invalide. */
export async function consumeVoteOtp(opts: {
  challengeId: string
  phaseKey: string
  email: string
  otp: string
}): Promise<void> {
  const email = normalizeCandidateEmail(opts.email)
  const otp = opts.otp.replace(/\s/g, '').trim()
  if (!/^\d{6}$/.test(otp)) {
    throw new PublicVoteError('Code invalide (6 chiffres requis)', 400)
  }

  const row = await prisma.challengeVoteOtp.findUnique({
    where: {
      challengeId_phaseId_email: {
        challengeId: opts.challengeId,
        phaseId: opts.phaseKey,
        email,
      },
    },
  })

  if (!row) {
    throw new PublicVoteError('Demandez d’abord un code par email', 400)
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.challengeVoteOtp.delete({ where: { id: row.id } }).catch(() => {})
    throw new PublicVoteError('Code expiré. Demandez un nouveau code.', 400)
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await prisma.challengeVoteOtp.delete({ where: { id: row.id } }).catch(() => {})
    throw new PublicVoteError('Trop de tentatives. Demandez un nouveau code.', 429)
  }

  const expected = hashOtpCode(otp)
  if (row.codeHash !== expected) {
    await prisma.challengeVoteOtp.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    })
    throw new PublicVoteError('Code incorrect', 400)
  }

  await prisma.challengeVoteOtp.delete({ where: { id: row.id } }).catch(() => {})
}
