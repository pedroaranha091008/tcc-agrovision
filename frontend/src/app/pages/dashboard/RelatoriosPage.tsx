import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { api, apiLista } from "../../lib/api";
import { formatarArea, formatarData, formatarDataHora, NIVEIS_RISCO, TIPOS_ANALISE } from "../../lib/format";
import type { AnaliseDetalhe, Monitoramento, NivelRisco, Paginacao, PropriedadeResumo } from "../../lib/types";
import { useCarregar } from "../../lib/useCarregar";
import { Carregando } from "../../components/Carregando";
import { EstadoErro, EstadoVazio, LinkPrimario } from "../../components/Estados";
import { Modal } from "../../components/Modal";
import { RiscoBadge } from "../../components/RiscoBadge";
import { BotaoPdf, CaixaRecomendacao } from "../../components/Relatorio";
import { CabecalhoPagina } from "./DashboardLayout";

const selectClasse = "w-full sm:w-auto px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]";

/** Pré-visualização: mostra o conteúdo do relatório antes de baixar o PDF. */
function PreVisualizacao({ idAnalise }: { idAnalise: string }) {
  const { dados: a, erro, recarregar } = useCarregar(() => api<AnaliseDetalhe>(`/analises/${idAnalise}`), [idAnalise]);
  if (erro) return <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard/relatorios", label: "Voltar" }} />;
  if (!a) return <Carregando />;
  const { talhao } = a.voo;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <RiscoBadge nivel={a.nivel_risco} />
        <span className="text-sm text-[#4a5568]">{TIPOS_ANALISE[a.tipo_analise]}{a.percentual_area_afetada !== null && ` · ${a.percentual_area_afetada.toLocaleString("pt-BR")}% afetada`}</span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div><dt className="text-xs text-[#4a5568]">Propriedade</dt><dd className="font-medium">{talhao.propriedade.nome_fazenda} — {talhao.propriedade.cidade}/{talhao.propriedade.estado}</dd></div>
        <div><dt className="text-xs text-[#4a5568]">Talhão</dt><dd className="font-medium">{[talhao.nome_talhao, talhao.cultura, formatarArea(talhao.area_hectares)].filter(Boolean).join(" · ")}</dd></div>
        <div><dt className="text-xs text-[#4a5568]">Voo</dt><dd className="font-medium">{formatarData(a.voo.data_voo)}{a.voo.modelo_drone && ` · ${a.voo.modelo_drone}`}</dd></div>
        <div><dt className="text-xs text-[#4a5568]">Análise</dt><dd className="font-medium">{a.origem === "automatica" ? "Automática" : "Manual"} · {formatarDataHora(a.data_analise)}</dd></div>
      </dl>
      {a.resultado && <p className="text-sm text-[#4a5568] whitespace-pre-line bg-[#F8F9FA] rounded-xl p-3">{a.resultado}</p>}
      {a.recomendacao && <CaixaRecomendacao recomendacao={a.recomendacao} />}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
        <Link to={`/dashboard/voos/${a.voo.id_voo}#analise-${a.id_analise}`} className="text-sm font-semibold text-[#1B5E20] hover:underline self-center">Abrir o voo</Link>
        <BotaoPdf idAnalise={a.id_analise} disponivel={!!a.nivel_risco} />
      </div>
    </div>
  );
}

