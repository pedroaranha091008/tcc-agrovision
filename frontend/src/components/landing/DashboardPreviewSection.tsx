import { Link } from "react-router";
import { ArrowRight, Calendar, FileText, LayoutDashboard, Map, Settings, Tractor } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Kicker } from "./Kicker";

// Conteudo ilustrativo da landing page (nao vem da API).
const previewChart = [
  { month: "Mar", health: 80 },
  { month: "Abr", health: 88 },
  { month: "Mai", health: 92 },
  { month: "Jun", health: 90 },
  { month: "Jul", health: 94 },
];

const sidebarIcons = [LayoutDashboard, Map, FileText, Tractor, Calendar, Settings];
const sidebarLabels = ["Visão Geral", "Fazendas", "Relatórios", "Análises", "Agenda", "Config."];
const metricCards = [
  { label: "Hectares", value: "1.240", trend: "+12%", color: "text-[#66BB6A]" },
  { label: "Relatórios", value: "34", trend: "+5", color: "text-[#A5D6A7]" },
  { label: "Voos", value: "18", trend: "este mês", color: "text-yellow-400" },
  { label: "Áreas Críticas", value: "3", trend: "-2 vs mês", color: "text-red-400" },
];

export function DashboardPreviewSection() {
  return (
    <section id="dashboard-preview" className="py-28 bg-[#1B5E20] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="flex justify-center">
            <Kicker light>Dashboard Inteligente</Kicker>
          </div>
          <h2
            className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Todos os dados da sua
            <span className="text-[#A5D6A7] block">lavoura em um só lugar</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Interface profissional com mapas interativos, gráficos em tempo real e relatórios técnicos detalhados.
          </p>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-[#0a3d12] px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <span className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 h-6 bg-white/10 rounded-lg mx-4" />
            <div className="text-white/50 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
              app.agrovision.com.br/dashboard
            </div>
          </div>

          <div className="grid grid-cols-12 bg-[#0d1f0f] min-h-80">
            <div className="col-span-2 bg-[#0a3d12] border-r border-white/5 p-3 flex flex-col gap-1 hidden md:flex">
              {sidebarIcons.map((Icon, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg flex items-center gap-2 ${
                    i === 0 ? "bg-[#66BB6A]/20 text-[#66BB6A]" : "text-white/40 hover:text-white/70"
                  } transition-colors cursor-pointer`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs hidden lg:block" style={{ fontFamily: "Inter, sans-serif" }}>
                    {sidebarLabels[i]}
                  </span>
                </div>
              ))}
            </div>

            <div className="col-span-12 md:col-span-10 p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {metricCards.map(({ label, value, trend, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-md p-3">
                    <div className="text-white/50 text-xs mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                      {label}
                    </div>
                    <div className={`text-2xl font-bold ${color}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                      {value}
                    </div>
                    <div className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      {trend}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-md overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560493676-04071185765b?w=700&h=220&fit=crop&auto=format"
                    alt="Mapa de calor da lavoura"
                    className="w-full h-36 object-cover opacity-80"
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-md p-3">
                  <div className="text-white/60 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    Saúde Vegetativa
                  </div>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={previewChart}>
                      <defs>
                        <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#66BB6A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="health" stroke="#66BB6A" strokeWidth={2} fill="url(#ndviGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#66BB6A] text-[#0a2e0c] font-bold px-8 py-4 rounded-md transition-all shadow-[4px_4px_0_0_#0a2e0c] hover:shadow-[2px_2px_0_0_#0a2e0c] hover:translate-x-[2px] hover:translate-y-[2px]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Acessar Dashboard Completo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
