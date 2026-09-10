import * as service from "../services/monitoramento.service.js";
import { ok } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const historico = handler(async (req, res) => {
  const { itens, meta } = await service.historico(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});
