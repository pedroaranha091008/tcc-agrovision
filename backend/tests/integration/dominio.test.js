import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

async function novoUsuario(prefixo) {
  const email = emailUnico(prefixo);
  const res = await request(app)
    .post("/api/v1/auth/registro")
    .send({ nome: prefixo, email, senha: "senhaForte123" });
  return { email, token: res.body.data.access_token };
}

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe.skipIf(!bancoDisponivel)("dominio agricola: CRUD, isolamento e exclusao", () => {
  let usuarioA;
  let usuarioB;
  let idPropriedade;
  let idTalhao;
  let idVoo;

  beforeAll(async () => {
    await limpar();
    usuarioA = await novoUsuario("dono");
    usuarioB = await novoUsuario("intruso");
  });
  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  it("cria a hierarquia propriedade -> talhao -> voo", async () => {
    const prop = await request(app)
      .post("/api/v1/propriedades")
      .set(auth(usuarioA.token))
      .send({ nome_fazenda: "Fazenda Um", estado: "sp", cidade: "Campinas", area_total_hectares: 120 });
    expect(prop.status).toBe(201);
    expect(prop.body.data.estado).toBe("SP");
    idPropriedade = prop.body.data.id_propriedade;

    const talhao = await request(app)
      .post("/api/v1/talhoes")
      .set(auth(usuarioA.token))
      .send({ id_propriedade: idPropriedade, nome_talhao: "Talhao A", cultura: "soja", area_hectares: 40 });
    expect(talhao.status).toBe(201);
    idTalhao = talhao.body.data.id_talhao;

    const voo = await request(app)
      .post("/api/v1/voos")
      .set(auth(usuarioA.token))
      .send({ id_talhao: idTalhao, data_voo: "2026-02-01", modelo_drone: "Mavic 3M" });
    expect(voo.status).toBe(201);
    idVoo = voo.body.data.id_voo;
  });

  it("usuario B nao enxerga nem acessa recursos de A", async () => {
    const lista = await request(app)
      .get("/api/v1/propriedades")
      .set(auth(usuarioB.token));
    expect(lista.status).toBe(200);
    expect(lista.body.data).toHaveLength(0);

    const acesso = await request(app)
      .get(`/api/v1/propriedades/${idPropriedade}`)
      .set(auth(usuarioB.token));
    expect(acesso.status).toBe(404);

    const alteracao = await request(app)
      .patch(`/api/v1/talhoes/${idTalhao}`)
      .set(auth(usuarioB.token))
      .send({ nome_talhao: "invadido" });
    expect(alteracao.status).toBe(404);
  });

  it("bloqueia exclusao de recurso com dependentes (409)", async () => {
    const res = await request(app)
      .delete(`/api/v1/propriedades/${idPropriedade}`)
      .set(auth(usuarioA.token));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLITO");
  });

  it("registra analise e ela aparece no historico e no dashboard", async () => {
    const analise = await request(app)
      .post("/api/v1/analises")
      .set(auth(usuarioA.token))
      .send({
        id_voo: idVoo,
        tipo_analise: "NDVI",
        nivel_risco: "alto",
        percentual_area_afetada: 22.5,
        resultado: "Zona norte com perda de vigor.",
      });
    expect(analise.status).toBe(201);

    const hist = await request(app)
      .get("/api/v1/monitoramentos")
      .set(auth(usuarioA.token));
    expect(hist.status).toBe(200);
    expect(hist.body.data).toHaveLength(1);
    expect(hist.body.data[0].propriedade.nome_fazenda).toBe("Fazenda Um");

    const dash = await request(app).get("/api/v1/dashboard").set(auth(usuarioA.token));
    expect(dash.status).toBe(200);
    expect(dash.body.data.indicadores.total_analises).toBe(1);
    expect(dash.body.data.indicadores.problemas_detectados).toBe(1);
  });

  it("filtra o historico por tipo de analise, inclusive resultado vazio", async () => {
    const vazio = await request(app)
      .get("/api/v1/monitoramentos?tipo_analise=RGB")
      .set(auth(usuarioA.token));
    expect(vazio.status).toBe(200);
    expect(vazio.body.data).toHaveLength(0);
    expect(vazio.body.meta.total).toBe(0);
  });

  it("gera relatorio PDF de uma analise concluida e permite download autenticado", async () => {
    const analises = await request(app).get("/api/v1/analises").set(auth(usuarioA.token));
    const idAnalise = analises.body.data[0].id_analise;

    const gerar = await request(app)
      .post("/api/v1/relatorios")
      .set(auth(usuarioA.token))
      .send({ id_analise: idAnalise });
    expect(gerar.status).toBe(201);
    expect(gerar.body.data.recomendacao.baseada_em_regras).toBe(true);
    const idRelatorio = gerar.body.data.relatorio.id_relatorio;

    const semAuth = await request(app).get(`/api/v1/relatorios/${idRelatorio}/download`);
    expect(semAuth.status).toBe(401);

    const download = await request(app)
      .get(`/api/v1/relatorios/${idRelatorio}/download`)
      .set(auth(usuarioA.token));
    expect(download.status).toBe(200);
    expect(download.headers["content-type"]).toContain("pdf");
  });
});
