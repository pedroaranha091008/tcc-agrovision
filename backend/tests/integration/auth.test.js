import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

describe.skipIf(!bancoDisponivel)("fluxo de autenticacao", () => {
  beforeAll(limpar);
  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  const email = emailUnico("auth");
  const senha = "senhaForte123";
  let refreshToken;

  it("registra um novo usuario e devolve tokens sem campos sensiveis", async () => {
    const res = await request(app)
      .post("/api/v1/auth/registro")
      .send({ nome: "Teste Auth", email, senha });
    expect(res.status).toBe(201);
    expect(res.body.data.access_token).toBeTruthy();
    expect(res.body.data.refresh_token).toBeTruthy();
    expect(res.body.data.usuario.senha_hash).toBeUndefined();
    refreshToken = res.body.data.refresh_token;
  });

  it("rejeita registro com email duplicado", async () => {
    const res = await request(app)
      .post("/api/v1/auth/registro")
      .send({ nome: "Outro", email, senha });
    expect(res.status).toBe(409);
  });

  it("rejeita login com senha errada", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, senha: "errada" });
    expect(res.status).toBe(401);
  });

  it("faz login com credenciais corretas", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, senha });
    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBeTruthy();
  });

  it("consulta o proprio perfil com o access token", async () => {
    const login = await request(app).post("/api/v1/auth/login").send({ email, senha });
    const res = await request(app)
      .get("/api/v1/usuarios/me")
      .set("Authorization", `Bearer ${login.body.data.access_token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it("renova a sessao e invalida o refresh token antigo", async () => {
    const renov = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refresh_token: refreshToken });
    expect(renov.status).toBe(200);
    const novoRefresh = renov.body.data.refresh_token;

    const reuso = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refresh_token: refreshToken });
    expect(reuso.status).toBe(401);

    refreshToken = novoRefresh;
  });

  it("faz logout e impede renovacao posterior", async () => {
    const logout = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refresh_token: refreshToken });
    expect(logout.status).toBe(200);

    const depois = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refresh_token: refreshToken });
    expect(depois.status).toBe(401);
  });
});
