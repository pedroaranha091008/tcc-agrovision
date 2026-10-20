// Propriedade → talhão → voo: CRUD, validação, isolamento entre usuários e exclusão com dependentes.
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
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  return { status: resposta.status, json: resposta.status === 204 ? null : await resposta.json().catch(() => null) };
}

async function novoUsuario(nome) {
  const { json } = await req("/auth/cadastro", { method: "POST", body: { nome: `${nome} Teste`, email: `${nome}.${SUFIXO}`, senha: "senha1234" } });
  return json.data.token;
}

let dono;
let intruso;

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;
  dono = await novoUsuario("dono");
  intruso = await novoUsuario("intruso");
});

after(async () => {
  const usuarios = await prisma.usuario.findMany({ where: { email: { endsWith: SUFIXO } }, select: { id_usuario: true } });
  const ids = usuarios.map((u) => u.id_usuario);
  await prisma.voo.deleteMany({ where: { talhao: { propriedade: { id_usuario: { in: ids } } } } });
  await prisma.talhao.deleteMany({ where: { propriedade: { id_usuario: { in: ids } } } });
  await prisma.propriedade.deleteMany({ where: { id_usuario: { in: ids } } });
  await prisma.sessao.deleteMany({ where: { usuario: { email: { endsWith: SUFIXO } } } });
  await prisma.usuario.deleteMany({ where: { id_usuario: { in: ids } } });
  await prisma.$disconnect();
  servidor.close();
});

describe("hierarquia propriedade → talhão → voo", () => {
  let idPropriedade;
  let idTalhao;
  let idVoo;

  test("exige login", async () => {
    assert.equal((await req("/propriedades")).status, 401);
  });

  test("lista vazia para conta nova", async () => {
    const { status, json } = await req("/propriedades", { token: dono });
    assert.equal(status, 200);
    assert.deepEqual(json.data, []);
    assert.equal(json.meta.total, 0);
  });

  test("valida a propriedade", async () => {
    const { status, json } = await req("/propriedades", { method: "POST", token: dono, body: { nome_fazenda: "", estado: "XX", cidade: "", area_total_hectares: -1 } });
    assert.equal(status, 422);
    assert.deepEqual(json.error.details.map((d) => d.campo).sort(), ["area_total_hectares", "cidade", "estado", "nome_fazenda"]);
  });

  test("cria propriedade (UF em minúsculas é aceita) e devolve números, não strings", async () => {
    const { status, json } = await req("/propriedades", {
      method: "POST", token: dono,
      body: { nome_fazenda: "Fazenda São João", estado: "sp", cidade: "Ribeirão Preto", area_total_hectares: 320.5 }
    });
    assert.equal(status, 201);
    assert.equal(json.data.estado, "SP");
    assert.equal(json.data.area_total_hectares, 320.5);
    idPropriedade = json.data.id_propriedade;
  });

  test("cria talhão dentro da propriedade", async () => {
    const { status, json } = await req("/talhoes", {
      method: "POST", token: dono,
      body: { id_propriedade: idPropriedade, nome_talhao: "Talhão A", cultura: "Soja", area_hectares: 98, latitude: -21.17, longitude: -47.81 }
    });
    assert.equal(status, 201);
    assert.equal(json.data.status, "ativo");
    idTalhao = json.data.id_talhao;
  });

  test("recusa coordenadas inválidas", async () => {
    const { status, json } = await req("/talhoes", { method: "POST", token: dono, body: { id_propriedade: idPropriedade, nome_talhao: "X", latitude: 120 } });
    assert.equal(status, 422);
    assert.equal(json.error.details[0].campo, "latitude");
  });

  test("registra voo no talhão", async () => {
    const { status, json } = await req("/voos", {
      method: "POST", token: dono,
      body: { id_talhao: idTalhao, data_voo: "2026-10-15", altitude_metros: 120, modelo_drone: "DJI Mavic 3M", operador: "Carlos" }
    });
    assert.equal(status, 201);
    assert.equal(json.data.altitude_metros, 120);
    idVoo = json.data.id_voo;
  });

  test("detalhes trazem contagens e a hierarquia para os breadcrumbs", async () => {
    const lista = await req("/propriedades", { token: dono });
    assert.equal(lista.json.data[0].total_talhoes, 1);
    assert.equal(lista.json.data[0].area_talhoes_hectares, 98);

    const prop = await req(`/propriedades/${idPropriedade}`, { token: dono });
    assert.equal(prop.json.data.talhoes[0].total_voos, 1);
    assert.ok(prop.json.data.talhoes[0].ultimo_voo);

    const talhao = await req(`/talhoes/${idTalhao}`, { token: dono });
    assert.equal(talhao.json.data.propriedade.nome_fazenda, "Fazenda São João");
    assert.equal(talhao.json.data.voos.length, 1);

    const voo = await req(`/voos/${idVoo}`, { token: dono });
    assert.equal(voo.json.data.talhao.propriedade.id_propriedade, idPropriedade);
  });

  test("outro usuário não vê, não altera e não usa os dados do dono", async () => {
    assert.deepEqual((await req("/propriedades", { token: intruso })).json.data, []);
    assert.equal((await req(`/propriedades/${idPropriedade}`, { token: intruso })).status, 404);
    assert.equal((await req(`/talhoes/${idTalhao}`, { token: intruso })).status, 404);
    assert.equal((await req(`/voos/${idVoo}`, { token: intruso })).status, 404);
    assert.equal((await req(`/propriedades/${idPropriedade}`, { method: "PATCH", token: intruso, body: { cidade: "Hack" } })).status, 404);
    assert.equal((await req(`/voos/${idVoo}`, { method: "DELETE", token: intruso })).status, 404);
    assert.equal((await req("/talhoes", { method: "POST", token: intruso, body: { id_propriedade: idPropriedade, nome_talhao: "Invasor" } })).status, 404);
  });

  test("id que não é UUID responde 404", async () => {
    assert.equal((await req("/propriedades/abc", { token: dono })).status, 404);
  });

  test("atualiza e não deixa trocar o talhão de propriedade", async () => {
    const ok = await req(`/talhoes/${idTalhao}`, { method: "PATCH", token: dono, body: { cultura: "Milho", status: "em_analise" } });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.data.cultura, "Milho");
    const mover = await req(`/talhoes/${idTalhao}`, { method: "PATCH", token: dono, body: { id_propriedade: idPropriedade } });
    assert.equal(mover.status, 422);
  });

  test("não exclui itens com dependentes; exclui de baixo para cima", async () => {
    const bloqueado = await req(`/propriedades/${idPropriedade}`, { method: "DELETE", token: dono });
    assert.equal(bloqueado.status, 409);
    assert.equal(bloqueado.json.error.code, "POSSUI_DEPENDENTES");
    assert.equal((await req(`/talhoes/${idTalhao}`, { method: "DELETE", token: dono })).status, 409);

    assert.equal((await req(`/voos/${idVoo}`, { method: "DELETE", token: dono })).status, 204);
    assert.equal((await req(`/talhoes/${idTalhao}`, { method: "DELETE", token: dono })).status, 204);
    assert.equal((await req(`/propriedades/${idPropriedade}`, { method: "DELETE", token: dono })).status, 204);
    assert.equal((await req(`/propriedades/${idPropriedade}`, { token: dono })).status, 404);
  });
});
