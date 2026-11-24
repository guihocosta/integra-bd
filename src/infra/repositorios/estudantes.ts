import { asc, eq } from "drizzle-orm";
import type { RepositorioEstudantes } from "@/aplicacao/portas";
import type { Estudante } from "@/dominio/modelos";
import type { Banco } from "../banco/conexao";
import { estudante, ppc } from "../banco/esquema";

export class RepositorioEstudantesPg implements RepositorioEstudantes {
  constructor(private readonly db: () => Banco) {}

  private consulta() {
    return this.db()
      .select({
        matricula: estudante.matricula,
        nome: estudante.nome,
        email: estudante.email,
        dataIngresso: estudante.dataIngresso,
        situacaoMatricula: estudante.situacaoMatricula,
        ppc: { id: ppc.id, semestreAtivo: ppc.semestreAtivo, pontosMinimos: ppc.pontosMinimos },
      })
      .from(estudante)
      .innerJoin(ppc, eq(ppc.id, estudante.ppcId));
  }

  async listar(): Promise<Estudante[]> {
    return this.consulta().orderBy(asc(estudante.nome));
  }

  async buscar(matricula: string): Promise<Estudante | null> {
    const [linha] = await this.consulta().where(eq(estudante.matricula, matricula));
    return linha ?? null;
  }
}
