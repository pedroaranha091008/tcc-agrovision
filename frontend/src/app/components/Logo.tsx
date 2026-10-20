import { Leaf } from "lucide-react";

type Variante = "claro" | "escuro";

/** Marca AgroVision. "claro" = para fundos escuros (texto branco); "escuro" = para fundos claros. */
export function Logo({ variante = "escuro", tamanho = "md" }: { variante?: Variante; tamanho?: "sm" | "md" }) {
  const caixa = tamanho === "sm" ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl";
  const texto = tamanho === "sm" ? "text-lg" : "text-xl";
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${caixa} bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center shadow-md flex-shrink-0`}>
        <Leaf className="w-5 h-5 text-white" aria-hidden />
      </span>
      <span className={`font-bold ${texto} tracking-tight font-display`}>
        <span className={variante === "claro" ? "text-white" : "text-[#1B5E20]"}>Agro</span>
        <span className={variante === "claro" ? "text-[#A5D6A7]" : "text-[#66BB6A]"}>Vision</span>
      </span>
    </span>
  );
}
