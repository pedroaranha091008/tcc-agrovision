import type { Analise, ImagemVoo, Propriedade, Talhao, Voo } from "@/types/dominio";
import type { Relatorio } from "@/types/relatorio";

/**
 * Store do dominio agricola no modo mock.
 * Propriedades/talhoes/voos sao persistidos em localStorage (sobrevivem ao reload).
 * Imagens e analises ficam so em memoria: guardar bytes de arquivo em
 * localStorage nao e viavel (quota ~5-10MB), entao esses dois somem no reload.
 */

type ColecaoPersistida = "propriedades" | "talhoes" | "voos";
const PREFIXO = "agrovision.mock.";

interface Dados {
  propriedades: Propriedade[];
  talhoes: Talhao[];
  voos: Voo[];
}

function ler<K extends ColecaoPersistida>(col: K): Dados[K] {
  try {
    const bruto = localStorage.getItem(PREFIXO + col);
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return [] as unknown as Dados[K];
  }
}

function gravar<K extends ColecaoPersistida>(col: K, valor: Dados[K]) {
  try {
    localStorage.setItem(PREFIXO + col, JSON.stringify(valor));
  } catch {
    /* ignore */
  }
}

export const dominio = {
  propriedades: ler("propriedades"),
  talhoes: ler("talhoes"),
  voos: ler("voos"),
  imagens: [] as ImagemVoo[],
  analises: [] as Analise[],
  relatorios: [] as Relatorio[],

  salvar(col: ColecaoPersistida) {
    if (col === "propriedades") gravar("propriedades", this.propriedades);
    else if (col === "talhoes") gravar("talhoes", this.talhoes);
    else gravar("voos", this.voos);
  },
};

export const agora = () => new Date().toISOString();
