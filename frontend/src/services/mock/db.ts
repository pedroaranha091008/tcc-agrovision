import type { Usuario } from "@/types/api";

/**
 * "Banco" em memoria do modo mock (VITE_API_MOCK=true).
 * Usuarios sao persistidos em localStorage para sobreviver ao reload;
 * tokens ficam so em memoria.
 */

const CHAVE_USUARIOS = "agrovision.mock.usuarios";

interface RegistroUsuario extends Usuario {
  senha: string | null;
  google_sub: string | null;
}

function carregar(): RegistroUsuario[] {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIOS);
    return bruto ? (JSON.parse(bruto) as RegistroUsuario[]) : [];
  } catch {
    return [];
  }
}

function salvar(lista: RegistroUsuario[]) {
  try {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
  } catch {
    /* ignore */
  }
}

export const mockDb = {
  usuarios: carregar(),
  refreshTokens: new Map<string, string>(), // refreshToken -> id_usuario
  accessTokens: new Map<string, string>(), // accessToken -> id_usuario

  persistir() {
    salvar(this.usuarios);
  },

  acharPorEmail(email: string) {
    return this.usuarios.find((u) => u.email === email.toLowerCase());
  },

  acharPorId(id: string) {
    return this.usuarios.find((u) => u.id_usuario === id);
  },

  criarUsuario(dados: {
    nome: string;
    email: string;
    senha: string | null;
    telefone?: string | null;
    provedor_auth: "local" | "google";
    google_sub?: string | null;
    email_verificado?: boolean;
  }): RegistroUsuario {
    const agora = new Date().toISOString();
    const registro: RegistroUsuario = {
      id_usuario: crypto.randomUUID(),
      nome: dados.nome,
      email: dados.email.toLowerCase(),
      telefone: dados.telefone ?? null,
      provedor_auth: dados.provedor_auth,
      email_verificado: dados.email_verificado ?? false,
      criado_em: agora,
      atualizado_em: agora,
      senha: dados.senha,
      google_sub: dados.google_sub ?? null,
    };
    this.usuarios.push(registro);
    this.persistir();
    return registro;
  },
};

export function paraUsuarioPublico(r: RegistroUsuario): Usuario {
  const { senha: _s, google_sub: _g, ...pub } = r;
  return pub;
}

export type { RegistroUsuario };
