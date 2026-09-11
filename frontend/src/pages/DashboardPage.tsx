import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Activity,
  AlertTriangle,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Tractor,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { BotaoSecundario, Select } from "@/components/comum/Form";
import { StatusTalhaoBadge } from "@/components/comum/StatusBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { useQuery } from "@/hooks/useQuery";
import * as dashboardService from "@/services/dashboard";
import * as propriedadeService from "@/services/propriedades";
import * as talhaoService from "@/services/talhoes";
import { area } from "@/lib/formatar";
import { RISCO_COR, RISCO_LABEL, TIPO_LABEL, type DistribuicaoRisco } from "@/types/dashboard";

const MESES_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez",
];

function rotuloMes(mes: string): string {
  const [ano, m] = mes.split("-");
  const idx = Number(m) - 1;
  return `${MESES_PT[idx] ?? m}/${ano.slice(2)}`;
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "produtor";
  const [params, setParams] = useSearchParams();

  const idPropriedade = params.get("id_propriedade") ?? "";
  const dataInicio = params.get("data_inicio") ?? "";
  const dataFim = params.get("data_fim") ?? "";

  function atualizarFiltro(chave: string, valor: string) {
    const novo = new URLSearchParams(params);
    if (valor) novo.set(chave, valor);
    else novo.delete(chave);
    setParams(novo, { replace: true });
  }

  const propriedades = useQuery((s) => propriedadeService.listar({ por_pagina: 100 }, s), []);

  const resumo = useQuery(
    (s) => dashboardService.obterResumo({ id_propriedade: idPropriedade || undefined, data_inicio: dataInicio || undefined, data_fim: dataFim || undefined }, s),
    [idPropriedade, dataInicio, dataFim],
  );

  const talhoes = useQuery(
    (s) => talhaoService.listar({ id_propriedade: idPropriedade || undefined, por_pagina: 8 }, s),
    [idPropriedade],
  );

  const nomePropriedade = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of propriedades.data?.itens ?? []) mapa.set(p.id_propriedade, p.nome_fazenda);
    return mapa;
  }, [propriedades.data]);

  const dadosRisco = useMemo(() => {
    const d = resumo.data?.indicadores.distribuicao_risco;
    if (!d) return [];
    return (Object.keys(d) as Array<keyof DistribuicaoRisco>)
      .filter((k) => d[k] > 0)
      .map((k) => ({ chave: k, nome: RISCO_LABEL[k], valor: d[k], cor: RISCO_COR[k] }));
  }, [resumo.data]);

  const semDadosAinda =
    !resumo.loading && !resumo.error && resumo.data && resumo.data.indicadores.total_propriedades === 0;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        titulo="Visão Geral"
        descricao={`Bem-vindo, ${primeiroNome}! Aqui está o resumo da sua propriedade.`}
        acao={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resumo.refetch();
                talhoes.refetch();
              }}
              className="p-2.5 rounded-xl border border-border hover:bg-[#F8F9FA] text-[#4a5568] transition-colors"
              aria-label="Atualizar dados"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${resumo.loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              to="/propriedades"
              className="flex items-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all"
            >
              <Plus className="w-4 h-4" /> Nova propriedade
            </Link>
          </div>
        }
      />

      {/* Filtros, sincronizados com a URL */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label htmlFor="dash-filtro-propriedade" className="block text-xs font-medium text-[#4a5568] mb-1">
            Propriedade
          </label>
          <Select
            id="dash-filtro-propriedade"
            value={idPropriedade}
            onChange={(e) => atualizarFiltro("id_propriedade", e.target.value)}
            className="!w-auto min-w-[180px]"
          >
            <option value="">Todas as propriedades</option>
            {propriedades.data?.itens.map((p) => (
              <option key={p.id_propriedade} value={p.id_propriedade}>
                {p.nome_fazenda}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="dash-filtro-data-inicio" className="block text-xs font-medium text-[#4a5568] mb-1">
            De
          </label>
          <input
            id="dash-filtro-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => atualizarFiltro("data_inicio", e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
          />
        </div>
        <div>
          <label htmlFor="dash-filtro-data-fim" className="block text-xs font-medium text-[#4a5568] mb-1">
            Até
          </label>
          <input
            id="dash-filtro-data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => atualizarFiltro("data_fim", e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
          />
        </div>
        {(idPropriedade || dataInicio || dataFim) && (
          <BotaoSecundario onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Limpar filtros
          </BotaoSecundario>
        )}
      </div>

      {resumo.loading && <Carregando texto="Carregando indicadores..." />}
      {resumo.error && <EstadoErro erro={resumo.error} onTentarNovamente={resumo.refetch} />}

      {semDadosAinda && (
        <EstadoVazio
          titulo="Nenhum dado para exibir ainda"
          descricao="Cadastre sua primeira propriedade para começar a monitorar talhões, voos e análises."
          acao={
            <Link
              to="/propriedades"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] transition-colors"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Plus className="w-4 h-4" /> Nova propriedade
            </Link>
          }
        />
      )}

      {!resumo.loading && !resumo.error && resumo.data && !semDadosAinda && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                icon: Layers,
                label: "Área Monitorada",
                value: area(resumo.data.indicadores.area_monitorada_hectares),
                color: "text-[#1B5E20]",
                bg: "bg-[#E8F5E9]",
              },
              {
                icon: Activity,
                label: "Voos Registrados",
                value: String(resumo.data.indicadores.total_voos),
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                icon: FileText,
                label: "Análises Registradas",
                value: String(resumo.data.indicadores.total_analises),
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: AlertTriangle,
                label: "Problemas Detectados",
                value: String(resumo.data.indicadores.problemas_detectados),
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-border hover:border-[#A5D6A7] hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-[#212121] mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {value}
                </div>
                <div className="text-xs font-medium text-[#4a5568]">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Voos e análises por mês
                </h3>
              </div>
              {resumo.data.series.length === 0 ? (
                <p className="text-sm text-[#4a5568] py-10 text-center">Sem voos no período selecionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={resumo.data.series.map((s) => ({ ...s, rotulo: rotuloMes(s.mes) }))}>
                    <defs>
                      <linearGradient id="voosGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="analisesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#66BB6A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#4a5568" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="voos" name="Voos" stroke="#1B5E20" strokeWidth={2} fill="url(#voosGrad)" />
                    <Area type="monotone" dataKey="analises" name="Análises" stroke="#66BB6A" strokeWidth={2} fill="url(#analisesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                Distribuição de risco
              </h3>
              {dadosRisco.length === 0 ? (
                <p className="text-sm text-[#4a5568] py-8 text-center">Nenhuma análise classificada ainda.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={dadosRisco} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="valor">
                        {dadosRisco.map((d) => (
                          <Cell key={d.chave} fill={d.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                    {dadosRisco.map((d) => (
                      <div key={d.chave} className="flex items-center gap-1.5 text-xs text-[#4a5568]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.cor }} />
                        {d.nome} ({d.valor})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#212121] flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  <Tractor className="w-4 h-4" /> Talhões
                </h3>
                <Link to="/propriedades" className="text-xs text-[#1B5E20] font-semibold hover:underline">
                  Ver propriedades
                </Link>
              </div>
              {talhoes.loading && <Carregando texto="Carregando talhões..." />}
              {talhoes.error && <EstadoErro erro={talhoes.error} onTentarNovamente={talhoes.refetch} />}
              {!talhoes.loading && !talhoes.error && talhoes.data && (
                talhoes.data.itens.length === 0 ? (
                  <EstadoVazio
                    titulo="Nenhum talhão cadastrado"
                    descricao="Cadastre talhões dentro de uma propriedade para vê-los aqui."
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {talhoes.data.itens.map((t) => (
                      <Link
                        key={t.id_talhao}
                        to={`/talhoes/${t.id_talhao}`}
                        className="bg-white rounded-2xl border border-border p-4 hover:border-[#A5D6A7] hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {t.nome_talhao}
                          </span>
                          <StatusTalhaoBadge status={t.status} />
                        </div>
                        <p className="text-sm text-[#4a5568] mt-1">
                          {t.cultura ?? "Sem cultura"} · {area(t.area_hectares)}
                        </p>
                        {!idPropriedade && (
                          <p className="text-xs text-[#4a5568] mt-1">
                            {nomePropriedade.get(t.id_propriedade) ?? "Propriedade"}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                Análises por tipo
              </h3>
              {resumo.data.indicadores.distribuicao_tipo.length === 0 ? (
                <p className="text-sm text-[#4a5568] py-6 text-center">Nenhuma análise registrada ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {resumo.data.indicadores.distribuicao_tipo.map((t) => (
                    <li key={t.tipo_analise} className="flex items-center justify-between text-sm">
                      <span className="text-[#4a5568]">{TIPO_LABEL[t.tipo_analise] ?? t.tipo_analise}</span>
                      <span className="font-semibold text-[#212121]">{t.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
