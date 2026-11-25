import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NaoEncontradoError } from "@/domain/erros";
import { podeSerModificada, pontosDaAtividade, quantidadeEfetiva, tipoEfetivo } from "@/domain/regras";
import { servicoAtividades } from "@/infrastructure/container";
import { AcoesAtividade } from "../../_componentes/botoes-atividade";
import { SeloStatus } from "../../_componentes/selo-status";
import { estudanteAtual } from "../../_lib/sessao";

/** UC01, E04 (Consultar), com as ações de E03 (Alterar) e E05 (Excluir). */
export default function Pagina({ params }: PageProps<"/atividades/[id]">) {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: PageProps<"/atividades/[id]">["params"] }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const estudante = await estudanteAtual();

  const atividade = await servicoAtividades.consultar(estudante.matricula, id).catch((erro) => {
    if (erro instanceof NaoEncontradoError) notFound();
    throw erro;
  });
  const modificavel = podeSerModificada(atividade);
  const formulario = modificavel ? await servicoAtividades.dadosParaFormulario(estudante.matricula, id) : null;
  const corrigida = atividade.tipoConfirmado !== null || atividade.quantidadeConfirmada !== null;

  return (
    <>
      <Link href="/atividades" className="text-xs font-semibold text-marca hover:underline">
        ← Minhas atividades
      </Link>
      <div className="mt-2 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold break-words md:text-[26px]">{atividade.descricao}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-suave">
            <SeloStatus status={atividade.status} />
            <span>Cadastrada em {data(atividade.dataCadastro)}</span>
            {atividade.pedidoDeAvaliacaoId && <span>· Pedido nº {atividade.pedidoDeAvaliacaoId}</span>}
          </div>
        </div>
        {formulario && (
          <AcoesAtividade
            tipos={formulario.tipos}
            pontosPorEixo={formulario.pontosPorEixo}
            atividade={{
              id: atividade.id,
              tipoId: atividade.tipo.id,
              descricao: atividade.descricao,
              dataInicio: atividade.dataInicio,
              dataFim: atividade.dataFim,
              quantidadeUnidades: atividade.quantidadeUnidades,
              nomeComprovante: atividade.comprovante?.nomeArquivo ?? null,
            }}
          />
        )}
      </div>

      {!modificavel && (
        <p className="mb-4 rounded-lg bg-white px-4 py-3 text-xs text-suave">
          Esta atividade já foi enviada para avaliação e não pode mais ser alterada nem excluída.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Cartao titulo="Dados informados">
          <Linha rotulo="Tipo" valor={`${atividade.tipo.id} — ${atividade.tipo.descricao}`} />
          <Linha rotulo="Eixo" valor={atividade.tipo.eixo.descricao} />
          <Linha rotulo="Período" valor={`${data(atividade.dataInicio)} a ${data(atividade.dataFim)}`} />
          <Linha
            rotulo="Quantidade"
            valor={`${atividade.quantidadeUnidades} × ${atividade.tipo.unidade.toLowerCase()} (${atividade.tipo.pontosPorUnidade} pts cada)`}
          />
          <Linha rotulo="Declaração" valor={atividade.declarouNaoUso ? "Não usada em estágio nem extensão" : "—"} />
        </Cartao>

        <Cartao titulo="Pontuação">
          <div className="mb-3 text-3xl font-bold text-marca">
            {pontosDaAtividade(atividade)} <span className="text-base font-semibold">pts</span>
          </div>
          {corrigida && (
            <>
              <Linha rotulo="Tipo confirmado" valor={tipoEfetivo(atividade).descricao} />
              <Linha rotulo="Quantidade confirmada" valor={String(quantidadeEfetiva(atividade))} />
            </>
          )}
          <p className="text-[11px] text-suave">
            {atividade.status === "APROVADA"
              ? "Pontos confirmados pelo avaliador."
              : atividade.status === "REJEITADA"
                ? "Atividade rejeitada: não conta no seu total."
                : "Estimativa: o valor final depende da confirmação do avaliador."}
          </p>
        </Cartao>

        <Cartao titulo="Comprovante">
          {atividade.comprovante ? (
            <>
              <Linha rotulo="Arquivo" valor={atividade.comprovante.nomeArquivo} />
              <Linha rotulo="Enviado em" valor={data(atividade.comprovante.dataEnvio)} />
              <a
                href={`/api/atividades/${atividade.id}/comprovante`}
                target="_blank"
                className="mt-2 inline-block text-xs font-semibold text-marca hover:underline"
              >
                Abrir comprovante
              </a>
            </>
          ) : (
            <p className="text-xs text-suave">Sem comprovante.</p>
          )}
        </Cartao>

        {atividade.avaliacao && (
          <Cartao titulo="Avaliação">
            <Linha rotulo="Situação" valor={atividade.avaliacao.status === "FINALIZADA" ? "Finalizada" : "Em andamento"} />
            {atividade.avaliacao.resultado && <Linha rotulo="Resultado" valor={atividade.avaliacao.resultado === "APROVADA" ? "Aprovada" : "Rejeitada"} />}
            {atividade.avaliacao.data && <Linha rotulo="Data" valor={data(atividade.avaliacao.data)} />}
            {atividade.avaliacao.justificativa && <Linha rotulo="Justificativa" valor={atividade.avaliacao.justificativa} />}
          </Cartao>
        )}
      </div>
    </>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-borda bg-white p-4 sm:p-5">
      <h2 className="mb-3 text-[13px] font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="mb-2 grid grid-cols-[100px_1fr] gap-2 text-xs sm:grid-cols-[130px_1fr]">
      <span className="text-suave">{rotulo}</span>
      <span className="min-w-0 font-medium break-words">{valor}</span>
    </div>
  );
}

function data(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
