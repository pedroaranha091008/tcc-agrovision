import * as orcamentosService from "./orcamentos.service.js";

export async function criar(req, res) {
  const solicitacao = await orcamentosService.criar(req.body);
  res.status(201).json({ data: solicitacao });
}
