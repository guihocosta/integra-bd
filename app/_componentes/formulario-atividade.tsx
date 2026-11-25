"use client";

import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import type { TipoDeAtividade } from "@/domain/modelos";
import { estimar, FORMATOS_COMPROVANTE, validarArquivoComprovante } from "@/domain/regras";
import { salvarAtividade } from "../_acoes/atividades";
import { ESTADO_INICIAL } from "../_lib/formulario";
import { IconeArquivo, IconeFechar } from "./icones";

export interface ValoresAtividade {
  id: number;
  tipoId: number;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  quantidadeUnidades: number;
  nomeComprovante: string | null;
}

interface Props {
  tipos: TipoDeAtividade[];
  pontosPorEixo: Record<number, number>;
  /** Presente quando é alteração (E03); ausente na inclusão (E02). */
  atividade?: ValoresAtividade;
  aoFechar: () => void;
}

export function FormularioAtividade({ tipos, pontosPorEixo, atividade, aoFechar }: Props) {
  const [estado, enviar, pendente] = useActionState(salvarAtividade, ESTADO_INICIAL);
  const [tipoId, setTipoId] = useState(String(atividade?.tipoId ?? tipos[0]?.id ?? ""));
  const [quantidade, setQuantidade] = useState(String(atividade?.quantidadeUnidades ?? 1));
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);

  useEffect(() => {
    if (estado.ok) aoFechar();
  }, [estado, aoFechar]);

  const tipo = tipos.find((t) => String(t.id) === tipoId);
  const estimativa = useMemo(
    () => tipo && estimar(tipo, Number(quantidade) || 0, pontosPorEixo[tipo.eixo.id] ?? 0),
    [tipo, quantidade, pontosPorEixo],
  );
  const porEixo = useMemo(() => {
    const grupos = new Map<string, TipoDeAtividade[]>();
    for (const t of tipos) grupos.set(t.eixo.descricao, [...(grupos.get(t.eixo.descricao) ?? []), t]);
    return [...grupos];
  }, [tipos]);

  const erros = estado.erros ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 sm:px-4 sm:py-12">
      <form
        onSubmit={(e) => {
          // Envia sem o reset automático do <form action>, para não perder o que foi digitado quando há erro.
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          startTransition(() => enviar(dados));
        }}
        className="min-h-full w-full max-w-lg bg-white p-5 shadow-xl sm:min-h-0 sm:rounded-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{atividade ? "Alterar atividade" : "Nova atividade"}</h2>
            <p className="text-xs text-suave">Os pontos são calculados pela unidade definida no PPC.</p>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="-m-2 p-2 text-suave hover:text-texto">
            <IconeFechar />
          </button>
        </div>

        {atividade && <input type="hidden" name="id" value={atividade.id} />}

        <Campo rotulo="Título ou nome da atividade" erro={erros.descricao}>
          <input
            name="descricao"
            defaultValue={atividade?.descricao}
            maxLength={150}
            placeholder="Ex.: Jornada de Iniciação Científica"
            className={entrada(erros.descricao)}
          />
        </Campo>

        <Campo rotulo="Tipo de atividade do PPC" erro={erros.tipoId}>
          <select name="tipoId" value={tipoId} onChange={(e) => setTipoId(e.target.value)} className={entrada(erros.tipoId)}>
            {porEixo.map(([eixo, lista]) => (
              <optgroup key={eixo} label={eixo}>
                {lista.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} — {t.descricao}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Campo>

        {tipo && estimativa && (
          <div className="mb-4 rounded-xl bg-marca-clara px-4 py-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Info rotulo="Unidade" valor={tipo.unidade} />
              <Info rotulo="Valor unitário" valor={`${tipo.pontosPorUnidade} ${plural(tipo.pontosPorUnidade, "ponto")}`} />
              <Info rotulo="Estimativa" valor={`${estimativa.pontosAtividade} ${plural(estimativa.pontosAtividade, "ponto")}`} />
            </div>
            {/* RN02: o eixo conta no máximo o seu limite. */}
            {estimativa.pontosQueContam < estimativa.pontosAtividade && (
              <p className="mt-2 text-[11px] text-alerta">
                {estimativa.tetoJaAtingido
                  ? `Você já tem ${estimativa.pontosNoEixo} pontos em ${tipo.eixo.descricao}, que conta no máximo ${estimativa.limiteEixo}. Esta atividade não aumenta seu total.`
                  : `${tipo.eixo.descricao} conta no máximo ${estimativa.limiteEixo} pontos: só ${estimativa.pontosQueContam} destes pontos vão contar.`}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-x-3 sm:grid-cols-2">
          <Campo rotulo="Data de início" erro={erros.dataInicio}>
            <input type="date" name="dataInicio" defaultValue={atividade?.dataInicio} className={entrada(erros.dataInicio)} />
          </Campo>
          <Campo rotulo="Data de término" erro={erros.dataFim}>
            <input type="date" name="dataFim" defaultValue={atividade?.dataFim} className={entrada(erros.dataFim)} />
          </Campo>
        </div>

        <Campo
          rotulo={`Quantidade de unidades completas${tipo ? ` (${tipo.unidade})` : ""}`}
          erro={erros.quantidadeUnidades}
          dica="Frações de unidade não pontuam. O avaliador poderá corrigir esta quantidade."
        >
          <input
            type="number"
            name="quantidadeUnidades"
            min={1}
            step={1}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className={entrada(erros.quantidadeUnidades)}
          />
        </Campo>

        <Campo rotulo="" erro={erroArquivo ?? erros.comprovante}>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-4 text-[13px] font-semibold ${
              erroArquivo || erros.comprovante ? "border-alerta text-alerta" : "border-marca/60 bg-marca-clara/50 text-marca"
            }`}
          >
            <IconeArquivo />
            <span className="min-w-0 break-all">
              {arquivo
                ? arquivo.name
                : atividade?.nomeComprovante
                  ? `${atividade.nomeComprovante} (toque para trocar)`
                  : "Anexar comprovante em PDF"}
            </span>
            <input
              type="file"
              name="comprovante"
              accept={FORMATOS_COMPROVANTE.map((f) => `.${f}`).join(",")}
              className="sr-only"
              onChange={(e) => {
                const escolhido = e.target.files?.[0] ?? null;
                setArquivo(escolhido);
                setErroArquivo(escolhido && validarArquivoComprovante(escolhido.name, escolhido.size));
              }}
            />
          </label>
        </Campo>

        <div className={`mb-5 rounded-xl border px-4 py-3 ${erros.declarouNaoUso ? "border-alerta" : "border-alerta/30"} bg-alerta-claro`}>
          <p className="text-[13px] font-semibold text-alerta">Atenção à não duplicidade</p>
          <p className="mb-2 text-[11px] text-alerta">
            Atividades já computadas no estágio curricular obrigatório ou em atividades/projetos de extensão não podem ser
            usadas como atividade complementar.
          </p>
          <label className="flex items-start gap-2 text-xs font-medium text-alerta">
            <input type="checkbox" name="declarouNaoUso" defaultChecked={Boolean(atividade)} className="mt-0.5 accent-marca" />
            Declaro que esta atividade não foi utilizada para estágio obrigatório nem para extensão.
          </label>
          {erros.declarouNaoUso && <p className="mt-2 text-[11px] font-semibold text-alerta">{erros.declarouNaoUso}</p>}
        </div>

        {estado.mensagem && !estado.ok && (
          <p role="alert" className="mb-4 rounded-lg bg-alerta-claro px-3 py-2 text-xs text-alerta">
            {estado.mensagem}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={aoFechar} className="rounded-lg border border-borda px-4 py-2.5 text-[13px] hover:bg-fundo">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pendente || Boolean(erroArquivo)}
            className="rounded-lg bg-marca px-4 py-2.5 text-[13px] font-medium text-white hover:bg-marca-escura disabled:opacity-60"
          >
            {pendente ? "Salvando…" : atividade ? "Salvar alterações" : "Cadastrar atividade"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ rotulo, erro, dica, children }: { rotulo: string; erro?: string | null; dica?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {rotulo && <label className="mb-1.5 block text-xs font-semibold">{rotulo}</label>}
      {children}
      {erro ? (
        <p className="mt-1 text-[11px] text-alerta">{erro}</p>
      ) : (
        dica && <p className="mt-1 text-[10px] text-suave">{dica}</p>
      )}
    </div>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="text-[9px] font-bold tracking-wider text-marca uppercase">{rotulo}</div>
      <div className="text-[13px] font-semibold break-words">{valor}</div>
    </div>
  );
}

function entrada(erro?: string | null) {
  return `w-full min-w-0 rounded-lg border bg-white px-3 py-2.5 text-base outline-none sm:text-[13px] focus:border-marca focus:ring-2 focus:ring-marca/15 ${
    erro ? "border-alerta" : "border-borda"
  }`;
}

function plural(n: number, palavra: string) {
  return n === 1 ? palavra : `${palavra}s`;
}
