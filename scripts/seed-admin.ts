import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean)
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!'

  if (!url || !serviceKey) throw new Error('Missing SUPABASE config (URL or SERVICE ROLE KEY)')
  if (adminEmails.length === 0) throw new Error('No ADMIN_EMAILS provided')

  const supabase = createClient(url, serviceKey)

  for (const email of adminEmails) {
    // Create if not exists: we try to sign up; if exists, ignore error
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
    })
    if (error && !String(error.message).includes('already registered')) {
      console.error('Failed to create admin', email, error)
    } else {
      console.log('Ensured admin user:', email)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})







