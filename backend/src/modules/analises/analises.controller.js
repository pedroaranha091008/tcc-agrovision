import * as analisesService from "./analises.service.js";

export async function criarManual(req, res) {
  res.status(201).json({ data: await analisesService.criarManual(req.params.id, req.usuarioId, req.body) });
}

export async function criarAutomatica(req, res) {
  res.status(201).json({ data: await analisesService.criarAutomatica(req.params.id, req.usuarioId) });
}

export async function mapa(req, res) {
  const arquivo = await analisesService.buscarMapa(req.params.id, req.usuarioId, Number(req.params.indice));
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.sendFile(arquivo);
}

export async function excluir(req, res) {
  await analisesService.excluir(req.params.id, req.usuarioId);
  res.status(204).end();
}
