import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Placeholders for `prisma generate` (no DB connection needed).
 * Real DATABASE_URL / DIRECT_URL must be set for migrate, push, and runtime.
 */
const placeholderUrl = "postgresql://build:build@127.0.0.1:5432/build?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = placeholderUrl;
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
