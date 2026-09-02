import { CandidateStatus } from '@prisma/client'
import { sendTransactionalEmail } from '@/lib/nodemailer'
import { getChallengeVideoSubmitUrl } from '@/lib/structures/public-url'

export type CandidateEmailContext = {
  fullName: string
  email: string
  parentEmail?: string | null
  challengeName: string
  structureName: string
  structureSlug: string
  challengeSlug: string
  reviewNotes?: string | null
  videoSubmitToken?: string | null
  structure: {
    slug: string
    landingPagePath?: string | null
    subdomain?: string | null
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function emailShell(structureName: string, accent: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table role="presentation" width="100%" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="padding:28px 32px;background:${accent};color:#fff;text-align:center;">
            <p style="margin:0;font-size:13px;opacity:.9;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(structureName)}</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">${body}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendCandidateRegistrationReceivedEmail(
  ctx: CandidateEmailContext
): Promise<boolean> {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111;">Inscription bien reçue</h1>
    <p style="margin:0 0 16px;color:#444;line-height:1.6;">
      Bonjour <strong>${escapeHtml(ctx.fullName)}</strong>,
    </p>
    <p style="margin:0 0 16px;color:#444;line-height:1.6;">
      Nous avons bien enregistré votre candidature pour le challenge
      <strong>${escapeHtml(ctx.challengeName)}</strong>.
    </p>
    <p style="margin:0 0 16px;color:#444;line-height:1.6;">
      Votre dossier est <strong>en cours d'examen</strong>. L'équipe ${escapeHtml(ctx.structureName)}
      vous contactera par email dès qu'une décision aura été prise.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#888;">
      Ceci est un message automatique — merci de ne pas répondre directement à cet email.
    </p>
  `

  return sendTransactionalEmail({
    to: ctx.email,
    subject: `Inscription reçue — ${ctx.challengeName}`,
    html: emailShell(ctx.structureName, '#7c3aed', body),
    fromName: ctx.structureName,
  })
}

export async function sendCandidateStatusEmail(
  status: CandidateStatus.APPROVED | CandidateStatus.REJECTED,
  ctx: CandidateEmailContext
): Promise<boolean> {
  const isApproved = status === CandidateStatus.APPROVED
  const accent = isApproved ? '#059669' : '#dc2626'

  const decisionBlock = isApproved
    ? `<p style="margin:0 0 16px;color:#444;line-height:1.6;">
        Félicitations ! Votre candidature pour <strong>${escapeHtml(ctx.challengeName)}</strong>
        a été <strong style="color:#059669;">validée</strong> par l'équipe ${escapeHtml(ctx.structureName)}.
      </p>
      ${
        ctx.videoSubmitToken
          ? `<div style="margin:20px 0;padding:16px;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
              <p style="margin:0 0 12px;color:#065f46;font-weight:600;">Prochaine étape : déposer votre vidéo</p>
              <p style="margin:0 0 12px;color:#444;line-height:1.6;">
                Utilisez le lien ci-dessous pour soumettre votre prestation (YouTube, Vimeo ou lien direct).
              </p>
              <a href="${escapeHtml(getChallengeVideoSubmitUrl(ctx.structure, ctx.challengeSlug, ctx.videoSubmitToken))}"
                 style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
                Déposer ma vidéo
              </a>
            </div>`
          : `<p style="margin:0 0 16px;color:#444;line-height:1.6;">
              Vous serez contacté prochainement pour les prochaines étapes du challenge.
            </p>`
      }`
    : `<p style="margin:0 0 16px;color:#444;line-height:1.6;">
        Nous vous remercions pour votre candidature au challenge
        <strong>${escapeHtml(ctx.challengeName)}</strong>.
      </p>
      <p style="margin:0 0 16px;color:#444;line-height:1.6;">
        Après examen, votre dossier n'a pas été retenu pour cette édition.
      </p>
      ${
        ctx.reviewNotes?.trim()
          ? `<div style="margin:16px 0;padding:16px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#991b1b;">Message de l'équipe</p>
              <p style="margin:0;color:#444;white-space:pre-wrap;">${escapeHtml(ctx.reviewNotes.trim())}</p>
            </div>`
          : ''
      }
      <p style="margin:0 0 16px;color:#444;line-height:1.6;">
        Nous vous encourageons à rester en contact avec ${escapeHtml(ctx.structureName)} pour les prochaines éditions.
      </p>`

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#111;">
      ${isApproved ? 'Candidature validée' : 'Décision sur votre candidature'}
    </h1>
    <p style="margin:0 0 16px;color:#444;line-height:1.6;">
      Bonjour <strong>${escapeHtml(ctx.fullName)}</strong>,
    </p>
    ${decisionBlock}
    <p style="margin:24px 0 0;font-size:13px;color:#888;">
      Challenge : ${escapeHtml(ctx.challengeName)} · ${escapeHtml(ctx.structureName)}
    </p>
  `

  const subject = isApproved
    ? `Candidature validée — ${ctx.challengeName}`
    : `Décision candidature — ${ctx.challengeName}`

  const sentToCandidate = await sendTransactionalEmail({
    to: ctx.email,
    subject,
    html: emailShell(ctx.structureName, accent, body),
    fromName: ctx.structureName,
  })

  if (ctx.parentEmail && ctx.parentEmail !== ctx.email) {
    await sendTransactionalEmail({
      to: ctx.parentEmail,
      subject: `[${ctx.fullName}] ${subject}`,
      html: emailShell(
        ctx.structureName,
        accent,
        `<p style="color:#444;line-height:1.6;">Message concernant la candidature de <strong>${escapeHtml(ctx.fullName)}</strong> :</p>${body}`
      ),
      fromName: ctx.structureName,
    })
  }

  return sentToCandidate
}

export async function loadCandidateEmailContext(
  candidateId: string
): Promise<CandidateEmailContext | null> {
  const { prisma } = await import('@/lib/prisma')
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      challenge: {
        include: {
          structure: {
            select: {
              name: true,
              slug: true,
              landingPagePath: true,
              subdomain: true,
            },
          },
        },
      },
    },
  })

  if (!candidate) return null

  const structure = candidate.challenge.structure
  const structureSlug =
    structure.landingPagePath?.trim() ||
    structure.subdomain?.trim() ||
    structure.slug

  return {
    fullName: candidate.fullName,
    email: candidate.email,
    parentEmail: candidate.parentEmail,
    challengeName: candidate.challenge.name,
    structureName: structure.name,
    structureSlug,
    challengeSlug: candidate.challenge.slug,
    reviewNotes: candidate.reviewNotes,
    videoSubmitToken: candidate.videoSubmitToken,
    structure: {
      slug: structure.slug,
      landingPagePath: structure.landingPagePath,
      subdomain: structure.subdomain,
    },
  }
}

export async function notifyCandidateStatusChange(
  candidateId: string,
  status: CandidateStatus.APPROVED | CandidateStatus.REJECTED,
  reviewNotes?: string | null
): Promise<void> {
  try {
    const ctx = await loadCandidateEmailContext(candidateId)
    if (!ctx) return
    if (reviewNotes !== undefined) ctx.reviewNotes = reviewNotes
    await sendCandidateStatusEmail(status, ctx)
  } catch (error) {
    console.error('[candidate-notification-email] notifyCandidateStatusChange:', error)
  }
}

export async function notifyCandidateRegistrationReceived(
  candidateId: string
): Promise<void> {
  try {
    const ctx = await loadCandidateEmailContext(candidateId)
    if (!ctx) return
    await sendCandidateRegistrationReceivedEmail(ctx)
  } catch (error) {
    console.error('[candidate-notification-email] notifyCandidateRegistrationReceived:', error)
  }
}
