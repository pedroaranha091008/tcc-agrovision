import fs from "node:fs/promises";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { caminho, garantirPasta, remover } from "../../utils/armazenamento.js";
import { normalizar } from "../../utils/serializers.js";
import { garantirDono as garantirDonoVoo } from "../voos/voos.service.js";
import { analisarImagem, LIMIARES, resumir, textoResultado, VERSAO_METODO } from "./indiceVerde.js";

export async function garantirDono(idAnalise, idUsuario) {
  const analise = await prisma.analise.findFirst({
    where: { id_analise: idAnalise, voo: { talhao: { propriedade: { id_usuario: idUsuario } } } }
  });
  if (!analise) throw new AppError("Análise não encontrada.", 404, "NAO_ENCONTRADO");
  return analise;
}

export async function criarManual(idVoo, idUsuario, dados) {
  await garantirDonoVoo(idVoo, idUsuario);
  const analise = await prisma.analise.create({ data: { ...dados, id_voo: idVoo, origem: "manual" } });
  return normalizar(analise);
}

/** Roda o índice de verde em todas as imagens do voo e grava uma análise com o mapa de cada imagem. */
export async function criarAutomatica(idVoo, idUsuario) {
  await garantirDonoVoo(idVoo, idUsuario);
  const imagens = await prisma.imagemVoo.findMany({ where: { id_voo: idVoo }, orderBy: { criado_em: "asc" } });
  if (imagens.length === 0) {
    throw new AppError("Envie ao menos uma imagem do voo antes de analisar.", 422, "SEM_IMAGENS");
  }

  // Cria o registro primeiro para usar o id no nome dos mapas; se algo falhar, desfaz tudo.
  const analise = await prisma.analise.create({ data: { id_voo: idVoo, tipo_analise: "RGB", origem: "automatica" } });
  const mapasGravados = [];

  try {
    await garantirPasta("analises");
    const porImagem = [];
    for (const [i, imagem] of imagens.entries()) {
      const r = await analisarImagem(caminho("voos", idVoo, imagem.nome_arquivo));
      const nomeMapa = `${analise.id_analise}-${i}.png`;
      await fs.writeFile(caminho("analises", nomeMapa), r.mapaPng);
      mapasGravados.push(nomeMapa);
      porImagem.push({
        id_imagem: imagem.id_imagem,
        nome: imagem.nome_original,
        saudavel: r.saudavel,
        atencao: r.atencao,
        critico: r.critico,
        exg_medio: r.exg_medio,
        mapa: nomeMapa
      });
    }

    const resumo = resumir(porImagem);
    const atualizada = await prisma.analise.update({
      where: { id_analise: analise.id_analise },
      data: {
        nivel_risco: resumo.nivel,
        percentual_area_afetada: resumo.afetada,
        resultado: textoResultado(resumo, imagens.length),
        detalhes: { metodo: "ExG", versao: VERSAO_METODO, limiares: LIMIARES, resumo, por_imagem: porImagem }
      }
    });
    return normalizar(atualizada);
  } catch (erro) {
    await prisma.analise.delete({ where: { id_analise: analise.id_analise } });
    await Promise.all(mapasGravados.map((nome) => remover("analises", nome)));
    if (erro instanceof AppError) throw erro;
    console.error(erro);
    throw new AppError("Não foi possível processar as imagens deste voo.", 422, "FALHA_NA_ANALISE");
  }
}

export async function buscarMapa(idAnalise, idUsuario, indice) {
  const analise = await garantirDono(idAnalise, idUsuario);
  const mapa = analise.detalhes?.por_imagem?.[indice]?.mapa;
  if (!mapa) throw new AppError("Mapa não encontrado.", 404, "NAO_ENCONTRADO");
  return caminho("analises", mapa);
}

export async function excluir(idAnalise, idUsuario) {
  const analise = await garantirDono(idAnalise, idUsuario);
  await prisma.analise.delete({ where: { id_analise: idAnalise } });
  const mapas = analise.detalhes?.por_imagem?.map((i) => i.mapa).filter(Boolean) ?? [];
  await Promise.all(mapas.map((nome) => remover("analises", nome)));
}
