import Link from "next/link";
import { Suspense } from "react";
import { Navegacao, NavegacaoAtual } from "./navegacao";

export function BarraLateral() {
  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-borda bg-white px-3 py-5">
      <Link href="/atividades" className="mb-6 flex items-center gap-2.5 px-2">
        <Logo />
        <div className="leading-tight">
          <div className="text-[15px] font-bold">
            ifes <span className="font-normal text-suave">|</span> <span className="text-marca">Integra</span>
          </div>
          <div className="text-[8px] font-semibold tracking-[0.18em] text-suave">CAMPUS SERRA</div>
        </div>
      </Link>

      <div className="mb-5 rounded-lg bg-fundo px-3 py-2">
        <div className="text-[9px] font-semibold tracking-wider text-suave uppercase">Perfil atual</div>
        <div className="text-[13px] font-semibold">Estudante</div>
      </div>

      {/* O item ativo depende da URL, que só existe na requisição. */}
      <Suspense fallback={<Navegacao caminho="" />}>
        <NavegacaoAtual />
      </Suspense>
    </aside>
  );
}

function Logo() {
  // Grade de quadrados do logotipo do Ifes, com o primeiro em vermelho.
  const celulas = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10];
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden>
      {celulas.map((c) => (
        <rect
          key={c}
          x={(c % 3) * 10}
          y={Math.floor(c / 3) * 10}
          width="8"
          height="8"
          rx="2"
          fill={c === 0 ? "#d92d20" : "#0d6b45"}
        />
      ))}
    </svg>
  );
}
