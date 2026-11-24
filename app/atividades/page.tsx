import Link from "next/link";
import { Suspense } from "react";
import { ROTULO_STATUS, type StatusAtividade } from "@/dominio/modelos";
import { pontosDaAtividade, tipoEfetivo } from "@/dominio/regras";
import { servicoAtividades } from "@/infra/container";
import { BotaoNovaAtividade } from "../_componentes/botoes-atividade";
import { IconeFiltro } from "../_componentes/icones";
import { SeloStatus } from "../_componentes/selo-status";
import { estudanteAtual } from "../_lib/sessao";

export const metadata = { title: "Minhas atividades · Integra" };

/** Tela 4.2 (Consulta de atividades do estudante) — UC01, E01. */
export default function Pagina({ searchParams }: PageProps<"/atividades">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo filtros={searchParams} />
    </Suspense>
  );
}

async function Conteudo({ filtros }: { filtros: PageProps<"/atividades">["searchParams"] }) {
  const { status, eixo } = await filtros;
  const estudante = await estudanteAtual();
  const [atividades, formulario] = await Promise.all([
    servicoAtividades.listar(estudante.matricula),
    servicoAtividades.dadosParaFormulario(estudante.matricula),
  ]);

  const eixos = [...new Map(atividades.map((a) => [tipoEfetivo(a).eixo.id, tipoEfetivo(a).eixo.descricao]))];
  const filtradas = atividades.filter(
    (a) => (!status || a.status === status) && (!eixo || String(tipoEfetivo(a).eixo.id) === eixo),
  );

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-marca">Meu histórico</p>
          <h1 className="text-[26px] font-bold">Minhas atividades</h1>
          <p className="text-xs text-suave">Gerencie atividades cadastradas e acompanhe cada análise.</p>
        </div>
        <BotaoNovaAtividade
          tipos={formulario.tipos}
          pontosPorEixo={formulario.pontosPorEixo}
          desabilitado={
            estudante.situacaoMatricula !== "ATIVA" ? "Só estudantes com matrícula ativa podem cadastrar atividades." : undefined
          }
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-borda bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold">Atividades</h2>
            <p className="text-[10px] text-suave">
              {filtradas.length} {filtradas.length === 1 ? "registro encontrado" : "registros encontrados"}
            </p>
          </div>
          {/* Filtro por situação e eixo (tela 4.2), via parâmetros da URL. */}
          <form className="flex items-center gap-2 text-xs">
            <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-borda px-2 py-2">
              <option value="">Todas as situações</option>
              {(Object.keys(ROTULO_STATUS) as StatusAtividade[]).map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS[s]}
                </option>
              ))}
            </select>
            <select name="eixo" defaultValue={eixo ?? ""} className="rounded-lg border border-borda px-2 py-2">
              <option value="">Todos os eixos</option>
              {eixos.map(([id, descricao]) => (
                <option key={id} value={id}>
                  {descricao}
                </option>
              ))}
            </select>
            <button className="flex items-center gap-1.5 rounded-lg border border-borda px-3 py-2 hover:bg-fundo">
              <IconeFiltro /> Filtrar
            </button>
          </form>
        </div>

        <table className="w-full text-left text-[13px]">
          <thead className="bg-fundo/60 text-[10px] font-semibold tracking-wider text-suave uppercase">
            <tr>
              <th className="px-5 py-3">Atividade</th>
              <th className="px-3 py-3">Estudante</th>
              <th className="px-3 py-3">Eixo</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((a) => (
              <tr key={a.id} className="border-t border-borda hover:bg-fundo/50">
                <td className="max-w-80 px-5 py-3.5">
                  <Link href={`/atividades/${a.id}`} className="font-semibold hover:text-marca">
                    {a.descricao}
                  </Link>
                  <div className="text-[10px] text-suave">
                    {a.comprovante ? `Comprovante ${extensao(a.comprovante.nomeArquivo)} anexado` : "Sem comprovante"}
                  </div>
                </td>
                <td className="px-3 py-3.5">{estudante.nome}</td>
                <td className="px-3 py-3.5">{tipoEfetivo(a).eixo.descricao}</td>
                <td className="px-3 py-3.5">
                  <SeloStatus status={a.status} />
                </td>
                <td className="px-5 py-3.5 font-semibold">
                  {a.status === "REJEITADA" ? <span className="text-suave line-through">{pontosDaAtividade(a)} pts</span> : `${pontosDaAtividade(a)} pts`}
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-suave">
                  {atividades.length === 0
                    ? "Nenhuma atividade cadastrada ainda. Use “Nova atividade” para começar."
                    : "Nenhuma atividade com esses filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

function extensao(nome: string) {
  return (nome.split(".").pop() ?? "").toUpperCase();
}

function Carregando() {
  return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
}
