import type {
  AtualizarPerfilPayload,
  LoginPayload,
  RegistroPayload,
  SessaoResposta,
  Usuario,
} from "@/types/api";
import { configurarRenovacao, http } from "./http";
import { session } from "./session";

async function abrir(resp: SessaoResposta): Promise<Usuario> {
  session.definir(resp.access_token, resp.refresh_token);
  return resp.usuario;
}

export async function registrar(payload: RegistroPayload): Promise<Usuario> {
  const { data } = await http.post<SessaoResposta>("/auth/registro", payload, { auth: false });
  return abrir(data);
}

export async function login(payload: LoginPayload): Promise<Usuario> {
  const { data } = await http.post<SessaoResposta>("/auth/login", payload, { auth: false });
  return abrir(data);
}

export async function loginGoogle(idToken: string): Promise<Usuario> {
  const { data } = await http.post<SessaoResposta>(
    "/auth/google",
    { id_token: idToken },
    { auth: false },
  );
  return abrir(data);
}

export async function obterPerfil(signal?: AbortSignal): Promise<Usuario> {
  const { data } = await http.get<Usuario>("/usuarios/me", { signal });
  return data;
}

export async function atualizarPerfil(payload: AtualizarPerfilPayload): Promise<Usuario> {
  const { data } = await http.patch<Usuario>("/usuarios/me", payload);
  return data;
}

/** Pede o link de redefinição. A resposta é sempre a mesma, exista ou não a conta. */
export async function esqueciSenha(email: string): Promise<void> {
  await http.post("/auth/esqueci-senha", { email }, { auth: false });
}

/** Troca a senha usando o token do link recebido por email. */
export async function redefinirSenha(token: string, senha: string): Promise<void> {
  await http.post("/auth/redefinir-senha", { token, senha }, { auth: false });
}

export async function logout(): Promise<void> {
  const refresh = session.getRefreshToken();
  try {
    if (refresh) await http.post("/auth/logout", { refresh_token: refresh }, { auth: false });
  } finally {
    session.limpar();
  }
}

let renovacaoEmAndamento: Promise<boolean> | null = null;

/**
 * Troca o refresh token persistido por um novo par de tokens.
 * Retorna true se a sessao foi renovada.
 *
 * Chamadas simultaneas (StrictMode ao abrir a pagina, ou varias requisicoes
 * recebendo 401 quando o access token vence) compartilham a mesma renovacao.
 * Sem isso, todas mandavam o mesmo refresh token: o backend rotacionava na
 * primeira e as outras recebiam 401, derrubando a sessao do usuario.
 */
export function renovarSessao(): Promise<boolean> {
  renovacaoEmAndamento ??= executarRenovacao().finally(() => {
    renovacaoEmAndamento = null;
  });
  return renovacaoEmAndamento;
}

async function executarRenovacao(): Promise<boolean> {
  const refresh = session.getRefreshToken();
  if (!refresh) return false;
  try {
    const { data } = await http.post<SessaoResposta>(
      "/auth/refresh",
      { refresh_token: refresh },
      { auth: false },
    );
    session.definir(data.access_token, data.refresh_token);
    return true;
  } catch {
    // So limpa se o refresh token que falhou ainda for o que esta guardado.
    // Duas renovacoes concorrentes (duas abas, ou StrictMode) podem correr
    // ao mesmo tempo: a que perde nao pode apagar o token novo que a
    // vencedora acabou de gravar, ou a aba vencedora fica sem refresh token
    // na proxima vez que precisar renovar, mesmo tendo funcionado agora.
    if (session.getRefreshToken() === refresh) session.limpar();
    return false;
  }
}

// Liga o retry automatico de 401 do cliente HTTP a renovacao de sessao.
configurarRenovacao(renovarSessao);
