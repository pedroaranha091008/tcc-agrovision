import type { Propriedade, Talhao, Voo } from "@/types/dominio";

/**
 * Store do dominio agricola no modo mock. Persistido em localStorage para
 * sobreviver ao reload. Escopo por id_usuario e feito pelo adapter.
 */

type Colecao = "propriedades" | "talhoes" | "voos";
const PREFIXO = "agrovision.mock.";

interface Dados {
  propriedades: Propriedade[];
  talhoes: Talhao[];
  voos: Voo[];
}

function ler<K extends Colecao>(col: K): Dados[K] {
  try {
    const bruto = localStorage.getItem(PREFIXO + col);
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return [] as unknown as Dados[K];
  }
}

function gravar<K extends Colecao>(col: K, valor: Dados[K]) {
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

  salvar(col: Colecao) {
    if (col === "propriedades") gravar("propriedades", this.propriedades);
    else if (col === "talhoes") gravar("talhoes", this.talhoes);
    else gravar("voos", this.voos);
  },
};

export const agora = () => new Date().toISOString();
