import type { NivelRisco, StatusTalhao, TipoAnalise } from "./types";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MS", "MT", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function formatarArea(hectares: number | null | undefined) {
  if (hectares === null || hectares === undefined) return "—";
  return `${hectares.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha`;
}

/** Datas "só dia" (ex.: data do voo) são gravadas à meia-noite UTC; exibimos em UTC para não voltar um dia. */
export function formatarData(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Converte ISO para o valor de um <input type="date">. */
export function paraInputData(iso: string | null | undefined) {
  return iso ? iso.slice(0, 10) : "";
}

export function hojeInputData() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const STATUS_TALHAO: Record<StatusTalhao, { label: string; classe: string }> = {
  ativo: { label: "Ativo", classe: "bg-green-100 text-green-800" },
  em_analise: { label: "Em análise", classe: "bg-yellow-100 text-yellow-800" },
  inativo: { label: "Inativo", classe: "bg-gray-100 text-gray-700" },
};

/** Converte texto de input numérico (aceita vírgula) em number, ou null se vazio. */
export function numeroOuNulo(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (!limpo) return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : NaN;
}

export function formatarBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const TIPOS_ANALISE: Record<TipoAnalise, string> = {
  NDVI: "NDVI",
  RGB: "Índice de verde (RGB)",
  termico: "Térmica",
  multispectral: "Multiespectral",
  outro: "Outra",
};

export const NIVEIS_RISCO: Record<NivelRisco, string> = {
  baixo: "Risco baixo",
  medio: "Atenção",
  alto: "Risco alto",
  critico: "Crítico",
};
