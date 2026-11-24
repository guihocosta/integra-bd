// Contratos que a camada de aplicação espera da infraestrutura.
// O serviço depende só destas interfaces; as implementações ficam em src/infra.

import type { Atividade, Comprovante, Estudante, TipoDeAtividade } from "@/dominio/modelos";
import type { DadosAtividade } from "@/dominio/regras";

export interface RepositorioEstudantes {
  listar(): Promise<Estudante[]>;
  buscar(matricula: string): Promise<Estudante | null>;
}

export interface RepositorioTipos {
  listarDoPpc(ppcId: number): Promise<TipoDeAtividade[]>;
  buscar(id: number): Promise<TipoDeAtividade | null>;
}

export interface NovaAtividade extends DadosAtividade {
  id: number;
  estudanteMatricula: string;
  dataCadastro: string;
}

export interface RepositorioAtividades {
  listarDoEstudante(matricula: string): Promise<Atividade[]>;
  buscar(id: number): Promise<Atividade | null>;
  /** Pontos por eixo das atividades que contam no progresso (todas menos as rejeitadas). */
  pontosPorEixo(matricula: string, excetoAtividadeId?: number): Promise<Map<number, number>>;
  /** RN05: o hash já está em alguma atividade que não foi rejeitada? */
  hashEmUso(hash: string, excetoAtividadeId?: number): Promise<boolean>;
  /** Reserva o próximo id, para o caminho do comprovante existir antes da gravação. */
  reservarId(): Promise<number>;
  /** Grava a atividade e o comprovante na mesma transação. */
  inserir(atividade: NovaAtividade, comprovante: Comprovante): Promise<void>;
  /** Altera os dados e, se vier, troca o comprovante, na mesma transação. */
  atualizar(id: number, dados: DadosAtividade, comprovante: Comprovante | null): Promise<void>;
  /** Exclui o comprovante e a atividade na mesma transação. */
  excluir(id: number): Promise<void>;
}

export interface ArquivoAberto {
  conteudo: ReadableStream<Uint8Array>;
  tipoMime: string;
}

export interface ArmazemComprovantes {
  salvar(caminho: string, conteudo: Uint8Array, tipoMime: string): Promise<void>;
  abrir(caminho: string): Promise<ArquivoAberto | null>;
  remover(caminho: string): Promise<void>;
}
