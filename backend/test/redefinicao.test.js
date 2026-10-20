// "Esqueci a senha": pedido, email com link, troca de senha e encerramento das sessões.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { PASTA_EMAILS_DEV } from "../src/utils/email.js";

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
const EMAIL = `esqueci.${SUFIXO}`;
let servidor;
let base;

async function req(caminho, { method = "POST", body, cookie } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: `agrovision_renovacao=${cookie}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const cookieRecebido = /agrovision_renovacao=([^;]*)/.exec(resposta.headers.get("set-cookie") ?? "")?.[1];
  return { status: resposta.status, json: await resposta.json().catch(() => null), cookie: cookieRecebido };
}

/** Lê o último email salvo na caixa de saída de desenvolvimento para este destinatário. */
async function ultimoLink(para) {
  const arquivos = (await fs.readdir(PASTA_EMAILS_DEV)).filter((f) => f.endsWith(`${para}.txt`)).sort();
  if (!arquivos.length) return null;
  const texto = await fs.readFile(path.join(PASTA_EMAILS_DEV, arquivos.at(-1)), "utf8");
  return /token=([A-Za-z0-9_-]+)/.exec(texto)?.[1] ?? null;
}

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;
  await req("/auth/cadastro", { body: { nome: "Esqueci Teste", email: EMAIL, senha: "senhaAntiga1" } });
});

after(async () => {
  const arquivos = await fs.readdir(PASTA_EMAILS_DEV).catch(() => []);
  await Promise.all(arquivos.filter((f) => f.includes(SUFIXO)).map((f) => fs.rm(path.join(PASTA_EMAILS_DEV, f))));
  await prisma.redefinicaoSenha.deleteMany({ where: { usuario: { email: { endsWith: SUFIXO } } } });
  await prisma.sessao.deleteMany({ where: { usuario: { email: { endsWith: SUFIXO } } } });
  await prisma.usuario.deleteMany({ where: { email: { endsWith: SUFIXO } } });
  await prisma.$disconnect();
  servidor.close();
});

describe("recuperação de senha", () => {
  test("cadastro recusa senha sem números", async () => {
    const r = await req("/auth/cadastro", { body: { nome: "Sem Numero", email: `semnumero.${SUFIXO}`, senha: "senhadodia" } });
    assert.equal(r.status, 422);
    assert.ok(r.json.error.details.some((d) => d.mensagem === "Use letras e números na senha."));
  });

  test("resposta é a mesma para email cadastrado ou não (não revela contas)", async () => {
    const existe = await req("/auth/esqueci-senha", { body: { email: EMAIL } });
    const naoExiste = await req("/auth/esqueci-senha", { body: { email: `ninguem.${SUFIXO}` } });
    assert.equal(existe.status, 200);
    assert.deepEqual(existe.json, naoExiste.json);
    assert.equal(await ultimoLink(`ninguem.${SUFIXO}`), null, "não manda email para conta inexistente");
  });

  test("o link do email troca a senha, vale uma vez só e derruba as sessões abertas", async () => {
    const sessaoAberta = await req("/auth/login", { body: { email: EMAIL, senha: "senhaAntiga1" } });
    await req("/auth/esqueci-senha", { body: { email: EMAIL } });
    const token = await ultimoLink(EMAIL);
    assert.ok(token, "email com link salvo na caixa de saída");

    const fraca = await req("/auth/redefinir-senha", { body: { token, senha: "curta" } });
    assert.equal(fraca.status, 422);

    const ok = await req("/auth/redefinir-senha", { body: { token, senha: "senhaNova123" } });
    assert.equal(ok.status, 200);
    assert.equal((await req("/auth/login", { body: { email: EMAIL, senha: "senhaAntiga1" } })).status, 401);
    assert.equal((await req("/auth/login", { body: { email: EMAIL, senha: "senhaNova123" } })).status, 200);
    assert.equal((await req("/auth/renovar", { cookie: sessaoAberta.cookie })).status, 401, "sessão antiga encerrada");

    const reuso = await req("/auth/redefinir-senha", { body: { token, senha: "outraSenha9" } });
    assert.equal(reuso.status, 400);
    assert.equal(reuso.json.error.code, "LINK_INVALIDO");
  });

  test("pedir de novo invalida o link anterior", async () => {
    await req("/auth/esqueci-senha", { body: { email: EMAIL } });
    const primeiro = await ultimoLink(EMAIL);
    await new Promise((r) => setTimeout(r, 5)); // nomes de arquivo com horário diferente
    await req("/auth/esqueci-senha", { body: { email: EMAIL } });
    const segundo = await ultimoLink(EMAIL);
    assert.notEqual(primeiro, segundo);
    assert.equal((await req("/auth/redefinir-senha", { body: { token: primeiro, senha: "senhaNova456" } })).status, 400);
    assert.equal((await req("/auth/redefinir-senha", { body: { token: segundo, senha: "senhaNova456" } })).status, 200);
  });

  test("link expirado é recusado", async () => {
    await req("/auth/esqueci-senha", { body: { email: EMAIL } });
    const token = await ultimoLink(EMAIL);
    await prisma.redefinicaoSenha.updateMany({ where: { usuario: { email: EMAIL }, usada_em: null }, data: { expira_em: new Date(Date.now() - 1000) } });
    assert.equal((await req("/auth/redefinir-senha", { body: { token, senha: "senhaNova789" } })).status, 400);
  });

  test("token inventado é recusado", async () => {
    const r = await req("/auth/redefinir-senha", { body: { token: "x".repeat(43), senha: "senhaNova789" } });
    assert.equal(r.status, 400);
  });
});
