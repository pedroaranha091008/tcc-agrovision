import type { NivelRisco, StatusTalhao, TipoAnalise } from "./dominio";

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
  RGB: "Índice de verde (RGB)",
  termico: "Térmica",
  multispectral: "Multiespectral",
  outro: "Outra",
};

/** Painel da Visao Geral (GET /dashboard/painel). */
export interface ResumoAnaliseTalhao {
  id_analise: string;
  id_voo: string;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  tipo_analise: TipoAnalise;
  data_voo: string;
}

export interface Painel {
  periodo_dias: number;
  totais: {
    propriedades: number;
    talhoes: number;
    area_monitorada_hectares: number;
    voos: number;
    voos_periodo: number;
    imagens: number;
    analises_periodo: number;
    areas_criticas: number;
  };
  risco_talhoes: Record<NivelRisco | "sem_analise", number>;
  talhoes: Array<{
    id_talhao: string;
    nome_talhao: string;
    cultura: string | null;
    area_hectares: number | null;
    status: StatusTalhao;
    propriedade: { id_propriedade: string; nome_fazenda: string };
    total_voos: number;
    ultima_analise: ResumoAnaliseTalhao | null;
  }>;
  serie_mensal: Array<{ mes: string; voos: number; area_afetada_media: number | null }>;
  ultimas_analises: Array<
    ResumoAnaliseTalhao & { data_analise: string; talhao: string; id_talhao: string; propriedade: string }
  >;
}
