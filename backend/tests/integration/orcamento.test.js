import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { bancoDisponivel, limpar } from "./_infra.js";

describe.skipIf(!bancoDisponivel)("solicitacao de orcamento (formulario do site)", () => {
  beforeAll(limpar);
  afterAll(async () => {
    await limpar();
    await prisma.$disconnect();
  });

  const valido = {
    nome: "Maria da Conceição",
    email: "Maria@Fazenda.com.br",
    telefone: "(16) 99999-0000",
    cidade: "Ribeirão Preto, SP",
    cultura: "Cana-de-açúcar",
    area_hectares: 120.5,
    servico: "Falhas de plantio",
    mensagem: "Gostaria de um voo em novembro.",
  };

  it("nao exige login e grava a solicitacao no banco", async () => {
    const res = await request(app).post("/api/v1/orcamentos").send(valido);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("novo");

    const salvo = await prisma.solicitacaoOrcamento.findUnique({ where: { id_solicitacao: res.body.data.id_solicitacao } });
    expect(salvo.nome).toBe("Maria da Conceição");
    expect(salvo.email).toBe("maria@fazenda.com.br");
    expect(salvo.cultura).toBe("Cana-de-açúcar");
    expect(Number(salvo.area_hectares)).toBe(120.5);
  });

  it("devolve so o necessario (nao ecoa os dados pessoais)", async () => {
    const res = await request(app).post("/api/v1/orcamentos").send(valido);
    expect(Object.keys(res.body.data).sort()).toEqual(["criado_em", "id_solicitacao", "status"]);
  });

  it("recusa dados invalidos dizendo quais campos", async () => {
    const res = await request(app)
      .post("/api/v1/orcamentos")
      .send({ ...valido, email: "x@y", telefone: "abc", area_hectares: -5, cultura: "Banana" });
    expect(res.status).toBe(422);
    const campos = res.body.error.details.map((d) => d.campo).sort();
    expect(campos).toEqual(["area_hectares", "cultura", "email", "telefone"]);
  });

  it("mensagem e opcional", async () => {
    const { mensagem: _sem, ...semMensagem } = valido;
    const res = await request(app).post("/api/v1/orcamentos").send(semMensagem);
    expect(res.status).toBe(201);
  });
});
