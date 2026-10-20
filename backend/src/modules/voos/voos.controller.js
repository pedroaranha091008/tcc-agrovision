import * as voosService from "./voos.service.js";

export async function buscar(req, res) {
  res.json({ data: await voosService.buscar(req.params.id, req.usuarioId) });
}

export async function criar(req, res) {
  res.status(201).json({ data: await voosService.criar(req.usuarioId, req.body) });
}

export async function atualizar(req, res) {
  res.json({ data: await voosService.atualizar(req.params.id, req.usuarioId, req.body) });
}

export async function excluir(req, res) {
  await voosService.excluir(req.params.id, req.usuarioId);
  res.status(204).end();
}
