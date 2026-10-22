import { AlertTriangle, CheckCircle, Info, OctagonAlert } from "lucide-react";
import type { NivelRisco, StatusProcessamento, StatusTalhao } from "@/types/dominio";

const talhao: Record<StatusTalhao, { txt: string; cls: string }> = {
  ativo: { txt: "Ativo", cls: "bg-green-50 text-green-800 border-green-200" },
  inativo: { txt: "Inativo", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  em_analise: { txt: "Em análise", cls: "bg-yellow-50 text-yellow-900 border-yellow-200" },
};

const processamento: Record<StatusProcessamento, { txt: string; cls: string }> = {
  pendente: { txt: "Pendente", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  em_processamento: { txt: "Em processamento", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  concluido: { txt: "Concluído", cls: "bg-green-50 text-green-800 border-green-200" },
  falhou: { txt: "Falhou", cls: "bg-red-50 text-red-700 border-red-200" },
};

function Base({ txt, cls }: { txt: string; cls: string }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${cls}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {txt}
    </span>
  );
}

export function StatusTalhaoBadge({ status }: { status: StatusTalhao }) {
  return <Base {...talhao[status]} />;
}

export function StatusProcessamentoBadge({ status }: { status: StatusProcessamento }) {
  return <Base {...processamento[status]} />;
}

export const NIVEL_RISCO_LABEL: Record<NivelRisco, string> = {
  baixo: "Risco baixo",
  medio: "Atenção",
  alto: "Risco alto",
  critico: "Crítico",
};

// Risco: cor + icone + texto, para nao depender so da cor (acessibilidade).
const risco: Record<NivelRisco, { cls: string; Icon: typeof Info }> = {
  baixo: { cls: "bg-green-100 text-green-800 border-green-200", Icon: CheckCircle },
  medio: { cls: "bg-yellow-100 text-yellow-900 border-yellow-200", Icon: Info },
  alto: { cls: "bg-orange-100 text-orange-900 border-orange-200", Icon: AlertTriangle },
  critico: { cls: "bg-red-100 text-red-800 border-red-200", Icon: OctagonAlert },
};

export function RiscoBadge({ nivel }: { nivel: NivelRisco | null }) {
  if (!nivel) {
    return (
      <span className="text-xs text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
        Sem classificação
      </span>
    );
  }
  const { cls, Icon } = risco[nivel];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cls}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {NIVEL_RISCO_LABEL[nivel]}
    </span>
  );
}
