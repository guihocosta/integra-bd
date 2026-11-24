import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as esquema from "./esquema";

export type Banco = NodePgDatabase<typeof esquema>;

// O plano gratuito do Aiven aceita poucas conexões, e a Vercel pode subir várias instâncias
// da função ao mesmo tempo. Cada instância fica com no máximo uma conexão, que fecha quando
// fica ociosa, para não esgotar as vagas do banco.
const LIMITES: PoolConfig = { max: 1, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 };

/**
 * Monta a configuração do pool a partir das variáveis de ambiente:
 * - DATABASE_URL: string de conexão (no Aiven, a "Service URI");
 * - DATABASE_CA_CERT: certificado da CA do Aiven (PEM). Com ele, a conexão usa TLS verificando o servidor.
 */
function configuracao(): PoolConfig {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida. Veja o README.");

  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  if (!ca) return { connectionString: url, ...LIMITES };

  // O sslmode da URL sobrescreveria o objeto ssl abaixo; quem manda é o certificado.
  const semSslMode = new URL(url);
  semSslMode.searchParams.delete("sslmode");
  return { connectionString: semSslMode.toString(), ssl: { ca, rejectUnauthorized: true }, ...LIMITES };
}

// Um pool por instância do servidor; em desenvolvimento, sobrevive ao hot reload.
const global = globalThis as unknown as { integraBanco?: Banco };

export function banco(): Banco {
  if (!global.integraBanco) {
    const pool = new Pool(configuracao());
    // Na Vercel, fecha as conexões ociosas antes de a instância ser suspensa.
    attachDatabasePool(pool);
    global.integraBanco = drizzle(pool, { schema: esquema });
  }
  return global.integraBanco;
}
