import { useState, useEffect, useRef } from "react";
import {
  Menu, X, MapPin, Mail, Phone, ChevronRight, ArrowRight,
  Leaf, AlertTriangle, BarChart2, Trees, Eye, FileText,
  CheckCircle, Clock, Upload, Download, LogIn, User,
  Settings, LogOut, Bell, TrendingUp, Layers, Zap,
  Shield, DollarSign, Target, Wifi, ChevronDown,
  Building2, Tractor, Users, Star, Play, LayoutDashboard,
  Calendar, Map, Activity, Home, BarChart, List,
  Plus, Filter, Search, MoreHorizontal, ArrowUpRight,
  Globe, Twitter, Instagram, Linkedin, Youtube,
  ChevronLeft, Circle
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RechartBar, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from "recharts";

type Page = "home" | "login" | "register" | "dashboard";

// ─── Data ────────────────────────────────────────────────────────────────────

const vegetativeData = [
  { month: "Jan", ndvi: 0.62, health: 78 },
  { month: "Fev", ndvi: 0.71, health: 84 },
  { month: "Mar", ndvi: 0.68, health: 80 },
  { month: "Abr", ndvi: 0.75, health: 88 },
  { month: "Mai", ndvi: 0.82, health: 92 },
  { month: "Jun", ndvi: 0.79, health: 90 },
  { month: "Jul", ndvi: 0.85, health: 94 },
];

const sectorData = [
  { sector: "A1", falhas: 3.2 },
  { sector: "A2", falhas: 1.8 },
  { sector: "B1", falhas: 5.4 },
  { sector: "B2", falhas: 2.1 },
  { sector: "C1", falhas: 4.7 },
  { sector: "C2", falhas: 1.2 },
];

const pieData = [
  { name: "Saudável", value: 74, color: "#66BB6A" },
  { name: "Atenção", value: 18, color: "#FFC107" },
  { name: "Crítico", value: 8, color: "#ef4444" },
];

const recentReports = [
  { id: "R-2847", farm: "Fazenda São João", area: "320 ha", type: "NDVI", date: "02/05/2026", status: "Pronto" },
  { id: "R-2846", farm: "Granja Esperança", area: "180 ha", type: "Falhas", date: "01/05/2026", status: "Pronto" },
  { id: "R-2845", farm: "Sítio Verde", area: "95 ha", type: "Plantas Daninhas", date: "30/04/2026", status: "Processando" },
  { id: "R-2844", farm: "Fazenda Primavera", area: "440 ha", type: "Contagem", date: "29/04/2026", status: "Pronto" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (page === "dashboard") return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
        <button onClick={() => setPage("home")} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center shadow-md group-hover:shadow-green-500/30 transition-shadow">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className={scrolled ? "text-[#1B5E20]" : "text-white"}>Agro</span>
            <span className={scrolled ? "text-[#66BB6A]" : "text-[#A5D6A7]"}>Vision</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Início", id: "hero" },
            { label: "Sobre", id: "sobre" },
            { label: "Serviços", id: "servicos" },
            { label: "Dashboard", id: "dashboard-preview" },
            { label: "Contato", id: "contato" },
          ].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${scrolled ? "text-[#212121] hover:text-[#1B5E20] hover:bg-[#E8F5E9]" : "text-white/90 hover:text-white"}`}
              style={{ fontFamily: "Inter, sans-serif" }}>
              {label}
            </button>
          ))}
          <button onClick={() => setPage("login")}
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${scrolled ? "text-[#1B5E20] border border-[#1B5E20]/30 hover:bg-[#E8F5E9]" : "text-white border border-white/30 hover:bg-white/10"}`}
            style={{ fontFamily: "Inter, sans-serif" }}>
            Login
          </button>
          <button onClick={() => scrollTo("contato")}
            className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-md hover:shadow-green-900/30 hover:-translate-y-0.5"
            style={{ fontFamily: "Inter, sans-serif" }}>
            Solicitar Orçamento
          </button>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 rounded-lg ${scrolled ? "text-[#212121]" : "text-white"}`}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-2">
          {[{ label: "Início", id: "hero" }, { label: "Sobre", id: "sobre" }, { label: "Serviços", id: "servicos" }, { label: "Contato", id: "contato" }].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-left px-4 py-2.5 rounded-lg text-[#212121] hover:bg-[#E8F5E9] hover:text-[#1B5E20] font-medium transition-colors">{label}</button>
          ))}
          <button onClick={() => { setPage("login"); setMobileOpen(false); }} className="px-4 py-2.5 rounded-lg text-[#1B5E20] border border-[#1B5E20]/30 font-medium text-left">Login</button>
          <button onClick={() => { scrollTo("contato"); }} className="px-4 py-2.5 rounded-lg bg-[#1B5E20] text-white font-semibold text-left">Solicitar Orçamento</button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=1600&h=900&fit=crop&auto=format"
          alt="Drone sobrevoando plantação agrícola"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/92 via-[#2E7D32]/80 to-[#1B5E20]/90" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(102,187,106,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
      </div>

      {/* Grid lines overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#66BB6A] animate-pulse" />
            <span className="text-white/90 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>Tecnologia de Precisão para o Agro</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            Mapeamento
            <span className="block text-[#A5D6A7]">Inteligente</span>
            <span className="block text-white/90 text-4xl md:text-5xl font-medium mt-1">com Drones para</span>
            <span className="block text-[#66BB6A]">Agricultura de Precisão</span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 mb-10 max-w-xl leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
            Transforme imagens aéreas em decisões estratégicas para aumentar produtividade e reduzir custos na sua lavoura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
              className="group px-8 py-4 bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/30 hover:-translate-y-1 hover:shadow-green-900/40"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setPage("dashboard")}
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              <Play className="w-5 h-5" />
              Ver Dashboard
            </button>
          </div>

          {/* Floating cards */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Target, value: "98%", label: "Precisão de mapeamento" },
              { icon: Clock, value: "48h", label: "Entrega de relatórios" },
              { icon: Layers, value: "+500", label: "Hectares analisados" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 hover:bg-white/15 transition-all hover:-translate-y-0.5 cursor-default">
                <div className="w-10 h-10 rounded-xl bg-[#66BB6A]/20 border border-[#66BB6A]/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#A5D6A7]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                  <div className="text-xs text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce">
        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>Explorar</span>
        <ChevronDown className="w-5 h-5" />
      </button>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="sobre" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-6 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
              <Leaf className="w-4 h-4" /> Sobre a AgroVision
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
              Tecnologia aeroespacial a serviço do campo
            </h2>
            <p className="text-[#4a5568] leading-relaxed mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              A AgroVision é uma plataforma de análise agrícola que utiliza drones de última geração equipados com sensores multiespectrais para capturar dados precisos da lavoura. Nosso sistema transforma imagens aéreas em relatórios detalhados que auxiliam produtores rurais a tomar decisões estratégicas baseadas em dados reais.
            </p>
            <p className="text-[#4a5568] leading-relaxed mb-10" style={{ fontFamily: "Inter, sans-serif" }}>
              Fundada com o objetivo de democratizar a agricultura de precisão, a AgroVision oferece tecnologia antes acessível apenas às grandes corporações, agora disponível para produtores de todos os portes — de pequenos sítios a grandes fazendas e cooperativas.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { value: "500+", label: "Clientes ativos" },
                { value: "50k ha", label: "Área mapeada" },
                { value: "98%", label: "Satisfação" },
                { value: "3", label: "Estados atendidos" },
              ].map(({ value, label }) => (
                <div key={label} className="border border-[#E8F5E9] rounded-2xl p-5 hover:border-[#66BB6A] transition-colors">
                  <div className="text-3xl font-bold text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                  <div className="text-sm text-[#4a5568] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-[#2E7D32] transition-all hover:-translate-y-0.5 shadow-lg shadow-green-900/20"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Fale Conosco <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Map mockup */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-green-900/15 border border-[#E8F5E9]">
              <div className="bg-[#1B5E20] px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-white/70 text-sm flex-1 text-center" style={{ fontFamily: "Inter, sans-serif" }}>Mapa Agrícola — Fazenda São João</span>
              </div>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&h=450&fit=crop&auto=format"
                  alt="Mapa agrícola de lavoura vista de cima"
                  className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/60 to-transparent" />
                {/* Overlay grid */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(102,187,106,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                {/* Heatmap cells */}
                <div className="absolute top-4 left-4 w-16 h-16 rounded-lg bg-green-500/50 border border-green-400/50" />
                <div className="absolute top-4 left-24 w-20 h-20 rounded-lg bg-yellow-400/40 border border-yellow-300/50" />
                <div className="absolute top-4 right-8 w-14 h-14 rounded-lg bg-red-500/40 border border-red-400/50" />
                <div className="absolute bottom-12 left-8 w-24 h-12 rounded-lg bg-green-400/50 border border-green-300/50" />
                {/* Labels */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {[{ color: "bg-green-500", label: "Saudável" }, { color: "bg-yellow-400", label: "Atenção" }, { color: "bg-red-500", label: "Crítico" }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-white text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#F8F9FA] px-5 py-4 flex items-center justify-between">
                <div className="text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>320 ha mapeados · Índice NDVI: 0.82</div>
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-3 py-1 rounded-full">Atualizado hoje</span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#E8F5E9] -z-10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#E8F5E9] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────

const services = [
  { icon: Leaf, title: "Plantas Daninhas", desc: "Identificação precisa de invasoras na lavoura com mapeamento multiespectral para tratamento seletivo e redução de herbicidas.", color: "from-green-500 to-green-700" },
  { icon: AlertTriangle, title: "Falhas de Plantio", desc: "Detecção automática de falhas no estande de plantas para replantio assertivo e maximização da produtividade por hectare.", color: "from-yellow-500 to-orange-600" },
  { icon: BarChart2, title: "Saúde Vegetativa NDVI", desc: "Análise do índice de vegetação NDVI em tempo real para monitorar a saúde das plantas e identificar deficiências nutricionais.", color: "from-emerald-500 to-teal-600" },
  { icon: Trees, title: "Contagem de Árvores", desc: "Contagem automática de indivíduos arbóreos com 98% de precisão para inventário florestal e estimativa de produção.", color: "from-lime-600 to-green-700" },
  { icon: Eye, title: "Monitoramento de Lavoura", desc: "Acompanhamento contínuo da evolução da cultura ao longo do ciclo produtivo com histórico temporal e alertas inteligentes.", color: "from-cyan-500 to-blue-600" },
  { icon: FileText, title: "Relatórios Personalizados", desc: "Documentos técnicos completos com mapas, gráficos, índices e recomendações agronômicas para cada talhão da propriedade.", color: "from-violet-500 to-purple-700" },
];

function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="servicos" className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
            <Zap className="w-4 h-4" /> Nossos Serviços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Análises que transformam
            <span className="block text-[#1B5E20]">sua gestão agrícola</span>
          </h2>
          <p className="text-[#4a5568] max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Cada serviço é desenvolvido com algoritmos de visão computacional e inteligência artificial para entregar insights precisos e acionáveis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={s.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group bg-white rounded-2xl p-7 border transition-all duration-300 cursor-pointer ${hovered === i ? "border-[#66BB6A] shadow-xl shadow-green-900/10 -translate-y-2" : "border-border hover:border-[#A5D6A7]"}`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</h3>
              <p className="text-[#4a5568] text-sm leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>{s.desc}</p>
              <button className="inline-flex items-center gap-1.5 text-[#1B5E20] text-sm font-semibold hover:gap-2.5 transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}>
                Saiba mais <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  { icon: Upload, num: "01", title: "Solicitação Online", desc: "Preencha o formulário com os dados da sua propriedade, cultura e área desejada. Nossa equipe retorna em até 2 horas úteis." },
  { icon: Calendar, num: "02", title: "Agendamento de Voo", desc: "Definimos a data e horário ideal para o voo, considerando condições climáticas e disponibilidade da equipe técnica." },
  { icon: Map, num: "03", title: "Captura e Processamento", desc: "Nossos drones realizam o voo e as imagens são processadas com algoritmos de IA para gerar mapas de alta precisão." },
  { icon: Download, num: "04", title: "Entrega dos Relatórios", desc: "Em até 48 horas você recebe os relatórios completos no dashboard com mapas, índices e recomendações técnicas." },
];

function HowItWorksSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
            <CheckCircle className="w-4 h-4" /> Como Funciona
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Processo simples,
            <span className="text-[#1B5E20]"> resultados excepcionais</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#E8F5E9] via-[#66BB6A] to-[#E8F5E9]" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center shadow-xl shadow-green-900/20 group-hover:shadow-green-900/30 group-hover:-translate-y-1 transition-all">
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#66BB6A] text-white text-xs font-bold flex items-center justify-center" style={{ fontFamily: "Poppins, sans-serif" }}>{i + 1}</span>
                </div>
                <div className="text-4xl font-bold text-[#E8F5E9] mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>{step.num}</div>
                <h3 className="text-lg font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>{step.title}</h3>
                <p className="text-[#4a5568] text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────

function DashboardPreviewSection({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section id="dashboard-preview" className="py-28 bg-[#1B5E20] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4 text-sm font-medium text-white/80" style={{ fontFamily: "Inter, sans-serif" }}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard Inteligente
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Todos os dados da sua
            <span className="text-[#A5D6A7] block">lavoura em um só lugar</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Interface profissional com mapas interativos, gráficos em tempo real e relatórios técnicos detalhados.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-[#0a3d12] px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400/60" /><span className="w-3 h-3 rounded-full bg-yellow-400/60" /><span className="w-3 h-3 rounded-full bg-green-400/60" /></div>
            <div className="flex-1 h-6 bg-white/10 rounded-lg mx-4" />
            <div className="text-white/50 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>app.agrovision.com.br/dashboard</div>
          </div>

          <div className="grid grid-cols-12 bg-[#0d1f0f] min-h-80">
            {/* Sidebar */}
            <div className="col-span-2 bg-[#0a3d12] border-r border-white/5 p-3 flex flex-col gap-1 hidden md:flex">
              {[LayoutDashboard, Map, FileText, Tractor, Calendar, Settings].map((Icon, i) => (
                <div key={i} className={`p-2.5 rounded-lg flex items-center gap-2 ${i === 0 ? "bg-[#66BB6A]/20 text-[#66BB6A]" : "text-white/40 hover:text-white/70"} transition-colors cursor-pointer`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs hidden lg:block" style={{ fontFamily: "Inter, sans-serif" }}>{["Visão Geral", "Fazendas", "Relatórios", "Análises", "Agenda", "Config."][i]}</span>
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
                    <div className="text-white/50 text-xs mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
                    <div className={`text-2xl font-bold ${color}`} style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                    <div className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{trend}</div>
                  </div>
                ))}
              </div>

              {/* Map + Chart row */}
              <div className="grid lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1560493676-04071185765b?w=700&h=220&fit=crop&auto=format"
                    alt="Mapa de calor da lavoura"
                    className="w-full h-36 object-cover opacity-80" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Saúde Vegetativa</div>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={vegetativeData.slice(-5)}>
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
          <button onClick={() => setPage("dashboard")}
            className="inline-flex items-center gap-2 bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-black/20"
            style={{ fontFamily: "Poppins, sans-serif" }}>
            Acessar Dashboard Completo <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Benefits Section ─────────────────────────────────────────────────────────

const benefits = [
  { icon: DollarSign, title: "Redução de Custos", desc: "Diminua gastos com insumos em até 30% por meio da aplicação seletiva e precisa baseada em dados reais da lavoura.", color: "#1B5E20" },
  { icon: TrendingUp, title: "Maior Produtividade", desc: "Aumente o rendimento por hectare com intervenções no momento certo e no lugar exato, baseadas em análises de NDVI.", color: "#2E7D32" },
  { icon: Target, title: "Decisões Assertivas", desc: "Tome decisões agronômicas fundamentadas em dados geoespaciais precisos, eliminando achismos e intuições.", color: "#388E3C" },
  { icon: Wifi, title: "Monitoramento Remoto", desc: "Acompanhe sua lavoura de qualquer lugar pelo app ou web, recebendo alertas em tempo real sobre áreas críticas.", color: "#1B5E20" },
  { icon: Leaf, title: "Sustentabilidade", desc: "Reduza o impacto ambiental com aplicação precisa de agroquímicos, preservando solo, água e biodiversidade.", color: "#2E7D32" },
  { icon: Shield, title: "Dados Seguros", desc: "Toda a informação da sua propriedade é armazenada com criptografia AES-256 e backups redundantes na nuvem.", color: "#388E3C" },
];

function BenefitsSection() {
  return (
    <section className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
            <Star className="w-4 h-4" /> Benefícios
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Por que escolher a<span className="text-[#1B5E20]"> AgroVision?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="group bg-white rounded-2xl p-7 border border-border hover:border-[#A5D6A7] hover:shadow-lg hover:shadow-green-900/8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: b.color + "15" }}>
                <b.icon className="w-6 h-6" style={{ color: b.color }} />
              </div>
              <h3 className="text-lg font-bold text-[#212121] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{b.title}</h3>
              <p className="text-[#4a5568] text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact / Quote Form ─────────────────────────────────────────────────────

function ContactSection() {
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", cidade: "", cultura: "", hectares: "", servico: "", mensagem: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contato" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-6 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
              <Mail className="w-4 h-4" /> Solicitar Análise
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
              Solicite seu
              <span className="text-[#1B5E20] block">orçamento gratuito</span>
            </h2>
            <p className="text-[#4a5568] mb-10 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Preencha o formulário e nossa equipe técnica entrará em contato em até 2 horas úteis com uma proposta personalizada para sua propriedade.
            </p>

            <div className="space-y-6">
              {[
                { icon: Phone, title: "Telefone", info: "+55 (16) 99999-0000" },
                { icon: Mail, title: "Email", info: "contato@agrovision.com.br" },
                { icon: MapPin, title: "Localização", info: "Ribeirão Preto, SP — Brasil" },
              ].map(({ icon: Icon, title, info }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#4a5568] uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{title}</div>
                    <div className="text-[#212121] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{info}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitted ? (
            <div className="bg-[#E8F5E9] rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-96">
              <div className="w-16 h-16 rounded-full bg-[#1B5E20] flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Solicitação recebida!</h3>
              <p className="text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>Nossa equipe entrará em contato em até 2 horas úteis.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F8F9FA] rounded-2xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva", colSpan: 2 },
                  { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br", colSpan: 1 },
                  { key: "telefone", label: "Telefone", type: "tel", placeholder: "(16) 99999-0000", colSpan: 1 },
                  { key: "cidade", label: "Cidade / Estado", type: "text", placeholder: "Ribeirão Preto, SP", colSpan: 1 },
                  { key: "hectares", label: "Área (hectares)", type: "number", placeholder: "100", colSpan: 1 },
                ].map(({ key, label, type, placeholder, colSpan }) => (
                  <div key={key} className={colSpan === 2 ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>{label}</label>
                    <input type={type} placeholder={placeholder}
                      value={formData[key as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }} />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Tipo de cultura</label>
                  <select value={formData.cultura} onChange={e => setFormData({ ...formData, cultura: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}>
                    <option value="">Selecionar...</option>
                    {["Soja", "Milho", "Cana-de-açúcar", "Café", "Algodão", "Citros", "Eucalipto", "Outro"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Serviço desejado</label>
                  <select value={formData.servico} onChange={e => setFormData({ ...formData, servico: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}>
                    <option value="">Selecionar...</option>
                    {["NDVI / Saúde vegetativa", "Falhas de plantio", "Plantas daninhas", "Contagem de árvores", "Monitoramento completo", "Relatório personalizado"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Mensagem (opcional)</label>
                  <textarea placeholder="Descreva sua necessidade..." rows={3}
                    value={formData.mensagem}
                    onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }} />
                </div>
              </div>

              <button type="submit"
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5"
                style={{ fontFamily: "Poppins, sans-serif" }}>
                Solicitar Análise Gratuita
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="bg-[#0a2e0c] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
                Agro<span className="text-[#66BB6A]">Vision</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Tecnologia de precisão para o agronegócio brasileiro. Mapeamento com drones, análises inteligentes e relatórios que transformam dados em resultados.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#66BB6A] flex items-center justify-center transition-all hover:-translate-y-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>Links</h4>
            <div className="flex flex-col gap-2">
              {["Início", "Sobre", "Serviços", "Dashboard", "Contato"].map(link => (
                <button key={link} className="text-left text-white/60 hover:text-white text-sm transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>{link}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>Contato</h4>
            <div className="flex flex-col gap-3 text-white/60 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#66BB6A]" /> contato@agrovision.com.br</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#66BB6A]" /> +55 (16) 99999-0000</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#66BB6A]" /> Ribeirão Preto, SP</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#66BB6A]" /> agrovision.com.br</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>© 2026 AgroVision. Todos os direitos reservados. TCC — Agricultura de Precisão.</p>
          <div className="flex gap-6 text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            <button className="hover:text-white transition-colors">Privacidade</button>
            <button className="hover:text-white transition-colors">Termos de Uso</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <>
      <HeroSection setPage={setPage} />
      <AboutSection />
      <ServicesSection />
      <HowItWorksSection />
      <DashboardPreviewSection setPage={setPage} />
      <BenefitsSection />
      <ContactSection />
      <Footer setPage={setPage} />
    </>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ setPage }: { setPage: (p: Page) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("dashboard"); }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&h=1200&fit=crop&auto=format"
            alt="Drone sobre lavoura de soja" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/90 to-[#0a2e0c]/95" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        </div>

        <div className="relative z-10">
          <button onClick={() => setPage("home")} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "Poppins, sans-serif" }}>Agro<span className="text-[#A5D6A7]">Vision</span></span>
          </button>
        </div>

        <div className="relative z-10">
          <div className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Inteligência que<br /><span className="text-[#A5D6A7]">transforma o campo</span>
          </div>
          <p className="text-white/70 mb-8" style={{ fontFamily: "Inter, sans-serif" }}>
            Acesse sua conta e monitore suas lavouras com dados precisos de mapeamento aéreo.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[{ value: "98%", label: "Precisão" }, { value: "48h", label: "Entrega" }, { value: "500+", label: "Clientes" }].map(({ value, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-[#A5D6A7]" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                <div className="text-white/60 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
          © 2026 AgroVision — Plataforma de Agricultura de Precisão
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => setPage("home")} className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#1B5E20]" />
            </div>
            <span className="font-bold text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>AgroVision</span>
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#212121] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Bem-vindo de volta</h2>
            <p className="text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>Entre na sua conta para continuar</p>
          </div>

          {/* Social login */}
          <div className="flex flex-col gap-3 mb-7">
            {[
              { icon: "G", label: "Continuar com Google", bg: "bg-white border-border" },
              { icon: "⊞", label: "Continuar com Microsoft", bg: "bg-white border-border" },
              { icon: "⌘", label: "Continuar com Apple", bg: "bg-white border-border" },
            ].map(({ icon, label, bg }) => (
              <button key={label}
                className={`w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border ${bg} hover:bg-[#F8F9FA] transition-all text-[#212121] font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                style={{ fontFamily: "Inter, sans-serif" }}>
                <span className="font-bold text-base w-5 text-center">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="relative mb-7">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#4a5568] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>ou entre com email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Email</label>
              <input type="email" placeholder="joao@fazenda.com.br" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                style={{ fontFamily: "Inter, sans-serif" }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#212121]" style={{ fontFamily: "Inter, sans-serif" }}>Senha</label>
                <button type="button" className="text-xs text-[#1B5E20] hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>Esqueci a senha</button>
              </div>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                style={{ fontFamily: "Inter, sans-serif" }} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border text-[#1B5E20] focus:ring-[#66BB6A] accent-[#1B5E20]" />
              <label htmlFor="remember" className="text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>Lembrar de mim</label>
            </div>
            <button type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...</>
              ) : (
                <><LogIn className="w-5 h-5" /> Entrar</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
            Não tem conta?{" "}
            <button onClick={() => setPage("register")} className="text-[#1B5E20] font-semibold hover:underline">Criar conta gratuita</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

function RegisterPage({ setPage }: { setPage: (p: Page) => void }) {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "", tipo: "produtor" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("dashboard"); }, 1400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-6">
      <div className="w-full max-w-md">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 mx-auto mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>Agro<span className="text-[#66BB6A]">Vision</span></span>
        </button>

        <div className="bg-white rounded-2xl p-8 border border-border shadow-xl shadow-green-900/5">
          <h2 className="text-2xl font-bold text-[#212121] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Criar conta</h2>
          <p className="text-[#4a5568] text-sm mb-7" style={{ fontFamily: "Inter, sans-serif" }}>Comece a mapear sua lavoura gratuitamente</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva" },
              { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br" },
              { key: "senha", label: "Senha", type: "password", placeholder: "Mínimo 8 caracteres" },
              { key: "confirmar", label: "Confirmar senha", type: "password", placeholder: "Repita a senha" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                  style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Tipo de usuário</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "produtor", label: "Produtor", icon: Tractor },
                  { value: "agronomo", label: "Agrônomo", icon: Leaf },
                  { value: "empresa", label: "Empresa", icon: Building2 },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => setForm({ ...form, tipo: value })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.tipo === value ? "border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20]" : "border-border text-[#4a5568] hover:border-[#A5D6A7]"}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando conta...</> : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
            Já tem conta?{" "}
            <button onClick={() => setPage("login")} className="text-[#1B5E20] font-semibold hover:underline">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Visão Geral" },
    { id: "analyses", icon: Activity, label: "Minhas Análises" },
    { id: "reports", icon: FileText, label: "Relatórios" },
    { id: "farms", icon: Tractor, label: "Fazendas" },
    { id: "schedule", icon: Calendar, label: "Agendamentos" },
    { id: "settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-[#1B5E20] flex flex-col transition-all duration-300 min-h-screen flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-white text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>Agro<span className="text-[#A5D6A7]">Vision</span></span>}
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${activeNav === id ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={() => setPage("home")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center gap-4 px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568] transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
              <input type="text" placeholder="Buscar fazendas, relatórios..." className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8F9FA] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors">
              <Bell className="w-5 h-5 text-[#4a5568]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center">
                <span className="text-white text-sm font-bold">J</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-[#212121]">João Silva</div>
                <div className="text-xs text-[#4a5568]">Produtor Rural</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>Visão Geral</h1>
                <p className="text-[#4a5568] text-sm">Bem-vindo, João! Aqui está o resumo da sua propriedade.</p>
              </div>
              <button className="flex items-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all">
                <Plus className="w-4 h-4" /> Nova Análise
              </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Layers, label: "Hectares Analisados", value: "1.240", trend: "+12%", sub: "vs mês anterior", color: "text-[#1B5E20]", bg: "bg-[#E8F5E9]" },
                { icon: FileText, label: "Relatórios Disponíveis", value: "34", trend: "+5", sub: "novos esta semana", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Activity, label: "Voos Realizados", value: "18", trend: "este mês", sub: "4 agendados", color: "text-violet-600", bg: "bg-violet-50" },
                { icon: AlertTriangle, label: "Áreas Críticas", value: "3", trend: "-2", sub: "vs semana passada", color: "text-red-500", bg: "bg-red-50" },
              ].map(({ icon: Icon, label, value, trend, sub, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-border hover:border-[#A5D6A7] hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>{trend}</span>
                  </div>
                  <div className="text-2xl font-bold text-[#212121] mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                  <div className="text-xs font-medium text-[#212121] mb-0.5">{label}</div>
                  <div className="text-xs text-[#4a5568]">{sub}</div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Map */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>Mapa da Fazenda — São João</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#4a5568]">320 ha</span>
                    <button className="p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors"><Filter className="w-4 h-4 text-[#4a5568]" /></button>
                  </div>
                </div>
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1560493676-04071185765b?w=800&h=320&fit=crop&auto=format"
                    alt="Mapa de calor NDVI da lavoura"
                    className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(102,187,106,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.8) 1px, transparent 1px)", backgroundSize: "25px 25px" }} />
                  {/* Zone markers */}
                  <div className="absolute top-4 left-6 bg-green-500/70 backdrop-blur-sm border border-green-400 text-white text-xs px-2 py-1 rounded-lg">Talhão A — 98 ha ✓</div>
                  <div className="absolute top-4 right-6 bg-yellow-500/70 backdrop-blur-sm border border-yellow-400 text-white text-xs px-2 py-1 rounded-lg">Talhão B — 72 ha ⚠</div>
                  <div className="absolute bottom-4 left-6 bg-red-500/70 backdrop-blur-sm border border-red-400 text-white text-xs px-2 py-1 rounded-lg">Talhão C — 45 ha !</div>
                  <div className="absolute bottom-4 right-6 bg-green-500/70 backdrop-blur-sm border border-green-400 text-white text-xs px-2 py-1 rounded-lg">Talhão D — 105 ha ✓</div>
                  {/* Legend */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {[{ c: "bg-green-500", l: "Saudável" }, { c: "bg-yellow-400", l: "Atenção" }, { c: "bg-red-500", l: "Crítico" }].map(({ c, l }) => (
                      <div key={l} className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className={`w-2 h-2 rounded-full ${c}`} /><span className="text-white text-xs">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-5 py-3 bg-[#F8F9FA] flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-[#4a5568]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 74% Saudável</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 18% Atenção</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 8% Crítico</span>
                  </div>
                  <button className="text-xs text-[#1B5E20] font-semibold hover:underline flex items-center gap-1">
                    Ampliar <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Pie + quick stats */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Status da Lavoura</h3>
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
                        <div className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color }}>{value}%</div>
                        <div className="text-xs text-[#4a5568]">{name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-5">
                  <h3 className="font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Indicadores</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Índice NDVI médio", value: "0.82", max: 1, color: "#66BB6A" },
                      { label: "Taxa de falhas", value: "3.2%", max: 10, color: "#FFC107" },
                      { label: "Contagem árvores", value: "1.847", max: 2000, color: "#1B5E20" },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#4a5568]">{label}</span>
                          <span className="font-semibold text-[#212121]">{value}</span>
                        </div>
                        <div className="h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(parseFloat(value) / max) * 100}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>Saúde Vegetativa — NDVI</h3>
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
                    <Area type="monotone" dataKey="health" name="Saúde (%)" stroke="#1B5E20" strokeWidth={2} fill="url(#healthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>Falhas por Setor</h3>
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
                        <Cell key={`bar-${i}`} fill={entry.falhas > 4 ? "#ef4444" : entry.falhas > 2.5 ? "#FFC107" : "#66BB6A"} />
                      ))}
                    </Bar>
                  </RechartBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent reports table */}
            <div className="bg-white rounded-2xl border border-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>Relatórios Recentes</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#1B5E20] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9]">
                    <Filter className="w-3.5 h-3.5" /> Filtrar
                  </button>
                  <button className="text-xs text-[#1B5E20] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors">Ver todos</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA]">
                      {["ID", "Fazenda", "Área", "Tipo", "Data", "Status", ""].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
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
                          <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-full font-medium">{r.type}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4a5568]">{r.date}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "Pronto" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button className="p-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors">
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
        </main>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar page={page} setPage={setPage} />

      {page === "home" && <HomePage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "register" && <RegisterPage setPage={setPage} />}
      {page === "dashboard" && <DashboardPage setPage={setPage} />}
    </div>
  );
}
