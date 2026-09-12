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
 * Persiste os buffers recebidos pelo multer em paralelo. Se qualquer
 * gravacao ou o registro no banco falhar, todos os arquivos ja salvos nesta
 * chamada sao removidos para nao deixar orfaos em disco.
 */
export async function anexarAoVoo(voo, arquivos) {
  if (!arquivos || arquivos.length === 0) {
    throw erros.requisicaoInvalida("Envie ao menos uma imagem no campo 'imagens'");
  }

  // allSettled (nao Promise.all): se um arquivo falhar, os outros ainda
  // terminam de gravar em paralelo e precisamos saber quais para poder
  // limpa-los — Promise.all rejeitaria na primeira falha sem informar o
  // resultado dos demais.
  const resultados = await Promise.allSettled(
    arquivos.map(async (arquivo) => {
      const { nome_armazenado, caminho } = await storage.salvar(
        arquivo.buffer,
        arquivo.originalname,
      );
      return {
        id_voo: voo.id_voo,
        nome_original: arquivo.originalname.slice(0, 255),
        nome_armazenado,
        mime_type: arquivo.mimetype,
        tamanho_bytes: arquivo.size,
        caminho,
      };
    }),
  );

  const falha = resultados.find((r) => r.status === "rejected");
  if (falha) {
    await Promise.allSettled(
      resultados
        .filter((r) => r.status === "fulfilled")
        .map((r) => storage.remover(r.value.caminho)),
    );
    throw falha.reason;
  }

  const salvos = resultados.map((r) => r.value);

  try {
    await prisma.imagemVoo.createMany({ data: salvos });
  } catch (e) {
    await Promise.allSettled(salvos.map((s) => storage.remover(s.caminho)));
    throw e;
  }

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

  // Remove o arquivo antes do registro: se a remocao do arquivo falhar,
  // o registro continua existindo e o cliente pode tentar excluir de novo
  // (idempotente). Na ordem inversa, uma falha no disco deixaria o registro
  // ja apagado do banco mas o arquivo ainda ocupando espaco, sem chance de
  // um retry encontrar e limpar.
  await storage.remover(imagem.caminho);
  await prisma.imagemVoo.delete({ where: { id_imagem: idImagem } });
}
