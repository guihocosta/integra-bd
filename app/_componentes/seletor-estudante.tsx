"use client";

import { useTransition } from "react";
import { selecionarEstudante } from "../_acoes/estudante";

interface Props {
  atual: { matricula: string; nome: string };
  estudantes: { matricula: string; nome: string; situacao: string }[];
}

/** Troca o estudante em uso (substitui o login enquanto o RF01 não é implementado). */
export function SeletorEstudante({ atual, estudantes }: Props) {
  const [pendente, iniciar] = useTransition();
  const iniciais = atual.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <label className={`flex items-center gap-3 ${pendente ? "opacity-60" : ""}`}>
      <div className="text-right leading-tight">
        <select
          aria-label="Estudante em uso"
          value={atual.matricula}
          disabled={pendente}
          onChange={(e) => iniciar(() => selecionarEstudante(e.target.value))}
          className="cursor-pointer appearance-none bg-transparent text-right text-[13px] font-semibold outline-none"
        >
          {estudantes.map((e) => (
            <option key={e.matricula} value={e.matricula}>
              {e.nome}
              {e.situacao !== "ATIVA" ? ` (${e.situacao.toLowerCase()})` : ""}
            </option>
          ))}
        </select>
        <div className="text-[10px] text-suave">{atual.matricula}</div>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marca text-xs font-bold text-white">
        {iniciais}
      </span>
    </label>
  );
}
