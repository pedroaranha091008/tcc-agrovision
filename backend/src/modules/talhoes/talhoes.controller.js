import * as talhoesService from "./talhoes.service.js";

export async function buscar(req, res) {
  res.json({ data: await talhoesService.buscar(req.params.id, req.usuarioId) });
}

export async function criar(req, res) {
  res.status(201).json({ data: await talhoesService.criar(req.usuarioId, req.body) });
}

export async function atualizar(req, res) {
  res.json({ data: await talhoesService.atualizar(req.params.id, req.usuarioId, req.body) });
}

export async function excluir(req, res) {
  await talhoesService.excluir(req.params.id, req.usuarioId);
  res.status(204).end();
}
