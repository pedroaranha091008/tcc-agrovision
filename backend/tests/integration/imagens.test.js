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

const jpegValido = () =>
  sharp({ create: { width: 300, height: 200, channels: 3, background: { r: 40, g: 140, b: 40 } } }).jpeg().toBuffer();

describe.skipIf(!bancoDisponivel)("imagens do voo", () => {
  let token;
  let intruso;
  let idVoo;
  let idImagem;

  beforeAll(async () => {
    await limpar();
    token = await novoUsuario("img");
    intruso = await novoUsuario("intruso");
    const auth = { Authorization: `Bearer ${token}` };
    const prop = await request(app).post("/api/v1/propriedades").set(auth).send({ nome_fazenda: "Fazenda Img", estado: "SP", cidade: "Franca" });
    const tal = await request(app).post("/api/v1/talhoes").set(auth).send({ id_propriedade: prop.body.data.id_propriedade, nome_talhao: "T1" });
    const voo = await request(app).post("/api/v1/voos").set(auth).send({ id_talhao: tal.body.data.id_talhao, data_voo: "2026-10-10" });
    idVoo = voo.body.data.id_voo;
  });

  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  it("aceita uma imagem de verdade", async () => {
    const res = await request(app)
      .post(`/api/v1/voos/${idVoo}/imagens`)
      .set("Authorization", `Bearer ${token}`)
      .attach("imagens", await jpegValido(), { filename: "talhão-norte.jpg", contentType: "image/jpeg" });
    expect(res.status).toBe(201);
    idImagem = res.body.data[0].id_imagem;
  });

  it("recusa arquivo com extensao .jpg mas que nao e imagem (e nao grava nada)", async () => {
    const antes = await prisma.imagemVoo.count({ where: { id_voo: idVoo } });
    const res = await request(app)
      .post(`/api/v1/voos/${idVoo}/imagens`)
      .set("Authorization", `Bearer ${token}`)
      .attach("imagens", Buffer.from("isto nao e uma imagem"), { filename: "disfarcada.jpg", contentType: "image/jpeg" });
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].campo).toBe("disfarcada.jpg");
    expect(await prisma.imagemVoo.count({ where: { id_voo: idVoo } })).toBe(antes);
  });

  it("recusa tipo nao permitido", async () => {
    const res = await request(app)
      .post(`/api/v1/voos/${idVoo}/imagens`)
      .set("Authorization", `Bearer ${token}`)
      .attach("imagens", Buffer.from("texto"), { filename: "notas.txt", contentType: "text/plain" });
    expect(res.status).toBe(415);
  });

  it("devolve o arquivo e uma miniatura JPEG so para o dono", async () => {
    const original = await request(app).get(`/api/v1/voos/${idVoo}/imagens/${idImagem}/arquivo`).set("Authorization", `Bearer ${token}`);
    expect(original.status).toBe(200);
    expect(original.headers["content-type"]).toMatch(/image\/jpeg/);

    const mini = await request(app).get(`/api/v1/voos/${idVoo}/imagens/${idImagem}/arquivo?miniatura=1`).set("Authorization", `Bearer ${token}`);
    expect(mini.status).toBe(200);
    expect(mini.headers["content-type"]).toMatch(/image\/jpeg/);
    const meta = await sharp(mini.body).metadata();
    expect(meta.width).toBeLessThanOrEqual(480);

    expect((await request(app).get(`/api/v1/voos/${idVoo}/imagens/${idImagem}/arquivo`)).status).toBe(401);
    const alheio = await request(app).get(`/api/v1/voos/${idVoo}/imagens/${idImagem}/arquivo`).set("Authorization", `Bearer ${intruso}`);
    expect([403, 404]).toContain(alheio.status);
  });

  it("excluir a imagem remove tambem o acesso ao arquivo", async () => {
    const del = await request(app).delete(`/api/v1/voos/${idVoo}/imagens/${idImagem}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
    const depois = await request(app).get(`/api/v1/voos/${idVoo}/imagens/${idImagem}/arquivo?miniatura=1`).set("Authorization", `Bearer ${token}`);
    expect(depois.status).toBe(404);
  });
});
