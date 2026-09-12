import { defineConfig } from "vitest/config";

/**
 * Config separada para os testes de integracao: eles compartilham um
 * MESMO banco de dados externo e cada arquivo limpa as tabelas no
 * beforeAll/afterAll, entao rodar arquivos em paralelo (padrao do Vitest)
 * faz um arquivo apagar dados que outro ainda esta usando. fileParallelism
 * desligado forca os arquivos a rodarem em sequencia.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.js"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
    },
  },
});
