import { defineConfig } from "drizzle-kit";

// Usado só para gerar o mapeamento a partir do banco (npx drizzle-kit pull).
// O esquema oficial é o de db/01-esquema.sql.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/banco/esquema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://integra:integra@localhost:5432/integra" },
});
