import { Link, useSearchParams } from "react-router";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, ArrowRight, Check, ChevronRight, ImageUp, Layers, Plane, Plus, RefreshCw, Tractor } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { formatarArea, formatarData, NIVEIS_RISCO, TIPOS_ANALISE } from "../../lib/format";
import type { NivelRisco, Painel, PropriedadeResumo } from "../../lib/types";
import { useCarregar } from "../../lib/useCarregar";
import { EstadoErro } from "../../components/Estados";
import { RiscoBadge } from "../../components/RiscoBadge";
import { CabecalhoPagina } from "./DashboardLayout";

const PERIODOS = [
  { dias: 30, label: "Últimos 30 dias" },
  { dias: 90, label: "Últimos 90 dias" },
  { dias: 180, label: "Últimos 6 meses" },
  { dias: 365, label: "Último ano" },
];

const COR_RISCO: Record<NivelRisco | "sem_analise", string> = {
  baixo: "#43A047", medio: "#FBC02D", alto: "#FB8C00", critico: "#E53935", sem_analise: "#CFD8DC",
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const rotuloMes = (aaaamm: string) => `${MESES[Number(aaaamm.slice(5, 7)) - 1]}/${aaaamm.slice(2, 4)}`;

function Esqueleto() {
  return (
    <div aria-hidden className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-border" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-border" /><div className="h-72 bg-white rounded-2xl border border-border" /></div>
    </div>
  );
}

/** Primeiro acesso: guia passo a passo até a primeira análise. */
function PrimeirosPassos({ painel }: { painel: Painel }) {
  const passos = [
    { feito: painel.totais.propriedades > 0, titulo: "Cadastre sua fazenda", texto: "Nome, cidade e estado da propriedade.", icon: Tractor },
    { feito: painel.totais.talhoes > 0, titulo: "Divida em talhões", texto: "As áreas de plantio, com cultura e tamanho.", icon: Layers },
    { feito: painel.totais.voos > 0, titulo: "Registre um voo", texto: "A data do sobrevoo do drone em um talhão.", icon: Plane },
    { feito: painel.totais.imagens > 0, titulo: "Envie as imagens e analise", texto: "As fotos do drone viram mapa de vegetação e nível de risco.", icon: ImageUp },
  ];
  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#212121] mb-1 font-display">Vamos começar?</h2>
      <p className="text-sm text-[#4a5568] mb-6">Siga os passos abaixo. Assim que houver análises, este painel mostra a situação de cada talhão.</p>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {passos.map(({ feito, titulo, texto, icon: Icon }, i) => (
          <li key={titulo} className={`rounded-xl border p-4 ${feito ? "border-green-200 bg-green-50" : "border-border"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${feito ? "bg-green-600 text-white" : "bg-[#E8F5E9] text-[#1B5E20]"}`}>
                {feito ? <Check className="w-4 h-4" aria-label="Concluído" /> : i + 1}
              </span>
              <Icon className="w-4 h-4 text-[#1B5E20]" aria-hidden />
            </div>
            <h3 className="font-semibold text-sm text-[#212121]">{titulo}</h3>
            <p className="text-xs text-[#4a5568]">{texto}</p>
          </li>
        ))}
      </ol>
      <Link to="/dashboard/fazendas" className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32]">
        {painel.totais.propriedades === 0 ? <><Plus className="w-4 h-4" aria-hidden /> Cadastrar minha fazenda</> : <>Continuar em Fazendas <ArrowRight className="w-4 h-4" aria-hidden /></>}
      </Link>
    </div>
  );
}

