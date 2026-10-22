import { describe, expect, it } from "vitest";
import { resumir, textoResultado } from "../../src/utils/indiceVerde.js";

const img = (saudavel, atencao, critico) => ({ saudavel, atencao, critico });

describe("indice de verde (ExG)", () => {
  it("area afetada = pouca vegetacao + metade da atencao, com faixas de risco", () => {
    expect(resumir([img(90, 10, 0)])).toMatchObject({ afetada: 5, nivel: "baixo" });
    expect(resumir([img(70, 20, 10)])).toMatchObject({ afetada: 20, nivel: "medio" });
    expect(resumir([img(50, 20, 30)])).toMatchObject({ afetada: 40, nivel: "alto" });
    expect(resumir([img(20, 20, 60)])).toMatchObject({ afetada: 70, nivel: "critico" });
  });

  it("faz a media entre as imagens do voo", () => {
    expect(resumir([img(100, 0, 0), img(40, 0, 60)])).toMatchObject({ saudavel: 70, critico: 30, afetada: 30, nivel: "alto" });
  });

  it("o texto avisa que nao identifica pragas e pede confirmacao em campo", () => {
    const texto = textoResultado(resumir([img(70, 20, 10)]), 2);
    expect(texto).toMatch(/2 imagem\(ns\)/);
    expect(texto).toMatch(/20%/);
    expect(texto).toMatch(/não identifica pragas/);
  });
});
