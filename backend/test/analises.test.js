// Upload de imagens e análises (automática por índice de verde e manual).
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

// Pasta de uploads temporária, para os testes não misturarem arquivos com os de desenvolvimento.
const PASTA_UPLOADS = await fs.mkdtemp(path.join(os.tmpdir(), "agrovision-uploads-"));
process.env.UPLOAD_DIR = PASTA_UPLOADS;
const { default: app } = await import("../src/app.js");
const { prisma } = await import("../src/config/prisma.js");

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
let servidor;
let base;

async function req(caminho, { method = "GET", body, token, form } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined)
  });
  const tipo = resposta.headers.get("content-type") || "";
  return {
    status: resposta.status,
    tipo,
    json: tipo.includes("json") ? await resposta.json() : null,
    bytes: tipo.startsWith("image/") ? Buffer.from(await resposta.arrayBuffer()) : null
  };
}

/** Imagem 400x200: 75% verde (lavoura) e 25% marrom (solo exposto). */
async function imagemLavoura(formato = "jpeg") {
  const verde = { r: 40, g: 140, b: 40 };
  const solo = { r: 120, g: 90, b: 60 };
  const base = sharp({ create: { width: 400, height: 200, channels: 3, background: verde } });
  const faixaSolo = await sharp({ create: { width: 100, height: 200, channels: 3, background: solo } }).png().toBuffer();
  return base.composite([{ input: faixaSolo, left: 300, top: 0 }])[formato]().toBuffer();
}

function formulario(arquivos) {
  const form = new FormData();
  for (const { buffer, nome, tipo } of arquivos) form.append("imagens", new Blob([buffer], { type: tipo }), nome);
  return form;
}

let token;
let tokenIntruso;
let idVoo;

