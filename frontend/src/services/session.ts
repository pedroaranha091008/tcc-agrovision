/**
 * Guarda da sessao no cliente.
 * - access token: apenas em memoria (nao persiste; some ao recarregar).
 * - refresh token: em localStorage, para restaurar a sessao apos reload.
 *   E o unico dado sensivel persistido, e serve so para trocar por um novo
 *   access token contra o backend.
 */

const CHAVE_REFRESH = "agrovision.refresh_token";

let accessToken: string | null = null;

export const session = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(CHAVE_REFRESH);
    } catch {
      return null;
    }
  },

  definir(access: string, refresh: string) {
    accessToken = access;
    try {
      localStorage.setItem(CHAVE_REFRESH, refresh);
    } catch {
      /* modo privado / storage indisponivel: sessao vive so nesta aba */
    }
  },

  atualizarAccess(access: string) {
    accessToken = access;
  },

  limpar() {
    accessToken = null;
    try {
      localStorage.removeItem(CHAVE_REFRESH);
    } catch {
      /* ignore */
    }
  },

  temSessaoPersistida(): boolean {
    return Boolean(this.getRefreshToken());
  },
};
