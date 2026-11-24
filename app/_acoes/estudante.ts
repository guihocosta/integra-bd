"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { servicoAtividades } from "@/infrastructure/container";
import { COOKIE_ESTUDANTE } from "../_lib/sessao";

export async function selecionarEstudante(matricula: string) {
  // Confere se a matrícula existe antes de gravar o cookie.
  const estudante = await servicoAtividades.buscarEstudante(matricula);
  (await cookies()).set(COOKIE_ESTUDANTE, estudante.matricula, { path: "/", sameSite: "lax", httpOnly: true });
  refresh();
}
