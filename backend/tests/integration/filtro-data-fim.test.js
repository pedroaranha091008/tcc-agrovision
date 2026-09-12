import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

const auth = (t) => ({ Authorization: `Bearer ${t}` });

/**
 * Regressao: "data_fim" vem de um <input type="date"> (ex.: "2026-02-01"),
 * que vira meia-noite UTC ao ser parseado. Um registro feito mais tarde no
 * mesmo dia tem que continuar aparecendo no filtro "ate esse dia".
 */
describe.skipIf(!bancoDisponivel)("filtro data_fim inclui o dia inteiro", () => {
  let token;
  let idVoo;
  const hoje = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    await limpar();
    const email = emailUnico("datafim");
    const reg = await request(app)
      .post("/api/v1/auth/registro")
      .send({ nome: "Teste Data", email, senha: "senhaForte123" });
    token = reg.body.data.access_token;

    const prop = await request(app)
      .post("/api/v1/propriedades")
      .set(auth(token))
      .send({ nome_fazenda: "Fazenda Data", estado: "SP", cidade: "Campinas" });
    const talhao = await request(app)
      .post("/api/v1/talhoes")
      .set(auth(token))
      .send({ id_propriedade: prop.body.data.id_propriedade, nome_talhao: "T1" });
    const voo = await request(app)
      .post("/api/v1/voos")
      .set(auth(token))
      .send({ id_talhao: talhao.body.data.id_talhao, data_voo: hoje });
    idVoo = voo.body.data.id_voo;

    await request(app)
      .post("/api/v1/analises")
      .set(auth(token))
      .send({
        id_voo: idVoo,
        tipo_analise: "NDVI",
        nivel_risco: "baixo",
        resultado: "ok",
        status: "concluido",
      });
  });
  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  it("/monitoramentos?data_fim=hoje inclui uma analise registrada mais tarde hoje", async () => {
    const res = await request(app)
      .get(`/api/v1/monitoramentos?data_fim=${hoje}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
  });

  it("/voos?data_fim=hoje inclui o voo de hoje", async () => {
    const res = await request(app).get(`/api/v1/voos?data_fim=${hoje}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((v) => v.id_voo)).toContain(idVoo);
  });

  it("/dashboard?data_fim=hoje conta o voo e a analise de hoje", async () => {
    const res = await request(app).get(`/api/v1/dashboard?data_fim=${hoje}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.indicadores.total_voos).toBe(1);
    expect(res.body.data.indicadores.total_analises).toBe(1);
  });
});
