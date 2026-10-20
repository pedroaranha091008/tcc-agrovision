import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api, renovarSessao, sessao, type RespostaSessao } from "./api";
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

// O token de acesso vale 15 minutos; renovamos antes disso para o usuário nunca ver a sessão cair.
const INTERVALO_RENOVACAO_MS = 12 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => sessao.provavelmenteAtiva());
  const [saiu, setSaiu] = useState(false);

  // Ao abrir/recarregar a página, recupera a sessão pelo cookie httpOnly.
  useEffect(() => {
    if (!sessao.provavelmenteAtiva()) return;
    renovarSessao<Usuario>()
      .then(r => setUsuario(r?.usuario ?? null))
      .finally(() => setCarregando(false));
  }, []);

  // Se uma renovação falhar no meio do uso, volta para o login avisando o motivo.
  useEffect(() => {
    sessao.aoExpirar(() => {
      setUsuario(atual => {
        if (atual) toast.info("Sua sessão expirou", { description: "Entre novamente para continuar." });
        return null;
      });
    });
    return () => sessao.aoExpirar(null);
  }, []);

  const logado = usuario !== null;
  useEffect(() => {
    if (!logado) return;
    const timer = setInterval(async () => {
      const r = await renovarSessao<Usuario>();
      if (r === null && !sessao.token()) setUsuario(null);
    }, INTERVALO_RENOVACAO_MS);
    return () => clearInterval(timer);
  }, [logado]);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    const { token, usuario } = await api<RespostaSessao<Usuario>>("/auth/login", { method: "POST", body: { email, senha, lembrar }, publico: true });
    sessao.iniciar(token);
    setSaiu(false);
    setUsuario(usuario);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro) => {
    const { token, usuario } = await api<RespostaSessao<Usuario>>("/auth/cadastro", { method: "POST", body: dados, publico: true });
    sessao.iniciar(token);
    setSaiu(false);
    setUsuario(usuario);
  }, []);

  const sair = useCallback(() => {
    // Encerra a sessão no servidor (revoga o cookie); a tela já volta para a home sem esperar.
    api("/auth/sair", { method: "POST", publico: true }).catch(() => {});
    sessao.limpar();
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
