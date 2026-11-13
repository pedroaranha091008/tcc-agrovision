import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

describe.skipIf(!bancoDisponivel)("painel da visao geral e resumos das listas", () => {
  let token;
  let idProp;
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const post = (url, body) => request(app).post(`/api/v1${url}`).set(auth()).send(body);

  beforeAll(async () => {
    await limpar();
    const reg = await request(app)
      .post("/api/v1/auth/registro")
      .send({ nome: "Painel Teste", email: emailUnico("painel"), senha: "senhaForte123" });
    token = reg.body.data.access_token;

    const prop = await post("/propriedades", { nome_fazenda: "Fazenda Painel", estado: "SP", cidade: "Franca", area_total_hectares: 300 });
    idProp = prop.body.data.id_propriedade;
    const norte = await post("/talhoes", { id_propriedade: idProp, nome_talhao: "Norte", area_hectares: 100 });
    const sul = await post("/talhoes", { id_propriedade: idProp, nome_talhao: "Sul", area_hectares: 50 });
    await post("/talhoes", { id_propriedade: idProp, nome_talhao: "Leste", area_hectares: 30 });

    const hoje = new Date().toISOString().slice(0, 10);
    const vooAntigo = await post("/voos", { id_talhao: norte.body.data.id_talhao, data_voo: "2026-01-10" });
    const vooNovo = await post("/voos", { id_talhao: norte.body.data.id_talhao, data_voo: hoje });
    const vooSul = await post("/voos", { id_talhao: sul.body.data.id_talhao, data_voo: hoje });
    // O talhao Norte piorou: a situacao atual e a do voo mais recente (critico), nao a do antigo (baixo).
    await post("/analises", { id_voo: vooAntigo.body.data.id_voo, tipo_analise: "NDVI", nivel_risco: "baixo", percentual_area_afetada: 5 });
    await post("/analises", { id_voo: vooNovo.body.data.id_voo, tipo_analise: "NDVI", nivel_risco: "critico", percentual_area_afetada: 60 });
    await post("/analises", { id_voo: vooSul.body.data.id_voo, tipo_analise: "termico", nivel_risco: "medio", percentual_area_afetada: 20 });
  });

  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  it("mostra a situacao de cada talhao pela analise do voo mais recente, piores primeiro", async () => {
    const res = await request(app).get("/api/v1/dashboard/painel").set(auth());
    expect(res.status).toBe(200);
    const p = res.body.data;
    expect(p.talhoes.map((t) => [t.nome_talhao, t.ultima_analise?.nivel_risco ?? null])).toEqual([
      ["Norte", "critico"],
      ["Sul", "medio"],
      ["Leste", null],
    ]);
    expect(p.risco_talhoes).toEqual({ baixo: 0, medio: 1, alto: 0, critico: 1, sem_analise: 1 });
    expect(p.totais).toMatchObject({ propriedades: 1, talhoes: 3, area_monitorada_hectares: 180, voos: 3, areas_criticas: 1 });
    expect(p.serie_mensal).toHaveLength(6);
    expect(p.ultimas_analises.length).toBeGreaterThanOrEqual(2);
  });

  it("as listas trazem as contagens usadas nos cartoes", async () => {
    const props = await request(app).get("/api/v1/propriedades").set(auth());
    expect(props.body.data[0]).toMatchObject({ total_talhoes: 3, area_talhoes_hectares: 180 });

    const talhoes = await request(app).get(`/api/v1/talhoes?id_propriedade=${idProp}`).set(auth());
    const norte = talhoes.body.data.find((t) => t.nome_talhao === "Norte");
    expect(norte.total_voos).toBe(2);
    expect(norte.ultimo_voo).toBeTruthy();

    const voos = await request(app).get(`/api/v1/voos?id_talhao=${norte.id_talhao}`).set(auth());
    expect(voos.body.data[0]).toMatchObject({ total_imagens: 0, total_analises: 1 });
  });

  it("a analise vem com a recomendacao por regras", async () => {
    const res = await request(app).get("/api/v1/analises?nivel_risco=critico").set(auth());
    const rec = res.body.data[0].recomendacao;
    expect(rec.titulo).toBe("Ação imediata");
    expect(rec.acoes.length).toBeGreaterThan(2);
  });
});
