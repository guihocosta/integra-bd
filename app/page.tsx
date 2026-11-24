import { redirect } from "next/navigation";

// A "Visão geral" (tela 4.1) ainda não existe; a entrada do sistema é a lista de atividades.
export default function Inicio() {
  redirect("/atividades");
}
