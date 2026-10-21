import * as service from "../services/orcamento.service.js";
import { criado } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const criar = handler(async (req, res) => {
  criado(res, await service.criar(req.body));
});
