import { useState } from "react";
import { Link } from "react-router";
import { Download, Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { Paginacao } from "@/components/comum/Paginacao";
import { Modal } from "@/components/comum/Modal";
import { BotaoPrimario } from "@/components/comum/Form";
import { RiscoBadge, StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { useQuery } from "@/hooks/useQuery";
import * as relatorioService from "@/services/relatorios";
import { dataHora } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import { TIPO_LABEL } from "@/types/dashboard";
import type { Relatorio } from "@/types/relatorio";

export function RelatoriosListPage() {
  const [pagina, setPagina] = useState(1);
  const q = useQuery((s) => relatorioService.listar({ pagina, por_pagina: 12 }, s), [pagina]);

  const [preview, setPreview] = useState<Relatorio | null>(null);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  async function baixar(r: Relatorio) {
    setErro(null);
    setBaixandoId(r.id_relatorio);
    setProgresso(0);
    try {
      await relatorioService.baixar(r.id_relatorio, r.id_analise, { onProgresso: setProgresso });
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setBaixandoId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader titulo="Relatórios" descricao="Relatórios em PDF gerados a partir das análises concluídas" />

      {erro && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erro}
        </div>
      )}

      {q.loading && <Carregando />}
      {q.error && <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />}

      {!q.loading && !q.error && q.data && (
        <>
          {q.data.itens.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum relatório gerado ainda"
              descricao="Abra uma análise concluída e gere o relatório para vê-lo aqui."
              acao={
                <Link to="/analises" className="text-sm text-[#1B5E20] font-semibold hover:underline">
                  Ir para o histórico de análises
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {q.data.itens.map((r) => (
                <div key={r.id_relatorio} className="bg-white rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {r.analise ? TIPO_LABEL[r.analise.tipo_analise] : "Análise"}
                      </p>
                      <p className="text-sm text-[#4a5568]">
                        {r.analise?.voo.talhao.propriedade.nome_fazenda} — {r.analise?.voo.talhao.nome_talhao}
                      </p>
                    </div>
                    {r.analise && <RiscoBadge nivel={r.analise.nivel_risco} />}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {r.analise && <StatusProcessamentoBadge status={r.analise.status} />}
                    <span className="text-xs text-[#4a5568]">Gerado em {dataHora(r.gerado_em)}</span>
                  </div>

                  {baixandoId === r.id_relatorio && (
                    <div
                      className="mt-3 h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label="Baixando relatório em PDF"
                      aria-valuenow={progresso}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full bg-[#66BB6A] transition-all" style={{ width: `${progresso}%` }} />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => setPreview(r)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-[#4a5568] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizar
                    </button>
                    <button
                      onClick={() => baixar(r)}
                      disabled={baixandoId === r.id_relatorio}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white font-medium hover:bg-[#2E7D32] transition-colors disabled:opacity-60"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar PDF
                    </button>
                    <Link
                      to={`/analises/${r.id_analise}`}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-[#4a5568] hover:bg-[#F8F9FA] transition-colors"
                    >
                      Ver análise
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Paginacao meta={q.data.meta} onPagina={setPagina} />
        </>
      )}

      <Modal aberto={Boolean(preview)} titulo="Prévia do relatório" onFechar={() => setPreview(null)}>
        {preview && (
          <div style={{ fontFamily: "Inter, sans-serif" }}>
            <div className="flex items-center gap-2 mb-3 text-sm text-[#4a5568]">
              <FileText className="w-4 h-4" />
              <span>Versão das regras {preview.versao_regras} · gerado em {dataHora(preview.gerado_em)}</span>
            </div>
            <p className="text-sm text-[#212121] leading-relaxed">{preview.recomendacao}</p>
            <div className="mt-5 flex justify-end">
              <BotaoPrimario onClick={() => baixar(preview)} carregando={baixandoId === preview.id_relatorio}>
                <Download className="w-4 h-4" /> Baixar PDF
              </BotaoPrimario>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
