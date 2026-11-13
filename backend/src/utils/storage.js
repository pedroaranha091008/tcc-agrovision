import crypto from "node:crypto";
import path from "node:path";
import env from "../config/env.js";
import { criarArmazenamento } from "./arquivos.js";

const arquivos = criarArmazenamento(env.upload.dir, "imagens");

export const storage = {
  async salvar(buffer, nomeOriginal, contentType = "application/octet-stream") {
    const ext = path.extname(nomeOriginal).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const nome = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const caminho = await arquivos.salvar(buffer, nome, contentType);
    return { nome_armazenado: nome, caminho };
  },
  remover: arquivos.remover,
  ler: arquivos.ler,
};

// Mapas coloridos da analise automatica (por nome, guardado em detalhes.por_imagem[].mapa).
const arquivosMapas = criarArmazenamento(path.join(env.upload.dir, "mapas"), "mapas");

export const mapas = {
  salvar: (buffer, nome) => arquivosMapas.salvar(buffer, nome, "image/png", true),
  ler: (nome) => arquivosMapas.ler(arquivosMapas.referencia(nome)),
  remover: (nome) => arquivosMapas.remover(arquivosMapas.referencia(nome)),
};
