/**
 * @file prisma/seed.ts
 * @description Script de seed pour initialiser la base de données
 * Crée : un admin user, settings par défaut, et un contact d'exemple
 */

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...')

  // ============================================
  // 1. CRÉER UN UTILISATEUR ADMIN
  // ============================================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@oma.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrateur OMA',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Utilisateur admin créé:', admin.email)

  // ============================================
  // 2. CRÉER LES PARAMÈTRES DU SITE (SETTING)
  // ============================================
  const setting = await prisma.setting.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      siteTitle: 'Réseau OMA & OMA TV',
      siteDescription:
        'Plateforme internationale de formation en communication et leadership',
      logoUrl: '/placeholder-logo.png',
      primaryColor: '#f97316',
      secondaryColor: '#1a1a1a',
      fontFamily: 'Playfair Display',
      // Couleurs shadcn dynamiques (orange/or par défaut)
      colorBackground: '#fefcfb',
      colorForeground: '#1a1a1a',
      colorCard: '#ffffff',
      colorCardForeground: '#1a1a1a',
      colorPrimary: '#0a0a0a',
      colorPrimaryForeground: '#fefcfb',
      colorSecondary: '#f97316',
      colorSecondaryForeground: '#1a1a1a',
      colorMuted: '#f7f5f3',
      colorMutedForeground: '#71717a',
      colorAccent: '#f97316',
      colorAccentForeground: '#1a1a1a',
      colorBorder: '#e4e4e7',
      colorInput: '#ffffff',
      colorRing: '#f97316',
      colorGold: '#f97316',
      colorGoldDark: '#ea580c',
      colorGoldLight: '#fb923c',
    },
  })

  console.log('✅ Paramètres du site créés')

  // ============================================
  // 3. CRÉER UN CONTACT D'EXEMPLE
  // ============================================
  const contact = await prisma.contact.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'contact@oma.com',
      telephones: ['+243900000000', '+243970000000'],
      facebook: 'https://facebook.com/reseauoma',
      instagram: 'https://instagram.com/reseauoma',
      youtube: 'https://youtube.com/@reseauoma',
      twitter: 'https://twitter.com/reseauoma',
      linkedin: 'https://linkedin.com/company/reseauoma',
    },
  })

  console.log('✅ Contact d\'exemple créé')

  // ============================================
  // 4. CRÉER UN UTILISATEUR EDITOR (optionnel)
  // ============================================
  const editorEmail = 'editor@oma.com'
  const editorPassword = await bcrypt.hash('Editor123!', 10)

  const editor = await prisma.user.upsert({
    where: { email: editorEmail },
    update: {},
    create: {
      email: editorEmail,
      password: editorPassword,
      name: 'Éditeur OMA',
      role: UserRole.EDITOR,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Utilisateur éditeur créé:', editor.email)

  console.log('\n🎉 Seed terminé avec succès!')
  console.log('\n📋 Informations de connexion:')
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`)
  console.log(`   Editor: ${editorEmail} / Editor123!`)
  console.log('\n⚠️  Changez ces mots de passe en production!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

