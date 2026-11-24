// Regras de negócio do cadastro de atividades. Funções puras: não acessam banco nem arquivo,
// por isso também rodam no navegador (a estimativa do formulário usa as mesmas contas).

import type { Atividade, Estudante, TipoDeAtividade } from "./modelos";

/** Formatos de comprovante aceitos (UC01, E02, fluxo 5a). */
export const FORMATOS_COMPROVANTE = ["pdf", "png", "jpg", "jpeg"] as const;

/** Limite do arquivo. A Vercel recusa requisições acima de 4,5 MB. */
export const TAMANHO_MAXIMO_COMPROVANTE = 4 * 1024 * 1024;

/** RN03: unidades completas × pontos por unidade do tipo. */
export function pontosPorQuantidade(quantidadeUnidades: number, tipo: TipoDeAtividade): number {
  return Math.max(0, Math.floor(quantidadeUnidades)) * tipo.pontosPorUnidade;
}

/** RN03: vale o tipo confirmado pelo avaliador, se houver; senão, o informado. */
export function tipoEfetivo(atividade: Atividade): TipoDeAtividade {
  return atividade.tipoConfirmado ?? atividade.tipo;
}

/** RN03: vale a quantidade confirmada pelo avaliador, se houver; senão, a informada. */
export function quantidadeEfetiva(atividade: Atividade): number {
  return atividade.quantidadeConfirmada ?? atividade.quantidadeUnidades;
}

export function pontosDaAtividade(atividade: Atividade): number {
  return pontosPorQuantidade(quantidadeEfetiva(atividade), tipoEfetivo(atividade));
}

/** Atividades rejeitadas não contam no progresso nem no teto do eixo. */
export function contaNoProgresso(atividade: Atividade): boolean {
  return atividade.status !== "REJEITADA";
}

/** RN10: só a atividade cadastrada e fora de pedido pode ser alterada ou excluída pelo estudante. */
export function podeSerModificada(atividade: Atividade): boolean {
  return atividade.status === "CADASTRADA" && atividade.pedidoDeAvaliacaoId === null;
}

export interface Estimativa {
  pontosAtividade: number;
  pontosNoEixo: number;
  limiteEixo: number;
  /** Quanto desta atividade cabe no eixo antes de bater no teto (RN02). */
  pontosQueContam: number;
  tetoJaAtingido: boolean;
}

/** UC01, E02, passo 6: pontos da atividade e situação do teto do eixo. */
export function estimar(tipo: TipoDeAtividade, quantidadeUnidades: number, pontosNoEixo: number): Estimativa {
  const pontosAtividade = pontosPorQuantidade(quantidadeUnidades, tipo);
  const limiteEixo = tipo.eixo.limitePontos;
  return {
    pontosAtividade,
    pontosNoEixo,
    limiteEixo,
    pontosQueContam: Math.max(0, Math.min(pontosAtividade, limiteEixo - pontosNoEixo)),
    tetoJaAtingido: pontosNoEixo >= limiteEixo,
  };
}

export interface DadosAtividade {
  tipoId: number;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  quantidadeUnidades: number;
  declarouNaoUso: boolean;
}

export type ErrosPorCampo = Partial<Record<keyof DadosAtividade | "comprovante", string>>;

/**
 * Valida os dados informados pelo estudante contra as regras do cadastro.
 * Devolve um erro por campo; objeto vazio quando está tudo certo.
 */
export function validarDadosAtividade(
  dados: DadosAtividade,
  estudante: Estudante,
  tipo: TipoDeAtividade | null,
): ErrosPorCampo {
  const erros: ErrosPorCampo = {};
  const descricao = dados.descricao.trim();

  if (!descricao) erros.descricao = "Informe o título da atividade.";
  else if (descricao.length > 150) erros.descricao = "Use no máximo 150 caracteres.";

  if (!tipo) erros.tipoId = "Escolha um tipo de atividade do seu PPC.";
  else if (!tipo.ativo) erros.tipoId = "Este tipo de atividade não está mais ativo.";

  if (!dados.dataInicio) erros.dataInicio = "Informe a data de início.";
  // RN04: não pontuam atividades realizadas antes do ingresso no curso.
  else if (dados.dataInicio < estudante.dataIngresso)
    erros.dataInicio = "A atividade começou antes do seu ingresso no curso e não pontua (RN04).";

  if (!dados.dataFim) erros.dataFim = "Informe a data de término.";
  else if (dados.dataInicio && dados.dataFim < dados.dataInicio)
    erros.dataFim = "A data de término não pode ser anterior à de início.";

  if (!Number.isInteger(dados.quantidadeUnidades) || dados.quantidadeUnidades <= 0)
    erros.quantidadeUnidades = "Informe a quantidade de unidades completas (número inteiro maior que zero).";

  // RN06: o estudante declara que a atividade não foi usada no estágio obrigatório nem na extensão.
  if (!dados.declarouNaoUso)
    erros.declarouNaoUso = "Sem a declaração a atividade não pode ser registrada (RN06).";

  return erros;
}

export function extensaoDoArquivo(nome: string): string {
  const ponto = nome.lastIndexOf(".");
  return ponto < 0 ? "" : nome.slice(ponto + 1).toLowerCase();
}

/** UC01, E02, fluxo 5a: formato e tamanho do comprovante. */
export function validarArquivoComprovante(nome: string, tamanho: number): string | null {
  if (!(FORMATOS_COMPROVANTE as readonly string[]).includes(extensaoDoArquivo(nome)))
    return "Formato não aceito. Envie o comprovante em PDF, PNG ou JPG.";
  if (tamanho === 0) return "O arquivo está vazio.";
  if (tamanho > TAMANHO_MAXIMO_COMPROVANTE) return "O arquivo passa de 4 MB.";
  return null;
}
