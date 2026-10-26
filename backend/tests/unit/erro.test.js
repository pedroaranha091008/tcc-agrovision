import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import prismaPkg from "../../generated/prisma/client.js";
import { tratadorErros } from "../../src/middlewares/erro.js";

vi.mock("../../src/config/logger.js", () => ({ default: { error: vi.fn() } }));

function appComErro(error) {
  const app = express();
  app.get("/", () => { throw error; });
  app.use(tratadorErros);
  return app;
}

describe("tratamento de erros em producao", () => {
  it("responde JSON sem expor detalhes de erro interno", async () => {
    const res = await request(appComErro(new Error("detalhe privado"))).get("/");
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain("detalhe privado");
  });

  it.each([["P2002", 409], ["P2003", 409], ["P2025", 404]])(
    "converte erro Prisma %s para HTTP %s",
    async (code, status) => {
      const error = new prismaPkg.Prisma.PrismaClientKnownRequestError("erro", {
        code, clientVersion: "7", meta: {},
      });
      const res = await request(appComErro(error)).get("/");
      expect(res.status).toBe(status);
      expect(res.body.error).toBeDefined();
    },
  );
});
