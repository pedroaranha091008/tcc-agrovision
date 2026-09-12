import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AtualizarPerfilPayload,
  LoginPayload,
  RegistroPayload,
  Usuario,
} from "@/types/api";
import * as authService from "@/services/auth";
import { session } from "@/services/session";

interface AuthContextValue {
  usuario: Usuario | null;
  /** true durante a restauracao inicial da sessao */
  carregando: boolean;
  autenticado: boolean;
  login: (p: LoginPayload) => Promise<void>;
  registrar: (p: RegistroPayload) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  atualizarPerfil: (p: AtualizarPerfilPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!session.temSessaoPersistida()) {
        setCarregando(false);
        return;
      }
      const ok = await authService.renovarSessao();
      if (ok) {
        try {
          setUsuario(await authService.obterPerfil(controller.signal));
        } catch {
          session.limpar();
        }
      }
      setCarregando(false);
    })();
    return () => controller.abort();
  }, []);

  // session.limpar() pode ser chamado bem longe daqui (ex.: dentro de
  // http.ts, quando uma renovacao automatica de sessao falha no meio de uma
  // requisicao qualquer). Sem essa assinatura, esse "usuario" do contexto
  // nunca ficava sabendo que a sessao caiu: a UI continuava se mostrando
  // autenticada, RequireAuth nunca redirecionava para /login, e toda
  // chamada seguinte repetia o mesmo erro de sessao expirada.
  useEffect(() => session.aoLimpar(() => setUsuario(null)), []);

  const login = useCallback(async (p: LoginPayload) => {
    setUsuario(await authService.login(p));
  }, []);

  const registrar = useCallback(async (p: RegistroPayload) => {
    setUsuario(await authService.registrar(p));
  }, []);

  const loginGoogle = useCallback(async (idToken: string) => {
    setUsuario(await authService.loginGoogle(idToken));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUsuario(null);
  }, []);

  const atualizarPerfil = useCallback(async (p: AtualizarPerfilPayload) => {
    setUsuario(await authService.atualizarPerfil(p));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      carregando,
      autenticado: Boolean(usuario),
      login,
      registrar,
      loginGoogle,
      logout,
      atualizarPerfil,
    }),
    [usuario, carregando, login, registrar, loginGoogle, logout, atualizarPerfil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
