"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeAtividades, IconeEnviar, IconeGrade, IconeLivro } from "./icones";

// Itens sem `href` são telas dos protótipos que ainda não foram implementadas.
const ITENS = [
  { rotulo: "Visão geral", icone: IconeGrade },
  { rotulo: "Minhas atividades", href: "/atividades", icone: IconeAtividades },
  { rotulo: "Pedidos de avaliação", icone: IconeEnviar },
  { rotulo: "Tipos de atividade", href: "/tipos", icone: IconeLivro },
];

export function NavegacaoAtual() {
  return <Navegacao caminho={usePathname()} />;
}

export function Navegacao({ caminho }: { caminho: string }) {
  return (
    <nav className="flex flex-col gap-1">
        {ITENS.map(({ rotulo, href, icone: Icone }) => {
          const ativo = href !== undefined && caminho.startsWith(href);
          const classe = `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] ${
            ativo ? "bg-marca-clara font-medium text-marca" : "text-suave"
          }`;
          return href ? (
            <Link key={rotulo} href={href} className={`${classe} hover:bg-fundo`}>
              <Icone /> {rotulo}
            </Link>
          ) : (
            <span key={rotulo} className={`${classe} cursor-not-allowed opacity-50`} title="Em breve">
              <Icone /> {rotulo}
            </span>
          );
        })}
      </nav>
  );
}
