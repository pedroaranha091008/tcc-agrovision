import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import sharp from "sharp";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, emailUnico, limpar } from "./_infra.js";

async function novoUsuario(prefixo) {
  const res = await request(app)
    .post("/api/v1/auth/registro")
    .send({ nome: `Teste ${prefixo}`, email: emailUnico(prefixo), senha: "senhaForte123" });
  return res.body.data.access_token;
}

/** Foto sintetica: metade de cima verde (lavoura) e metade de baixo marrom (solo exposto). */
const fotoMeioAMeio = () =>
  sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 60, g: 150, b: 50 } } })
    .composite([
      {
        input: { create: { width: 200, height: 100, channels: 3, background: { r: 140, g: 100, b: 70 } } },
        top: 100,
        left: 0,
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

describe.skipIf(!bancoDisponivel)("analise automatica do voo", () => {
  let token;
  let intruso;
  let idVoo;
  let analise;

  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    await limpar();
    token = await novoUsuario("exg");
    intruso = await novoUsuario("intruso");
    const prop = await request(app).post("/api/v1/propriedades").set(auth()).send({ nome_fazenda: "Fazenda ExG", estado: "SP", cidade: "Franca" });
    const tal = await request(app).post("/api/v1/talhoes").set(auth()).send({ id_propriedade: prop.body.data.id_propriedade, nome_talhao: "T1" });
    const voo = await request(app).post("/api/v1/voos").set(auth()).send({ id_talhao: tal.body.data.id_talhao, data_voo: "2026-10-10" });
    idVoo = voo.body.data.id_voo;
  });

  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  it("pede imagens antes de analisar", async () => {
    const res = await request(app).post(`/api/v1/voos/${idVoo}/analisar`).set(auth());
    expect(res.status).toBe(422);
  });

  it("analisa as imagens, calcula a area afetada e conclui o voo", async () => {
    await request(app).post(`/api/v1/voos/${idVoo}/imagens`).set(auth()).attach("imagens", await fotoMeioAMeio(), { filename: "voo.jpg", contentType: "image/jpeg" });
    expect((await prisma.voo.findUnique({ where: { id_voo: idVoo } })).status_processamento).toBe("pendente");

    const res = await request(app).post(`/api/v1/voos/${idVoo}/analisar`).set(auth());
    expect(res.status).toBe(201);
    analise = res.body.data;
    expect(analise.origem).toBe("automatica");
    expect(analise.tipo_analise).toBe("RGB");
    expect(analise.status).toBe("concluido");
    // metade solo exposto -> ~50% afetada
    expect(Number(analise.percentual_area_afetada)).toBeGreaterThan(40);
    expect(Number(analise.percentual_area_afetada)).toBeLessThan(60);
    expect(["alto", "critico"]).toContain(analise.nivel_risco);
    expect(analise.resultado).toMatch(/Confirme sempre em campo/);
    expect(analise.detalhes.por_imagem).toHaveLength(1);

    expect((await prisma.voo.findUnique({ where: { id_voo: idVoo } })).status_processamento).toBe("concluido");
  });

  it("entrega o mapa colorido so para o dono", async () => {
    const mapa = await request(app).get(`/api/v1/analises/${analise.id_analise}/mapas/0`).set(auth());
    expect(mapa.status).toBe(200);
    expect(mapa.headers["content-type"]).toMatch(/image\/png/);
    expect((await sharp(mapa.body).metadata()).format).toBe("png");

    expect((await request(app).get(`/api/v1/analises/${analise.id_analise}/mapas/1`).set(auth())).status).toBe(404);
    expect((await request(app).get(`/api/v1/analises/${analise.id_analise}/mapas/0`).set("Authorization", `Bearer ${intruso}`)).status).toBe(404);
    expect((await request(app).post(`/api/v1/voos/${idVoo}/analisar`).set("Authorization", `Bearer ${intruso}`)).status).toBe(404);
  });

  it("envios em paralelo (como o site faz) nao travam e o voo volta a pendente", async () => {
    const envios = await Promise.all(
      [1, 2, 3, 4].map(async (n) =>
        request(app).post(`/api/v1/voos/${idVoo}/imagens`).set(auth()).attach("imagens", await fotoMeioAMeio(), { filename: `foto-${n}.jpg`, contentType: "image/jpeg" }),
      ),
    );
    expect(envios.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    expect((await prisma.voo.findUnique({ where: { id_voo: idVoo } })).status_processamento).toBe("pendente");
  });

  it("a analise automatica gera relatorio como as manuais", async () => {
    const res = await request(app).post("/api/v1/relatorios").set(auth()).send({ id_analise: analise.id_analise });
    expect([200, 201]).toContain(res.status);
  });
});
