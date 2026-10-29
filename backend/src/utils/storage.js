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
};
