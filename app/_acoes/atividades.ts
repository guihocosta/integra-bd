"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { ArquivoEnviado } from "@/application/servico-atividades";
import { NaoEncontradoError, RegraVioladaError } from "@/domain/erros";
import type { DadosAtividade } from "@/domain/regras";
import { servicoAtividades } from "@/infrastructure/container";
import type { EstadoFormulario } from "../_lib/formulario";
import { estudanteAtual } from "../_lib/sessao";

// Camada de apresentação: converte o formulário em dados, chama o serviço e traduz os erros.
// A matrícula vem sempre do servidor (cookie), nunca do formulário.

function lerDados(form: FormData): DadosAtividade {
  return {
    tipoId: Number(form.get("tipoId")),
    descricao: String(form.get("descricao") ?? ""),
    dataInicio: String(form.get("dataInicio") ?? ""),
    dataFim: String(form.get("dataFim") ?? ""),
    quantidadeUnidades: Number(form.get("quantidadeUnidades")),
    declarouNaoUso: form.get("declarouNaoUso") === "on",
  };
}

async function lerArquivo(form: FormData): Promise<ArquivoEnviado | null> {
  const arquivo = form.get("comprovante");
  if (!(arquivo instanceof File) || arquivo.size === 0) return null;
  return { nome: arquivo.name, tipoMime: arquivo.type, conteudo: new Uint8Array(await arquivo.arrayBuffer()) };
}

/** E02 (incluir) e E03 (alterar): o campo oculto `id` diz qual dos dois. */
export async function salvarAtividade(anterior: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const envio = anterior.envio + 1;
  try {
    const estudante = await estudanteAtual();
    const id = form.get("id") ? Number(form.get("id")) : null;
    const dados = lerDados(form);
    const arquivo = await lerArquivo(form);

    if (id === null) await servicoAtividades.incluir(estudante.matricula, dados, arquivo);
    else await servicoAtividades.alterar(estudante.matricula, id, dados, arquivo);

    refresh();
    return { ok: true, envio, mensagem: id === null ? "Atividade cadastrada." : "Alteração registrada." };
  } catch (erro) {
    return { ok: false, envio, ...traduzirErro(erro) };
  }
}

/** E05. Excluir. */
export async function excluirAtividade(id: number): Promise<{ mensagem: string } | void> {
  try {
    const estudante = await estudanteAtual();
    await servicoAtividades.excluir(estudante.matricula, id);
  } catch (erro) {
    return { mensagem: traduzirErro(erro).mensagem ?? "Não foi possível excluir." };
  }
  redirect("/atividades");
}

function traduzirErro(erro: unknown): Pick<EstadoFormulario, "mensagem" | "erros"> {
  if (erro instanceof RegraVioladaError) return { mensagem: erro.message, erros: erro.campos };
  if (erro instanceof NaoEncontradoError) return { mensagem: erro.message };
  console.error(erro);
  return { mensagem: "Não foi possível salvar agora. Tente de novo em instantes." };
}
