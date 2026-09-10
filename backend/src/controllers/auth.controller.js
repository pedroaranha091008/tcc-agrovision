import * as authService from "../services/auth.service.js";
import { criado, ok } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

function contexto(req) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

export const registrar = handler(async (req, res) => {
  const resultado = await authService.registrar(req.body, contexto(req));
  criado(res, resultado);
});

export const login = handler(async (req, res) => {
  const resultado = await authService.login(req.body, contexto(req));
  ok(res, resultado);
});

export const google = handler(async (req, res) => {
  const resultado = await authService.loginGoogle(req.body.id_token, contexto(req));
  ok(res, resultado);
});

export const renovar = handler(async (req, res) => {
  const resultado = await authService.renovar(req.body.refresh_token, contexto(req));
  ok(res, resultado);
});

export const logout = handler(async (req, res) => {
  await authService.logout(req.body.refresh_token);
  ok(res, { mensagem: "Sessao encerrada" });
});
