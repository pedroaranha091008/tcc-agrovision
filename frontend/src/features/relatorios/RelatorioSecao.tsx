import { useState } from "react";
import { Download, FileText, Info, RefreshCw } from "lucide-react";
import { Carregando, EstadoErro } from "@/components/comum/Estados";
import { BotaoPrimario, BotaoSecundario } from "@/components/comum/Form";
import { useQuery } from "@/hooks/useQuery";
import * as relatorioService from "@/services/relatorios";
import { dataHora } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import type { Analise } from "@/types/dominio";

function analiseCompleta(a: Analise): boolean {
  return a.status === "concluido" && a.nivel_risco != null && Boolean(a.resultado?.trim());
}

/** Bloco de recomendação + relatório PDF de uma análise, usado na página de detalhe. */
export function RelatorioSecao({ analise }: { analise: Analise }) {
  const q = useQuery(
    (s) => relatorioService.listar({ id_analise: analise.id_analise, por_pagina: 1 }, s),
    [analise.id_analise],
  );
  const relatorio = q.data?.itens[0] ?? null;

  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const completa = analiseCompleta(analise);

  async function gerar() {
    setErro(null);
    setGerando(true);
    try {
      await relatorioService.gerar(analise.id_analise);
      q.refetch();
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setGerando(false);
    }
  }

  async function baixar() {
    if (!relatorio) return;
    setErro(null);
    setBaixando(true);
    setProgresso(0);
    try {
      await relatorioService.baixar(relatorio.id_relatorio, analise.id_analise, { onProgresso: setProgresso });
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setBaixando(false);
    }
  }

  if (q.loading) return <Carregando texto="Verificando relatório..." />;
  if (q.error) return <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />;

  return (
    <div className="rounded-2xl border border-border bg-white p-5" style={{ fontFamily: "Inter, sans-serif" }}>
      <h2 className="font-bold text-[#212121] flex items-center gap-2 mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
        <FileText className="w-4 h-4" /> Relatório e recomendação
      </h2>

      {erro && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erro}
        </div>
      )}

      {!relatorio && !completa && (
        <div className="flex items-start gap-2 text-sm text-[#4a5568] bg-[#F8F9FA] rounded-xl p-4">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            É preciso que a análise esteja <strong>concluída</strong>, com <strong>nível de risco</strong> e{" "}
            <strong>resultado</strong> preenchidos para gerar o relatório. Edite a análise na página do voo.
          </span>
        </div>
      )}

      {!relatorio && completa && (
        <div className="flex items-center justify-between gap-3 bg-[#F8F9FA] rounded-xl p-4">
          <p className="text-sm text-[#4a5568]">Nenhum relatório gerado ainda para esta análise.</p>
          <BotaoPrimario onClick={gerar} carregando={gerando}>
            Gerar relatório
          </BotaoPrimario>
        </div>
      )}

      {relatorio && (
        <div>
          <p className="text-sm text-[#212121] leading-relaxed">{relatorio.recomendacao}</p>
          <p className="text-xs text-[#4a5568] mt-3">
            Recomendação baseada em regras (versão {relatorio.versao_regras}) — gerada em{" "}
            {dataHora(relatorio.gerado_em)}. Não substitui a avaliação de um profissional agrícola.
          </p>

          {baixando && (
            <div
              className="mt-3 h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden max-w-xs"
              role="progressbar"
              aria-label="Baixando relatório em PDF"
              aria-valuenow={progresso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-[#66BB6A] transition-all" style={{ width: `${progresso}%` }} />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            <BotaoPrimario onClick={baixar} carregando={baixando}>
              <Download className="w-4 h-4" /> Baixar PDF
            </BotaoPrimario>
            <BotaoSecundario onClick={gerar} disabled={gerando}>
              <RefreshCw className={`w-4 h-4 ${gerando ? "animate-spin" : ""}`} /> Regenerar
            </BotaoSecundario>
          </div>
        </div>
      )}
    </div>
  );
}
