import { useState } from "react";
import { Download, Lightbulb } from "lucide-react";
import * as relatorioService from "@/services/relatorios";
import { mensagemDoErro } from "@/services/erros";
import type { Analise } from "@/types/dominio";
import type { RecomendacaoGerada } from "@/types/relatorio";

/** O backend so gera relatorio de analise concluida, com risco e resultado. */
export function analiseCompleta(a: Pick<Analise, "status" | "nivel_risco" | "resultado">): boolean {
  return a.status === "concluido" && a.nivel_risco != null && Boolean(a.resultado?.trim());
}

/**
 * Gera o relatorio (o PDF sai sempre com os dados atuais da analise) e baixa
 * em seguida. Mostra o erro ao lado se algo falhar.
 */
export function BotaoPdf({
  idAnalise,
  disponivel,
  compacto = false,
}: {
  idAnalise: string;
  disponivel: boolean;
  compacto?: boolean;
}) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function baixar() {
    setBaixando(true);
    setErro(null);
    try {
      const { relatorio } = await relatorioService.gerar(idAnalise);
      await relatorioService.baixar(relatorio.id_relatorio, idAnalise);
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setBaixando(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        onClick={baixar}
        disabled={baixando || !disponivel}
        title={disponivel ? undefined : "O relatório fica disponível quando a análise está concluída, com nível de risco e resultado."}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/30 bg-white text-[#1B5E20] font-semibold hover:bg-[#E8F5E9] disabled:opacity-50 disabled:cursor-not-allowed ${compacto ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {baixando ? (
          <span className="w-3.5 h-3.5 border-2 border-[#1B5E20]/30 border-t-[#1B5E20] rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" aria-hidden />
        )}
        {baixando ? "Gerando PDF..." : "Baixar PDF"}
      </button>
      {erro && (
        <span role="alert" className="text-xs text-red-600 mt-1 max-w-[16rem] text-right">
          {erro}
        </span>
      )}
    </span>
  );
}

export function CaixaRecomendacao({ recomendacao }: { recomendacao: RecomendacaoGerada }) {
  return (
    <div className="rounded-xl border border-[#A5D6A7] bg-[#F1F8E9] p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <h4 className="flex items-center gap-2 font-semibold text-[#1B5E20] mb-1">
        <Lightbulb className="w-4 h-4" aria-hidden /> Recomendação: {recomendacao.titulo}
      </h4>
      <p className="text-sm font-medium text-[#212121] mb-2">{recomendacao.prazo}</p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#212121]">
        {recomendacao.acoes.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[#4a5568] italic">{recomendacao.aviso}</p>
    </div>
  );
}
