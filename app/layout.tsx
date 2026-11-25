import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { BarraInferior, BarraLateral, LogoCompacto } from "./_componentes/barra-lateral";
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
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-borda bg-white px-4 md:static md:px-8">
            <LogoCompacto />
            {/* O cabeçalho lê o cookie do estudante e o banco, por isso fica num Suspense. */}
            <LimiteCabecalho>
              <Suspense fallback={<div className="ml-auto h-9 w-40 animate-pulse rounded-lg bg-fundo md:w-64" />}>
                <CabecalhoEstudante />
              </Suspense>
            </LimiteCabecalho>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
          <footer className="mx-auto flex w-full max-w-5xl flex-col gap-1 border-t border-borda px-4 pt-5 pb-24 text-[11px] text-suave sm:flex-row sm:justify-between md:px-8 md:pb-5">
            <span>Integra · Atividades Complementares do BSI</span>
            <span>Instituto Federal do Espírito Santo · Campus Serra</span>
          </footer>
        </div>
        <BarraInferior />
      </body>
    </html>
  );
}
