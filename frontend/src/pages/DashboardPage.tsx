import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Download,
  FileText,
  Filter,
  Layers,
  Plus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartBar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/features/auth/AuthContext";
import { pieData, recentReports, sectorData, vegetativeData } from "./dashboard/_mockData";

const metricCards = [
  {
    icon: Layers,
    label: "Hectares Analisados",
    value: "1.240",
    trend: "+12%",
    sub: "vs mês anterior",
    color: "text-[#1B5E20]",
    bg: "bg-[#E8F5E9]",
  },
  {
    icon: FileText,
    label: "Relatórios Disponíveis",
    value: "34",
    trend: "+5",
    sub: "novos esta semana",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Activity,
    label: "Voos Realizados",
    value: "18",
    trend: "este mês",
    sub: "4 agendados",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: AlertTriangle,
    label: "Áreas Críticas",
    value: "3",
    trend: "-2",
    sub: "vs semana passada",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const indicadores = [
  { label: "Índice NDVI médio", value: "0.82", max: 1, color: "#66BB6A" },
  { label: "Taxa de falhas", value: "3.2%", max: 10, color: "#FFC107" },
  { label: "Contagem árvores", value: "1.847", max: 2000, color: "#1B5E20" },
];

export function DashboardPage() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "produtor";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Visão Geral
          </h1>
          <p className="text-[#4a5568] text-sm">
            Bem-vindo, {primeiroNome}! Aqui está o resumo da sua propriedade.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all">
          <Plus className="w-4 h-4" /> Nova Análise
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map(({ icon: Icon, label, value, trend, sub, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-border hover:border-[#A5D6A7] hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>{trend}</span>
            </div>
            <div className="text-2xl font-bold text-[#212121] mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>
              {value}
            </div>
            <div className="text-xs font-medium text-[#212121] mb-0.5">{label}</div>
            <div className="text-xs text-[#4a5568]">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Mapa da Fazenda — São João
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#4a5568]">320 ha</span>
              <button className="p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors" aria-label="Filtrar mapa">
                <Filter className="w-4 h-4 text-[#4a5568]" />
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071185765b?w=800&h=320&fit=crop&auto=format"
              alt="Mapa de calor NDVI da lavoura"
              className="w-full h-52 object-cover"
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(102,187,106,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.8) 1px, transparent 1px)",
                backgroundSize: "25px 25px",
              }}
            />
            <div className="absolute top-4 left-6 bg-green-500/70 backdrop-blur-sm border border-green-400 text-white text-xs px-2 py-1 rounded-lg">
              Talhão A — 98 ha ✓
            </div>
            <div className="absolute top-4 right-6 bg-yellow-500/70 backdrop-blur-sm border border-yellow-400 text-white text-xs px-2 py-1 rounded-lg">
              Talhão B — 72 ha ⚠
            </div>
            <div className="absolute bottom-4 left-6 bg-red-500/70 backdrop-blur-sm border border-red-400 text-white text-xs px-2 py-1 rounded-lg">
              Talhão C — 45 ha !
            </div>
            <div className="absolute bottom-4 right-6 bg-green-500/70 backdrop-blur-sm border border-green-400 text-white text-xs px-2 py-1 rounded-lg">
              Talhão D — 105 ha ✓
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {[
                { c: "bg-green-500", l: "Saudável" },
                { c: "bg-yellow-400", l: "Atenção" },
                { c: "bg-red-500", l: "Crítico" },
              ].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className={`w-2 h-2 rounded-full ${c}`} />
                  <span className="text-white text-xs">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-3 bg-[#F8F9FA] flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[#4a5568]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 74% Saudável
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 18% Atenção
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 8% Crítico
              </span>
            </div>
            <button className="text-xs text-[#1B5E20] font-semibold hover:underline flex items-center gap-1">
              Ampliar <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              Status da Lavoura
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={`pie-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-2">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="text-center">
                  <div className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color }}>
                    {value}%
                  </div>
                  <div className="text-xs text-[#4a5568]">{name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              Indicadores
            </h3>
            <div className="space-y-3">
              {indicadores.map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#4a5568]">{label}</span>
                    <span className="font-semibold text-[#212121]">{value}</span>
                  </div>
                  <div className="h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(parseFloat(value) / max) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Saúde Vegetativa — NDVI
            </h3>
            <span className="text-xs text-[#4a5568] bg-[#F8F9FA] px-3 py-1 rounded-full">Últimos 7 meses</span>
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
              <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="health"
                name="Saúde (%)"
                stroke="#1B5E20"
                strokeWidth={2}
                fill="url(#healthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Falhas por Setor
            </h3>
            <span className="text-xs text-[#4a5568] bg-[#F8F9FA] px-3 py-1 rounded-full">% de área</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RechartBar data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: "#4a5568" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E8F5E9", fontSize: "12px" }} />
              <Bar dataKey="falhas" name="Falhas (%)" fill="#2E7D32" radius={[6, 6, 0, 0]}>
                {sectorData.map((entry, i) => (
                  <Cell
                    key={`bar-${i}`}
                    fill={entry.falhas > 4 ? "#ef4444" : entry.falhas > 2.5 ? "#FFC107" : "#66BB6A"}
                  />
                ))}
              </Bar>
            </RechartBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Relatórios Recentes
          </h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#1B5E20] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9]">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </button>
            <button className="text-xs text-[#1B5E20] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors">
              Ver todos
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA]">
                {["ID", "Fazenda", "Área", "Tipo", "Data", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#1B5E20]">{r.id}</td>
                  <td className="px-5 py-4 text-sm text-[#212121]">{r.farm}</td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{r.area}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-full font-medium">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{r.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === "Pronto" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="p-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors"
                      aria-label={`Baixar relatório ${r.id}`}
                    >
                      <Download className="w-4 h-4 text-[#1B5E20]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
