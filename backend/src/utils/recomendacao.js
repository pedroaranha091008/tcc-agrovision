/**
 * Motor de recomendacoes por regras versionadas.
 *
 * A recomendacao e DETERMINISTICA: depende apenas de (tipo_analise, nivel_risco,
 * percentual_area_afetada). Nao ha diagnostico automatico por IA.
 * Ao mudar as regras, incremente VERSAO_REGRAS.
 */

export const VERSAO_REGRAS = "1.0.0";

const BASE_POR_TIPO = {
  NDVI: "Indice de vegetacao indica variacao de vigor na cultura.",
  RGB: "Inspecao visual aponta variacao de cobertura/coloracao na area.",
  termico: "Mapa termico indica variacao de temperatura foliar, possivel estresse hidrico.",
  multispectral: "Resposta espectral indica variacao de sanidade da cultura.",
  outro: "Analise registrada sem categoria espectral especifica.",
};

const ACAO_POR_RISCO = {
  baixo: "Manter o monitoramento na proxima janela de voo. Nenhuma acao corretiva imediata.",
  medio:
    "Programar vistoria de campo nas zonas destacadas em ate 7 dias e revisar manejo de irrigacao e nutricao.",
  alto:
    "Vistoria de campo prioritaria em ate 48h. Avaliar amostragem de solo/folha e possivel intervencao localizada.",
  critico:
    "Acao imediata: inspecao em campo em ate 24h, isolamento das zonas afetadas e consulta a um engenheiro agronomo responsavel.",
};

function faixaPercentual(p) {
  if (p == null) return "";
  if (p >= 40) return " A area afetada e extensa (>= 40%); priorize a logistica de intervencao.";
  if (p >= 15) return " A area afetada e moderada (15-40%); delimite os focos antes de agir.";
  if (p > 0) return " A area afetada e pequena (< 15%); trate os focos pontualmente.";
  return "";
}

/**
 * @param {{ tipo_analise: string, nivel_risco: string|null, percentual_area_afetada: number|null }} analise
 * @returns {{ versao: string, baseada_em_regras: true, texto: string }}
 */
export function gerarRecomendacao(analise) {
  const base = BASE_POR_TIPO[analise.tipo_analise] ?? BASE_POR_TIPO.outro;
  const risco = analise.nivel_risco ?? "baixo";
  const acao = ACAO_POR_RISCO[risco] ?? ACAO_POR_RISCO.baixo;
  const percent = faixaPercentual(
    analise.percentual_area_afetada == null ? null : Number(analise.percentual_area_afetada),
  );

  return {
    versao: VERSAO_REGRAS,
    baseada_em_regras: true,
    texto: `${base} ${acao}${percent} Recomendacao gerada por regras (versao ${VERSAO_REGRAS}); nao substitui a avaliacao de um profissional agricola.`,
  };
}
