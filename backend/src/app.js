import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.corsOrigens.length > 0 ? env.corsOrigens : true,
    credentials: true,
    // Sem isso o navegador esconde o nome do arquivo dos downloads (relatórios PDF) do frontend.
    exposedHeaders: ["Content-Disposition"]
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    mensagem: "API AgroVision funcionando!",
    versao: "1.0",
    api: "/api/v1"
  });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
