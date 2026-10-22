import type { Analise } from "@/types/dominio";
import type { RecomendacaoGerada } from "@/types/relatorio";

/**
 * Espelho, no mock, do motor de recomendacoes por regras do backend
 * (src/utils/recomendacao.js) — mesma versao, mesmo texto.
 * Deterministico: so depende de (tipo_analise, nivel_risco, percentual_area_afetada).
 */
export const VERSAO_REGRAS = "2.0.0";

const AVISO =
  "Recomendações geradas por regras simples a partir do tipo de análise, do nível de risco e da área afetada. " +
  "Não são diagnóstico automático e não substituem a avaliação de um engenheiro agrônomo.";

const POR_RISCO: Record<string, { titulo: string; prazo: string; acoes: string[] }> = {
  baixo: {
    titulo: "Situação sob controle",
    prazo: "Próximo monitoramento no ciclo normal (15 a 30 dias).",
    acoes: ["Manter o manejo atual.", "Repetir o voo no próximo estágio da cultura para acompanhar a evolução."],
  },
  medio: {
    titulo: "Atenção a pontos isolados",
    prazo: "Inspecionar em campo nos próximos 7 dias.",
    acoes: [
      "Visitar as manchas indicadas no mapa para identificar a causa.",
      "Registrar o que foi encontrado como nova análise para acompanhar a evolução.",
    ],
  },
  alto: {
    titulo: "Intervenção recomendada",
    prazo: "Inspecionar em campo em até 3 dias.",
    acoes: [
      "Inspecionar as áreas afetadas com o agrônomo responsável.",
      "Avaliar correção localizada (replantio, adubação ou controle) apenas nas zonas indicadas.",
      "Programar novo voo após a intervenção para medir o resultado.",
    ],
  },
  critico: {
    titulo: "Ação imediata",
    prazo: "Inspecionar em campo com urgência (até 24 horas).",
    acoes: [
      "Confirmar em campo a extensão do problema com o agrônomo responsável.",
      "Definir o plano de correção antes que o dano se espalhe para áreas vizinhas.",
      "Se a imagem não corresponde à lavoura no estágio esperado, refazer o voo.",
    ],
  },
};

const POR_TIPO: Record<string, string> = {
  RGB: "Verificar falhas de plantio e solo exposto nas faixas sem vegetação; avaliar replantio onde a falha for contínua.",
  NDVI: "Investigar deficiência nutricional ou estresse nas zonas de NDVI baixo; considerar análise de solo e foliar.",
  termico: "Verificar a irrigação e sinais de estresse hídrico nas zonas mais quentes.",
  multispectral: "Cruzar as bandas com o histórico do talhão para separar estresse hídrico, nutricional ou fitossanitário.",
};

export function gerarRecomendacao(
  analise: Pick<Analise, "tipo_analise" | "nivel_risco" | "percentual_area_afetada">,
): RecomendacaoGerada {
  const risco = analise.nivel_risco && POR_RISCO[analise.nivel_risco] ? analise.nivel_risco : "baixo";
  const base = POR_RISCO[risco];
  const acoes = [...base.acoes];
  if (risco !== "baixo" && POR_TIPO[analise.tipo_analise]) acoes.splice(1, 0, POR_TIPO[analise.tipo_analise]);
  if (analise.percentual_area_afetada != null && analise.percentual_area_afetada >= 40) {
    acoes.push("A área afetada é extensa (40% ou mais): considere tratar o talhão inteiro, e não só as manchas.");
  }
  return {
    versao: VERSAO_REGRAS,
    baseada_em_regras: true,
    titulo: base.titulo,
    prazo: base.prazo,
    acoes,
    aviso: AVISO,
    texto: `${base.titulo}. ${base.prazo} ${acoes.join(" ")} ${AVISO}`,
  };
}
