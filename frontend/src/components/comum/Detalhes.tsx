import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

/** Cartao com rotulo: valor, usado no topo das paginas de fazenda, talhao e voo. */
export function Detalhes({ itens }: { itens: [string, ReactNode][] }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {itens.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className="text-xs uppercase tracking-wide text-[#4a5568]">{rotulo}</dt>
            <dd className="text-sm font-medium text-[#212121] mt-0.5 break-words">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function BotoesEditarExcluir({
  nome,
  aoEditar,
  aoExcluir,
}: {
  nome: string;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  return (
    <div className="flex gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
      <button
        onClick={aoEditar}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium text-[#212121] hover:bg-[#F8F9FA]"
        aria-label={`Editar ${nome}`}
      >
        <Pencil className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Editar</span>
      </button>
      <button
        onClick={aoExcluir}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50"
        aria-label={`Excluir ${nome}`}
      >
        <Trash2 className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Excluir</span>
      </button>
    </div>
  );
}

/** Titulo de secao (ex.: "Talhoes", "Voos") com contador opcional e acao a direita. */
export function TituloSecao({ titulo, total, acao }: { titulo: string; total?: number; acao?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <h2 className="text-lg font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
        {titulo} {total != null && <span className="text-sm font-normal text-[#4a5568]">({total})</span>}
      </h2>
      {acao}
    </div>
  );
}
