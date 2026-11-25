import Link from "next/link";
import { Suspense } from "react";
import { ROTULO_STATUS, type StatusAtividade } from "@/domain/modelos";
import { pontosDaAtividade, tipoEfetivo } from "@/domain/regras";
import { servicoAtividades } from "@/infrastructure/container";
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-marca">Meu histórico</p>
          <h1 className="text-[22px] font-bold md:text-[26px]">Minhas atividades</h1>
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
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-bold">Atividades</h2>
            <p className="text-[10px] text-suave">
              {filtradas.length} {filtradas.length === 1 ? "registro encontrado" : "registros encontrados"}
            </p>
          </div>
          {/* Filtro por situação e eixo (tela 4.2), via parâmetros da URL. */}
          <form className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
            <select name="status" defaultValue={status ?? ""} className="min-w-0 rounded-lg border border-borda bg-white px-2 py-2 text-base sm:text-xs">
              <option value="">Todas as situações</option>
              {(Object.keys(ROTULO_STATUS) as StatusAtividade[]).map((s) => (
                <option key={s} value={s}>
                  {ROTULO_STATUS[s]}
                </option>
              ))}
            </select>
            <select name="eixo" defaultValue={eixo ?? ""} className="min-w-0 rounded-lg border border-borda bg-white px-2 py-2 text-base sm:text-xs">
              <option value="">Todos os eixos</option>
              {eixos.map(([id, descricao]) => (
                <option key={id} value={id}>
                  {descricao}
                </option>
              ))}
            </select>
            <button className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-borda px-3 py-2 hover:bg-fundo">
              <IconeFiltro /> Filtrar
            </button>
          </form>
        </div>

        {/* No celular, cada atividade vira um cartão; a tabela aparece a partir do tablet. */}
        <ul className="md:hidden">
          {filtradas.map((a) => (
            <li key={a.id} className="border-t border-borda">
              <Link href={`/atividades/${a.id}`} className="block px-4 py-3.5 active:bg-fundo">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[13px] font-semibold break-words">{a.descricao}</span>
                  <Pontos atividade={a} />
                </div>
                <div className="mt-1 text-[11px] text-suave">{tipoEfetivo(a).eixo.descricao}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-suave">
                  <SeloStatus status={a.status} />
                  <span>{rotuloComprovante(a)}</span>
                </div>
              </Link>
            </li>
          ))}
          {filtradas.length === 0 && (
            <li className="border-t border-borda px-4 py-10 text-center text-xs text-suave">{mensagemVazia(atividades.length)}</li>
          )}
        </ul>

        <table className="hidden w-full text-left text-[13px] md:table">
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
                    {rotuloComprovante(a)}
                  </div>
                </td>
                <td className="px-3 py-3.5">{estudante.nome}</td>
                <td className="px-3 py-3.5">{tipoEfetivo(a).eixo.descricao}</td>
                <td className="px-3 py-3.5">
                  <SeloStatus status={a.status} />
                </td>
                <td className="px-5 py-3.5 font-semibold">
                  <Pontos atividade={a} />
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-suave">
                  {mensagemVazia(atividades.length)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

type Atividade = Awaited<ReturnType<typeof servicoAtividades.listar>>[number];

function Pontos({ atividade }: { atividade: Atividade }) {
  const texto = `${pontosDaAtividade(atividade)} pts`;
  return (
    <span className="shrink-0 font-semibold">
      {atividade.status === "REJEITADA" ? <span className="text-suave line-through">{texto}</span> : texto}
    </span>
  );
}

function rotuloComprovante(a: Atividade) {
  return a.comprovante ? `Comprovante ${extensao(a.comprovante.nomeArquivo)} anexado` : "Sem comprovante";
}

function mensagemVazia(total: number) {
  return total === 0
    ? "Nenhuma atividade cadastrada ainda. Use “Nova atividade” para começar."
    : "Nenhuma atividade com esses filtros.";
}

function extensao(nome: string) {
  return (nome.split(".").pop() ?? "").toUpperCase();
}

function Carregando() {
  return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
}
