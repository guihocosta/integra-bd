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
        className="flex items-center justify-center gap-2 rounded-lg bg-marca px-4 py-3 text-[13px] font-medium text-white hover:bg-marca-escura disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {confirmando ? (
          <>
            <span className="w-full self-center text-xs text-suave sm:w-auto">Excluir a atividade e o comprovante?</span>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="flex-1 rounded-lg border border-borda bg-white px-3 py-2.5 text-[13px] hover:bg-fundo sm:flex-none sm:py-2"
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
              className="flex-1 rounded-lg bg-alerta px-3 py-2.5 text-[13px] sm:flex-none sm:py-2 font-medium text-white disabled:opacity-60"
            >
              {excluindo ? "Excluindo…" : "Confirmar exclusão"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="flex-1 rounded-lg border border-alerta/40 bg-white px-3 py-2.5 text-[13px] sm:flex-none sm:py-2 text-alerta hover:bg-alerta-claro"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="flex-1 rounded-lg bg-marca px-3 py-2.5 text-[13px] font-medium text-white hover:bg-marca-escura sm:flex-none sm:py-2"
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
