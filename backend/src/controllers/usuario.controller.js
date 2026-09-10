import * as usuarioService from "../services/usuario.service.js";
import { ok } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const meuPerfil = handler(async (req, res) => {
  const usuario = await usuarioService.obterPerfil(req.usuario.id_usuario);
  ok(res, usuario);
});

export const atualizarMeuPerfil = handler(async (req, res) => {
  const usuario = await usuarioService.atualizarPerfil(req.usuario.id_usuario, req.body);
  ok(res, usuario);
});
