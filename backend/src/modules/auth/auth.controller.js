import * as authService from "./auth.service.js";

export async function cadastrar(req, res) {
  const resultado = await authService.cadastrar(req.body);
  res.status(201).json({ data: resultado });
}

export async function login(req, res) {
  const resultado = await authService.login(req.body);
  res.json({ data: resultado });
}
