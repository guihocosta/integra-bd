import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ArmazemComprovantes, ArquivoAberto } from "@/application/portas";

const TIPOS: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/** Comprovantes numa pasta local. Usado em desenvolvimento, quando não há token do Blob. */
export class ArmazemDiscoLocal implements ArmazemComprovantes {
  constructor(private readonly pastaBase: string) {}

  private resolver(caminho: string) {
    const destino = path.resolve(this.pastaBase, "." + path.posix.normalize("/" + caminho));
    if (!destino.startsWith(path.resolve(this.pastaBase))) throw new Error("Caminho inválido.");
    return destino;
  }

  async salvar(caminho: string, conteudo: Uint8Array): Promise<void> {
    const destino = this.resolver(caminho);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, conteudo);
  }

  async abrir(caminho: string): Promise<ArquivoAberto | null> {
    const arquivo = this.resolver(caminho);
    const info = await stat(arquivo).catch(() => null);
    if (!info?.isFile()) return null;
    return {
      conteudo: Readable.toWeb(createReadStream(arquivo)) as ReadableStream<Uint8Array>,
      tipoMime: TIPOS[path.extname(arquivo).toLowerCase()] ?? "application/octet-stream",
    };
  }

  async remover(caminho: string): Promise<void> {
    await rm(this.resolver(caminho), { force: true });
  }
}
