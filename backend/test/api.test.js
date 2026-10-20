// Testes de integração da API. Usam o banco do .env e apagam o que criam ao final.
// Rodar com: npm test  (o MySQL/MariaDB precisa estar no ar)
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
const emailTeste = (nome) => `${nome}.${SUFIXO}`;
let servidor;
let base;

async function req(caminho, { method = "GET", body, token } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  return { status: resposta.status, json: await resposta.json().catch(() => null) };
}

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;
});

after(async () => {
  await prisma.sessao.deleteMany({ where: { usuario: { email: { endsWith: SUFIXO } } } });
  await prisma.usuario.deleteMany({ where: { email: { endsWith: SUFIXO } } });
  await prisma.solicitacaoOrcamento.deleteMany({ where: { email: { endsWith: SUFIXO } } });
  await prisma.$disconnect();
  servidor.close();
});

describe("autenticação", () => {
  const email = emailTeste("produtor");
  let token;

  test("recusa cadastro com dados inválidos e diz quais campos", async () => {
    const { status, json } = await req("/auth/cadastro", { method: "POST", body: { nome: "a", email: "x@y", senha: "123" } });
    assert.equal(status, 422);
    const campos = json.error.details.map((d) => d.campo);
    assert.ok(campos.includes("nome") && campos.includes("email") && campos.includes("senha"));
  });

  test("cadastra, devolve token e nunca expõe o hash da senha", async () => {
    const { status, json } = await req("/auth/cadastro", {
      method: "POST",
      body: { nome: "João Ação Teste", email, senha: "senha1234", tipo_usuario: "agronomo" }
    });
    assert.equal(status, 201);
    assert.ok(json.data.token);
    assert.equal(json.data.usuario.nome, "João Ação Teste", "acentos devem ser preservados");
    assert.equal(json.data.usuario.tipo_usuario, "agronomo");
    assert.equal(json.data.usuario.senha_hash, undefined);
    token = json.data.token;

    const salvo = await prisma.usuario.findUnique({ where: { email } });
    assert.equal(salvo.nome, "João Ação Teste");
    assert.notEqual(salvo.senha_hash, "senha1234");
  });

  test("não permite dois cadastros com o mesmo email (ignorando maiúsculas)", async () => {
    const { status, json } = await req("/auth/cadastro", { method: "POST", body: { nome: "Outro Nome", email: email.toUpperCase(), senha: "senha1234" } });
    assert.equal(status, 409);
    assert.equal(json.error.code, "EMAIL_JA_CADASTRADO");
  });

  test("login com senha errada ou email inexistente dá a mesma resposta", async () => {
    const errada = await req("/auth/login", { method: "POST", body: { email, senha: "outra1234" } });
    const inexistente = await req("/auth/login", { method: "POST", body: { email: emailTeste("ninguem"), senha: "1" } });
    assert.equal(errada.status, 401);
    assert.deepEqual(errada.json, inexistente.json);
  });

  test("login correto e consulta do perfil", async () => {
    const login = await req("/auth/login", { method: "POST", body: { email, senha: "senha1234" } });
    assert.equal(login.status, 200);
    const me = await req("/auth/me", { token: login.json.data.token });
    assert.equal(me.status, 200);
    assert.equal(me.json.data.email, email);
  });

  test("rotas protegidas exigem token válido", async () => {
    assert.equal((await req("/auth/me")).status, 401);
    assert.equal((await req("/auth/me", { token: "token-falso" })).status, 401);
  });

  test("atualiza perfil e recusa campos não permitidos", async () => {
    const ok = await req("/usuarios/me", { method: "PATCH", token, body: { telefone: "(16) 98888-7777" } });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.data.telefone, "(16) 98888-7777");

    const proibido = await req("/usuarios/me", { method: "PATCH", token, body: { email: "outro@x.com" } });
    assert.equal(proibido.status, 422);
    assert.equal(proibido.json.error.details[0].campo, "email");
  });
});

describe("orçamentos", () => {
  const valido = {
    nome: "Maria Conceição",
    email: emailTeste("orcamento"),
    telefone: "(16) 99999-0000",
    cidade: "Ribeirão Preto, SP",
    cultura: "Cana-de-açúcar",
    area_hectares: 120.5,
    servico: "Falhas de plantio"
  };

  test("salva uma solicitação válida no banco", async () => {
    const { status, json } = await req("/orcamentos", { method: "POST", body: valido });
    assert.equal(status, 201);
    const salvo = await prisma.solicitacaoOrcamento.findUnique({ where: { id_solicitacao: json.data.id_solicitacao } });
    assert.equal(salvo.nome, "Maria Conceição");
    assert.equal(salvo.cultura, "Cana-de-açúcar");
    assert.equal(Number(salvo.area_hectares), 120.5);
    assert.equal(salvo.status, "novo");
  });

  test("recusa dados inválidos (email, telefone, área negativa, cultura fora da lista)", async () => {
    const { status, json } = await req("/orcamentos", {
      method: "POST",
      body: { ...valido, email: "x@y", telefone: "abc", area_hectares: -5, cultura: "Banana" }
    });
    assert.equal(status, 422);
    const campos = json.error.details.map((d) => d.campo).sort();
    assert.deepEqual(campos, ["area_hectares", "cultura", "email", "telefone"]);
  });
});

describe("erros gerais", () => {
  test("JSON malformado retorna 400 no formato padrão", async () => {
    const resposta = await fetch(base + "/orcamentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{nome:" });
    assert.equal(resposta.status, 400);
    assert.equal((await resposta.json()).error.code, "JSON_INVALIDO");
  });

  test("rota inexistente retorna 404", async () => {
    const { status, json } = await req("/nao-existe");
    assert.equal(status, 404);
    assert.equal(json.error.code, "ROTA_NAO_ENCONTRADA");
  });
});
