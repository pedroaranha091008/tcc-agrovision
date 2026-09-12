import { describe, expect, it } from "vitest";
import { area, coordenadas, data, numero, paraInputDate } from "@/lib/formatar";

describe("formatar", () => {
  it("area formata numero e trata nulo", () => {
    expect(area(320.5)).toContain("320,5");
    expect(area(null)).toBe("—");
  });

  it("numero formata em pt-BR e trata nulo", () => {
    expect(numero(1234.5)).toContain(",5");
    expect(numero(undefined)).toBe("—");
  });

  it("data formata ISO para pt-BR e trata invalido/nulo", () => {
    expect(data("2026-03-15T00:00:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(data(null)).toBe("—");
    expect(data("nao-e-data")).toBe("—");
  });

  it("nao desloca o dia num fuso horario negativo (ex.: Brasil, UTC-3)", () => {
    // data_voo/filtros de data chegam como meia-noite UTC do dia escolhido
    // (de um <input type="date">); formatar em horario local do navegador
    // mostraria "14/03" para um usuario em UTC-3 escolhendo "15/03".
    expect(data("2026-03-15T00:00:00.000Z")).toBe("15/03/2026");
    // e mantem o mesmo dia mesmo com um horario mais avançado no fim do dia
    expect(data("2026-03-15T23:00:00.000Z")).toBe("15/03/2026");
  });

  it("paraInputDate extrai yyyy-mm-dd", () => {
    expect(paraInputDate("2026-03-15T12:00:00.000Z")).toBe("2026-03-15");
    expect(paraInputDate(null)).toBe("");
  });

  it("coordenadas formata par lat/long e trata ausencia", () => {
    expect(coordenadas(-21.1767, -47.8208)).toBe("-21.17670, -47.82080");
    expect(coordenadas(null, null)).toBe("—");
  });
});
