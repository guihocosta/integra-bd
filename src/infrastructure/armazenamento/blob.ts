import { del, get, put } from "@vercel/blob";
import type { ArmazemComprovantes, ArquivoAberto } from "@/application/portas";

/** Comprovantes no Vercel Blob, com acesso privado: só o servidor lê, com o token. */
export class ArmazemBlob implements ArmazemComprovantes {
  async salvar(caminho: string, conteudo: Uint8Array, tipoMime: string): Promise<void> {
    await put(semBarraInicial(caminho), Buffer.from(conteudo), {
      access: "private",
      contentType: tipoMime,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }

  async abrir(caminho: string): Promise<ArquivoAberto | null> {
    const resultado = await get(semBarraInicial(caminho), { access: "private" });
    if (!resultado || resultado.statusCode !== 200) return null;
    return { conteudo: resultado.stream, tipoMime: resultado.blob.contentType };
  }

  async remover(caminho: string): Promise<void> {
    await del(semBarraInicial(caminho));
  }
}

function semBarraInicial(caminho: string) {
  return caminho.replace(/^\/+/, "");
}
