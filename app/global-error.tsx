"use client";

import { Manrope } from "next/font/google";
import { EmManutencao } from "./_componentes/em-manutencao";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

// Último recurso: o próprio layout falhou. Esta tela substitui o documento inteiro.
export default function ErroGlobal(props: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} antialiased`}>
      <body className="min-h-screen bg-fundo px-4 font-sans">
        <title>Em manutenção · Integra</title>
        <EmManutencao {...props} />
      </body>
    </html>
  );
}
