import type { ReactNode } from "react";

/**
 * Rotulo editorial das secoes (substitui os badges em capsula): uma barra
 * solida curta + texto maiusculo espacado, sem fundo nem borda arredondada.
 */
export function Kicker({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-3 mb-5 text-xs font-bold uppercase tracking-[0.18em] ${
        light ? "text-white/70" : "text-[#1B5E20]"
      }`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <span className={`h-[3px] w-8 ${light ? "bg-[#66BB6A]" : "bg-[#1B5E20]"}`} />
      {children}
    </div>
  );
}
