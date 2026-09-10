import { describe, expect, it } from "vitest";
import { conferirSenha, gerarHashSenha } from "../../src/utils/hash.js";

describe("hash de senha", () => {
  it("gera hash diferente da senha original", async () => {
    const hash = await gerarHashSenha("segredo123");
    expect(hash).not.toBe("segredo123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("confere a senha correta", async () => {
    const hash = await gerarHashSenha("segredo123");
    expect(await conferirSenha("segredo123", hash)).toBe(true);
  });

  it("rejeita senha incorreta", async () => {
    const hash = await gerarHashSenha("segredo123");
    expect(await conferirSenha("errada", hash)).toBe(false);
  });

  it("retorna false quando o hash e nulo", async () => {
    expect(await conferirSenha("qualquer", null)).toBe(false);
  });
});
