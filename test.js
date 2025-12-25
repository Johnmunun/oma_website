const { PrismaClient } = require("./lib/generated/prisma/index.js");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connexion réussie à Neon !");
  } catch (e) {
    console.error("Erreur connexion :", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
