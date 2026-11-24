import { asc, eq } from "drizzle-orm";
import type { RepositorioTipos } from "@/application/portas";
import type { TipoDeAtividade } from "@/domain/modelos";
import type { Banco } from "../banco/conexao";
import { eixo, tipoDeAtividade } from "../banco/esquema";

export class RepositorioTiposPg implements RepositorioTipos {
  constructor(private readonly db: () => Banco) {}

  private consulta() {
    return this.db()
      .select({
        id: tipoDeAtividade.id,
        descricao: tipoDeAtividade.descricao,
        unidade: tipoDeAtividade.unidade,
        pontosPorUnidade: tipoDeAtividade.pontosPorUnidade,
        exigeRelacaoCurso: tipoDeAtividade.exigeRelacaoCurso,
        ativo: tipoDeAtividade.ativo,
        eixo: { id: eixo.id, descricao: eixo.descricao, limitePontos: eixo.limitePontos },
      })
      .from(tipoDeAtividade)
      .innerJoin(eixo, eq(eixo.id, tipoDeAtividade.eixoId));
  }

  async listarDoPpc(ppcId: number): Promise<TipoDeAtividade[]> {
    return this.consulta().where(eq(eixo.ppcId, ppcId)).orderBy(asc(eixo.id), asc(tipoDeAtividade.id));
  }

  async buscar(id: number): Promise<TipoDeAtividade | null> {
    const [linha] = await this.consulta().where(eq(tipoDeAtividade.id, id));
    return linha ?? null;
  }
}
