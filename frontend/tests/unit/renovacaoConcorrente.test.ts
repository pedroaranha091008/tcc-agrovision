import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Regressao: duas renovacoes de sessao ao mesmo tempo (StrictMode ao abrir a
 * pagina, ou varias requisicoes recebendo 401 quando o access token vence)
 * mandavam o MESMO refresh token duas vezes. O backend rotaciona o token na
 * primeira; a segunda recebe 401 e, se essa resposta chegasse antes da primeira
 * gravar o token novo, a sessao era apagada e o usuario caia no login.
 */
describe("renovação de sessão concorrente", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function carregarComServidorFalso() {
    vi.stubEnv("VITE_API_MOCK", "false");
    vi.resetModules();

    let refreshValido = "T0";
    const chamadas: string[] = [];
    // Servidor falso: a rotacao bem-sucedida demora; um token ja trocado
    // recebe 401 rapido (a corrida que derrubava a sessao).
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      if (!url.endsWith("/auth/refresh")) return new Response(null, { status: 404 });
      const { refresh_token } = JSON.parse(String(init.body));
      chamadas.push(refresh_token);
      if (refresh_token !== refreshValido) {
        return new Response(JSON.stringify({ error: { code: "NAO_AUTENTICADO", message: "Sessao invalida" } }), { status: 401 });
      }
      refreshValido = "T1"; // rotacionou no servidor...
      await new Promise((r) => setTimeout(r, 30)); // ...mas a resposta ainda vai demorar
      return new Response(JSON.stringify({ data: { access_token: "A1", refresh_token: "T1", usuario: { id_usuario: "u1" } } }), { status: 200 });
    }));

    const { session } = await import("@/services/session");
    const auth = await import("@/services/auth");
    localStorage.setItem("agrovision.refresh_token", "T0");
    return { session, auth, chamadas };
  }

  it("várias renovações simultâneas viram uma só e a sessão continua", async () => {
    const { session, auth, chamadas } = await carregarComServidorFalso();
    const limpou = vi.fn();
    session.aoLimpar(limpou);

    const resultados = await Promise.all([auth.renovarSessao(), auth.renovarSessao(), auth.renovarSessao()]);

    expect(resultados).toEqual([true, true, true]);
    expect(chamadas).toEqual(["T0"]); // uma única chamada ao servidor
    expect(session.getRefreshToken()).toBe("T1");
    expect(session.getAccessToken()).toBe("A1");
    expect(limpou).not.toHaveBeenCalled();
  });

  it("depois que a renovação termina, uma nova pode acontecer", async () => {
    const { auth, chamadas } = await carregarComServidorFalso();
    await auth.renovarSessao();
    await auth.renovarSessao();
    expect(chamadas).toEqual(["T0", "T1"]);
  });
});
