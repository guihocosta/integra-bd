"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeAtividades, IconeLivro } from "./icones";

// Só as telas já implementadas; "Visão geral" e "Pedidos de avaliação" (protótipos) entram quando existirem.
const ITENS = [
  { rotulo: "Minhas atividades", curto: "Atividades", href: "/atividades", icone: IconeAtividades },
  { rotulo: "Tipos de atividade", curto: "Tipos", href: "/tipos", icone: IconeLivro },
];

interface Props {
  caminho: string;
  /** Barra inferior do celular: ícone em cima, rótulo curto embaixo. */
  inferior?: boolean;
}

export function NavegacaoAtual({ inferior }: Omit<Props, "caminho">) {
  return <Navegacao caminho={usePathname()} inferior={inferior} />;
}

export function Navegacao({ caminho, inferior = false }: Props) {
  return (
    <nav className={inferior ? "grid grid-cols-2" : "flex flex-col gap-1"}>
      {ITENS.map(({ rotulo, curto, href, icone: Icone }) => {
        const ativo = caminho.startsWith(href);
        const cor = ativo ? "font-medium text-marca" : "text-suave";
        const classe = inferior
          ? `flex flex-col items-center gap-1 py-2.5 text-[10px] ${cor}`
          : `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] ${ativo ? "bg-marca-clara" : ""} ${cor}`;
        const conteudo = (
          <>
            <Icone /> {inferior ? curto : rotulo}
          </>
        );
        return (
          <Link key={rotulo} href={href} aria-current={ativo ? "page" : undefined} className={`${classe} hover:bg-fundo`}>
            {conteudo}
          </Link>
        );
      })}
    </nav>
  );
}
