import { useState } from "react";
import { toast } from "sonner";
import { Download, Lightbulb } from "lucide-react";
import { apiDownload, ApiError } from "../lib/api";
import type { Recomendacao } from "../lib/types";
import { Spinner } from "./Carregando";

/** Baixa o PDF gerado pelo servidor, com indicação de progresso e mensagem em caso de falha. */
export function BotaoPdf({ idAnalise, disponivel = true, compacto = false }: { idAnalise: string; disponivel?: boolean; compacto?: boolean }) {
  const [baixando, setBaixando] = useState(false);

  const baixar = async () => {
    setBaixando(true);
    try {
      await apiDownload(`/analises/${idAnalise}/relatorio`, "relatorio-agrovision.pdf");
    } catch (e) {
      toast.error("Não foi possível gerar o relatório", { description: e instanceof ApiError ? e.message : undefined });
    } finally {
      setBaixando(false);
    }
  };

  return (
    <button onClick={baixar} disabled={baixando || !disponivel}
      title={disponivel ? undefined : "O relatório fica disponível quando a análise tem nível de risco."}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/30 text-[#1B5E20] font-semibold hover:bg-[#E8F5E9] disabled:opacity-50 disabled:cursor-not-allowed ${compacto ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}>
      {baixando ? <Spinner /> : <Download className="w-4 h-4" aria-hidden />}
      {baixando ? "Gerando PDF..." : "Baixar PDF"}
    </button>
  );
}

export function CaixaRecomendacao({ recomendacao }: { recomendacao: Recomendacao }) {
  return (
    <div className="rounded-xl border border-[#A5D6A7] bg-[#F1F8E9] p-4">
      <h4 className="flex items-center gap-2 font-semibold text-[#1B5E20] mb-1">
        <Lightbulb className="w-4 h-4" aria-hidden /> Recomendação: {recomendacao.titulo}
      </h4>
      <p className="text-sm font-medium text-[#212121] mb-2">{recomendacao.prazo}</p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#212121]">
        {recomendacao.acoes.map(a => <li key={a}>{a}</li>)}
      </ul>
      <p className="mt-3 text-xs text-[#4a5568] italic">{recomendacao.aviso}</p>
    </div>
  );
}
