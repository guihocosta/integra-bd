"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useEffect } from "react";

// Se o cabeçalho não carregar (banco fora), mostra um aviso no lugar dele em vez de
// derrubar a página inteira, e tenta de novo sozinho a cada 10 segundos.
function Indisponivel(_props: object, { retry }: ErrorInfo) {
  return <AvisoCabecalho retry={retry} />;
}

function AvisoCabecalho({ retry }: { retry: () => void }) {
  useEffect(() => {
    const relogio = setInterval(retry, 10_000);
    return () => clearInterval(relogio);
  }, [retry]);

  return (
    <div className="flex w-full items-center justify-between text-[13px]">
      <span className="font-semibold">Bacharelado em Sistemas de Informação · Campus Serra</span>
      <button type="button" onClick={() => retry()} className="flex items-center gap-2 text-xs text-suave hover:text-texto">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Reconectando…
      </button>
    </div>
  );
}

export const LimiteCabecalho = catchError(Indisponivel);
