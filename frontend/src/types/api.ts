/**
 * Tipos do contrato da API do backend AgroVision.
 * Envelopes: sucesso `{ data, meta? }`; erro `{ error: { code, message, details? } }`.
 * Campos em snake_case/portugues, iguais ao schema Prisma.
 */

export interface ApiEnvelope<T> {
  data: T;
  meta?: PaginacaoMeta;
}

export interface PaginacaoMeta {
  pagina: number;
  por_pagina: number;
  total: number;
  total_paginas: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ProvedorAuth = "local" | "google";

export interface Usuario {
  id_usuario: string;
  nome: string;
  email: string;
  telefone: string | null;
  provedor_auth: ProvedorAuth;
  email_verificado: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface SessaoResposta {
  usuario: Usuario;
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
}

export interface RegistroPayload {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AtualizarPerfilPayload {
  nome?: string;
  telefone?: string | null;
  senha?: string;
}
