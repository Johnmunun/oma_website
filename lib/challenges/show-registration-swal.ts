import Swal from 'sweetalert2'

type RegistrationSuccessSwalInput = {
  message: string
  fullName: string
  email: string
  candidateCode?: string
  challengeName: string
  structureName: string
}

type RegistrationErrorSwalInput = {
  message: string
}

export async function showRegistrationSuccessSwal(input: RegistrationSuccessSwalInput) {
  const codeBlock = input.candidateCode
    ? `<p style="margin:16px 0 0;font-size:14px;color:#475569">Votre numéro candidat</p>
       <p style="margin:6px 0 0;font-family:ui-monospace,monospace;font-size:22px;font-weight:700;color:#0f172a">${input.candidateCode}</p>
       <p style="margin:8px 0 0;font-size:12px;color:#64748b">Conservez ce code pour le suivi de votre candidature. Le vote public se fait par email, sans ce code.</p>`
    : ''

  await Swal.fire({
    icon: 'success',
    title: 'Inscription reçue !',
    html: `
      <p style="margin:0;font-size:15px;color:#334155;line-height:1.6">${input.message}</p>
      <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;text-align:left">
        <p style="margin:0;font-size:13px;color:#64748b">Challenge</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a">${input.challengeName}</p>
        <p style="margin:12px 0 0;font-size:14px;color:#475569">Candidat : <strong>${input.fullName}</strong></p>
        <p style="margin:4px 0 0;font-size:14px;color:#475569">${input.email}</p>
        ${codeBlock}
        <p style="margin:16px 0 0;font-size:13px;color:#475569">
          Votre dossier est <strong>en cours d'examen</strong>. ${input.structureName} vous contactera après validation.
        </p>
      </div>
    `,
    confirmButtonText: 'Parfait',
    confirmButtonColor: '#0f766e',
    width: 520,
  })
}

export async function showRegistrationErrorSwal(input: RegistrationErrorSwalInput) {
  await Swal.fire({
    icon: 'error',
    title: 'Inscription impossible',
    text: input.message,
    confirmButtonText: 'Réessayer',
    confirmButtonColor: '#dc2626',
  })
}
