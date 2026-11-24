"use client";

import { EmManutencao } from "./_componentes/em-manutencao";

// Qualquer página que não carregar cai aqui, dentro do layout (a barra lateral continua visível).
export default function Erro(props: { error: unknown; retry: () => void }) {
  return <EmManutencao {...props} />;
}
