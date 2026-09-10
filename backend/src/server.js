import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { prisma } from "./config/prisma.js";

async function iniciar() {
  try {
    await prisma.$connect();
    logger.info("Conexao com o banco de dados estabelecida");
  } catch (error) {
    logger.error({ err: error }, "Falha ao conectar ao banco de dados");
    process.exit(1);
  }

  const servidor = app.listen(env.port, () => {
    logger.info(`Servidor ouvindo em http://localhost:${env.port} (${env.nodeEnv})`);
  });

  async function encerrar(sinal) {
    logger.info({ sinal }, "Encerrando servidor");
    servidor.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => encerrar("SIGINT"));
  process.on("SIGTERM", () => encerrar("SIGTERM"));
}

iniciar();
