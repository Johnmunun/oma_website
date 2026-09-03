/** Limites upload Cloudflare Stream (partagées client/serveur, sans secrets) */

export const CLOUDFLARE_MULTIPART_MAX_BYTES = 200 * 1024 * 1024
export const CLOUDFLARE_TUS_MAX_BYTES = 2 * 1024 * 1024 * 1024

export function pickCloudflareUploadMode(fileSize: number): 'multipart' | 'tus' {
  return fileSize > CLOUDFLARE_MULTIPART_MAX_BYTES ? 'tus' : 'multipart'
}

export function formatBytesLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb >= 2048 ? 0 : 1)} Go`
  return `${Math.round(mb)} Mo`
}
