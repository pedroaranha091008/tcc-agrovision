import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Activity, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { api, apiLista } from "../../lib/api";
import { formatarData, NIVEIS_RISCO, TIPOS_ANALISE } from "../../lib/format";
import type { Monitoramento, NivelRisco, Paginacao, PropriedadeDetalhe, PropriedadeResumo, TipoAnalise } from "../../lib/types";
import { useCarregar } from "../../lib/useCarregar";
import { Carregando } from "../../components/Carregando";
import { EstadoErro, EstadoVazio, LinkPrimario } from "../../components/Estados";
import { RiscoBadge } from "../../components/RiscoBadge";
import { CabecalhoPagina } from "./DashboardLayout";

const FILTROS = ["data_inicio", "data_fim", "id_propriedade", "id_talhao", "tipo_analise", "nivel_risco"] as const;
type Filtro = (typeof FILTROS)[number];

const selectClasse = "w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]";

export function AnalisesPage() {
  const [params, setParams] = useSearchParams();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false); // só no celular; em telas maiores ficam sempre visíveis
  const valor = (f: Filtro) => params.get(f) ?? "";
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);
  const consulta = new URLSearchParams();
  for (const f of FILTROS) if (valor(f)) consulta.set(f, valor(f));
  consulta.set("pagina", String(pagina));

  const { dados: propriedades } = useCarregar(() => api<PropriedadeResumo[]>("/propriedades"), []);
  const idProp = valor("id_propriedade");
  const { dados: propriedade } = useCarregar(
    () => (idProp ? api<PropriedadeDetalhe>(`/propriedades/${idProp}`) : Promise.resolve(null)),
    [idProp],
  );
  const { dados, erro, carregando, recarregar } = useCarregar(
    () => apiLista<Monitoramento, Paginacao>(`/monitoramentos?${consulta.toString()}`),
    [consulta.toString()],
  );

  /** Mudar qualquer filtro volta para a página 1; trocar a propriedade limpa o talhão. */
  const mudar = (mudancas: Partial<Record<Filtro | "pagina", string>>) => {
    // Lê da URL atual (não do último render) para duas mudanças seguidas não se sobrescreverem.
    const novos = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(mudancas)) { if (v) novos.set(k, v); else novos.delete(k); }
    if (!("pagina" in mudancas)) novos.delete("pagina");
    if ("id_propriedade" in mudancas) novos.delete("id_talhao");
    setParams(novos);
  };

  const nomePropriedade = propriedades?.find(p => p.id_propriedade === idProp)?.nome_fazenda;
  const nomeTalhao = propriedade?.talhoes.find(t => t.id_talhao === valor("id_talhao"))?.nome_talhao;
  const ativos: { f: Filtro; texto: string }[] = [
    valor("data_inicio") && { f: "data_inicio" as Filtro, texto: `A partir de ${formatarData(valor("data_inicio"))}` },
    valor("data_fim") && { f: "data_fim" as Filtro, texto: `Até ${formatarData(valor("data_fim"))}` },
    idProp && { f: "id_propriedade" as Filtro, texto: nomePropriedade ?? "Propriedade" },
    valor("id_talhao") && { f: "id_talhao" as Filtro, texto: nomeTalhao ?? "Talhão" },
    valor("tipo_analise") && { f: "tipo_analise" as Filtro, texto: TIPOS_ANALISE[valor("tipo_analise") as TipoAnalise] ?? valor("tipo_analise") },
    valor("nivel_risco") && { f: "nivel_risco" as Filtro, texto: NIVEIS_RISCO[valor("nivel_risco") as NivelRisco] ?? valor("nivel_risco") },
  ].filter(Boolean) as { f: Filtro; texto: string }[];

  const lista = dados?.data ?? [];
  const meta = dados?.meta;
  const erroFiltro = erro?.status === 422 ? erro.details?.[0]?.mensagem ?? erro.message : null;

  return (
    <>
      <CabecalhoPagina titulo="Minhas Análises" descricao="Histórico de todos os monitoramentos das suas fazendas." />

      <button onClick={() => setFiltrosAbertos(!filtrosAbertos)} aria-expanded={filtrosAbertos} aria-controls="form-filtros"
        className="md:hidden w-full mb-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-[#212121]">
        <SlidersHorizontal className="w-4 h-4" aria-hidden /> {filtrosAbertos ? "Esconder filtros" : "Filtros"}{ativos.length > 0 && ` (${ativos.length})`}
      </button>
      <form id="form-filtros" className={`${filtrosAbertos ? "grid" : "hidden"} md:grid bg-white rounded-2xl border border-border p-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3`} onSubmit={e => e.preventDefault()} aria-label="Filtros">
        <div>
          <label htmlFor="f-inicio" className="block text-xs font-medium text-[#4a5568] mb-1">Voos a partir de</label>
          <input id="f-inicio" type="date" value={valor("data_inicio")} onChange={e => mudar({ data_inicio: e.target.value })} className={selectClasse} />
        </div>
        <div>
          <label htmlFor="f-fim" className="block text-xs font-medium text-[#4a5568] mb-1">Até</label>
          <input id="f-fim" type="date" value={valor("data_fim")} onChange={e => mudar({ data_fim: e.target.value })} className={selectClasse} />
        </div>
        <div>
          <label htmlFor="f-prop" className="block text-xs font-medium text-[#4a5568] mb-1">Propriedade</label>
          <select id="f-prop" value={idProp} onChange={e => mudar({ id_propriedade: e.target.value })} className={selectClasse}>
            <option value="">Todas</option>
            {propriedades?.map(p => <option key={p.id_propriedade} value={p.id_propriedade}>{p.nome_fazenda}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-talhao" className="block text-xs font-medium text-[#4a5568] mb-1">Talhão</label>
          <select id="f-talhao" value={valor("id_talhao")} onChange={e => mudar({ id_talhao: e.target.value })} className={selectClasse} disabled={!idProp}>
            <option value="">{idProp ? "Todos" : "Escolha a propriedade"}</option>
            {propriedade?.talhoes.map(t => <option key={t.id_talhao} value={t.id_talhao}>{t.nome_talhao}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-tipo" className="block text-xs font-medium text-[#4a5568] mb-1">Tipo</label>
          <select id="f-tipo" value={valor("tipo_analise")} onChange={e => mudar({ tipo_analise: e.target.value })} className={selectClasse}>
            <option value="">Todos</option>
            {Object.entries(TIPOS_ANALISE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-risco" className="block text-xs font-medium text-[#4a5568] mb-1">Risco</label>
          <select id="f-risco" value={valor("nivel_risco")} onChange={e => mudar({ nivel_risco: e.target.value })} className={selectClasse}>
            <option value="">Todos</option>
            {Object.entries(NIVEIS_RISCO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </form>

      {ativos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4" aria-label="Filtros ativos">
          {ativos.map(({ f, texto }) => (
            <button key={f} onClick={() => mudar({ [f]: "" })} className="inline-flex items-center gap-1 text-xs bg-[#E8F5E9] text-[#1B5E20] px-3 py-1.5 rounded-full font-medium hover:bg-[#C8E6C9]" aria-label={`Remover filtro ${texto}`}>
              {texto} <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          ))}
          <button onClick={() => setParams(new URLSearchParams())} className="text-xs font-semibold text-[#4a5568] hover:text-[#1B5E20] underline px-1">Limpar filtros</button>
        </div>
      )}

      {erroFiltro ? (
        <div role="alert" className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-2xl p-4 text-sm">{erroFiltro}</div>
      ) : erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard", label: "Voltar à visão geral" }} />
        : !dados ? <Carregando />
        : lista.length === 0 ? (
          ativos.length > 0
            ? <EstadoVazio icon={Activity} titulo="Nenhuma análise com esses filtros" texto="Tente ampliar o período ou remover algum filtro."
                acao={<button onClick={() => setParams(new URLSearchParams())} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]">Limpar filtros</button>} />
            : <EstadoVazio icon={Activity} titulo="Você ainda não tem análises" texto="Registre um voo, envie as imagens do drone e clique em Analisar imagens. As análises aparecem aqui."
                acao={<LinkPrimario to="/dashboard/fazendas">Ir para Fazendas</LinkPrimario>} />
        ) : (
          <div className={carregando ? "opacity-60" : ""} aria-busy={carregando}>
            <p className="text-sm text-[#4a5568] mb-2" aria-live="polite">{meta?.total} análise(s) encontrada(s)</p>

            {/* Tabela em telas médias e grandes */}
            <div className="relative hidden md:block bg-white rounded-2xl border border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA]">
                    {["Data do voo", "Propriedade · Talhão", "Tipo", "Origem", "Área afetada", "Risco"].map(h => (
                      <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
                    ))}
                    <th scope="col"><span className="sr-only">Abrir</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lista.map(a => (
                    <tr key={a.id_analise} className="hover:bg-[#F8F9FA]">
                      <td className="px-5 py-3 text-sm text-[#212121]">{formatarData(a.voo.data_voo)}</td>
                      <td className="px-5 py-3 text-sm text-[#212121]">{a.voo.talhao.propriedade.nome_fazenda} · <strong className="font-medium">{a.voo.talhao.nome_talhao}</strong></td>
                      <td className="px-5 py-3 text-sm text-[#4a5568]">{TIPOS_ANALISE[a.tipo_analise]}</td>
                      <td className="px-5 py-3 text-sm text-[#4a5568]">{a.origem === "automatica" ? "Automática" : "Manual"}</td>
                      <td className="px-5 py-3 text-sm text-[#4a5568]">{a.percentual_area_afetada !== null ? `${a.percentual_area_afetada.toLocaleString("pt-BR")}%` : "—"}</td>
                      <td className="px-5 py-3"><RiscoBadge nivel={a.nivel_risco} /></td>
                      <td className="px-3 py-3">
                        <Link to={`/dashboard/voos/${a.voo.id_voo}#analise-${a.id_analise}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B5E20] hover:underline">
                          Abrir <ChevronRight className="w-4 h-4" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartões no celular */}
            <ul className="md:hidden space-y-3">
              {lista.map(a => (
                <li key={a.id_analise}>
                  <Link to={`/dashboard/voos/${a.voo.id_voo}#analise-${a.id_analise}`} className="block bg-white rounded-2xl border border-border p-4 hover:border-[#66BB6A]">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm text-[#212121]">{a.voo.talhao.nome_talhao} <span className="font-normal text-[#4a5568]">· {a.voo.talhao.propriedade.nome_fazenda}</span></span>
                      <RiscoBadge nivel={a.nivel_risco} />
                    </div>
                    <p className="text-xs text-[#4a5568]">
                      Voo de {formatarData(a.voo.data_voo)} · {TIPOS_ANALISE[a.tipo_analise]} · {a.origem === "automatica" ? "automática" : "manual"}
                      {a.percentual_area_afetada !== null && ` · ${a.percentual_area_afetada.toLocaleString("pt-BR")}% afetada`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            {meta && meta.total_paginas > 1 && (
              <nav className="flex items-center justify-between mt-4" aria-label="Paginação">
                <button onClick={() => mudar({ pagina: String(pagina - 1) })} disabled={pagina <= 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-white text-sm disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" aria-hidden /> Anterior
                </button>
                <span className="text-sm text-[#4a5568]">Página {meta.pagina} de {meta.total_paginas}</span>
                <button onClick={() => mudar({ pagina: String(pagina + 1) })} disabled={pagina >= meta.total_paginas}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-white text-sm disabled:opacity-40">
                  Próxima <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              </nav>
            )}
          </div>
        )}
    </>
  );
}
