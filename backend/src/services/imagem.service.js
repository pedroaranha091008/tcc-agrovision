import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { storage } from "../utils/storage.js";

export async function listarDoVoo(idVoo) {
  return prisma.imagemVoo.findMany({
    where: { id_voo: idVoo },
    orderBy: { criado_em: "asc" },
  });
}

/**
 * Persiste os buffers recebidos pelo multer. Se a gravacao de um arquivo
 * falhar, os que ja foram salvos sao removidos para nao deixar orfaos.
 */
export async function anexarAoVoo(voo, arquivos) {
  if (!arquivos || arquivos.length === 0) {
    throw erros.requisicaoInvalida("Envie ao menos uma imagem no campo 'imagens'");
  }

  const salvos = [];
  try {
    for (const arquivo of arquivos) {
      const { nome_armazenado, caminho } = await storage.salvar(
        arquivo.buffer,
        arquivo.originalname,
      );
      salvos.push({
        id_voo: voo.id_voo,
        nome_original: arquivo.originalname.slice(0, 255),
        nome_armazenado,
        mime_type: arquivo.mimetype,
        tamanho_bytes: arquivo.size,
        caminho,
      });
    }
  } catch (e) {
    await Promise.allSettled(salvos.map((s) => storage.remover(s.caminho)));
    throw e;
  }

  await prisma.imagemVoo.createMany({ data: salvos });
  return prisma.imagemVoo.findMany({
    where: { id_voo: voo.id_voo, nome_armazenado: { in: salvos.map((s) => s.nome_armazenado) } },
    orderBy: { criado_em: "asc" },
  });
}

export async function removerImagem(idVoo, idImagem) {
  const imagem = await prisma.imagemVoo.findFirst({
    where: { id_imagem: idImagem, id_voo: idVoo },
  });
  if (!imagem) throw erros.naoEncontrado("Imagem nao encontrada");

  await prisma.imagemVoo.delete({ where: { id_imagem: idImagem } });
  await storage.remover(imagem.caminho);
}
