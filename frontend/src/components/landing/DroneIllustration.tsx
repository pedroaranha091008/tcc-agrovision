import { forwardRef } from "react";

/**
 * Drone ilustrado em SVG (sem assets externos). As helices giram sozinhas via
 * CSS (independente do scroll); a posicao/escala/rotacao do drone inteiro e
 * quem o GSAP anima em DroneScrollSection, atraves do ref encaminhado.
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
        <linearGradient id="corpoDrone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
      </defs>

      {/* braços (desenhados antes do corpo pra ficarem por baixo) */}
      <g stroke="#0a2e0c" strokeWidth="6" strokeLinecap="round">
        <line x1="200" y1="150" x2="90" y2="90" />
        <line x1="200" y1="150" x2="310" y2="90" />
        <line x1="200" y1="150" x2="90" y2="210" />
        <line x1="200" y1="150" x2="310" y2="210" />
      </g>

      {/* helices: cada uma gira em torno do proprio centro (transform-box:
          fill-box faz "center" valer para a caixa do proprio elemento) */}
      {[
        { cx: 90, cy: 90 },
        { cx: 310, cy: 90 },
        { cx: 90, cy: 210 },
        { cx: 310, cy: 210 },
      ].map(({ cx, cy }, i) => (
        <g key={`${cx}-${cy}`} className="agv-helice" style={{ animationDelay: `${i * 0.05}s` }}>
          <circle cx={cx} cy={cy} r="6" fill="#0a2e0c" />
          <ellipse cx={cx} cy={cy} rx="34" ry="6" fill="#4a5568" opacity="0.55" />
          <ellipse cx={cx} cy={cy} rx="6" ry="34" fill="#4a5568" opacity="0.55" />
        </g>
      ))}

      {/* motores */}
      {[
        [90, 90],
        [310, 90],
        [90, 210],
        [310, 210],
      ].map(([cx, cy]) => (
        <circle key={`motor-${cx}-${cy}`} cx={cx} cy={cy} r="10" fill="#212121" />
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
      <line x1="200" y1="135" x2="200" y2="115" stroke="#0a2e0c" strokeWidth="4" strokeLinecap="round" />
      <circle cx="200" cy="112" r="5" fill="#A5D6A7" />

      {/* corpo */}
      <rect x="160" y="128" width="80" height="48" rx="18" fill="url(#corpoDrone)" stroke="#0a2e0c" strokeWidth="3" />
      <rect x="172" y="136" width="56" height="10" rx="5" fill="#A5D6A7" opacity="0.6" />

      {/* gimbal + camera, com brilho de "escaneando" */}
      <circle cx="200" cy="185" r="26" fill="url(#brilhoGimbal)" className="agv-scan-pulse" />
      <circle cx="200" cy="182" r="11" fill="#212121" stroke="#0a2e0c" strokeWidth="2" />
      <circle cx="200" cy="182" r="5" fill="#66BB6A" />
    </svg>
  );
});
