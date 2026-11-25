// Casos de uso do UC01 (Gerenciar Atividades): listar, incluir, consultar, alterar e excluir.
// Orquestra as regras do domínio e as portas; não sabe qual banco nem qual armazenamento está por trás.

import { NaoEncontradoError, RegraVioladaError } from "@/domain/erros";
import type { Atividade, Comprovante, Estudante, TipoDeAtividade } from "@/domain/modelos";
import {
  extensaoDoArquivo,
  podeSerModificada,
  validarArquivoComprovante,
  validarDadosAtividade,
  type DadosAtividade,
  type ErrosPorCampo,
} from "@/domain/regras";
import type {
  ArmazemComprovantes,
  ArquivoAberto,
  RepositorioAtividades,
  RepositorioEstudantes,
  RepositorioTipos,
} from "./portas";

export interface ArquivoEnviado {
  nome: string;
  tipoMime: string;
  conteudo: Uint8Array;
}

export interface DadosParaFormulario {
  estudante: Estudante;
  /** Tipos ativos do PPC do estudante, que é o que ele pode escolher. */
  tipos: TipoDeAtividade[];
  /** Pontos que já contam em cada eixo (id do eixo → pontos), para a estimativa do teto. */
  pontosPorEixo: Record<number, number>;
}

export class ServicoAtividades {
  constructor(
    private readonly estudantes: RepositorioEstudantes,
    private readonly tipos: RepositorioTipos,
    private readonly atividades: RepositorioAtividades,
    private readonly armazem: ArmazemComprovantes,
    private readonly hoje: () => string,
  ) {}

  listarEstudantes(): Promise<Estudante[]> {
    return this.estudantes.listar();
  }

  async buscarEstudante(matricula: string): Promise<Estudante> {
    const estudante = await this.estudantes.buscar(matricula);
    if (!estudante) throw new NaoEncontradoError("Estudante não encontrado.");
    return estudante;
  }

  /** E01. Listar Atividades. */
  async listar(matricula: string): Promise<Atividade[]> {
    await this.buscarEstudante(matricula);
    return this.atividades.listarDoEstudante(matricula);
  }

  /** RF17: catálogo de tipos do PPC que o estudante segue, ativos e inativos. */
  async catalogoDeTipos(matricula: string): Promise<{ estudante: Estudante; tipos: TipoDeAtividade[] }> {
    const estudante = await this.buscarEstudante(matricula);
    return { estudante, tipos: await this.tipos.listarDoPpc(estudante.ppc.id) };
  }

  /** E02, passos 2 e 4: o que o formulário precisa para mostrar os tipos e a estimativa. */
  async dadosParaFormulario(matricula: string, excetoAtividadeId?: number): Promise<DadosParaFormulario> {
    const estudante = await this.buscarEstudante(matricula);
    const [tipos, pontos] = await Promise.all([
      this.tipos.listarDoPpc(estudante.ppc.id),
      this.atividades.pontosPorEixo(matricula, excetoAtividadeId),
    ]);
    return {
      estudante,
      tipos: tipos.filter((t) => t.ativo),
      pontosPorEixo: Object.fromEntries(pontos),
    };
  }

  /** E04. Consultar. */
  async consultar(matricula: string, id: number): Promise<Atividade> {
    const atividade = await this.atividades.buscar(id);
    if (!atividade || atividade.estudanteMatricula !== matricula)
      throw new NaoEncontradoError("Atividade não encontrada.");
    return atividade;
  }

  /** E02. Incluir. Devolve o id da atividade criada. */
  async incluir(matricula: string, dados: DadosAtividade, arquivo: ArquivoEnviado | null): Promise<number> {
    const estudante = await this.buscarEstudante(matricula);
    // Pré-condição do E02 e RF02: só estudante com matrícula ativa cadastra.
    if (estudante.situacaoMatricula !== "ATIVA")
      throw new RegraVioladaError("Só estudantes com matrícula ativa podem cadastrar atividades.");

    const erros = await this.validar(estudante, dados);
    if (!arquivo) erros.comprovante = "Anexe o comprovante da atividade.";
    else {
      const erroArquivo = validarArquivoComprovante(arquivo.nome, arquivo.conteudo.byteLength);
      if (erroArquivo) erros.comprovante = erroArquivo;
    }
    lancarSeHouverErros(erros);

    const hash = await calcularHash(arquivo!.conteudo);
    // RN05 (E02, fluxo 6a): o comprovante não pode estar em outra atividade que não foi rejeitada.
    if (await this.atividades.hashEmUso(hash))
      throw new RegraVioladaError("Este comprovante já foi usado em outra atividade.", {
        comprovante: "Este comprovante já foi usado em outra atividade.",
      });

    const hoje = this.hoje();
    const id = await this.atividades.reservarId();
    const comprovante = await this.gravarArquivo(id, arquivo!, hash, hoje);
    try {
      await this.atividades.inserir(
        { ...dados, descricao: dados.descricao.trim(), id, estudanteMatricula: matricula, dataCadastro: hoje },
        comprovante,
      );
    } catch (erro) {
      // Sem a atividade no banco, o arquivo ficaria órfão.
      await this.armazem.remover(comprovante.pathArquivo).catch(() => {});
      throw erro;
    }
    return id;
  }

