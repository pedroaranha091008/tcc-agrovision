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

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : false,
    credentials: true,
  }),
);
if (!env.isTest) app.use(pinoHttp({ logger }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(limiteGlobal);

// Verificacao simples de disponibilidade (nao faz parte da API funcional).
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

app.use("/api/v1", apiV1);

app.use(naoEncontrado);
app.use(tratadorErros);

export default app;
