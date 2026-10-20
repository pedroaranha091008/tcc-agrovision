import { AlertTriangle, CheckCircle, Info, OctagonAlert } from "lucide-react";
import { NIVEIS_RISCO } from "../lib/format";
import type { NivelRisco } from "../lib/types";

// Cada nível tem ícone e texto próprios, para não depender só da cor (acessibilidade).
const ESTILOS: Record<NivelRisco, { classe: string; Icone: typeof Info }> = {
  baixo: { classe: "bg-green-100 text-green-800 border-green-200", Icone: CheckCircle },
  medio: { classe: "bg-yellow-100 text-yellow-900 border-yellow-200", Icone: Info },
  alto: { classe: "bg-orange-100 text-orange-900 border-orange-200", Icone: AlertTriangle },
  critico: { classe: "bg-red-100 text-red-800 border-red-200", Icone: OctagonAlert },
};

export function RiscoBadge({ nivel }: { nivel: NivelRisco | null }) {
  if (!nivel) return <span className="text-xs text-[#4a5568]">Sem classificação</span>;
  const { classe, Icone } = ESTILOS[nivel];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${classe}`}>
      <Icone className="w-3.5 h-3.5" aria-hidden /> {NIVEIS_RISCO[nivel]}
    </span>
  );
}
