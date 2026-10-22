import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import env from "./config/env.js";
import logger from "./config/logger.js";
import apiV1 from "./routes/index.js";
import { limiteGlobal } from "./middlewares/rateLimit.js";
import { naoEncontrado, tratadorErros } from "./middlewares/erro.js";

const app = express();

app.set("trust proxy", 1);

// CSP liberando o que o site usa: fotos baixadas com token (blob:), fontes
// do Google e o botao "Entrar com Google".
const GOOGLE = "https://accounts.google.com";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", `${GOOGLE}/gsi/client`],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", `${GOOGLE}/gsi/style`],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "blob:"],
        "connect-src": ["'self'", `${GOOGLE}/gsi/`],
        "frame-src": [`${GOOGLE}/gsi/`],
      },
    },
    // O popup do Google precisa conversar com a janela do site.
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : false,
    credentials: true,
    // Sem isso o navegador esconde do frontend o nome do arquivo dos downloads (PDF).
    exposedHeaders: ["Content-Disposition"],
  }),
);
if (!env.isTest) app.use(pinoHttp({ logger }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// So na API: os arquivos do site (JS, CSS, imagens) nao contam no limite.
app.use("/api", limiteGlobal);

// Verificacao simples de disponibilidade (nao faz parte da API funcional).
// Com o site junto (FRONTEND_DIST), a raiz e a pagina inicial do site.
if (!env.frontendDist) {
  app.get("/", (_req, res) => {
    res.json({
      data: {
        nome: "AgroVision API",
        descricao: "Plataforma de analise agricola por drones",
        api: "/api/v1",
        health: "/api/v1/health",
      },
    });
  });
}

app.use("/api/v1", apiV1);

if (env.frontendDist) {
  const pasta = path.resolve(env.frontendDist);
  // Arquivos com hash no nome (assets/) podem ficar em cache por muito tempo.
  app.use("/assets", express.static(path.join(pasta, "assets"), { immutable: true, maxAge: "1y" }));
  app.use(express.static(pasta, { index: false }));
  // Rotas do React (/login, /voos/:id...): qualquer GET fora da API devolve o index.html.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(pasta, "index.html"));
  });
}

app.use(naoEncontrado);
app.use(tratadorErros);

export default app;
