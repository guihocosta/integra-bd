"use client";

import { useCallback, useState, useTransition } from "react";
import type { TipoDeAtividade } from "@/domain/modelos";
import { excluirAtividade } from "../_acoes/atividades";
import { FormularioAtividade, type ValoresAtividade } from "./formulario-atividade";
import { IconeMais } from "./icones";

interface DadosFormulario {
  tipos: TipoDeAtividade[];
  pontosPorEixo: Record<number, number>;
}

/** Botão "Nova atividade" da tela Minhas atividades (E02). */
export function BotaoNovaAtividade(props: DadosFormulario & { desabilitado?: string }) {
  const [aberto, setAberto] = useState(false);
  const fechar = useCallback(() => setAberto(false), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        disabled={Boolean(props.desabilitado)}
        title={props.desabilitado}
        className="flex items-center gap-2 rounded-lg bg-marca px-4 py-3 text-[13px] font-medium text-white hover:bg-marca-escura disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconeMais /> Nova atividade
      </button>
      {aberto && <FormularioAtividade tipos={props.tipos} pontosPorEixo={props.pontosPorEixo} aoFechar={fechar} />}
    </>
  );
}

/** Ações da tela de detalhe: alterar (E03) e excluir (E05). */
export function AcoesAtividade(props: DadosFormulario & { atividade: ValoresAtividade }) {
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, iniciar] = useTransition();
  const fechar = useCallback(() => setEditando(false), []);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {confirmando ? (
          <>
            <span className="self-center text-xs text-suave">Excluir a atividade e o comprovante?</span>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-lg border border-borda bg-white px-3 py-2 text-[13px] hover:bg-fundo"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={excluindo}
              onClick={() =>
                iniciar(async () => {
                  const resultado = await excluirAtividade(props.atividade.id);
                  if (resultado) setErro(resultado.mensagem);
                })
              }
              className="rounded-lg bg-alerta px-3 py-2 text-[13px] font-medium text-white disabled:opacity-60"
            >
              {excluindo ? "Excluindo…" : "Confirmar exclusão"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="rounded-lg border border-alerta/40 bg-white px-3 py-2 text-[13px] text-alerta hover:bg-alerta-claro"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="rounded-lg bg-marca px-3 py-2 text-[13px] font-medium text-white hover:bg-marca-escura"
            >
              Alterar
            </button>
          </>
        )}
      </div>
      {erro && <p className="text-xs text-alerta">{erro}</p>}
      {editando && (
        <FormularioAtividade
          tipos={props.tipos}
          pontosPorEixo={props.pontosPorEixo}
          atividade={props.atividade}
          aoFechar={fechar}
        />
      )}
    </div>
  );
}
