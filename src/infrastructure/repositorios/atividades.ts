import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { NovaAtividade, RepositorioAtividades } from "@/application/portas";
import type { Atividade, Comprovante, StatusAtividade, TipoDeAtividade } from "@/domain/modelos";
import type { DadosAtividade } from "@/domain/regras";
import type { Banco } from "../banco/conexao";
import { atividade, avaliacao, comprovante, eixo, tipoDeAtividade } from "../banco/esquema";

// A atividade liga duas vezes em TIPO_DE_ATIVIDADE: o tipo informado e o confirmado pelo avaliador.
const tipoInformado = alias(tipoDeAtividade, "tipo_informado");
const eixoInformado = alias(eixo, "eixo_informado");
const tipoConfirmado = alias(tipoDeAtividade, "tipo_confirmado");
const eixoConfirmado = alias(eixo, "eixo_confirmado");
// Tipo que vale (RN03): o confirmado, se houver; senão, o informado.
const tipoQueVale = alias(tipoDeAtividade, "tipo_que_vale");

interface LinhaTipo {
  id: number;
  descricao: string;
  unidade: string;
  pontosPorUnidade: number;
  exigeRelacaoCurso: boolean;
  ativo: boolean;
  eixoId: number;
  eixoDescricao: string;
  eixoLimite: number;
}

function montarTipo(linha: LinhaTipo): TipoDeAtividade {
  return {
    id: linha.id,
    descricao: linha.descricao,
    unidade: linha.unidade,
    pontosPorUnidade: linha.pontosPorUnidade,
    exigeRelacaoCurso: linha.exigeRelacaoCurso,
    ativo: linha.ativo,
    eixo: { id: linha.eixoId, descricao: linha.eixoDescricao, limitePontos: linha.eixoLimite },
  };
}

export class RepositorioAtividadesPg implements RepositorioAtividades {
  constructor(private readonly db: () => Banco) {}

  private consulta() {
    return this.db()
      .select({
        atividade,
        informado: {
          id: tipoInformado.id,
          descricao: tipoInformado.descricao,
          unidade: tipoInformado.unidade,
          pontosPorUnidade: tipoInformado.pontosPorUnidade,
          exigeRelacaoCurso: tipoInformado.exigeRelacaoCurso,
          ativo: tipoInformado.ativo,
          eixoId: eixoInformado.id,
          eixoDescricao: eixoInformado.descricao,
          eixoLimite: eixoInformado.limitePontos,
        },
        confirmado: {
          id: tipoConfirmado.id,
          descricao: tipoConfirmado.descricao,
          unidade: tipoConfirmado.unidade,
          pontosPorUnidade: tipoConfirmado.pontosPorUnidade,
          exigeRelacaoCurso: tipoConfirmado.exigeRelacaoCurso,
          ativo: tipoConfirmado.ativo,
          eixoId: eixoConfirmado.id,
          eixoDescricao: eixoConfirmado.descricao,
          eixoLimite: eixoConfirmado.limitePontos,
        },
        comprovante,
        avaliacao,
      })
      .from(atividade)
      .innerJoin(tipoInformado, eq(tipoInformado.id, atividade.tipoDeAtividadeId))
      .innerJoin(eixoInformado, eq(eixoInformado.id, tipoInformado.eixoId))
      .leftJoin(tipoConfirmado, eq(tipoConfirmado.id, atividade.tipoDeAtividadeConfirmadaId))
      .leftJoin(eixoConfirmado, eq(eixoConfirmado.id, tipoConfirmado.eixoId))
      .leftJoin(comprovante, eq(comprovante.atividadeId, atividade.id))
      .leftJoin(avaliacao, eq(avaliacao.atividadeId, atividade.id));
  }

  private montar(linha: Awaited<ReturnType<RepositorioAtividadesPg["consulta"]>>[number]): Atividade {
    const a = linha.atividade;
    return {
      id: a.id,
      estudanteMatricula: a.estudanteMatricula,
      descricao: a.descricao,
      dataInicio: a.dataInicio,
      dataFim: a.dataFim,
      dataCadastro: a.dataCadastro,
      quantidadeUnidades: a.quantidadeUnidades,
      declarouNaoUso: a.declarouNaoUso,
      status: a.status as StatusAtividade,
      tipo: montarTipo(linha.informado),
      // Left join: sem tipo confirmado, as colunas vêm todas nulas.
      tipoConfirmado: linha.confirmado.id !== null ? montarTipo(linha.confirmado as LinhaTipo) : null,
      quantidadeConfirmada: a.quantidadeConfirmada,
      pedidoDeAvaliacaoId: a.pedidoDeAvaliacaoId,
      comprovante: linha.comprovante && {
        nomeArquivo: linha.comprovante.nomeArquivo,
        hash: linha.comprovante.hash,
        pathArquivo: linha.comprovante.pathArquivo,
        dataEnvio: linha.comprovante.dataEnvio,
      },
      avaliacao: linha.avaliacao && {
        status: linha.avaliacao.status,
        resultado: linha.avaliacao.resultado,
        data: linha.avaliacao.data,
        justificativa: linha.avaliacao.justificativa,
      },
    };
  }

