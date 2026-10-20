// Recomendações por regras e relatório em PDF.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const PASTA_UPLOADS = await fs.mkdtemp(path.join(os.tmpdir(), "agrovision-relatorios-"));
process.env.UPLOAD_DIR = PASTA_UPLOADS;
const { default: app } = await import("../src/app.js");
const { prisma } = await import("../src/config/prisma.js");
const { recomendar, VERSAO_REGRAS } = await import("../src/modules/relatorios/recomendacoes.js");

const SUFIXO = `${Date.now()}@teste.agrovision.dev`;
let servidor;
let base;

async function req(caminho, { method = "GET", body, token, form } = {}) {
  const resposta = await fetch(base + caminho, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined)
  });
  const tipo = resposta.headers.get("content-type") || "";
  return {
    status: resposta.status,
    tipo,
    disposicao: resposta.headers.get("content-disposition"),
    json: tipo.includes("json") ? await resposta.json() : null,
    bytes: tipo.includes("pdf") ? Buffer.from(await resposta.arrayBuffer()) : null
  };
}

describe("regras de recomendação", () => {
  test("cada nível de risco tem título, prazo, ações e aviso", () => {
    for (const nivel of ["baixo", "medio", "alto", "critico"]) {
      const r = recomendar({ tipo_analise: "NDVI", nivel_risco: nivel, percentual_area_afetada: 10 });
      assert.ok(r.titulo && r.prazo && r.acoes.length >= 2, nivel);
      assert.equal(r.versao, VERSAO_REGRAS);
      assert.match(r.aviso, /não substituem a avaliação de um engenheiro agrônomo/);
    }
  });

  test("ação específica do tipo só entra quando há risco", () => {
    const termicoAlto = recomendar({ tipo_analise: "termico", nivel_risco: "alto", percentual_area_afetada: 20 });
    assert.ok(termicoAlto.acoes.some((a) => a.includes("irrigação")));
    const termicoBaixo = recomendar({ tipo_analise: "termico", nivel_risco: "baixo", percentual_area_afetada: 2 });
    assert.ok(!termicoBaixo.acoes.some((a) => a.includes("irrigação")));
  });

  test("área afetada grande sugere tratar o talhão inteiro", () => {
    assert.ok(recomendar({ tipo_analise: "RGB", nivel_risco: "critico", percentual_area_afetada: 55 }).acoes.some((a) => a.includes("talhão inteiro")));
    assert.ok(!recomendar({ tipo_analise: "RGB", nivel_risco: "critico", percentual_area_afetada: 20 }).acoes.some((a) => a.includes("talhão inteiro")));
  });

  test("sem nível de risco não há recomendação", () => {
    assert.equal(recomendar({ tipo_analise: "RGB", nivel_risco: null, percentual_area_afetada: null }), null);
  });
});

