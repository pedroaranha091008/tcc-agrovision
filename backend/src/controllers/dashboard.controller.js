import * as service from "../services/dashboard.service.js";
import { ok } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const resumo = handler(async (req, res) => {
  const [indicadores, series] = await Promise.all([
    service.indicadores(req.usuario.id_usuario, req.consulta),
    service.series(req.usuario.id_usuario, req.consulta),
  ]);
  ok(res, { indicadores, series });
});
