// Armazenamento de arquivos em disco local. Para usar um storage externo (S3, etc.) no futuro,
// basta reimplementar estas funções mantendo as mesmas assinaturas.
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

const RAIZ = env.uploads.diretorio;

/** Caminho absoluto de um arquivo dentro da pasta de uploads (impede escapar da pasta com "../"). */
export function caminho(...partes) {
  const destino = path.resolve(RAIZ, ...partes);
  if (!destino.startsWith(RAIZ + path.sep)) throw new Error("Caminho de arquivo inválido.");
  return destino;
}

export async function garantirPasta(...partes) {
  const pasta = caminho(...partes);
  await fs.mkdir(pasta, { recursive: true });
  return pasta;
}

/** Remove arquivo ou pasta (com o conteúdo) sem falhar se já não existir. */
export async function remover(...partes) {
  await fs.rm(caminho(...partes), { force: true, recursive: true });
}
