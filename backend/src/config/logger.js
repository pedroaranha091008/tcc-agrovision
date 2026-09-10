import pino from "pino";
import env from "./env.js";

/**
 * Logger unico da aplicacao. Em desenvolvimento usa saida legivel;
 * em producao usa JSON. Campos sensiveis sao redigidos.
 */
const logger = pino({
  level: env.isTest ? "silent" : env.isProd ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.senha",
      "*.senha_hash",
      "*.token",
      "*.refresh_token",
      "*.access_token",
    ],
    censor: "[redigido]",
  },
  transport: env.isProd
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } },
});

export default logger;
