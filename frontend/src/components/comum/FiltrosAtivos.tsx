import { X } from "lucide-react";

export interface FiltroAtivo {
  chave: string;
  rotulo: string;
}

/** Chips dos filtros aplicados, com remoção individual e "limpar tudo". */
export function FiltrosAtivos({
  itens,
  onRemover,
  onLimparTudo,
}: {
  itens: FiltroAtivo[];
  onRemover: (chave: string) => void;
  onLimparTudo: () => void;
}) {
  if (itens.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <span className="text-xs text-[#4a5568]">Filtros:</span>
      {itens.map((f) => (
        <button
          key={f.chave}
          onClick={() => onRemover(f.chave)}
          className="inline-flex items-center gap-1.5 text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-md font-semibold hover:bg-[#d3ecd4] transition-colors"
        >
          {f.rotulo}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button onClick={onLimparTudo} className="text-xs text-[#4a5568] hover:text-[#1B5E20] hover:underline">
        Limpar tudo
      </button>
    </div>
  );
}
