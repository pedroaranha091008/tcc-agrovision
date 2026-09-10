import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Access token: JWT curto, assinado. Refresh token: valor opaco aleatorio;
 * no banco guardamos apenas o hash SHA-256 (com o REFRESH_SECRET como sal),
 * o que permite revogacao e comparacao sem armazenar o segredo em claro.
 */

export function gerarAccessToken(usuario) {
  return jwt.sign(
    { sub: usuario.id_usuario, email: usuario.email, nome: usuario.nome },
    env.auth.accessSecret,
    { expiresIn: env.auth.accessTtl },
  );
}

export function verificarAccessToken(token) {
  return jwt.verify(token, env.auth.accessSecret);
}

export function gerarRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token) {
  return crypto
    .createHmac("sha256", env.auth.refreshSecret)
    .update(token)
    .digest("hex");
}

export function expiracaoRefresh() {
  const d = new Date();
  d.setDate(d.getDate() + env.auth.refreshTtlDays);
  return d;
}