export function OverviewPage() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const idPropriedade = params.get("propriedade") ?? "";
  const dias = Number(params.get("dias")) || 90;

  const { dados: propriedades } = useCarregar(() => api<PropriedadeResumo[]>("/propriedades"), []);
  const { dados: painel, erro, carregando, recarregar } = useCarregar(
    () => api<Painel>(`/dashboard?dias=${dias}${idPropriedade ? `&id_propriedade=${idPropriedade}` : ""}`),
    [dias, idPropriedade],
  );

  const mudarFiltro = (chave: string, valor: string) => {
    // Lê da URL atual (não do último render) para duas mudanças seguidas não se sobrescreverem.
    const novos = new URLSearchParams(window.location.search);
    if (valor) novos.set(chave, valor); else novos.delete(chave);
    setParams(novos, { replace: true });
  };

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";
  const periodo = PERIODOS.find(p => p.dias === dias)?.label.toLowerCase() ?? `${dias} dias`;
  const mostrarFiltros = (propriedades?.length ?? 0) > 0;
  const semAnalises = painel && painel.talhoes.every(t => !t.ultima_analise);

  return (
    <>
      <CabecalhoPagina titulo="Visão Geral" descricao={`Olá, ${primeiroNome}! Aqui está o resumo das suas propriedades.`}
        acao={mostrarFiltros ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="sr-only" htmlFor="filtro-propriedade">Propriedade</label>
            <select id="filtro-propriedade" value={idPropriedade} onChange={e => mudarFiltro("propriedade", e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]">
              <option value="">Todas as propriedades</option>
              {propriedades?.map(p => <option key={p.id_propriedade} value={p.id_propriedade}>{p.nome_fazenda}</option>)}
            </select>
            <label className="sr-only" htmlFor="filtro-periodo">Período</label>
            <select id="filtro-periodo" value={dias} onChange={e => mudarFiltro("dias", e.target.value === "90" ? "" : e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]">
              {PERIODOS.map(p => <option key={p.dias} value={p.dias}>{p.label}</option>)}
            </select>
            <button onClick={recarregar} className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white text-sm hover:bg-[#F8F9FA]" aria-label="Atualizar dados">
              <RefreshCw className={`w-4 h-4 ${carregando ? "animate-spin" : ""}`} aria-hidden /> <span className="sm:hidden">Atualizar</span>
            </button>
          </div>
        ) : undefined} />

      {erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard/fazendas", label: "Ir para Fazendas" }} />
        : !painel ? <Esqueleto />
        : painel.totais.propriedades === 0 && !idPropriedade ? <PrimeirosPassos painel={painel} />
        : (
          <div className={carregando ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={carregando}>
            {semAnalises && !idPropriedade && <div className="mb-6"><PrimeirosPassos painel={painel} /></div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { icon: Layers, label: "Área monitorada", value: formatarArea(painel.totais.area_monitorada_hectares), sub: `${painel.totais.talhoes} talhão(ões) em ${painel.totais.propriedades} propriedade(s)`, color: "text-[#1B5E20]", bg: "bg-[#E8F5E9]" },
                { icon: Plane, label: "Voos no período", value: painel.totais.voos_periodo.toLocaleString("pt-BR"), sub: `${painel.totais.voos} no total`, color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Activity, label: "Análises no período", value: painel.totais.analises_periodo.toLocaleString("pt-BR"), sub: `${painel.totais.imagens} imagem(ns) enviada(s)`, color: "text-violet-600", bg: "bg-violet-50" },
                { icon: AlertTriangle, label: "Talhões em alerta", value: painel.totais.areas_criticas.toLocaleString("pt-BR"), sub: "risco alto ou crítico na última análise", color: "text-red-500", bg: "bg-red-50" },
              ].map(({ icon: Icon, label, value, sub, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-border">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${color}`} aria-hidden /></div>
                  <div className="text-2xl font-bold text-[#212121] mb-0.5 font-display">{value}</div>
                  <div className="text-xs font-medium text-[#212121] mb-0.5">{label}</div>
                  <div className="text-xs text-[#4a5568]">{sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <section className="lg:col-span-2 bg-white rounded-2xl border border-border" aria-labelledby="titulo-talhoes">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 id="titulo-talhoes" className="font-bold text-[#212121] font-display">Situação dos talhões</h2>
                  <span className="text-xs text-[#4a5568]">pela análise do voo mais recente</span>
                </div>
                {painel.talhoes.length === 0 ? (
                  <p className="p-6 text-sm text-[#4a5568]">Nenhum talhão cadastrado {idPropriedade ? "nesta propriedade" : ""}. <Link to={idPropriedade ? `/dashboard/fazendas/${idPropriedade}` : "/dashboard/fazendas"} className="text-[#1B5E20] underline">Cadastrar talhão</Link></p>
                ) : (
                  <ul className="divide-y divide-border max-h-[22rem] overflow-y-auto">
                    {painel.talhoes.map(t => (
                      <li key={t.id_talhao}>
                        <Link to={t.ultima_analise ? `/dashboard/voos/${t.ultima_analise.id_voo}` : `/dashboard/talhoes/${t.id_talhao}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8F9FA]">
                          <span className="w-2 self-stretch rounded-full flex-shrink-0" style={{ background: COR_RISCO[t.ultima_analise?.nivel_risco ?? "sem_analise"] }} aria-hidden />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#212121] truncate">{t.nome_talhao} <span className="font-normal text-[#4a5568]">· {t.propriedade.nome_fazenda}</span></div>
                            <div className="text-xs text-[#4a5568] truncate">
                              {[t.cultura, formatarArea(t.area_hectares)].filter(Boolean).join(" · ")}
                              {t.ultima_analise ? ` · voo de ${formatarData(t.ultima_analise.data_voo)}` : ` · ${t.total_voos ? "voo sem análise" : "sem voos"}`}
                            </div>
                          </div>
                          {t.ultima_analise ? <RiscoBadge nivel={t.ultima_analise.nivel_risco} /> : <span className="text-xs text-[#4a5568] whitespace-nowrap">Sem análise</span>}
                          <ChevronRight className="w-4 h-4 text-[#4a5568] flex-shrink-0" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-border p-5" aria-labelledby="titulo-risco">
                <h2 id="titulo-risco" className="font-bold text-[#212121] mb-3 font-display">Talhões por risco</h2>
                {painel.talhoes.length === 0 ? <p className="text-sm text-[#4a5568]">Sem talhões.</p> : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={Object.entries(painel.risco_talhoes).filter(([, v]) => v > 0).map(([k, v]) => ({ k, name: k === "sem_analise" ? "Sem análise" : NIVEIS_RISCO[k as NivelRisco], value: v }))}
                          cx="50%" cy="50%" innerRadius={42} outerRadius={70} paddingAngle={2} dataKey="value">
                          {Object.entries(painel.risco_talhoes).filter(([, v]) => v > 0).map(([k]) => <Cell key={k} fill={COR_RISCO[k as NivelRisco]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v} talhão(ões)`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {(Object.keys(COR_RISCO) as (NivelRisco | "sem_analise")[]).map(k => (
                        <li key={k} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[#4a5568]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COR_RISCO[k] }} /> {k === "sem_analise" ? "Sem análise" : NIVEIS_RISCO[k]}</span>
                          <span className="font-semibold text-[#212121]">{painel.risco_talhoes[k]}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </div>

            <section className="bg-white rounded-2xl border border-border p-5 mb-6" aria-labelledby="titulo-evolucao">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 id="titulo-evolucao" className="font-bold text-[#212121] font-display">Voos e área afetada por mês</h2>
                <span className="text-xs text-[#4a5568] bg-[#F8F9FA] px-3 py-1 rounded-full">{painel.serie_mensal.length} meses</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={painel.serie_mensal.map(m => ({ ...m, rotulo: rotuloMes(m.mes) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#4a5568" }} />
                  <YAxis yAxisId="voos" allowDecimals={false} tick={{ fontSize: 11, fill: "#4a5568" }} width={28} />
                  <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#4a5568" }} width={40} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }}
                    formatter={(v: number, nome: string) => (nome === "Área afetada média" ? [`${v.toLocaleString("pt-BR")}%`, nome] : [v, nome])} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="voos" dataKey="voos" name="Voos" fill="#A5D6A7" radius={[6, 6, 0, 0]} />
                  <Line yAxisId="pct" type="monotone" dataKey="area_afetada_media" name="Área afetada média" stroke="#E53935" strokeWidth={2} connectNulls dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </section>

            <section className="bg-white rounded-2xl border border-border" aria-labelledby="titulo-ultimas">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
                <h2 id="titulo-ultimas" className="font-bold text-[#212121] font-display">Últimas análises <span className="text-sm font-normal text-[#4a5568]">({periodo})</span></h2>
                <Link to="/dashboard/analises" className="text-xs text-[#1B5E20] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9]">Ver histórico</Link>
              </div>
              {painel.ultimas_analises.length === 0 ? (
                <p className="p-6 text-sm text-[#4a5568]">Nenhuma análise neste período.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {painel.ultimas_analises.map(a => (
                    <li key={a.id_analise}>
                      <Link to={`/dashboard/voos/${a.id_voo}#analise-${a.id_analise}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 sm:px-6 py-3 hover:bg-[#F8F9FA]">
                        <span className="text-sm text-[#4a5568] w-20">{formatarData(a.data_voo)}</span>
                        <span className="text-sm font-medium text-[#212121] flex-1 min-w-[10rem]">{a.talhao} <span className="font-normal text-[#4a5568]">· {a.propriedade}</span></span>
                        <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-full font-medium">{TIPOS_ANALISE[a.tipo_analise]}</span>
                        <RiscoBadge nivel={a.nivel_risco} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
    </>
  );
}
