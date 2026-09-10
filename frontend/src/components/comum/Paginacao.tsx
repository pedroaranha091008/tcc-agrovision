import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginacaoMeta } from "@/types/api";

export function Paginacao({ meta, onPagina }: { meta: PaginacaoMeta; onPagina: (p: number) => void }) {
  if (meta.total_paginas <= 1) return null;
  return (
    <div
      className="flex items-center justify-between gap-3 mt-4 text-sm text-[#4a5568]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <span>
        Página {meta.pagina} de {meta.total_paginas} · {meta.total} registro(s)
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPagina(meta.pagina - 1)}
          disabled={meta.pagina <= 1}
          className="p-2 rounded-lg border border-border hover:bg-[#F8F9FA] disabled:opacity-40 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPagina(meta.pagina + 1)}
          disabled={meta.pagina >= meta.total_paginas}
          className="p-2 rounded-lg border border-border hover:bg-[#F8F9FA] disabled:opacity-40 transition-colors"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
