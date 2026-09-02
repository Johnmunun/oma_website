import { PrismaClient } from '@prisma/client'
import { seedJoyStudio } from '../prisma/seed-joystudio'

const prisma = new PrismaClient()

seedJoyStudio(prisma)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
