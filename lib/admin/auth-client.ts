export function getPublicAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmailClient(email?: string | null): boolean {
  if (!email) return false
  return getPublicAdminEmails().includes(email.toLowerCase())
}


















