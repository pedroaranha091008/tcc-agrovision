import type { Analise } from "@/types/dominio";
import type { RecomendacaoGerada } from "@/types/relatorio";

/**
 * Espelho, no mock, do motor de recomendacoes por regras do backend
 * (src/utils/recomendacao.js) — mesma versao, mesmo tom de texto.
 * Determinístico: so depende de (tipo_analise, nivel_risco, percentual_area_afetada).
 */
export const VERSAO_REGRAS = "1.0.0";

const BASE_POR_TIPO: Record<string, string> = {
  NDVI: "Indice de vegetacao indica variacao de vigor na cultura.",
  RGB: "Inspecao visual aponta variacao de cobertura/coloracao na area.",
  termico: "Mapa termico indica variacao de temperatura foliar, possivel estresse hidrico.",
  multispectral: "Resposta espectral indica variacao de sanidade da cultura.",
  outro: "Analise registrada sem categoria espectral especifica.",
};

const ACAO_POR_RISCO: Record<string, string> = {
  baixo: "Manter o monitoramento na proxima janela de voo. Nenhuma acao corretiva imediata.",
  medio: "Programar vistoria de campo nas zonas destacadas em ate 7 dias e revisar manejo de irrigacao e nutricao.",
  alto: "Vistoria de campo prioritaria em ate 48h. Avaliar amostragem de solo/folha e possivel intervencao localizada.",
  critico:
    "Acao imediata: inspecao em campo em ate 24h, isolamento das zonas afetadas e consulta a um engenheiro agronomo responsavel.",
};

function faixaPercentual(p: number | null): string {
  if (p == null) return "";
  if (p >= 40) return " A area afetada e extensa (>= 40%); priorize a logistica de intervencao.";
  if (p >= 15) return " A area afetada e moderada (15-40%); delimite os focos antes de agir.";
  if (p > 0) return " A area afetada e pequena (< 15%); trate os focos pontualmente.";
  return "";
}

export function gerarRecomendacao(
  analise: Pick<Analise, "tipo_analise" | "nivel_risco" | "percentual_area_afetada">,
): RecomendacaoGerada {
  const base = BASE_POR_TIPO[analise.tipo_analise] ?? BASE_POR_TIPO.outro;
  const risco = analise.nivel_risco ?? "baixo";
  const acao = ACAO_POR_RISCO[risco] ?? ACAO_POR_RISCO.baixo;
  const percent = faixaPercentual(analise.percentual_area_afetada);

  return {
    versao: VERSAO_REGRAS,
    baseada_em_regras: true,
    texto: `${base} ${acao}${percent} Recomendacao gerada por regras (versao ${VERSAO_REGRAS}); nao substitui a avaliacao de um profissional agricola.`,
  };
}
