import type { ErrosPorCampo } from "./regras";

/** Uma regra de negócio impediu a operação. A mensagem vai para o usuário. */
export class RegraVioladaError extends Error {
  constructor(
    mensagem: string,
    public readonly campos: ErrosPorCampo = {},
  ) {
    super(mensagem);
    this.name = "RegraVioladaError";
  }
}

/** O registro não existe ou não pertence ao estudante. */
export class NaoEncontradoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "NaoEncontradoError";
  }
}
