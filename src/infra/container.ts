import "server-only";
import path from "node:path";
import { ServicoAtividades } from "@/aplicacao/servico-atividades";
import { ArmazemBlob } from "./armazenamento/blob";
import { ArmazemDiscoLocal } from "./armazenamento/disco-local";
import { banco } from "./banco/conexao";
import { RepositorioAtividadesPg } from "./repositorios/atividades";
import { RepositorioEstudantesPg } from "./repositorios/estudantes";
import { RepositorioTiposPg } from "./repositorios/tipos";

// Raiz de composição: o único lugar que escolhe as implementações concretas de cada porta.

/** Data de hoje no fuso de Brasília, no formato do tipo DATE (AAAA-MM-DD). */
function hoje() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function armazem() {
  // Com o token do Blob (na Vercel ou no .env.local), os arquivos vão para o Blob; sem ele, para o disco.
  if (process.env.BLOB_READ_WRITE_TOKEN) return new ArmazemBlob();
  return new ArmazemDiscoLocal(path.join(process.cwd(), "comprovantes-locais"));
}

export const servicoAtividades = new ServicoAtividades(
  new RepositorioEstudantesPg(banco),
  new RepositorioTiposPg(banco),
  new RepositorioAtividadesPg(banco),
  armazem(),
  hoje,
);
