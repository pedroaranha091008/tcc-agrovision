// Sessões: token de acesso curto + token de renovação rotativo em cookie httpOnly.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
const EMAIL = `sessao.${SUFIXO}`;
let servidor;
let base;

/** Requisição que devolve também o cookie de renovação recebido (se houver). */
async function req(caminho, { method = "GET", body, token, cookie } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { Cookie: `agrovision_renovacao=${cookie}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const setCookie = resposta.headers.get("set-cookie") ?? "";
  const valor = /agrovision_renovacao=([^;]*)/.exec(setCookie)?.[1];
  return { status: resposta.status, json: resposta.status === 204 ? null : await resposta.json().catch(() => null), setCookie, cookie: valor };
}

const login = (lembrar) => req("/auth/login", { method: "POST", body: { email: EMAIL, senha: "senha1234", lembrar } });

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;
  await req("/auth/cadastro", { method: "POST", body: { nome: "Sessão Teste", email: EMAIL, senha: "senha1234" } });
});

after(async () => {
  await prisma.sessao.deleteMany({ where: { usuario: { email: { endsWith: SUFIXO } } } });
  await prisma.usuario.deleteMany({ where: { email: { endsWith: SUFIXO } } });
  await prisma.$disconnect();
  servidor.close();
});

describe("sessões", () => {
  test("login entrega token de acesso curto e cookie httpOnly restrito às rotas de autenticação", async () => {
    const r = await login(false);
    assert.equal(r.status, 200);
    const { iat, exp } = JSON.parse(Buffer.from(r.json.data.token.split(".")[1], "base64url").toString());
    assert.equal(exp - iat, 15 * 60, "token de acesso vale 15 minutos");
    assert.ok(r.cookie && r.cookie.length > 40);
    assert.match(r.setCookie, /HttpOnly/i);
    assert.match(r.setCookie, /Path=\/api\/v1\/auth/);
    assert.match(r.setCookie, /SameSite=Lax/i);
    assert.doesNotMatch(r.setCookie, /Expires/i, "sem 'manter conectado' o cookie some ao fechar o navegador");
  });

  test("'manter conectado' grava cookie com validade de ~30 dias", async () => {
    const r = await login(true);
    const expira = new Date(/Expires=([^;]+)/i.exec(r.setCookie)[1]);
    const dias = (expira - Date.now()) / 86400000;
    assert.ok(dias > 29 && dias <= 30, `${dias} dias`);
  });

  test("o token de renovação nunca é guardado em texto puro", async () => {
    const r = await login(false);
    const guardadas = await prisma.sessao.findMany({ where: { usuario: { email: EMAIL } } });
    assert.ok(guardadas.every((s) => s.token_hash !== r.cookie && s.token_hash.length === 64));
  });

  test("renovar troca o token (rotação) e devolve novo acesso", async () => {
    const r = await login(false);
    const renovada = await req("/auth/renovar", { method: "POST", cookie: r.cookie });
    assert.equal(renovada.status, 200);
    assert.ok(renovada.json.data.token);
    assert.equal(renovada.json.data.usuario.email, EMAIL);
    assert.ok(renovada.cookie && renovada.cookie !== r.cookie);
    assert.equal((await req("/auth/me", { token: renovada.json.data.token })).status, 200);
  });

  test("reusar um token já trocado encerra todas as sessões do usuário", async () => {
    const r = await login(true);
    const outraAba = await login(true);
    const nova = await req("/auth/renovar", { method: "POST", cookie: r.cookie });
    const reuso = await req("/auth/renovar", { method: "POST", cookie: r.cookie });
    assert.equal(reuso.status, 401);
    assert.equal((await req("/auth/renovar", { method: "POST", cookie: nova.cookie })).status, 401, "a sessão nova também cai");
    assert.equal((await req("/auth/renovar", { method: "POST", cookie: outraAba.cookie })).status, 401, "e as outras sessões também");
  });

  test("sem cookie ou com cookie inventado: 401 e cookie apagado", async () => {
    assert.equal((await req("/auth/renovar", { method: "POST" })).status, 401);
    const falso = await req("/auth/renovar", { method: "POST", cookie: "inventado" });
    assert.equal(falso.status, 401);
    assert.match(falso.setCookie, /agrovision_renovacao=;/);
  });

  test("sair encerra a sessão no servidor", async () => {
    const r = await login(false);
    const saida = await req("/auth/sair", { method: "POST", cookie: r.cookie });
    assert.equal(saida.status, 204);
    assert.match(saida.setCookie, /agrovision_renovacao=;/);
    assert.equal((await req("/auth/renovar", { method: "POST", cookie: r.cookie })).status, 401);
  });
});
