// Painel (indicadores reais) e histórico de monitoramentos com filtros e paginação.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
let servidor;
let base;

async function req(caminho, { method = "GET", body, token } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  return { status: resposta.status, json: await resposta.json().catch(() => null) };
}

const diasAtras = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

let token;
let outro;
const ids = {};

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;
  const cadastrar = async (n) => (await req("/auth/cadastro", { method: "POST", body: { nome: `${n} Teste`, email: `${n}.${SUFIXO}`, senha: "senha1234" } })).json.data.token;
  token = await cadastrar("painel");
  outro = await cadastrar("outro");

  const post = async (caminho, body) => (await req(caminho, { method: "POST", token, body })).json.data;
  ids.fazA = (await post("/propriedades", { nome_fazenda: "Fazenda A", cidade: "Matão", estado: "SP", area_total_hectares: 500 })).id_propriedade;
  ids.fazB = (await post("/propriedades", { nome_fazenda: "Fazenda B", cidade: "Uberaba", estado: "MG" })).id_propriedade;
  ids.t1 = (await post("/talhoes", { id_propriedade: ids.fazA, nome_talhao: "A1", area_hectares: 100 })).id_talhao;
  ids.t2 = (await post("/talhoes", { id_propriedade: ids.fazA, nome_talhao: "A2", area_hectares: 50 })).id_talhao;
  ids.t3 = (await post("/talhoes", { id_propriedade: ids.fazB, nome_talhao: "B1", area_hectares: 30 })).id_talhao;
  await post("/talhoes", { id_propriedade: ids.fazB, nome_talhao: "B2 sem voos" });

  // A1: voo antigo crítico, voo recente baixo → situação atual = baixo
  ids.vooA1antigo = (await post("/voos", { id_talhao: ids.t1, data_voo: diasAtras(60) })).id_voo;
  ids.vooA1recente = (await post("/voos", { id_talhao: ids.t1, data_voo: diasAtras(5) })).id_voo;
  // A2: voo de 200 dias atrás, alto
  ids.vooA2 = (await post("/voos", { id_talhao: ids.t2, data_voo: diasAtras(200) })).id_voo;
  // B1: voo recente, crítico
  ids.vooB1 = (await post("/voos", { id_talhao: ids.t3, data_voo: diasAtras(10) })).id_voo;

  const analise = (idVoo, tipo, nivel, pct) => post(`/voos/${idVoo}/analises`, { tipo_analise: tipo, nivel_risco: nivel, percentual_area_afetada: pct, resultado: "Teste de painel." });
  await analise(ids.vooA1antigo, "NDVI", "critico", 60);
  await analise(ids.vooA1recente, "NDVI", "baixo", 5);
  await analise(ids.vooA2, "RGB", "alto", 35);
  await analise(ids.vooB1, "termico", "critico", 55);
});

after(async () => {
  const usuarios = await prisma.usuario.findMany({ where: { email: { endsWith: SUFIXO } }, select: { id_usuario: true } });
  const dono = { in: usuarios.map((u) => u.id_usuario) };
  await prisma.analise.deleteMany({ where: { voo: { talhao: { propriedade: { id_usuario: dono } } } } });
  await prisma.voo.deleteMany({ where: { talhao: { propriedade: { id_usuario: dono } } } });
  await prisma.talhao.deleteMany({ where: { propriedade: { id_usuario: dono } } });
  await prisma.propriedade.deleteMany({ where: { id_usuario: dono } });
  await prisma.usuario.deleteMany({ where: { id_usuario: dono } });
  await prisma.$disconnect();
  servidor.close();
});