before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}/api/v1`;

  token = (await req("/auth/cadastro", { method: "POST", body: { nome: "Dono Teste", email: `dono.${SUFIXO}`, senha: "senha1234" } })).json.data.token;
  tokenIntruso = (await req("/auth/cadastro", { method: "POST", body: { nome: "Intruso Teste", email: `intruso.${SUFIXO}`, senha: "senha1234" } })).json.data.token;
  const prop = await req("/propriedades", { method: "POST", token, body: { nome_fazenda: "Fazenda Teste", cidade: "Jaboticabal", estado: "SP" } });
  const talhao = await req("/talhoes", { method: "POST", token, body: { id_propriedade: prop.json.data.id_propriedade, nome_talhao: "T1" } });
  idVoo = (await req("/voos", { method: "POST", token, body: { id_talhao: talhao.json.data.id_talhao, data_voo: "2026-10-10" } })).json.data.id_voo;
});

after(async () => {
  const usuarios = await prisma.usuario.findMany({ where: { email: { endsWith: SUFIXO } }, select: { id_usuario: true } });
  const dono = { talhao: { propriedade: { id_usuario: { in: usuarios.map((u) => u.id_usuario) } } } };
  await prisma.analise.deleteMany({ where: { voo: dono } });
  await prisma.imagemVoo.deleteMany({ where: { voo: dono } });
  await prisma.voo.deleteMany({ where: dono });
  await prisma.talhao.deleteMany({ where: { propriedade: { id_usuario: { in: usuarios.map((u) => u.id_usuario) } } } });
  await prisma.propriedade.deleteMany({ where: { id_usuario: { in: usuarios.map((u) => u.id_usuario) } } });
  await prisma.usuario.deleteMany({ where: { id_usuario: { in: usuarios.map((u) => u.id_usuario) } } });
  await prisma.$disconnect();
  servidor.close();
  await fs.rm(PASTA_UPLOADS, { recursive: true, force: true });
});

describe("imagens do voo", () => {
  let idImagem;

  test("informa formatos e limites aceitos", async () => {
    const { json } = await req("/imagens/configuracao", { token });
    assert.deepEqual(json.data.formatos, ["JPEG", "PNG", "TIFF"]);
    assert.ok(json.data.tamanho_max_mb > 0);
  });

  test("análise automática sem imagens é recusada", async () => {
    const { status, json } = await req(`/voos/${idVoo}/analises/automatica`, { method: "POST", token });
    assert.equal(status, 422);
    assert.equal(json.error.code, "SEM_IMAGENS");
  });

  test("recusa arquivo que não é imagem (pela extensão/tipo)", async () => {
    const { status, json } = await req(`/voos/${idVoo}/imagens`, {
      method: "POST", token, form: formulario([{ buffer: Buffer.from("não sou imagem"), nome: "notas.txt", tipo: "text/plain" }])
    });
    assert.equal(status, 415);
    assert.equal(json.error.code, "FORMATO_NAO_SUPORTADO");
  });

  test("recusa arquivo com extensão de imagem mas conteúdo falso", async () => {
    const { status, json } = await req(`/voos/${idVoo}/imagens`, {
      method: "POST", token, form: formulario([{ buffer: Buffer.from("texto disfarçado"), nome: "falsa.jpg", tipo: "image/jpeg" }])
    });
    assert.equal(status, 422);
    assert.equal(json.error.code, "IMAGEM_INVALIDA");
    const arquivos = await fs.readdir(path.join(PASTA_UPLOADS, "voos", idVoo)).catch(() => []);
    assert.equal(arquivos.length, 0, "arquivo inválido deve ser apagado do disco");
  });

  test("outro usuário não consegue enviar para o voo", async () => {
    const { status } = await req(`/voos/${idVoo}/imagens`, {
      method: "POST", token: tokenIntruso, form: formulario([{ buffer: await imagemLavoura(), nome: "x.jpg", tipo: "image/jpeg" }])
    });
    assert.equal(status, 404);
  });

  test("envia JPEG e PNG (nome com acento preservado) e registra dimensões", async () => {
    const { status, json } = await req(`/voos/${idVoo}/imagens`, {
      method: "POST", token,
      form: formulario([
        { buffer: await imagemLavoura("jpeg"), nome: "talhão-norte.jpg", tipo: "image/jpeg" },
        { buffer: await imagemLavoura("png"), nome: "talhao-sul.png", tipo: "image/png" }
      ])
    });
    assert.equal(status, 201);
    assert.equal(json.data.enviadas.length, 2);
    assert.equal(json.data.enviadas[0].nome_original, "talhão-norte.jpg");
    assert.equal(json.data.enviadas[0].largura, 400);
    idImagem = json.data.enviadas[0].id_imagem;

    const voo = await req(`/voos/${idVoo}`, { token });
    assert.equal(voo.json.data.imagens.length, 2);
  });

  test("baixa original e miniatura só com login do dono", async () => {
    const original = await req(`/imagens/${idImagem}/arquivo`, { token });
    assert.equal(original.status, 200);
    assert.equal(original.tipo, "image/jpeg");
    const mini = await req(`/imagens/${idImagem}/arquivo?miniatura=1`, { token });
    assert.equal(mini.status, 200);
    assert.ok(mini.bytes.length > 0);
    assert.equal((await req(`/imagens/${idImagem}/arquivo`)).status, 401);
    assert.equal((await req(`/imagens/${idImagem}/arquivo`, { token: tokenIntruso })).status, 404);
  });

  test("não exclui voo que tem imagens", async () => {
    const { status } = await req(`/voos/${idVoo}`, { method: "DELETE", token });
    assert.equal(status, 409);
  });
});

describe("análises", () => {
  let idAutomatica;

  test("análise automática mede a cobertura verde corretamente", async () => {
    const { status, json } = await req(`/voos/${idVoo}/analises/automatica`, { method: "POST", token });
    assert.equal(status, 201);
    const resumo = json.data.detalhes.resumo;
    assert.ok(Math.abs(resumo.saudavel - 75) <= 2, `saudável ≈ 75%, veio ${resumo.saudavel}`);
    assert.ok(Math.abs(resumo.critico - 25) <= 2, `sem vegetação ≈ 25%, veio ${resumo.critico}`);
    assert.equal(json.data.nivel_risco, "medio");
    assert.equal(json.data.origem, "automatica");
    assert.equal(json.data.tipo_analise, "RGB");
    assert.match(json.data.resultado, /não identifica pragas ou doenças/);
    idAutomatica = json.data.id_analise;
  });

  test("gera um mapa PNG por imagem, protegido por login", async () => {
    const mapa = await req(`/analises/${idAutomatica}/mapas/0`, { token });
    assert.equal(mapa.status, 200);
    assert.equal(mapa.tipo, "image/png");
    assert.equal((await req(`/analises/${idAutomatica}/mapas/1`, { token })).status, 200);
    assert.equal((await req(`/analises/${idAutomatica}/mapas/5`, { token })).status, 404);
    assert.equal((await req(`/analises/${idAutomatica}/mapas/0`, { token: tokenIntruso })).status, 404);
  });

  test("registra análise manual com validação", async () => {
    const invalida = await req(`/voos/${idVoo}/analises`, { method: "POST", token, body: { tipo_analise: "X", nivel_risco: "alto", percentual_area_afetada: 150, resultado: "" } });
    assert.equal(invalida.status, 422);
    assert.deepEqual(invalida.json.error.details.map((d) => d.campo).sort(), ["percentual_area_afetada", "resultado", "tipo_analise"]);

    const ok = await req(`/voos/${idVoo}/analises`, {
      method: "POST", token, body: { tipo_analise: "NDVI", nivel_risco: "alto", percentual_area_afetada: 32.5, resultado: "Laudo do agrônomo: manchas de ferrugem no setor B." }
    });
    assert.equal(ok.status, 201);
    assert.equal(ok.json.data.origem, "manual");
    assert.equal(ok.json.data.percentual_area_afetada, 32.5);

    const voo = await req(`/voos/${idVoo}`, { token });
    assert.equal(voo.json.data.analises.length, 2);
  });

  test("excluir análise apaga os mapas do disco", async () => {
    const antes = await fs.readdir(path.join(PASTA_UPLOADS, "analises"));
    assert.ok(antes.some((f) => f.startsWith(idAutomatica)));
    assert.equal((await req(`/analises/${idAutomatica}`, { method: "DELETE", token: tokenIntruso })).status, 404);
    assert.equal((await req(`/analises/${idAutomatica}`, { method: "DELETE", token })).status, 204);
    const depois = await fs.readdir(path.join(PASTA_UPLOADS, "analises"));
    assert.ok(!depois.some((f) => f.startsWith(idAutomatica)));
  });
});
