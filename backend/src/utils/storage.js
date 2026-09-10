import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import env from "../config/env.js";

/**
 * Abstracao minima de armazenamento de arquivos.
 * Implementacao atual: disco local em env.upload.dir.
 * Para produzir storage externo (S3, GCS...), basta implementar a mesma
 * interface { salvar, remover, caminhoAbsoluto, lerStream }.
 */

const RAIZ = path.resolve(env.upload.dir);

async function garantirRaiz() {
  await fs.mkdir(RAIZ, { recursive: true });
}

function nomeSeguro(nomeOriginal) {
  const ext = path.extname(nomeOriginal).toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
}

export const storage = {
  /**
   * @param {Buffer} buffer
   * @param {string} nomeOriginal
   * @returns {Promise<{ nome_armazenado: string, caminho: string }>}
   */
  async salvar(buffer, nomeOriginal) {
    await garantirRaiz();
    const nome = nomeSeguro(nomeOriginal);
    const destino = path.join(RAIZ, nome);
    // flag "wx": falha se o arquivo ja existir; nunca sobrescreve.
    await fs.writeFile(destino, buffer, { flag: "wx", mode: 0o640 });
    return { nome_armazenado: nome, caminho: path.relative(process.cwd(), destino) };
  },

  async remover(caminhoRelativo) {
    const alvo = path.resolve(caminhoRelativo);
    if (!alvo.startsWith(RAIZ)) return; // nunca remove fora da raiz de upload
    await fs.rm(alvo, { force: true });
  },

  caminhoAbsoluto(caminhoRelativo) {
    return path.resolve(caminhoRelativo);
  },
};
