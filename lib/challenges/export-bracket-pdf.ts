/**
 * Export PDF du tableau FIFA — téléchargement réel via jsPDF
 */

import { jsPDF } from 'jspdf'
import type { BracketRound } from '@/components/challenges/challenge-tournament-bracket'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function downloadBracketPdf(opts: {
  title: string
  subtitle?: string
  rounds: BracketRound[]
  challengeName?: string
}) {
  const { title, subtitle, rounds, challengeName } = opts
  const dateLabel = new Date().toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 12
  let y = margin

  // En-tête
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('BRACKET  ·  STYLE FIFA', margin, y)

  y += 8
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(15, 23, 42)
  doc.text(title, margin, y, { maxWidth: pageW - margin * 2 })

  y += 7
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(subtitle, margin, y, { maxWidth: pageW - margin * 2 })
    y += 6
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(challengeName || title, margin, y)
  doc.text(`Exporte le ${dateLabel}`, pageW - margin, y, { align: 'right' })

  y += 3
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // Colonnes des tours
  const count = Math.max(rounds.length, 1)
  const gap = 4
  const usable = pageW - margin * 2 - gap * (count - 1)
  const colW = usable / count
  const colTop = y
  const colBottom = pageH - margin - 10

  rounds.forEach((round, index) => {
    const x = margin + index * (colW + gap)
    const isActive = Boolean(round.isActive)

    // Fond colonne
    if (isActive) {
      doc.setFillColor(255, 251, 235)
      doc.setDrawColor(201, 162, 39)
    } else {
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(203, 213, 225)
    }
    doc.setLineWidth(0.4)
    doc.roundedRect(x, colTop, colW, colBottom - colTop, 2, 2, 'FD')

    // Titre tour
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(round.name, x + colW / 2, colTop + 8, {
      align: 'center',
      maxWidth: colW - 6,
    })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    const status = isActive
      ? 'Tour actif'
      : `${round.candidates.length} talent(s)`
    doc.text(status, x + colW / 2, colTop + 13, { align: 'center' })

    // Candidats
    let slotY = colTop + 18
    const slotH = 14
    const list =
      round.candidates.length > 0
        ? round.candidates
        : [{ id: 'empty', fullName: 'Aucun talent', candidateCode: null, number: null }]

    for (let i = 0; i < list.length; i++) {
      if (slotY + slotH > colBottom - 4) {
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`+${list.length - i} autres…`, x + 3, slotY + 4)
        break
      }

      const c = list[i]
      const empty = c.id === 'empty'

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(x + 2.5, slotY, colW - 5, slotH - 2, 1.5, 1.5, 'FD')

      // Numéro
      doc.setFillColor(15, 23, 42)
      doc.roundedRect(x + 4.5, slotY + 2.5, 6, 6, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(255, 255, 255)
      const num =
        c.number != null ? String(c.number) : empty ? '·' : String(i + 1)
      doc.text(num, x + 7.5, slotY + 6.5, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(empty ? 148 : 15, empty ? 163 : 23, empty ? 184 : 42)
      doc.text(c.fullName, x + 12.5, slotY + 5.5, {
        maxWidth: colW - 16,
      })

      if (c.candidateCode) {
        doc.setFont('courier', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(100, 116, 139)
        doc.text(c.candidateCode, x + 12.5, slotY + 10, {
          maxWidth: colW - 16,
        })
      }

      slotY += slotH
    }

    // Flèche entre colonnes
    if (index < rounds.length - 1) {
      const ax = x + colW + gap / 2
      const ay = colTop + (colBottom - colTop) / 2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(148, 163, 184)
      doc.text('>', ax, ay, { align: 'center' })
    }
  })

  // Pied de page
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    'Document genere depuis OMA / JoyStudio',
    margin,
    pageH - 5
  )

  const filename = `bracket-${slugify(challengeName || title) || 'tournoi'}.pdf`
  doc.save(filename)
}
