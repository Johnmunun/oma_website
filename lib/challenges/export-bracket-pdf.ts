/**
 * Export du tableau FIFA en PDF (via impression navigateur → Enregistrer en PDF)
 */

import type { BracketRound } from '@/components/challenges/challenge-tournament-bracket'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function openBracketPdfExport(opts: {
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

  const roundsHtml = rounds
    .map((round) => {
      const candidates =
        round.candidates.length > 0
          ? round.candidates
              .map(
                (c, i) => `
            <div class="slot">
              <span class="num">${c.number ?? i + 1}</span>
              <div>
                <div class="name">${escapeHtml(c.fullName)}</div>
                ${
                  c.candidateCode
                    ? `<div class="code">${escapeHtml(c.candidateCode)}</div>`
                    : ''
                }
              </div>
            </div>`
              )
              .join('')
          : `<div class="slot empty"><span class="num">·</span><div class="name">Aucun talent</div></div>`

      return `
        <section class="round ${round.isActive ? 'active' : ''}">
          <header>
            <h2>${escapeHtml(round.name)}</h2>
            <p>${round.isActive ? 'Tour actif' : `${round.candidates.length} talent(s)`}</p>
          </header>
          <div class="slots">${candidates}</div>
        </section>`
    })
    .join('<div class="arrow">→</div>')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — Tableau PDF</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      color: #0f172a;
      background: #fff;
    }
    .sheet { padding: 8px 4px; }
    .brand {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #64748b;
      font-family: system-ui, sans-serif;
      font-weight: 700;
    }
    h1 {
      margin: 6px 0 4px;
      font-size: 26px;
      line-height: 1.15;
    }
    .sub {
      margin: 0 0 18px;
      color: #475569;
      font-size: 13px;
      font-family: system-ui, sans-serif;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 0;
      margin-bottom: 18px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #64748b;
    }
    .board {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .round {
      flex: 1 1 0;
      min-width: 160px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      background: #f8fafc;
    }
    .round.active {
      border-color: #c9a227;
      box-shadow: inset 0 0 0 1px #c9a227;
      background: #fffbeb;
    }
    .round header {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      background: #fff;
    }
    .round.active header { background: #fef3c7; }
    .round h2 {
      margin: 0;
      font-size: 15px;
    }
    .round header p {
      margin: 2px 0 0;
      font-size: 10px;
      color: #64748b;
      font-family: system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .slots { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
    .slot {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid #e2e8f0;
    }
    .slot.empty { opacity: 0.55; }
    .num {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #0f172a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-family: system-ui, sans-serif;
      font-weight: 700;
      flex-shrink: 0;
    }
    .name { font-size: 12px; font-weight: 700; }
    .code {
      font-size: 10px;
      color: #64748b;
      font-family: ui-monospace, monospace;
      margin-top: 1px;
    }
    .arrow {
      align-self: center;
      color: #94a3b8;
      font-size: 18px;
      font-family: system-ui, sans-serif;
      padding: 0 2px;
    }
    .footer {
      margin-top: 18px;
      font-size: 10px;
      color: #94a3b8;
      font-family: system-ui, sans-serif;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="brand">Bracket · style FIFA</div>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    <div class="meta">
      <span>${escapeHtml(challengeName || title)}</span>
      <span>Exporté le ${escapeHtml(dateLabel)}</span>
    </div>
    <div class="board">${roundsHtml}</div>
    <p class="footer">Document généré depuis l’administration OMA / JoyStudio. Utilisez « Enregistrer au format PDF » dans la boîte d’impression.</p>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 250);
    };
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800')
  if (!win) {
    throw new Error('Pop-up bloquée — autorisez les fenêtres pour exporter le PDF')
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}