export function RelatoriosPage() {
  const [params, setParams] = useSearchParams();
  const [visualizando, setVisualizando] = useState<Monitoramento | null>(null);
  const idProp = params.get("id_propriedade") ?? "";
  const risco = params.get("nivel_risco") ?? "";
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);
  const consulta = new URLSearchParams({ pagina: String(pagina), ...(idProp ? { id_propriedade: idProp } : {}), ...(risco ? { nivel_risco: risco } : {}) }).toString();

  const { dados: propriedades } = useCarregar(() => api<PropriedadeResumo[]>("/propriedades"), []);
  const { dados, erro, carregando, recarregar } = useCarregar(() => apiLista<Monitoramento, Paginacao>(`/monitoramentos?${consulta}`), [consulta]);

  const mudar = (chave: string, valor: string) => {
    const novos = new URLSearchParams(params);
    if (valor) novos.set(chave, valor); else novos.delete(chave);
    if (chave !== "pagina") novos.delete("pagina");
    setParams(novos);
  };

  const lista = dados?.data ?? [];
  const meta = dados?.meta;
  const filtrando = !!(idProp || risco);

  return (
    <>
      <CabecalhoPagina titulo="Relatórios" descricao="Cada análise gera um relatório em PDF com resultado, recomendação e mapas." />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <label className="sr-only" htmlFor="rel-prop">Propriedade</label>
        <select id="rel-prop" value={idProp} onChange={e => mudar("id_propriedade", e.target.value)} className={selectClasse}>
          <option value="">Todas as propriedades</option>
          {propriedades?.map(p => <option key={p.id_propriedade} value={p.id_propriedade}>{p.nome_fazenda}</option>)}
        </select>
        <label className="sr-only" htmlFor="rel-risco">Risco</label>
        <select id="rel-risco" value={risco} onChange={e => mudar("nivel_risco", e.target.value)} className={selectClasse}>
          <option value="">Todos os níveis de risco</option>
          {Object.entries(NIVEIS_RISCO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard", label: "Voltar à visão geral" }} />
        : !dados ? <Carregando />
        : lista.length === 0 ? (
          filtrando
            ? <EstadoVazio icon={FileText} titulo="Nenhum relatório com esses filtros" texto="Mude a propriedade ou o nível de risco."
                acao={<button onClick={() => setParams(new URLSearchParams())} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]">Limpar filtros</button>} />
            : <EstadoVazio icon={FileText} titulo="Nenhum relatório ainda" texto="Os relatórios aparecem aqui assim que você tiver análises nos seus voos."
                acao={<LinkPrimario to="/dashboard/fazendas">Ir para Fazendas</LinkPrimario>} />
        ) : (
          <div className={carregando ? "opacity-60" : ""} aria-busy={carregando}>
            <ul className="bg-white rounded-2xl border border-border divide-y divide-border">
              {lista.map(a => (
                <li key={a.id_analise} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 hidden sm:flex">
                    <FileText className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#212121]">
                      {a.voo.talhao.nome_talhao} <span className="font-normal text-[#4a5568]">· {a.voo.talhao.propriedade.nome_fazenda}</span>
                    </div>
                    <div className="text-xs text-[#4a5568]">
                      Voo de {formatarData(a.voo.data_voo)} · {TIPOS_ANALISE[a.tipo_analise]} · {a.origem === "automatica" ? "automática" : "manual"}
                    </div>
                  </div>
                  <RiscoBadge nivel={a.nivel_risco as NivelRisco | null} />
                  <div className="flex gap-2">
                    <button onClick={() => setVisualizando(a)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-semibold text-[#212121] hover:bg-[#F8F9FA]">
                      <Eye className="w-4 h-4" aria-hidden /> Visualizar
                    </button>
                    <BotaoPdf idAnalise={a.id_analise} disponivel={!!a.nivel_risco} />
                  </div>
                </li>
              ))}
            </ul>

            {meta && meta.total_paginas > 1 && (
              <nav className="flex items-center justify-between mt-4" aria-label="Paginação">
                <button onClick={() => mudar("pagina", String(pagina - 1))} disabled={pagina <= 1} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-white text-sm disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" aria-hidden /> Anterior
                </button>
                <span className="text-sm text-[#4a5568]">Página {meta.pagina} de {meta.total_paginas}</span>
                <button onClick={() => mudar("pagina", String(pagina + 1))} disabled={pagina >= meta.total_paginas} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-white text-sm disabled:opacity-40">
                  Próxima <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              </nav>
            )}
          </div>
        )}

      <Modal aberto={!!visualizando} aoFechar={() => setVisualizando(null)} titulo="Relatório da análise"
        descricao={visualizando ? `${visualizando.voo.talhao.propriedade.nome_fazenda} · ${visualizando.voo.talhao.nome_talhao}` : undefined}>
        {visualizando && <PreVisualizacao idAnalise={visualizando.id_analise} />}
      </Modal>
    </>
  );
}
