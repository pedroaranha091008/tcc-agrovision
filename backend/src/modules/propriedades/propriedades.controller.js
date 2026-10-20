import * as propriedadesService from "./propriedades.service.js";

export async function listar(req, res) {
  const propriedades = await propriedadesService.listar(req.usuarioId);
  res.json({ data: propriedades, meta: { total: propriedades.length } });
}

export async function buscar(req, res) {
  res.json({ data: await propriedadesService.buscar(req.params.id, req.usuarioId) });
}

export async function criar(req, res) {
  res.status(201).json({ data: await propriedadesService.criar(req.usuarioId, req.body) });
}

export async function atualizar(req, res) {
  res.json({ data: await propriedadesService.atualizar(req.params.id, req.usuarioId, req.body) });
}

export async function excluir(req, res) {
  await propriedadesService.excluir(req.params.id, req.usuarioId);
  res.status(204).end();
}
