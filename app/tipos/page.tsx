import Link from "next/link";
import { Suspense } from "react";
import { servicoAtividades } from "@/infra/container";
import { estudanteAtual } from "../_lib/sessao";

export const metadata = { title: "Tipos de atividade · Integra" };

/** Tela 4.3 (Catálogo de tipos de atividade do PPC) — RF17. */
export default function Pagina({ searchParams }: PageProps<"/tipos">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <Conteudo filtros={searchParams} />
    </Suspense>
  );
}

async function Conteudo({ filtros }: { filtros: PageProps<"/tipos">["searchParams"] }) {
  const { eixo } = await filtros;
  const estudante = await estudanteAtual();
  const { tipos } = await servicoAtividades.catalogoDeTipos(estudante.matricula);
  const eixos = [...new Map(tipos.map((t) => [String(t.eixo.id), t.eixo]))];
  const visiveis = eixo ? tipos.filter((t) => String(t.eixo.id) === eixo) : tipos;

  return (
    <>
      <p className="text-xs font-semibold text-marca">PPC {estudante.ppc.semestreAtivo}</p>
      <h1 className="text-[26px] font-bold">Tipos de atividade aceitos</h1>
      <p className="mb-5 text-xs text-suave">Tabela oficial de pontuação do Bacharelado em Sistemas de Informação.</p>

      <nav className="mb-4 flex flex-wrap gap-2">
        <Aba href="/tipos" ativa={!eixo}>
          Todos
        </Aba>
        {eixos.map(([id, e]) => (
          <Aba key={id} href={`/tipos?eixo=${id}`} ativa={eixo === id}>
            {e.descricao}
          </Aba>
        ))}
      </nav>

      <section className="overflow-hidden rounded-2xl border border-borda bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-fundo/60 text-[10px] font-semibold tracking-wider text-suave uppercase">
            <tr>
              <th className="px-5 py-3">Código</th>
              <th className="px-3 py-3">Descrição da atividade</th>
              <th className="px-3 py-3">Eixo</th>
              <th className="px-3 py-3">Unidade de avaliação</th>
              <th className="px-5 py-3">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((t) => (
              <tr key={t.id} className={`border-t border-borda ${t.ativo ? "" : "text-suave"}`}>
                <td className="px-5 py-3.5 font-semibold text-marca">{t.id}</td>
                <td className="px-3 py-3.5">
                  {t.descricao}
                  {t.exigeRelacaoCurso && (
                    <span className="ml-2 rounded bg-marca-clara px-1.5 py-0.5 text-[9px] font-semibold text-marca">
                      exige relação com o curso
                    </span>
                  )}
                  {!t.ativo && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold">inativo</span>}
                </td>
                <td className="px-3 py-3.5">{t.eixo.descricao}</td>
                <td className="px-3 py-3.5">{t.unidade}</td>
                <td className="px-5 py-3.5 font-semibold">{t.pontosPorUnidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="mt-3 text-[11px] text-suave">
        Cada eixo conta no máximo {eixos[0]?.[1].limitePontos ?? 10} pontos (RN02); o total exigido é{" "}
        {estudante.ppc.pontosMinimos} pontos (RN01).
      </p>
    </>
  );
}

function Aba({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-[13px] ${
        ativa ? "border-marca bg-marca text-white" : "border-borda bg-white hover:bg-fundo"
      }`}
    >
      {children}
    </Link>
  );
}
