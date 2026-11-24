import "server-only";
import { cookies } from "next/headers";
import type { Estudante } from "@/domain/modelos";
import { servicoAtividades } from "@/infrastructure/container";

export const COOKIE_ESTUDANTE = "integra_estudante";

/**
 * Estudante em uso. Ainda não há login (RF01): a matrícula vem de um cookie escolhido no
 * seletor do cabeçalho; sem cookie, vale o primeiro estudante com matrícula ativa.
 */
export async function estudanteAtual(): Promise<Estudante> {
  return (await sessao()).atual;
}

/** Estudante em uso e a lista para o seletor, numa consulta só. */
export async function sessao(): Promise<{ atual: Estudante; estudantes: Estudante[] }> {
  // Ler o cookie antes de tudo marca a renderização como de requisição: o banco nunca é
  // consultado durante o build (o pré-render para aqui).
  const matricula = (await cookies()).get(COOKIE_ESTUDANTE)?.value;
  const estudantes = await servicoAtividades.listarEstudantes();
  const escolhido = estudantes.find((e) => e.matricula === matricula);
  const padrao = estudantes.find((e) => e.situacaoMatricula === "ATIVA") ?? estudantes[0];
  if (!escolhido && !padrao) throw new Error("Nenhum estudante cadastrado no banco. Rode db/02-carga.sql.");
  return { atual: escolhido ?? padrao, estudantes };
}
