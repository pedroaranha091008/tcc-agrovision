import { describe, expect, it } from "vitest";
import {
  expiracaoRefresh,
  gerarAccessToken,
  gerarRefreshToken,
  hashRefreshToken,
  verificarAccessToken,
} from "../../src/utils/tokens.js";

const usuario = { id_usuario: "u-1", email: "a@b.com", nome: "Fulano" };

describe("tokens", () => {
  it("gera e verifica access token com o subject correto", () => {
    const token = gerarAccessToken(usuario);
    const payload = verificarAccessToken(token);
    expect(payload.sub).toBe("u-1");
    expect(payload.email).toBe("a@b.com");
  });

  it("lanca erro para access token invalido", () => {
    expect(() => verificarAccessToken("token.invalido.aqui")).toThrow();
  });

  it("gera refresh tokens unicos e opacos", () => {
    const a = gerarRefreshToken();
    const b = gerarRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(40);
  });

  it("hash do refresh token e deterministico e nao reversivel", () => {
    const token = gerarRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    expect(hashRefreshToken(token)).not.toContain(token);
    expect(hashRefreshToken(token)).toHaveLength(64);
  });

  it("expiracao do refresh fica no futuro", () => {
    expect(expiracaoRefresh().getTime()).toBeGreaterThan(Date.now());
  });
});
