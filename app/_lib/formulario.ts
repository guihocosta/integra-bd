import type { ErrosPorCampo } from "@/dominio/regras";

/** O que a action devolve ao formulário de atividade. */
export interface EstadoFormulario {
  ok: boolean;
  mensagem?: string;
  erros?: ErrosPorCampo;
  /** Incrementa a cada envio, para o formulário saber que recebeu uma resposta nova. */
  envio: number;
}

export const ESTADO_INICIAL: EstadoFormulario = { ok: false, envio: 0 };
