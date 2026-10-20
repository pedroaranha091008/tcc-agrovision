import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function main() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Conexão bem-sucedida com o banco de dados!");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    console.error("Confira se o MySQL/MariaDB está rodando e se o .env está correto.");
    process.exit(1);
  }

  // Só aceita requisições depois de garantir que o banco está acessível.
  app.listen(env.porta, () => {
    console.log(`Servidor rodando em http://localhost:${env.porta}`);
  });
}

async function encerrar() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);

main();
