import fs from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { caminho, remover } from "../../utils/armazenamento.js";

export async function garantirDono(idImagem, idUsuario) {
  const imagem = await prisma.imagemVoo.findFirst({
    where: { id_imagem: idImagem, voo: { talhao: { propriedade: { id_usuario: idUsuario } } } }
  });
  if (!imagem) throw new AppError("Imagem não encontrada.", 404, "NAO_ENCONTRADO");
  return imagem;
}

/**
 * Registra os arquivos já gravados pelo multer. Abre cada um com o sharp para garantir
 * que é mesmo uma imagem (a extensão pode mentir); os inválidos são apagados e listados.
 */
export async function registrar(idVoo, arquivos) {
  const enviadas = [];
  const recusadas = [];

  for (const arquivo of arquivos) {
    try {
      const meta = await sharp(arquivo.path).metadata();
      if (!meta.width || !meta.height) throw new Error("sem dimensões");
      const imagem = await prisma.imagemVoo.create({
        data: {
          id_voo: idVoo,
          nome_original: arquivo.originalname.slice(0, 255),
          nome_arquivo: arquivo.filename,
          mime_type: arquivo.mimetype,
          tamanho_bytes: arquivo.size,
          largura: meta.width,
          altura: meta.height
        }
      });
      enviadas.push(imagem);
    } catch {
      await fs.rm(arquivo.path, { force: true });
      recusadas.push({ nome: arquivo.originalname, motivo: "O arquivo está corrompido ou não é uma imagem válida." });
    }
  }

  return { enviadas, recusadas };
}

/** Caminho do arquivo original, ou de uma miniatura JPEG (TIFF não abre no navegador). */
export async function arquivo(idImagem, idUsuario, miniatura) {
  const imagem = await garantirDono(idImagem, idUsuario);
  const original = caminho("voos", imagem.id_voo, imagem.nome_arquivo);
  if (!miniatura) return { tipo: imagem.mime_type, caminho: original, nome: imagem.nome_original };

  const destino = caminho("voos", imagem.id_voo, "miniaturas", `${imagem.id_imagem}.jpg`);
  try {
    await fs.access(destino);
  } catch {
    await fs.mkdir(caminho("voos", imagem.id_voo, "miniaturas"), { recursive: true });
    await sharp(original).rotate().resize({ width: 480, height: 480, fit: "inside" }).jpeg({ quality: 78 }).toFile(destino);
  }
  return { tipo: "image/jpeg", caminho: destino, nome: imagem.nome_original };
}

export async function excluir(idImagem, idUsuario) {
  const imagem = await garantirDono(idImagem, idUsuario);
  await prisma.imagemVoo.delete({ where: { id_imagem: idImagem } });
  await remover("voos", imagem.id_voo, imagem.nome_arquivo);
  await remover("voos", imagem.id_voo, "miniaturas", `${imagem.id_imagem}.jpg`);
}
