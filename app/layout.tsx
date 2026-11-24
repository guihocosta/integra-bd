import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { BarraLateral } from "./_componentes/barra-lateral";
import { CabecalhoEstudante } from "./_componentes/cabecalho-estudante";
import { LimiteCabecalho } from "./_componentes/limite-cabecalho";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Integra · Atividades Complementares do BSI",
  description: "Cadastro e acompanhamento das atividades complementares do BSI (Ifes Campus Serra).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full font-sans">
        <BarraLateral />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-borda bg-white px-8">
            {/* O cabeçalho lê o cookie do estudante e o banco, por isso fica num Suspense. */}
            <LimiteCabecalho>
              <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-lg bg-fundo" />}>
                <CabecalhoEstudante />
              </Suspense>
            </LimiteCabecalho>
          </header>
          <main className="flex-1 px-8 py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
          <footer className="mx-auto flex w-full max-w-5xl justify-between border-t border-borda px-8 py-5 text-[11px] text-suave">
            <span>Integra · Atividades Complementares do BSI</span>
            <span>Instituto Federal do Espírito Santo · Campus Serra</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
