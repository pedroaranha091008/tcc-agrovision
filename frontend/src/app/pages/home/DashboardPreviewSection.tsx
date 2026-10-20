import { useNavigate } from "react-router";
import { ArrowRight, Calendar, FileText, LayoutDashboard, Map, Settings, Tractor } from "lucide-react";
import { FarmMap } from "../../components/FarmMap";
import { vegetativeData } from "../dashboard/demoData";

/** Mini gráfico em SVG puro, para a home não precisar baixar a biblioteca de gráficos. */
function Sparkline({ valores }: { valores: number[] }) {
  const min = Math.min(...valores) - 5, max = Math.max(...valores) + 2;
  const pts = valores.map((v, i) => [(i / (valores.length - 1)) * 200, 100 - ((v - min) / (max - min)) * 100]);
  const linha = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-[100px]" role="img" aria-label={`Saúde vegetativa subindo de ${valores[0]}% para ${valores[valores.length - 1]}%`}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#66BB6A" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${linha} L200,100 L0,100 Z`} fill="url(#spark-grad)" />
      <path d={linha} fill="none" stroke="#66BB6A" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function DashboardPreviewSection() {
  const navigate = useNavigate();
  return (
    <section id="dashboard-preview" className="py-28 bg-[#1B5E20] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4 text-sm font-medium text-white/80">
            <LayoutDashboard className="w-4 h-4" /> Dashboard Inteligente
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
            Todos os dados da sua
            <span className="text-[#A5D6A7] block">lavoura em um só lugar</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Interface profissional com mapas interativos, gráficos em tempo real e relatórios técnicos detalhados.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-[#0a3d12] px-5 py-3 flex items-center gap-3" aria-hidden>
            <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400/60" /><span className="w-3 h-3 rounded-full bg-yellow-400/60" /><span className="w-3 h-3 rounded-full bg-green-400/60" /></div>
            <div className="flex-1 h-6 bg-white/10 rounded-lg mx-4" />
            <div className="text-white/50 text-xs">app.agrovision.com.br/dashboard</div>
          </div>

          <div className="grid grid-cols-12 bg-[#0d1f0f] min-h-80">
            {/* Sidebar */}
            <div className="col-span-2 bg-[#0a3d12] border-r border-white/5 p-3 flex flex-col gap-1 hidden md:flex">
              {[LayoutDashboard, Map, FileText, Tractor, Calendar, Settings].map((Icon, i) => (
                <div key={i} className={`p-2.5 rounded-lg flex items-center gap-2 ${i === 0 ? "bg-[#66BB6A]/20 text-[#66BB6A]" : "text-white/40"}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs hidden lg:block">{["Visão Geral", "Fazendas", "Relatórios", "Análises", "Agenda", "Config."][i]}</span>
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="col-span-12 md:col-span-10 p-5">
              {/* Metric cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Hectares", value: "1.240", trend: "+12%", color: "text-[#66BB6A]" },
                  { label: "Relatórios", value: "34", trend: "+5", color: "text-[#A5D6A7]" },
                  { label: "Voos", value: "18", trend: "este mês", color: "text-yellow-400" },
                  { label: "Áreas Críticas", value: "3", trend: "-2 vs mês", color: "text-red-400" },
                ].map(({ label, value, trend, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-white/50 text-xs mb-1">{label}</div>
                    <div className={`text-2xl font-bold ${color} font-display`}>{value}</div>
                    <div className="text-white/40 text-xs mt-0.5">{trend}</div>
                  </div>
                ))}
              </div>

              {/* Map + Chart row */}
              <div className="grid lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <FarmMap className="w-full h-36" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-2">Saúde Vegetativa</div>
                  <Sparkline valores={vegetativeData.slice(-5).map(d => d.health)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-black/20 font-display">
            Acessar Dashboard Completo <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
