import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError, tokenStorage } from "./api";
import type { TipoUsuario } from "./site";

export type Usuario = {
  id_usuario: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo_usuario: TipoUsuario;
  data_criacao: string;
};

type DadosCadastro = { nome: string; email: string; senha: string; tipo_usuario: TipoUsuario };

type AuthContexto = {
  usuario: Usuario | null;
  carregando: boolean;
  /** true depois de "Sair": a rota protegida leva para a home em vez do login. */
  saiu: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => void;
  atualizarUsuario: (usuario: Usuario) => void;
};

const Contexto = createContext<AuthContexto | null>(null);

type RespostaAuth = { token: string; usuario: Usuario };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => tokenStorage.get() !== null);
  const [saiu, setSaiu] = useState(false);

  // Restaura a sessão salva ao abrir/recarregar a página.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    api<Usuario>("/auth/me")
      .then(setUsuario)
      .catch((erro: unknown) => {
        if (erro instanceof ApiError && erro.status === 401) tokenStorage.clear();
      })
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    const { token, usuario } = await api<RespostaAuth>("/auth/login", { method: "POST", body: { email, senha }, token: null });
    tokenStorage.set(token, lembrar);
    setSaiu(false);
    setUsuario(usuario);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro) => {
    const { token, usuario } = await api<RespostaAuth>("/auth/cadastro", { method: "POST", body: dados, token: null });
    tokenStorage.set(token, false);
    setSaiu(false);
    setUsuario(usuario);
  }, []);

  const sair = useCallback(() => {
    tokenStorage.clear();
    setSaiu(true);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, saiu, entrar, cadastrar, sair, atualizarUsuario: setUsuario }),
    [usuario, carregando, saiu, entrar, cadastrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
