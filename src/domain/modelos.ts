// Entidades do domínio, no formato em que as camadas de cima trabalham.
// Datas são strings ISO (AAAA-MM-DD), como o PostgreSQL devolve o tipo DATE.

export type StatusAtividade = "CADASTRADA" | "EM_AVALIACAO" | "APROVADA" | "REJEITADA";

export const ROTULO_STATUS: Record<StatusAtividade, string> = {
  CADASTRADA: "Cadastrada",
  EM_AVALIACAO: "Em avaliação",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

export interface Eixo {
  id: number;
  descricao: string;
  limitePontos: number;
}

export interface TipoDeAtividade {
  id: number;
  descricao: string;
  unidade: string;
  pontosPorUnidade: number;
  exigeRelacaoCurso: boolean;
  ativo: boolean;
  eixo: Eixo;
}

export interface Estudante {
  matricula: string;
  nome: string;
  email: string;
  dataIngresso: string;
  situacaoMatricula: string;
  ppc: { id: number; semestreAtivo: string; pontosMinimos: number };
}

export interface Comprovante {
  nomeArquivo: string;
  hash: string;
  pathArquivo: string;
  dataEnvio: string;
}

export interface Avaliacao {
  status: string;
  resultado: string | null;
  data: string | null;
  justificativa: string | null;
}

export interface Atividade {
  id: number;
  estudanteMatricula: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  dataCadastro: string;
  quantidadeUnidades: number;
  declarouNaoUso: boolean;
  status: StatusAtividade;
  /** Tipo informado pelo estudante. */
  tipo: TipoDeAtividade;
  /** Preenchido só quando o avaliador corrigiu o tipo. */
  tipoConfirmado: TipoDeAtividade | null;
  /** Preenchida só quando o avaliador corrigiu a quantidade. */
  quantidadeConfirmada: number | null;
  pedidoDeAvaliacaoId: number | null;
  comprovante: Comprovante | null;
  avaliacao: Avaliacao | null;
}
