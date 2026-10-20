import * as usuariosService from "./usuarios.service.js";

export async function perfil(req, res) {
  res.json({ data: await usuariosService.buscarPorId(req.usuarioId) });
}

export async function atualizarPerfil(req, res) {
  res.json({ data: await usuariosService.atualizar(req.usuarioId, req.body) });
}
