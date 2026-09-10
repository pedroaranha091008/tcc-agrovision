import type { StatusProcessamento, StatusTalhao } from "@/types/dominio";

const talhao: Record<StatusTalhao, { txt: string; cls: string }> = {
  ativo: { txt: "Ativo", cls: "bg-green-100 text-green-700" },
  inativo: { txt: "Inativo", cls: "bg-gray-100 text-gray-600" },
  em_analise: { txt: "Em análise", cls: "bg-yellow-100 text-yellow-700" },
};

const processamento: Record<StatusProcessamento, { txt: string; cls: string }> = {
  pendente: { txt: "Pendente", cls: "bg-gray-100 text-gray-600" },
  em_processamento: { txt: "Em processamento", cls: "bg-blue-100 text-blue-700" },
  concluido: { txt: "Concluído", cls: "bg-green-100 text-green-700" },
  falhou: { txt: "Falhou", cls: "bg-red-100 text-red-700" },
};

function Base({ txt, cls }: { txt: string; cls: string }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`} style={{ fontFamily: "Inter, sans-serif" }}>
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
