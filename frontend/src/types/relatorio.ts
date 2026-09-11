import type { NivelRisco, StatusProcessamento, TipoAnalise } from "./dominio";

export interface RelatorioAnaliseContexto {
  id_analise: string;
  tipo_analise: TipoAnalise;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  status: StatusProcessamento;
  voo: {
    id_voo: string;
    data_voo: string;
    talhao: {
      id_talhao: string;
      nome_talhao: string;
      propriedade: { id_propriedade: string; nome_fazenda: string; cidade: string; estado: string };
    };
  };
}

export interface Relatorio {
  id_relatorio: string;
  id_analise: string;
  versao_regras: string;
  recomendacao: string;
  gerado_em: string;
  analise?: RelatorioAnaliseContexto;
}

export interface RecomendacaoGerada {
  versao: string;
  baseada_em_regras: true;
  texto: string;
}

export interface GerarRelatorioResposta {
  relatorio: Relatorio;
  recomendacao: RecomendacaoGerada;
}
