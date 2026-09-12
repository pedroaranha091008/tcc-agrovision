import { describe, expect, it } from "vitest";
import { ApiError, mensagemDoErro } from "@/services/erros";

describe("mensagemDoErro", () => {
  it("traduz CREDENCIAIS_INVALIDAS", () => {
    const e = new ApiError("CREDENCIAIS_INVALIDAS", "x", 401);
    expect(mensagemDoErro(e)).toBe("Email ou senha incorretos.");
  });

  it("traduz CONFLITO", () => {
    const e = new ApiError("CONFLITO", "x", 409);
    expect(mensagemDoErro(e)).toMatch(/já existe/);
  });

  it("traduz SESSAO_EXPIRADA e NAO_AUTENTICADO da mesma forma", () => {
    expect(mensagemDoErro(new ApiError("SESSAO_EXPIRADA", "x", 401))).toMatch(/sessão expirou/i);
    expect(mensagemDoErro(new ApiError("NAO_AUTENTICADO", "x", 401))).toMatch(/sessão expirou/i);
  });

  it("erro de rede usa a propria mensagem", () => {
    expect(mensagemDoErro(ApiError.rede())).toMatch(/conectar/i);
  });

  it("codigo desconhecido cai no fallback com a mensagem do servidor", () => {
    const e = new ApiError("ALGO_ESPECIFICO", "mensagem do backend", 422);
    expect(mensagemDoErro(e)).toBe("mensagem do backend");
  });

  it("erro nao-ApiError vira mensagem generica", () => {
    expect(mensagemDoErro(new Error("boom"))).toBe("Ocorreu um erro inesperado.");
  });
});
