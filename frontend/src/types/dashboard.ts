import type { TipoAnalise } from "./dominio";

export interface DistribuicaoRisco {
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
  sem_classificacao: number;
}

export interface DistribuicaoTipo {
  tipo_analise: TipoAnalise;
  total: number;
}

export interface Indicadores {
  total_propriedades: number;
  total_talhoes: number;
  total_voos: number;
  total_analises: number;
  area_monitorada_hectares: number;
  problemas_detectados: number;
  distribuicao_risco: DistribuicaoRisco;
  distribuicao_tipo: DistribuicaoTipo[];
}

export interface PontoSerie {
  mes: string; // "YYYY-MM"
  voos: number;
  analises: number;
}

export interface DashboardResumo {
  indicadores: Indicadores;
  series: PontoSerie[];
}

export interface DashboardFiltros {
  id_propriedade?: string;
  data_inicio?: string;
  data_fim?: string;
  [extra: string]: string | undefined;
}

export const RISCO_LABEL: Record<keyof DistribuicaoRisco, string> = {
  baixo: "Saudável",
  medio: "Atenção",
  alto: "Alto risco",
  critico: "Crítico",
  sem_classificacao: "Sem classificação",
};

export const RISCO_COR: Record<keyof DistribuicaoRisco, string> = {
  baixo: "#66BB6A",
  medio: "#FFC107",
  alto: "#FB923C",
  critico: "#ef4444",
  sem_classificacao: "#9CA3AF",
};

export const TIPO_LABEL: Record<TipoAnalise, string> = {
  NDVI: "NDVI",
  RGB: "RGB",
  termico: "Térmico",
  multispectral: "Multiespectral",
  outro: "Outro",
};
