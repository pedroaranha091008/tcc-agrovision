import { erros } from "../utils/AppError.js";
import { verificarAccessToken } from "../utils/tokens.js";

/**
 * Exige um access token valido no header Authorization: Bearer <token>.
 * Popula req.usuario = { id_usuario, email, nome }.
 */
export function autenticar(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return next(erros.naoAutenticado("Token de acesso ausente"));
  }

  try {
    const payload = verificarAccessToken(token);
    req.usuario = { id_usuario: payload.sub, email: payload.email, nome: payload.nome };
    next();
  } catch {
    next(erros.naoAutenticado("Token de acesso invalido ou expirado"));
  }
}
