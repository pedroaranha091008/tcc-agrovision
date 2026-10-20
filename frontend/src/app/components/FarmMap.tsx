import { useId } from "react";

// Mapa ilustrativo de talhões coloridos por saúde (estilo NDVI). Substitui a foto externa que quebrava.

export type StatusTalhao = "saudavel" | "atencao" | "critico";

export type TalhaoMapa = { nome: string; area: number; status: StatusTalhao; pontos: string };

export const CORES_STATUS: Record<StatusTalhao, { fill: string; label: string; dot: string }> = {
  saudavel: { fill: "#43A047", label: "Saudável", dot: "bg-green-500" },
  atencao: { fill: "#FBC02D", label: "Atenção", dot: "bg-yellow-400" },
  critico: { fill: "#E53935", label: "Crítico", dot: "bg-red-500" },
};

export const TALHOES_DEMO: TalhaoMapa[] = [
  { nome: "Talhão A", area: 98, status: "saudavel", pontos: "20,20 300,14 290,150 26,160" },
  { nome: "Talhão B", area: 72, status: "atencao", pontos: "310,14 580,24 572,140 300,150" },
  { nome: "Talhão C", area: 45, status: "critico", pontos: "26,170 250,162 244,300 32,306" },
  { nome: "Talhão D", area: 105, status: "saudavel", pontos: "260,162 572,150 580,296 254,300" },
];

/** Linhas de plantio + manchas, gerados de forma determinística para o desenho ficar sempre igual. */
function manchas(seed: number) {
  const pts: { x: number; y: number; r: number }[] = [];
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 14; i++) pts.push({ x: 30 + rnd() * 540, y: 25 + rnd() * 270, r: 6 + rnd() * 16 });
  return pts;
}

export function FarmMap({ talhoes = TALHOES_DEMO, className = "", escuro = false }: { talhoes?: TalhaoMapa[]; className?: string; escuro?: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 600 320" className={className} role="img"
      aria-label={`Mapa de saúde da lavoura: ${talhoes.map(t => `${t.nome}, ${t.area} hectares, ${CORES_STATUS[t.status].label}`).join("; ")}`}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`linhas-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
        </pattern>
        <filter id={`desfoque-${uid}`}><feGaussianBlur stdDeviation="6" /></filter>
        {talhoes.map((t, i) => <clipPath key={i} id={`clip-${uid}-${i}`}><polygon points={t.pontos} /></clipPath>)}
      </defs>
      <rect width="600" height="320" fill={escuro ? "#1f2a1f" : "#6d5a3c"} />
      {talhoes.map((t, i) => (
        <g key={t.nome}>
          <polygon points={t.pontos} fill={CORES_STATUS[t.status].fill} fillOpacity={0.85} stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
          <polygon points={t.pontos} fill={`url(#linhas-${uid})`} />
          <g clipPath={`url(#clip-${uid}-${i})`}><g filter={`url(#desfoque-${uid})`}>
            {manchas(i * 97 + 13).filter((_, j) => j % (t.status === "critico" ? 1 : t.status === "atencao" ? 2 : 4) === 0).map((m, j) => (
              <circle key={j} cx={m.x} cy={m.y} r={m.r} fill={t.status === "saudavel" ? "#1B5E20" : "#B71C1C"} fillOpacity={0.25} />
            ))}
          </g></g>
        </g>
      ))}
      <path d="M0,158 C150,166 300,150 600,152" stroke="#c8b48a" strokeWidth="6" fill="none" opacity="0.8" />
      {talhoes.map(t => {
        const coords = t.pontos.split(" ").map(p => p.split(",").map(Number));
        const cx = coords.reduce((a, c) => a + c[0], 0) / coords.length;
        const cy = coords.reduce((a, c) => a + c[1], 0) / coords.length;
        return (
          <g key={t.nome + "-rotulo"}>
            <rect x={cx - 62} y={cy - 14} width="124" height="28" rx="8" fill="#000" fillOpacity="0.45" />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fill="#fff" fontFamily="Inter, sans-serif">{t.nome} · {t.area} ha</text>
          </g>
        );
      })}
    </svg>
  );
}
