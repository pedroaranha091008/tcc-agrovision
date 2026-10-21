import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

/**
 * Regressao: ao abrir a pagina com sessao salva, o AuthContext restaura a
 * sessao e carrega o perfil. Em StrictMode o efeito monta, desmonta e monta de
 * novo; a desmontagem cancela (abort) o carregamento do perfil da 1a montagem.
 * Esse cancelamento caia no catch e chamava session.limpar(), apagando a sessao
 * que a 2a montagem acabara de restaurar: as telas seguintes iam sem token e o
 * usuario via "Sua sessao expirou".
 */
describe("restaurar sessão ao abrir a página (StrictMode)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("não apaga a sessão quando o carregamento cancelado da 1ª montagem falha", async () => {
    vi.stubEnv("VITE_API_MOCK", "false");
    vi.resetModules();

    // Servidor falso que respeita o AbortSignal, como o fetch real.
    vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit) => new Promise<Response>((resolve, reject) => {
      const responder = () => {
        if (url.endsWith("/auth/refresh")) {
          resolve(new Response(JSON.stringify({ data: { access_token: "A1", refresh_token: "T1", usuario: { id_usuario: "u1" } } })));
        } else if (url.endsWith("/usuarios/me")) {
          resolve(new Response(JSON.stringify({ data: { id_usuario: "u1", nome: "Maria Produtora", email: "m@x.com" } })));
        } else resolve(new Response(null, { status: 404 }));
      };
      if (init.signal?.aborted) return reject(new DOMException("aborted", "AbortError"));
      init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      setTimeout(responder, 10);
    })));

    localStorage.setItem("agrovision.refresh_token", "T0");
    const { AuthProvider, useAuth } = await import("@/features/auth/AuthContext");
    const { session } = await import("@/services/session");

    function QuemEsta() {
      const { usuario, carregando } = useAuth();
      return <p>{carregando ? "carregando" : usuario ? `logado: ${usuario.nome}` : "deslogado"}</p>;
    }

    render(<StrictMode><AuthProvider><QuemEsta /></AuthProvider></StrictMode>);

    expect(await screen.findByText("logado: Maria Produtora")).toBeInTheDocument();
    // Dá tempo para a promessa cancelada da 1ª montagem terminar de falhar.
    await new Promise((r) => setTimeout(r, 50));
    await waitFor(() => expect(session.getAccessToken()).toBe("A1"));
    expect(session.getRefreshToken()).toBe("T1");
    expect(screen.getByText("logado: Maria Produtora")).toBeInTheDocument();
  });
});
