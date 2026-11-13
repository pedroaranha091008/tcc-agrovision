/**
 * Analise automatica por Indice de Excesso de Verde (ExG) em fotos RGB.
 *
 * Para cada pixel: r, g, b normalizados (r = R/(R+G+B) ...) e ExG = 2g - r - b.
 * ExG alto = vegetacao vigorosa; ExG baixo = solo exposto, palha ou planta muito
 * estressada. Mede COBERTURA VEGETAL: nao identifica pragas nem doencas, e o
 * texto do resultado deixa isso claro. Ao mudar limiares ou faixas, incremente
 * VERSAO_METODO.
 */
import sharp from "sharp";

export const VERSAO_METODO = "1.0.0";
export const LIMIARES = { saudavel: 0.1, atencao: 0.03 };

// Reduz a imagem antes de calcular: rapido e suficiente para percentuais.
const LARGURA_ANALISE = 1024;

const CORES = {
  saudavel: [46, 160, 67],
  atencao: [251, 192, 45],
  critico: [229, 57, 53],
};

const arred = (n, casas) => Math.round(n * 10 ** casas) / 10 ** casas;

/** Classifica os pixels de uma imagem e devolve os percentuais e um PNG com o mapa colorido. */
export async function analisarImagem(caminhoImagem) {
  const { data, info } = await sharp(caminhoImagem)
    .rotate()
    .resize({ width: LARGURA_ANALISE, withoutEnlargement: true })
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const total = info.width * info.height;
  const mapa = Buffer.alloc(total * 3);
  const contagem = { saudavel: 0, atencao: 0, critico: 0 };
  let somaExg = 0;

  for (let i = 0; i < total; i++) {
    const R = data[i * 3];
    const G = data[i * 3 + 1];
    const B = data[i * 3 + 2];
    const soma = R + G + B;
    const exg = soma === 0 ? 0 : (2 * G - R - B) / soma;
    somaExg += exg;

    const classe = exg >= LIMIARES.saudavel ? "saudavel" : exg >= LIMIARES.atencao ? "atencao" : "critico";
    contagem[classe]++;

    // Mistura a cor da classe com a foto em tons de cinza, para o mapa manter a referencia visual.
    const cinza = 0.3 * R + 0.59 * G + 0.11 * B;
    const [cr, cg, cb] = CORES[classe];
    mapa[i * 3] = Math.round(cinza * 0.4 + cr * 0.6);
    mapa[i * 3 + 1] = Math.round(cinza * 0.4 + cg * 0.6);
    mapa[i * 3 + 2] = Math.round(cinza * 0.4 + cb * 0.6);
  }

  const pct = (n) => arred((n / total) * 100, 1);
  const png = await sharp(mapa, { raw: { width: info.width, height: info.height, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    exg_medio: arred(somaExg / total, 3),
    saudavel: pct(contagem.saudavel),
    atencao: pct(contagem.atencao),
    critico: pct(contagem.critico),
    mapaPng: png,
  };
}

/** Media das imagens. Area afetada = pouca vegetacao + metade da area em atencao. */
export function resumir(porImagem) {
  const media = (campo) => arred(porImagem.reduce((s, i) => s + i[campo], 0) / porImagem.length, 1);
  const saudavel = media("saudavel");
  const atencao = media("atencao");
  const critico = media("critico");
  const afetada = Math.min(100, arred(critico + atencao / 2, 1));
  const nivel = afetada < 15 ? "baixo" : afetada < 30 ? "medio" : afetada < 50 ? "alto" : "critico";
  return { saudavel, atencao, critico, afetada, nivel };
}

const CONSTATACOES = {
  baixo: "Cobertura vegetal uniforme.",
  medio: "Há manchas com pouca vegetação.",
  alto: "Parte importante da área tem pouca vegetação.",
  critico: "Mais da metade da área tem pouca ou nenhuma vegetação.",
};

const pctTexto = (n) => `${n.toLocaleString("pt-BR")}%`;

export function textoResultado({ saudavel, atencao, critico, afetada, nivel }, quantidadeImagens) {
  return [
    `Análise automática por índice de verde (ExG) em ${quantidadeImagens} imagem(ns).`,
    `Vegetação vigorosa: ${pctTexto(saudavel)} · Atenção: ${pctTexto(atencao)} · Pouca ou nenhuma vegetação: ${pctTexto(critico)}.`,
    `Área considerada afetada: ${pctTexto(afetada)}. ${CONSTATACOES[nivel]}`,
    "Este índice mede cobertura vegetal em fotos comuns (RGB); não identifica pragas ou doenças. Confirme sempre em campo.",
  ].join("\n");
}