  async listarDoEstudante(matricula: string): Promise<Atividade[]> {
    const linhas = await this.consulta()
      .where(eq(atividade.estudanteMatricula, matricula))
      .orderBy(desc(atividade.dataCadastro), desc(atividade.id));
    return linhas.map((l) => this.montar(l));
  }

  async buscar(id: number): Promise<Atividade | null> {
    const [linha] = await this.consulta().where(eq(atividade.id, id));
    return linha ? this.montar(linha) : null;
  }

  async pontosPorEixo(matricula: string, excetoAtividadeId?: number): Promise<Map<number, number>> {
    const linhas = await this.db()
      .select({
        eixoId: tipoQueVale.eixoId,
        pontos: sql<number>`sum(coalesce(${atividade.quantidadeConfirmada}, ${atividade.quantidadeUnidades}) * ${tipoQueVale.pontosPorUnidade})::int`,
      })
      .from(atividade)
      .innerJoin(
        tipoQueVale,
        eq(tipoQueVale.id, sql`coalesce(${atividade.tipoDeAtividadeConfirmadaId}, ${atividade.tipoDeAtividadeId})`),
      )
      .where(
        and(
          eq(atividade.estudanteMatricula, matricula),
          ne(atividade.status, "REJEITADA"),
          excetoAtividadeId === undefined ? undefined : ne(atividade.id, excetoAtividadeId),
        ),
      )
      .groupBy(tipoQueVale.eixoId)
      .orderBy(asc(tipoQueVale.eixoId));
    return new Map(linhas.map((l) => [l.eixoId, l.pontos]));
  }

  async hashEmUso(hash: string, excetoAtividadeId?: number): Promise<boolean> {
    const [linha] = await this.db()
      .select({ id: atividade.id })
      .from(comprovante)
      .innerJoin(atividade, eq(atividade.id, comprovante.atividadeId))
      .where(
        and(
          eq(comprovante.hash, hash),
          // RN05: o mesmo arquivo pode voltar se as atividades anteriores com ele foram rejeitadas.
          ne(atividade.status, "REJEITADA"),
          excetoAtividadeId === undefined ? undefined : ne(atividade.id, excetoAtividadeId),
        ),
      )
      .limit(1);
    return linha !== undefined;
  }

  async reservarId(): Promise<number> {
    const resultado = await this.db().execute<{ id: number }>(
      sql`select nextval(pg_get_serial_sequence('atividade', 'id'))::int as id`,
    );
    return resultado.rows[0].id;
  }

  async inserir(nova: NovaAtividade, arquivo: Comprovante): Promise<void> {
    await this.db().transaction(async (tx) => {
      await tx.insert(atividade).values({
        id: nova.id,
        estudanteMatricula: nova.estudanteMatricula,
        tipoDeAtividadeId: nova.tipoId,
        descricao: nova.descricao,
        dataInicio: nova.dataInicio,
        dataFim: nova.dataFim,
        quantidadeUnidades: nova.quantidadeUnidades,
        declarouNaoUso: nova.declarouNaoUso,
        dataCadastro: nova.dataCadastro,
        status: "CADASTRADA",
      });
      await tx.insert(comprovante).values({ ...arquivo, atividadeId: nova.id });
    });
  }

  async atualizar(id: number, dados: DadosAtividade, arquivo: Comprovante | null): Promise<void> {
    await this.db().transaction(async (tx) => {
      await tx
        .update(atividade)
        .set({
          tipoDeAtividadeId: dados.tipoId,
          descricao: dados.descricao,
          dataInicio: dados.dataInicio,
          dataFim: dados.dataFim,
          quantidadeUnidades: dados.quantidadeUnidades,
          declarouNaoUso: dados.declarouNaoUso,
        })
        .where(eq(atividade.id, id));
      if (arquivo) {
        await tx
          .insert(comprovante)
          .values({ ...arquivo, atividadeId: id })
          .onConflictDoUpdate({ target: comprovante.atividadeId, set: arquivo });
      }
    });
  }

  async excluir(id: number): Promise<void> {
    await this.db().transaction(async (tx) => {
      await tx.delete(comprovante).where(eq(comprovante.atividadeId, id));
      await tx.delete(atividade).where(eq(atividade.id, id));
    });
  }
}