describe("relatório PDF", () => {
  let token;
  let outro;
  let idManual;
  let idAutomatica;
  let idVoo;

  before(async () => {
    servidor = app.listen(0);
    await new Promise((resolve) => servidor.once("listening", resolve));
    base = `http://localhost:${servidor.address().port}/api/v1`;
    const cadastrar = async (n) => (await req("/auth/cadastro", { method: "POST", body: { nome: `${n} Teste`, email: `${n}.${SUFIXO}`, senha: "senha1234" } })).json.data.token;
    token = await cadastrar("relatorio");
    outro = await cadastrar("curioso");
    const post = async (c, body) => (await req(c, { method: "POST", token, body })).json.data;
    const prop = await post("/propriedades", { nome_fazenda: "Fazenda São Bento", cidade: "Franca", estado: "SP" });
    const tal = await post("/talhoes", { id_propriedade: prop.id_propriedade, nome_talhao: "Talhão Café Nº 2", cultura: "Café", area_hectares: 33.5 });
    idVoo = (await post("/voos", { id_talhao: tal.id_talhao, data_voo: "2026-10-01", modelo_drone: "DJI Mavic 3M", operador: "José", altitude_metros: 100 })).id_voo;
    idManual = (await post(`/voos/${idVoo}/analises`, { tipo_analise: "NDVI", nivel_risco: "alto", percentual_area_afetada: 42, resultado: "Manchas de baixa vigor na face norte; possível deficiência de nitrogênio." })).id_analise;

    const img = await sharp({ create: { width: 300, height: 200, channels: 3, background: { r: 40, g: 140, b: 40 } } }).jpeg().toBuffer();
    const form = new FormData();
    form.append("imagens", new Blob([img], { type: "image/jpeg" }), "lavoura.jpg");
    await req(`/voos/${idVoo}/imagens`, { method: "POST", token, form });
    idAutomatica = (await req(`/voos/${idVoo}/analises/automatica`, { method: "POST", token })).json.data.id_analise;
  });

  after(async () => {
    const usuarios = await prisma.usuario.findMany({ where: { email: { endsWith: SUFIXO } }, select: { id_usuario: true } });
    const dono = { in: usuarios.map((u) => u.id_usuario) };
    await prisma.analise.deleteMany({ where: { voo: { talhao: { propriedade: { id_usuario: dono } } } } });
    await prisma.imagemVoo.deleteMany({ where: { voo: { talhao: { propriedade: { id_usuario: dono } } } } });
    await prisma.voo.deleteMany({ where: { talhao: { propriedade: { id_usuario: dono } } } });
    await prisma.talhao.deleteMany({ where: { propriedade: { id_usuario: dono } } });
    await prisma.propriedade.deleteMany({ where: { id_usuario: dono } });
    await prisma.usuario.deleteMany({ where: { id_usuario: dono } });
    await prisma.$disconnect();
    servidor.close();
    await fs.rm(PASTA_UPLOADS, { recursive: true, force: true });
  });

  test("detalhe da análise traz a hierarquia e a recomendação", async () => {
    const { status, json } = await req(`/analises/${idManual}`, { token });
    assert.equal(status, 200);
    assert.equal(json.data.voo.talhao.propriedade.nome_fazenda, "Fazenda São Bento");
    assert.equal(json.data.recomendacao.titulo, "Intervenção recomendada");
    assert.ok(json.data.recomendacao.acoes.some((a) => a.includes("talhão inteiro")), "42% afetada");
  });

  test("voo também devolve a recomendação de cada análise", async () => {
    const { json } = await req(`/voos/${idVoo}`, { token });
    assert.ok(json.data.analises.every((a) => a.recomendacao?.titulo));
  });

  test("gera um PDF válido para análise manual", async () => {
    const { status, tipo, disposicao, bytes } = await req(`/analises/${idManual}/relatorio`, { token });
    assert.equal(status, 200);
    assert.equal(tipo, "application/pdf");
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.match(disposicao, /relatorio-talhao-cafe-n-2-2026-10-01\.pdf/);
  });

  test("PDF da análise automática inclui o mapa como imagem", async () => {
    const temImagem = (pdf) => pdf.toString("latin1").includes("/Subtype /Image");
    const manual = (await req(`/analises/${idManual}/relatorio`, { token })).bytes;
    const automatica = (await req(`/analises/${idAutomatica}/relatorio`, { token })).bytes;
    assert.equal(automatica.subarray(0, 5).toString(), "%PDF-");
    assert.ok(temImagem(automatica), "a automática deve ter o mapa embutido");
    assert.ok(!temImagem(manual), "a manual não tem mapas");
  });

  test("só o dono baixa o relatório e vê o detalhe", async () => {
    assert.equal((await req(`/analises/${idManual}/relatorio`)).status, 401);
    assert.equal((await req(`/analises/${idManual}/relatorio`, { token: outro })).status, 404);
    assert.equal((await req(`/analises/${idManual}`, { token: outro })).status, 404);
  });
});
