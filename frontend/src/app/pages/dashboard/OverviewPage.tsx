import { Link } from "react-router";
import { toast } from "sonner";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, AlertTriangle, Download, FileText, Info, Layers, Plus } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { CORES_STATUS, FarmMap } from "../../components/FarmMap";
import { CabecalhoPagina } from "./DashboardLayout";
import { pieData, recentReports, sectorData, vegetativeData } from "./demoData";

const INDICADORES = [
  { label: "Índice NDVI médio", texto: "0,82", valor: 0.82, max: 1, color: "#66BB6A" },
  { label: "Taxa de falhas", texto: "3,2%", valor: 3.2, max: 10, color: "#FFC107" },
  { label: "Contagem de árvores", texto: "1.847", valor: 1847, max: 2000, color: "#1B5E20" },
];

export function OverviewPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <>
      <CabecalhoPagina
        titulo="Visão Geral"
        descricao={`Olá, ${primeiroNome}! Aqui está o resumo das suas propriedades.`}
        acao={
          <Link to="/dashboard/analises" className="inline-flex items-center justify-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all">
            <Plus className="w-4 h-4" aria-hidden /> Nova Análise
          </Link>
        }
      />

      <div role="note" className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden />
        <p>
          <strong>Dados de demonstração.</strong> Os números abaixo são um exemplo de como seu painel vai ficar.
          Assim que você <Link to="/dashboard/fazendas" className="underline font-medium">cadastrar uma fazenda</Link> e enviar as imagens do primeiro voo, eles serão substituídos pelos dados reais.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { icon: Layers, label: "Hectares Analisados", value: "1.240", trend: "+12%", sub: "vs mês anterior", color: "text-[#1B5E20]", bg: "bg-[#E8F5E9]" },
          { icon: FileText, label: "Relatórios Disponíveis", value: "34", trend: "+5", sub: "novos esta semana", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Activity, label: "Voos Realizados", value: "18", trend: "mês", sub: "4 agendados", color: "text-violet-600", bg: "bg-violet-50" },
          { icon: AlertTriangle, label: "Áreas Críticas", value: "3", trend: "-2", sub: "vs semana passada", color: "text-red-500", bg: "bg-red-50" },
        ].map(({ icon: Icon, label, value, trend, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 border border-border">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} aria-hidden />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>{trend}</span>
            </div>
            <div className="text-2xl font-bold text-[#212121] mb-0.5 font-display">{value}</div>
            <div className="text-xs font-medium text-[#212121] mb-0.5">{label}</div>
            <div className="text-xs text-[#4a5568]">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold text-[#212121] font-display">Mapa da Fazenda — São João</h2>
            <span className="text-xs text-[#4a5568]">320 ha</span>
          </div>
          <FarmMap className="w-full h-52 sm:h-64 block" />
          <div className="px-5 py-3 bg-[#F8F9FA] flex flex-wrap items-center gap-4 text-xs text-[#4a5568]">
            {pieData.map(({ name, value }, i) => (
              <span key={name} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full inline-block ${Object.values(CORES_STATUS)[i].dot}`} /> {value}% {name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-[#212121] mb-3 font-display">Status da Lavoura</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={`pie-${i}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-2">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="text-center">
                  <div className="text-lg font-bold font-display" style={{ color }}>{value}%</div>
                  <div className="text-xs text-[#4a5568]">{name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-[#212121] mb-3 font-display">Indicadores</h2>
            <div className="space-y-3">
              {INDICADORES.map(({ label, texto, valor, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#4a5568]">{label}</span>
                    <span className="font-semibold text-[#212121]">{texto}</span>
                  </div>
                  <div className="h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden" role="progressbar" aria-label={label} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={max}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (valor / max) * 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-bold text-[#212121] font-display">Saúde Vegetativa — NDVI</h2>
            <span className="text-xs text-[#4a5568] bg-[#F8F9FA] px-3 py-1 rounded-full whitespace-nowrap">Últimos 7 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={vegetativeData}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#66BB6A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4a5568" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} domain={[60, 100]} width={32} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }} />
              <Area type="monotone" dataKey="health" name="Saúde (%)" stroke="#1B5E20" strokeWidth={2} fill="url(#healthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-bold text-[#212121] font-display">Falhas por Setor</h2>
            <span className="text-xs text-[#4a5568] bg-[#F8F9FA] px-3 py-1 rounded-full whitespace-nowrap">% de área</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: "#4a5568" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} width={32} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }} />
              <Bar dataKey="falhas" name="Falhas (%)" radius={[6, 6, 0, 0]}>
                {sectorData.map((entry, i) => (
                  <Cell key={`bar-${i}`} fill={entry.falhas > 4 ? "#ef4444" : entry.falhas > 2.5 ? "#FFC107" : "#66BB6A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <h2 className="font-bold text-[#212121] font-display">Relatórios Recentes</h2>
          <Link to="/dashboard/relatorios" className="text-xs text-[#1B5E20] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors">Ver todos</Link>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#F8F9FA]">
                {["ID", "Fazenda", "Área", "Tipo", "Data", "Status"].map(h => (
                  <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
                ))}
                <th scope="col" className="px-5 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#1B5E20]">{r.id}</td>
                  <td className="px-5 py-4 text-sm text-[#212121]">{r.farm}</td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{r.area}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-full font-medium">{r.type}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{r.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "Pronto" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors" aria-label={`Baixar relatório ${r.id}`}
                      onClick={() => toast.info("Relatório de demonstração", { description: "O download em PDF fica disponível para os relatórios das suas próprias análises." })}>
                      <Download className="w-4 h-4 text-[#1B5E20]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
