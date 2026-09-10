/**
 * DADOS TEMPORÁRIOS de demonstração do dashboard.
 * Serão substituídos por dados da API na Fase 5 do planejamento
 * (endpoints /dashboard e /monitoramentos). Não usar em produção.
 */

export const vegetativeData = [
  { month: "Jan", ndvi: 0.62, health: 78 },
  { month: "Fev", ndvi: 0.71, health: 84 },
  { month: "Mar", ndvi: 0.68, health: 80 },
  { month: "Abr", ndvi: 0.75, health: 88 },
  { month: "Mai", ndvi: 0.82, health: 92 },
  { month: "Jun", ndvi: 0.79, health: 90 },
  { month: "Jul", ndvi: 0.85, health: 94 },
];

export const sectorData = [
  { sector: "A1", falhas: 3.2 },
  { sector: "A2", falhas: 1.8 },
  { sector: "B1", falhas: 5.4 },
  { sector: "B2", falhas: 2.1 },
  { sector: "C1", falhas: 4.7 },
  { sector: "C2", falhas: 1.2 },
];

export const pieData = [
  { name: "Saudável", value: 74, color: "#66BB6A" },
  { name: "Atenção", value: 18, color: "#FFC107" },
  { name: "Crítico", value: 8, color: "#ef4444" },
];

export const recentReports = [
  { id: "R-2847", farm: "Fazenda São João", area: "320 ha", type: "NDVI", date: "02/05/2026", status: "Pronto" },
  { id: "R-2846", farm: "Granja Esperança", area: "180 ha", type: "Falhas", date: "01/05/2026", status: "Pronto" },
  { id: "R-2845", farm: "Sítio Verde", area: "95 ha", type: "Plantas Daninhas", date: "30/04/2026", status: "Processando" },
  { id: "R-2844", farm: "Fazenda Primavera", area: "440 ha", type: "Contagem", date: "29/04/2026", status: "Pronto" },
];
