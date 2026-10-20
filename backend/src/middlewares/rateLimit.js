import { AppError } from "../utils/AppError.js";

/**
 * Limitador simples em memória (por IP). Suficiente para um único processo;
 * em produção com várias instâncias, trocar por um store compartilhado (ex.: Redis).
 */
export function rateLimit({ janelaMs, maximo, mensagem }) {
  const tentativas = new Map();

  return (req, res, next) => {
    const agora = Date.now();
    const chave = req.ip;
    const registro = tentativas.get(chave);

    if (!registro || agora > registro.expiraEm) {
      tentativas.set(chave, { total: 1, expiraEm: agora + janelaMs });
      return next();
    }

    registro.total += 1;
    if (registro.total > maximo) {
      res.setHeader("Retry-After", Math.ceil((registro.expiraEm - agora) / 1000));
      return next(new AppError(mensagem, 429, "MUITAS_TENTATIVAS"));
    }
    next();
  };
}
