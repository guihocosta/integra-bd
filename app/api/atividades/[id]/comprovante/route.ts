import { NaoEncontradoError } from "@/dominio/erros";
import { servicoAtividades } from "@/infra/container";
import { estudanteAtual } from "../../../../_lib/sessao";

/** Entrega o arquivo do comprovante, só para o estudante dono da atividade. */
export async function GET(_requisicao: Request, { params }: RouteContext<"/api/atividades/[id]/comprovante">) {
  const id = Number((await params).id);
  const estudante = await estudanteAtual();
  try {
    const arquivo = await servicoAtividades.abrirComprovante(estudante.matricula, id);
    if (!arquivo)
      return new Response("O arquivo deste comprovante não está no armazenamento (os da carga inicial são fictícios).", {
        status: 404,
      });
    return new Response(arquivo.conteudo, {
      headers: {
        "Content-Type": arquivo.tipoMime,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(arquivo.nome)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (erro) {
    if (erro instanceof NaoEncontradoError) return new Response("Atividade não encontrada.", { status: 404 });
    throw erro;
  }
}
