import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import env from "../config/env.js";
import { AppError, erros } from "./AppError.js";

let cliente;
function bucketPrivado() {
  if (!cliente) {
    cliente = createClient(env.storage.url, env.storage.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(60000) }) },
    });
  }
  return cliente.storage.from(env.storage.bucket);
}

// Nao repassa erros do provedor, URLs ou credenciais ao cliente/logs.
async function remoto(operacao) {
  try {
    const { data, error } = await operacao();
    if (error) throw error;
    return data;
  } catch {
    throw new AppError(503, "ARMAZENAMENTO_INDISPONIVEL", "Armazenamento indisponivel. Tente novamente mais tarde.");
  }
}

export function criarArmazenamento(dir, prefixo) {
  const raiz = path.resolve(dir);
  const marcador = () => `supabase://${env.storage.bucket}/${prefixo}/`;

  function localSeguro(referencia) {
    const alvo = path.resolve(referencia);
    if (!alvo.startsWith(raiz + path.sep)) throw erros.requisicaoInvalida("Caminho de arquivo invalido");
    return alvo;
  }

  function chave(referencia) {
    if (!referencia.startsWith(marcador())) throw erros.requisicaoInvalida("Referencia de arquivo invalida");
    const nome = referencia.slice(marcador().length);
    if (!/^[a-zA-Z0-9_.-]+$/.test(nome) || nome === "." || nome === "..") {
      throw erros.requisicaoInvalida("Nome de arquivo invalido");
    }
    return `${prefixo}/${nome}`;
  }

  return {
    async salvar(buffer, nome, contentType, sobrescrever = false) {
      if (!/^[a-zA-Z0-9_.-]+$/.test(nome) || nome === "." || nome === "..") {
        throw erros.requisicaoInvalida("Nome de arquivo invalido");
      }
      if (env.storage.provider === "supabase") {
        await remoto(() => bucketPrivado().upload(`${prefixo}/${nome}`, buffer, { contentType, upsert: sobrescrever }));
        return `${marcador()}${nome}`;
      }
      await fs.mkdir(raiz, { recursive: true });
      const destino = localSeguro(path.join(raiz, nome));
      if (sobrescrever) {
        const tmp = `${destino}.${crypto.randomUUID()}.tmp`;
        try {
          await fs.writeFile(tmp, buffer, { flag: "wx", mode: 0o640 });
          await fs.rename(tmp, destino);
        } finally {
          await fs.rm(tmp, { force: true });
        }
      } else {
        await fs.writeFile(destino, buffer, { flag: "wx", mode: 0o640 });
      }
      return path.relative(process.cwd(), destino);
    },

    async remover(referencia) {
      if (referencia.startsWith("supabase://")) {
        const objeto = chave(referencia);
        await remoto(() => bucketPrivado().remove([objeto]));
      } else {
        await fs.rm(localSeguro(referencia), { force: true });
      }
    },

    async ler(referencia) {
      if (referencia.startsWith("supabase://")) {
        const objeto = chave(referencia);
        const blob = await remoto(() => bucketPrivado().download(objeto));
        return Buffer.from(await blob.arrayBuffer());
      }
      try {
        return await fs.readFile(localSeguro(referencia));
      } catch (error) {
        if (error.code === "ENOENT") throw erros.naoEncontrado("Arquivo indisponivel");
        throw error;
      }
    },
  };
}
