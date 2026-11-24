import { servicoAtividades } from "@/infra/container";
import { estudanteAtual } from "../_lib/sessao";
import { SeletorEstudante } from "./seletor-estudante";

export async function CabecalhoEstudante() {
  const [atual, estudantes] = await Promise.all([estudanteAtual(), servicoAtividades.listarEstudantes()]);

  return (
    <>
      <div className="leading-tight">
        <div className="text-[10px] font-medium tracking-wider text-suave uppercase">
          Bacharelado em Sistemas de Informação
        </div>
        <div className="text-[13px] font-semibold">
          PPC {atual.ppc.semestreAtivo} · Campus Serra
        </div>
      </div>
      <SeletorEstudante
        atual={{ matricula: atual.matricula, nome: atual.nome }}
        estudantes={estudantes.map((e) => ({ matricula: e.matricula, nome: e.nome, situacao: e.situacaoMatricula }))}
      />
    </>
  );
}
