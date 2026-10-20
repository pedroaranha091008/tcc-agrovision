import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

/** Exige header "Authorization: Bearer <token>" válido e coloca o id do usuário em req.usuarioId. */
export function requireAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return next(new AppError("Faça login para continuar.", 401, "NAO_AUTENTICADO"));
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.usuarioId = payload.sub;
    next();
  } catch {
    next(new AppError("Sua sessão expirou. Entre novamente.", 401, "SESSAO_INVALIDA"));
  }
}
