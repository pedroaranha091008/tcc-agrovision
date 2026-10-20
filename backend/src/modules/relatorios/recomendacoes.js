// Recomendações por REGRAS fixas (não é diagnóstico por IA). Ao mudar as regras, aumente a versão:
// ela aparece no relatório, para saber com qual conjunto de regras cada recomendação foi gerada.
export const VERSAO_REGRAS = 1;

export const AVISO_RECOMENDACAO =
  "Recomendações geradas por regras simples a partir do tipo de análise, do nível de risco e da área afetada. " +
  "Não são diagnóstico automático e não substituem a avaliação de um engenheiro agrônomo.";

const POR_RISCO = {
  baixo: {
    titulo: "Situação sob controle",
    prazo: "Próximo monitoramento no ciclo normal (15 a 30 dias).",
    acoes: ["Manter o manejo atual.", "Repetir o voo no próximo estágio da cultura para acompanhar a evolução."]
  },
  medio: {
    titulo: "Atenção a pontos isolados",
    prazo: "Inspecionar em campo nos próximos 7 dias.",
    acoes: ["Visitar as manchas indicadas no mapa para identificar a causa.", "Registrar o que foi encontrado como nova análise para acompanhar a evolução."]
  },
  alto: {
    titulo: "Intervenção recomendada",
    prazo: "Inspecionar em campo em até 3 dias.",
    acoes: [
      "Inspecionar as áreas afetadas com o agrônomo responsável.",
      "Avaliar correção localizada (replantio, adubação ou controle) apenas nas zonas indicadas.",
      "Programar novo voo após a intervenção para medir o resultado."
    ]
  },
  critico: {
    titulo: "Ação imediata",
    prazo: "Inspecionar em campo com urgência (até 24 horas).",
    acoes: [
      "Confirmar em campo a extensão do problema com o agrônomo responsável.",
      "Definir o plano de correção antes que o dano se espalhe para áreas vizinhas.",
      "Se a imagem não corresponde à lavoura no estágio esperado, refazer o voo."
    ]
  }
};

// Ação extra conforme o tipo de análise, só quando o risco não é baixo.
const POR_TIPO = {
  RGB: "Verificar falhas de plantio e solo exposto nas faixas sem vegetação; avaliar replantio onde a falha for contínua.",
  NDVI: "Investigar deficiência nutricional ou estresse nas zonas de NDVI baixo; considerar análise de solo e foliar.",
  termico: "Verificar a irrigação e sinais de estresse hídrico nas zonas mais quentes.",
  multispectral: "Cruzar as bandas com o histórico do talhão para separar estresse hídrico, nutricional ou fitossanitário.",
  outro: null
};

export function recomendar({ tipo_analise, nivel_risco, percentual_area_afetada }) {
  if (!nivel_risco) return null;
  const base = POR_RISCO[nivel_risco];
  const acoes = [...base.acoes];
  if (nivel_risco !== "baixo" && POR_TIPO[tipo_analise]) acoes.splice(1, 0, POR_TIPO[tipo_analise]);
  if (percentual_area_afetada !== null && percentual_area_afetada !== undefined && Number(percentual_area_afetada) >= 40) {
    acoes.push("Como a área afetada passa de 40%, considere tratar o talhão inteiro e não só as manchas.");
  }
  return { versao: VERSAO_REGRAS, titulo: base.titulo, prazo: base.prazo, acoes, aviso: AVISO_RECOMENDACAO };
}
