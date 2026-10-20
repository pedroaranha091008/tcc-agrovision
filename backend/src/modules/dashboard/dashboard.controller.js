import * as dashboardService from "./dashboard.service.js";

export async function resumo(req, res) {
  res.json({ data: await dashboardService.resumo(req.usuarioId, req.filtros) });
}

export async function monitoramentos(req, res) {
  const { dados, meta } = await dashboardService.monitoramentos(req.usuarioId, req.filtros);
  res.json({ data: dados, meta });
}
