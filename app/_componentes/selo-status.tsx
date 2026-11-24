import { ROTULO_STATUS, type StatusAtividade } from "@/domain/modelos";

const CORES: Record<StatusAtividade, string> = {
  CADASTRADA: "bg-slate-100 text-slate-600",
  EM_AVALIACAO: "bg-amber-50 text-amber-700",
  APROVADA: "bg-marca-clara text-marca",
  REJEITADA: "bg-alerta-claro text-alerta",
};

export function SeloStatus({ status }: { status: StatusAtividade }) {
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-semibold ${CORES[status]}`}>
      {ROTULO_STATUS[status]}
    </span>
  );
}
