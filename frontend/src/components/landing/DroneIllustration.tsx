import { forwardRef } from "react";

/**
 * Drone ilustrado em SVG (sem assets externos). As helices giram sozinhas via
 * CSS (independente do scroll); a posicao/escala/rotacao do drone inteiro e
 * quem o GSAP anima em HeroSection, atraves do ref encaminhado.
 */
export const DroneIllustration = forwardRef<SVGSVGElement>(function DroneIllustration(_props, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 300"
      className="w-full h-full overflow-visible"
      role="img"
      aria-label="Ilustração de um drone agrícola sobrevoando a lavoura"
    >
      <defs>
        <radialGradient id="brilhoGimbal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="brilhoAmbiente" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="corpoDrone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4CA850" />
          <stop offset="45%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#164a19" />
        </linearGradient>
        <linearGradient id="bracoDrone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1c4a1e" />
          <stop offset="100%" stopColor="#0a2e0c" />
        </linearGradient>
        <filter id="sombraDrone" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* brilho ambiente atras do drone, tipo "foto de produto" */}
      <circle cx="200" cy="150" r="150" fill="url(#brilhoAmbiente)" />

      <g filter="url(#sombraDrone)">
        {/* braços, com leve afunilamento (poligono, nao so uma linha) */}
        {[
          [90, 90],
          [310, 90],
          [90, 210],
          [310, 210],
        ].map(([x, y]) => {
          const dx = x > 200 ? -1 : 1;
          const dy = y > 150 ? -1 : 1;
          return (
            <polygon
              key={`braco-${x}-${y}`}
              points={`200,${146} 200,${154} ${x + dx * 14},${y + dy * 4} ${x},${y} ${x + dx * 14},${y - dy * 4}`}
              fill="url(#bracoDrone)"
            />
          );
        })}

        {/* helices: cada uma gira em torno do proprio centro (transform-box:
            fill-box faz "center" valer para a caixa do proprio elemento) */}
        {[
          { cx: 90, cy: 90 },
          { cx: 310, cy: 90 },
          { cx: 90, cy: 210 },
          { cx: 310, cy: 210 },
        ].map(({ cx, cy }, i) => (
          <g key={`${cx}-${cy}`} className="agv-helice" style={{ animationDelay: `${i * 0.05}s` }}>
            <ellipse cx={cx} cy={cy} rx="36" ry="5" fill="#cbd5e1" opacity="0.5" />
            <ellipse cx={cx} cy={cy} rx="5" ry="36" fill="#cbd5e1" opacity="0.5" />
          </g>
        ))}

        {/* motores */}
        {[
          [90, 90],
          [310, 90],
          [90, 210],
          [310, 210],
        ].map(([cx, cy]) => (
          <g key={`motor-${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="11" fill="#161616" />
            <circle cx={cx} cy={cy} r="11" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
          </g>
        ))}

        {/* luzes de navegacao: vermelha (bombordo) e verde (estibordo) */}
        <circle cx="90" cy="90" r="4" fill="#ef4444" className="agv-luz" />
        <circle cx="90" cy="210" r="4" fill="#ef4444" className="agv-luz" />
        <circle cx="310" cy="90" r="4" fill="#66BB6A" className="agv-luz" style={{ animationDelay: "0.6s" }} />
        <circle cx="310" cy="210" r="4" fill="#66BB6A" className="agv-luz" style={{ animationDelay: "0.6s" }} />

        {/* trem de pouso */}
        <g stroke="#0a2e0c" strokeWidth="5" strokeLinecap="round">
          <path d="M175 175 L165 205" />
          <path d="M225 175 L235 205" />
        </g>
        <line x1="150" y1="205" x2="180" y2="205" stroke="#0a2e0c" strokeWidth="5" strokeLinecap="round" />
        <line x1="220" y1="205" x2="250" y2="205" stroke="#0a2e0c" strokeWidth="5" strokeLinecap="round" />

        {/* antena/GPS */}
        <line x1="200" y1="132" x2="200" y2="112" stroke="#0a2e0c" strokeWidth="4" strokeLinecap="round" />
        <circle cx="200" cy="109" r="5" fill="#A5D6A7" />

        {/* corpo, com friso de destaque no topo */}
        <rect x="158" y="126" width="84" height="50" rx="20" fill="url(#corpoDrone)" stroke="#0a2e0c" strokeWidth="2.5" />
        <rect x="171" y="133" width="58" height="9" rx="4.5" fill="#D9F2DA" opacity="0.75" />
        <rect x="171" y="146" width="34" height="4" rx="2" fill="#0a2e0c" opacity="0.35" />

        {/* gimbal + camera, com brilho de "escaneando" */}
        <circle cx="200" cy="186" r="28" fill="url(#brilhoGimbal)" className="agv-scan-pulse" />
        <circle cx="200" cy="182" r="12" fill="#161616" stroke="#0a2e0c" strokeWidth="2" />
        <circle cx="200" cy="182" r="6" fill="#66BB6A" />
        <circle cx="197" cy="179" r="1.6" fill="#D9F2DA" />
      </g>
    </svg>
  );
});
