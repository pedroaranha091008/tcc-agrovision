import { rateLimit } from "express-rate-limit";
import env from "../config/env.js";

const desativado = env.isTest;

const respostaLimite = {
  error: {
    code: "MUITAS_REQUISICOES",
    message: "Muitas requisicoes. Tente novamente em instantes.",
  },
};

/** Limite brando aplicado a toda a API. */
export const limiteGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => desativado,
  message: respostaLimite,
});

/** Limite estrito para rotas de autenticacao (anti forca-bruta). */
export const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => desativado,
  message: respostaLimite,
});
