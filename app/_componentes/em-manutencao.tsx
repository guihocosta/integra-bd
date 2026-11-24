"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const INTERVALO = 30;

interface Props {
  error: unknown;
  retry: () => void;
}

/**
 * Tela mostrada quando uma página não consegue carregar. Na prática, quase sempre é o banco
 * fora do ar ou sem vagas de conexão: a tela tenta de novo sozinha a cada 30 segundos.
 */
export function EmManutencao({ error, retry }: Props) {
  const [segundos, setSegundos] = useState(INTERVALO);
  const [tentando, iniciar] = useTransition();
  const codigo = error instanceof Error && "digest" in error ? String(error.digest) : null;

  const tentar = useCallback(() => {
    setSegundos(INTERVALO);
    iniciar(() => retry());
  }, [retry]);

  // Contagem regressiva; ao chegar a zero, tenta de novo e recomeça.
  const restante = useRef(INTERVALO);
  useEffect(() => {
    const relogio = setInterval(() => {
      restante.current -= 1;
      if (restante.current <= 0) {
        restante.current = INTERVALO;
        tentar();
      } else setSegundos(restante.current);
    }, 1000);
    return () => clearInterval(relogio);
  }, [tentar]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-borda bg-white px-8 py-10 text-center shadow-sm">
        <Ilustracao />
        <p className="mt-6 text-xs font-semibold tracking-wider text-marca uppercase">Integra</p>
        <h1 className="mt-1 text-2xl font-bold">Voltamos em instantes</h1>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-suave">
          O sistema está passando por uma instabilidade e não conseguiu falar com o banco de dados. Suas atividades e
          comprovantes estão salvos e nada foi perdido.
        </p>

        <button
          type="button"
          onClick={tentar}
          disabled={tentando}
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-marca px-5 py-3 text-[13px] font-medium text-white hover:bg-marca-escura disabled:opacity-60"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={tentando ? "animate-spin" : ""}
            aria-hidden
          >
            <path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />
          </svg>
          {tentando ? "Tentando…" : "Tentar agora"}
        </button>

        <p className="mt-3 text-[11px] text-suave" aria-live="polite">
          {tentando ? "Reconectando ao banco…" : `Nova tentativa automática em ${Math.max(segundos, 0)} s`}
        </p>

        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-fundo">
          <div
            className="h-full rounded-full bg-marca/60 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(1 - Math.max(segundos, 0) / INTERVALO) * 100}%` }}
          />
        </div>

        {codigo && <p className="mt-6 text-[10px] text-suave/70">Código para suporte: {codigo}</p>}
      </div>
    </div>
  );
}

function Ilustracao() {
  // Engrenagens girando devagar, nas cores do Ifes.
  return (
    <div className="relative mx-auto h-24 w-28" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-marca-clara" />
      <svg viewBox="0 0 24 24" className="absolute top-3 left-4 h-14 w-14 animate-[spin_6s_linear_infinite] text-marca">
        <Engrenagem />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute right-3 bottom-3 h-9 w-9 animate-[spin_4s_linear_infinite_reverse] text-[#d92d20]"
      >
        <Engrenagem />
      </svg>
    </div>
  );
}

function Engrenagem() {
  return (
    <path
      fill="currentColor"
      d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.5 7.5 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.5 7.5 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.5 7.5 0 0 0 1.7 1L11 21h4l.4-2.9a7.5 7.5 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
      transform="translate(-1 0)"
    />
  );
}