  /** E03. Alterar. O comprovante só é trocado se vier um arquivo novo. */
  async alterar(matricula: string, id: number, dados: DadosAtividade, arquivo: ArquivoEnviado | null): Promise<void> {
    const atual = await this.consultar(matricula, id);
    // E03, fluxo 1a (RN10).
    if (!podeSerModificada(atual))
      throw new RegraVioladaError("A atividade já foi enviada para avaliação e não pode mais ser alterada.");

    const estudante = await this.buscarEstudante(matricula);
    const erros = await this.validar(estudante, dados);
    if (arquivo) {
      const erroArquivo = validarArquivoComprovante(arquivo.nome, arquivo.conteudo.byteLength);
      if (erroArquivo) erros.comprovante = erroArquivo;
    }
    lancarSeHouverErros(erros);

    let novo: Comprovante | null = null;
    if (arquivo) {
      const hash = await calcularHash(arquivo.conteudo);
      if (await this.atividades.hashEmUso(hash, id))
        throw new RegraVioladaError("Este comprovante já foi usado em outra atividade.", {
          comprovante: "Este comprovante já foi usado em outra atividade.",
        });
      novo = await this.gravarArquivo(id, arquivo, hash, this.hoje());
    }

    try {
      await this.atividades.atualizar(id, { ...dados, descricao: dados.descricao.trim() }, novo);
    } catch (erro) {
      if (novo && novo.pathArquivo !== atual.comprovante?.pathArquivo)
        await this.armazem.remover(novo.pathArquivo).catch(() => {});
      throw erro;
    }

    // Se a extensão mudou, o caminho mudou e o arquivo antigo sobrou.
    const antigo = atual.comprovante?.pathArquivo;
    if (novo && antigo && antigo !== novo.pathArquivo) await this.armazem.remover(antigo).catch(() => {});
  }

  /** E05. Excluir. */
  async excluir(matricula: string, id: number): Promise<void> {
    const atual = await this.consultar(matricula, id);
    // E05, fluxo 1a (RN10).
    if (!podeSerModificada(atual))
      throw new RegraVioladaError("A atividade já foi enviada para avaliação e não pode ser excluída.");
    await this.atividades.excluir(id);
    if (atual.comprovante) await this.armazem.remover(atual.comprovante.pathArquivo).catch(() => {});
  }

  /** Abre o arquivo do comprovante, só para o dono da atividade. */
  async abrirComprovante(matricula: string, id: number): Promise<(ArquivoAberto & { nome: string }) | null> {
    const atividade = await this.consultar(matricula, id);
    if (!atividade.comprovante) return null;
    const arquivo = await this.armazem.abrir(atividade.comprovante.pathArquivo);
    return arquivo && { ...arquivo, nome: atividade.comprovante.nomeArquivo };
  }

  private async validar(estudante: Estudante, dados: DadosAtividade): Promise<ErrosPorCampo> {
    const tipo = Number.isInteger(dados.tipoId) ? await this.tipos.buscar(dados.tipoId) : null;
    // O tipo tem que ser de um eixo do PPC que o estudante segue.
    const tipoDoPpc = tipo && (await this.tipos.listarDoPpc(estudante.ppc.id)).some((t) => t.id === tipo.id) ? tipo : null;
    return validarDadosAtividade(dados, estudante, tipoDoPpc);
  }

  private async gravarArquivo(id: number, arquivo: ArquivoEnviado, hash: string, dataEnvio: string): Promise<Comprovante> {
    // Mesmo formato dos caminhos da carga: /comprovantes/AAAA/<id>.<extensão>
    const caminho = `/comprovantes/${dataEnvio.slice(0, 4)}/${id}.${extensaoDoArquivo(arquivo.nome)}`;
    await this.armazem.salvar(caminho, arquivo.conteudo, arquivo.tipoMime);
    return { nomeArquivo: arquivo.nome.slice(0, 150), hash, pathArquivo: caminho, dataEnvio };
  }
}

function lancarSeHouverErros(erros: ErrosPorCampo) {
  if (Object.keys(erros).length > 0) throw new RegraVioladaError("Corrija os campos destacados.", erros);
}

/** SHA-256 do conteúdo, em hexadecimal (RN05). */
async function calcularHash(conteudo: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", conteudo as Uint8Array<ArrayBuffer>);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
