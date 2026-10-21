import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { PASTA_EMAILS_DEV } from "../../src/utils/email.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

/** Le o link do ultimo email salvo na caixa de saida de desenvolvimento (sem SMTP) para o destinatario. */
async function tokenDoUltimoEmail(para) {
  const arquivos = (await fs.readdir(PASTA_EMAILS_DEV).catch(() => [])).filter((f) => f.endsWith(`${para}.txt`)).sort();
  if (!arquivos.length) return null;
  const texto = await fs.readFile(path.join(PASTA_EMAILS_DEV, arquivos.at(-1)), "utf8");
  return /token=([A-Za-z0-9_-]+)/.exec(texto)?.[1] ?? null;
}

describe.skipIf(!bancoDisponivel)("esqueci a senha", () => {
  const email = emailUnico("esqueci");
  let sessaoAntiga;

  beforeAll(async () => {
    await limpar();
    const res = await request(app).post("/api/v1/auth/registro").send({ nome: "Esqueci Teste", email, senha: "senhaAntiga123" });
    sessaoAntiga = res.body.data.refresh_token;
  });

  afterAll(async () => {
    const arquivos = await fs.readdir(PASTA_EMAILS_DEV).catch(() => []);
    await Promise.all(arquivos.filter((f) => f.includes("@teste.local")).map((f) => fs.rm(path.join(PASTA_EMAILS_DEV, f))));
    await limpar();
    await prisma.$disconnect();
  });

  it("responde igual para email cadastrado ou nao (nao revela contas)", async () => {
    const existe = await request(app).post("/api/v1/auth/esqueci-senha").send({ email });
    const naoExiste = await request(app).post("/api/v1/auth/esqueci-senha").send({ email: emailUnico("ninguem") });
    expect(existe.status).toBe(200);
    expect(existe.body).toEqual(naoExiste.body);
  });

  it("o link do email troca a senha, vale uma vez so e encerra as sessoes abertas", async () => {
    await request(app).post("/api/v1/auth/esqueci-senha").send({ email });
    const token = await tokenDoUltimoEmail(email);
    expect(token).toBeTruthy();

    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token, senha: "curta" })).status).toBe(422);
    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token, senha: "senhaNova123" })).status).toBe(200);

    expect((await request(app).post("/api/v1/auth/login").send({ email, senha: "senhaAntiga123" })).status).toBe(401);
    expect((await request(app).post("/api/v1/auth/login").send({ email, senha: "senhaNova123" })).status).toBe(200);
    expect((await request(app).post("/api/v1/auth/refresh").send({ refresh_token: sessaoAntiga })).status).toBe(401);

    const reuso = await request(app).post("/api/v1/auth/redefinir-senha").send({ token, senha: "outraSenha123" });
    expect(reuso.status).toBe(400);
  });

  it("pedir de novo invalida o link anterior", async () => {
    await request(app).post("/api/v1/auth/esqueci-senha").send({ email });
    const primeiro = await tokenDoUltimoEmail(email);
    await new Promise((r) => setTimeout(r, 5)); // nome do arquivo usa o horario
    await request(app).post("/api/v1/auth/esqueci-senha").send({ email });
    const segundo = await tokenDoUltimoEmail(email);
    expect(segundo).not.toBe(primeiro);
    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token: primeiro, senha: "senhaNova456" })).status).toBe(400);
    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token: segundo, senha: "senhaNova456" })).status).toBe(200);
  });

  it("link expirado ou inventado e recusado", async () => {
    await request(app).post("/api/v1/auth/esqueci-senha").send({ email });
    const token = await tokenDoUltimoEmail(email);
    await prisma.redefinicaoSenha.updateMany({ where: { usada_em: null }, data: { expira_em: new Date(Date.now() - 1000) } });
    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token, senha: "senhaNova789" })).status).toBe(400);
    expect((await request(app).post("/api/v1/auth/redefinir-senha").send({ token: "x".repeat(43), senha: "senhaNova789" })).status).toBe(400);
  });
});