describe("painel", () => {
  test("conta nova recebe painel zerado", async () => {
    const { status, json } = await req("/dashboard", { token: outro });
    assert.equal(status, 200);
    assert.equal(json.data.totais.propriedades, 0);
    assert.deepEqual(json.data.talhoes, []);
  });

  test("totais e situação de cada talhão (análise do voo mais recente vale)", async () => {
    const { json } = await req("/dashboard?dias=90", { token });
    const d = json.data;
    assert.equal(d.totais.propriedades, 2);
    assert.equal(d.totais.talhoes, 4);
    assert.equal(d.totais.area_monitorada_hectares, 180);
    assert.equal(d.totais.voos, 4);
    assert.equal(d.totais.voos_periodo, 3, "voo de 200 dias atrás fica fora de 90 dias");
    assert.equal(d.totais.analises_periodo, 3);
    assert.deepEqual(d.risco_talhoes, { baixo: 1, medio: 0, alto: 1, critico: 1, sem_analise: 1 });
    assert.equal(d.totais.areas_criticas, 2);

    const a1 = d.talhoes.find((t) => t.nome_talhao === "A1");
    assert.equal(a1.ultima_analise.nivel_risco, "baixo");
    assert.equal(d.talhoes[0].ultima_analise.nivel_risco, "critico", "talhões mais críticos primeiro");
    assert.equal(d.ultimas_analises.length, 3);
  });

  test("série mensal tem voos e média de área afetada", async () => {
    const { json } = await req("/dashboard?dias=365", { token });
    assert.equal(json.data.serie_mensal.length, 12);
    assert.equal(json.data.serie_mensal.reduce((s, m) => s + m.voos, 0), 4);
  });

  test("filtra por propriedade e não aceita propriedade de outro usuário", async () => {
    const { json } = await req(`/dashboard?id_propriedade=${ids.fazB}`, { token });
    assert.equal(json.data.totais.propriedades, 1);
    assert.equal(json.data.totais.talhoes, 2);
    assert.equal((await req(`/dashboard?id_propriedade=${ids.fazB}`, { token: outro })).status, 404);
    assert.equal((await req("/dashboard?dias=7", { token })).status, 422);
  });
});

describe("histórico de monitoramentos", () => {
  test("lista tudo, do voo mais recente ao mais antigo, com hierarquia", async () => {
    const { json } = await req("/monitoramentos", { token });
    assert.equal(json.meta.total, 4);
    assert.equal(json.data[0].voo.talhao.nome_talhao, "A1");
    assert.equal(json.data[0].nivel_risco, "baixo");
    assert.equal(json.data[3].voo.talhao.propriedade.nome_fazenda, "Fazenda A");
  });

  test("filtros combinados", async () => {
    assert.equal((await req(`/monitoramentos?id_propriedade=${ids.fazA}`, { token })).json.meta.total, 3);
    assert.equal((await req(`/monitoramentos?id_talhao=${ids.t1}`, { token })).json.meta.total, 2);
    assert.equal((await req("/monitoramentos?nivel_risco=critico", { token })).json.meta.total, 2);
    assert.equal((await req("/monitoramentos?tipo_analise=NDVI&nivel_risco=critico", { token })).json.meta.total, 1);
    assert.equal((await req(`/monitoramentos?data_inicio=${diasAtras(30)}`, { token })).json.meta.total, 2);
    assert.equal((await req(`/monitoramentos?data_inicio=${diasAtras(90)}&data_fim=${diasAtras(30)}`, { token })).json.meta.total, 1);
    assert.equal((await req("/monitoramentos?tipo_analise=", { token })).json.meta.total, 4, "filtro vazio é ignorado");
  });

  test("paginação", async () => {
    const p1 = await req("/monitoramentos?por_pagina=3&pagina=1", { token });
    const p2 = await req("/monitoramentos?por_pagina=3&pagina=2", { token });
    assert.equal(p1.json.data.length, 3);
    assert.equal(p2.json.data.length, 1);
    assert.equal(p1.json.meta.total_paginas, 2);
    assert.equal((await req("/monitoramentos?por_pagina=500", { token })).status, 422);
  });

  test("valida filtros e isola usuários", async () => {
    const datas = await req(`/monitoramentos?data_inicio=${diasAtras(1)}&data_fim=${diasAtras(30)}`, { token });
    assert.equal(datas.status, 422);
    assert.equal(datas.json.error.details[0].campo, "data_fim");
    assert.equal((await req("/monitoramentos?nivel_risco=gigante", { token })).status, 422);
    assert.equal((await req("/monitoramentos", { token: outro })).json.meta.total, 0);
    assert.equal((await req(`/monitoramentos?id_propriedade=${ids.fazA}`, { token: outro })).json.meta.total, 0);
  });
});
