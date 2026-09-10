/** Tipos do dominio agricola, espelhando o schema do backend (snake_case). */

export type StatusTalhao = "ativo" | "inativo" | "em_analise";
export type StatusProcessamento = "pendente" | "em_processamento" | "concluido" | "falhou";
export type TipoAnalise = "NDVI" | "RGB" | "termico" | "multispectral" | "outro";
export type NivelRisco = "baixo" | "medio" | "alto" | "critico";

export interface Propriedade {
  id_propriedade: string;
  id_usuario: string;
  nome_fazenda: string;
  estado: string;
  cidade: string;
  area_total_hectares: number | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Talhao {
  id_talhao: string;
  id_propriedade: string;
  nome_talhao: string;
  cultura: string | null;
  area_hectares: number | null;
  latitude: number | null;
  longitude: number | null;
  geojson: unknown | null;
  status: StatusTalhao;
  criado_em: string;
  atualizado_em: string;
}

export interface Voo {
  id_voo: string;
  id_talhao: string;
  data_voo: string;
  altitude_metros: number | null;
  modelo_drone: string | null;
  operador: string | null;
  observacoes: string | null;
  status_processamento: StatusProcessamento;
  criado_em: string;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface PropriedadePayload {
  nome_fazenda: string;
  estado: string;
  cidade: string;
  area_total_hectares?: number | null;
}

export interface TalhaoPayload {
  id_propriedade: string;
  nome_talhao: string;
  cultura?: string | null;
  area_hectares?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: StatusTalhao;
}

export interface VooPayload {
  id_talhao: string;
  data_voo: string;
  altitude_metros?: number | null;
  modelo_drone?: string | null;
  operador?: string | null;
  observacoes?: string | null;
}

export interface ListaQuery {
  pagina?: number;
  por_pagina?: number;
  ordenar_por?: string;
  ordem?: "asc" | "desc";
  [extra: string]: string | number | undefined;
}
