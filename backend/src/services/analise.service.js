import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import env from "../config/env.js";
import logger from "../config/logger.js";
import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { analisarImagem, LIMIARES, resumir, textoResultado, VERSAO_METODO } from "../utils/indiceVerde.js";
import { storage } from "../utils/storage.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";

const ORDENAVEIS = ["data_analise", "atualizado_em", "nivel_risco", "tipo_analise"];

async function garantirVooDoUsuario(idVoo, idUsuario) {
  const voo = await prisma.voo.findFirst({
    where: {
      id_voo: idVoo,
      talhao: { propriedade: { id_usuario: idUsuario } },
    },
  });
  if (!voo) throw erros.naoEncontrado("Voo nao encontrado");
  return voo;
}

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(
    consulta,
    ORDENAVEIS,
    { data_analise: "desc" },
  );
  const where = {
    voo: { talhao: { propriedade: { id_usuario: idUsuario } } },
  };
  if (consulta.id_voo) where.id_voo = consulta.id_voo;
  if (consulta.tipo_analise) where.tipo_analise = consulta.tipo_analise;
  if (consulta.nivel_risco) where.nivel_risco = consulta.nivel_risco;
  if (consulta.status) where.status = consulta.status;

  const [itens, total] = await Promise.all([
    prisma.analise.findMany({ where, skip, take, orderBy }),
    prisma.analise.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function obter(analise) {
  return analise;
}

export async function criar(idUsuario, dados) {
  await garantirVooDoUsuario(dados.id_voo, idUsuario);
  return prisma.analise.create({
    data: {
      id_voo: dados.id_voo,
      tipo_analise: dados.tipo_analise,
      nivel_risco: dados.nivel_risco ?? null,
      percentual_area_afetada: dados.percentual_area_afetada ?? null,
      resultado: dados.resultado ?? null,
      url_arquivo: dados.url_arquivo ?? null,
      status: dados.status ?? "concluido",
    },
  });
}

export async function atualizar(analise, dados) {
  return prisma.analise.update({
    where: { id_analise: analise.id_analise },
    data: dados,
  });
}

export async function remover(analise) {
  const relatorios = await prisma.relatorio.count({
    where: { id_analise: analise.id_analise },
  });
  if (relatorios > 0) {
    throw erros.conflito("Analise possui relatorios gerados", { relatorios });
  }
  await prisma.analise.delete({ where: { id_analise: analise.id_analise } });
  await removerMapas(analise);
}

const PASTA_MAPAS = path.resolve(env.upload.dir, "mapas");

const nomesDosMapas = (analise) =>
  (analise.detalhes?.por_imagem ?? []).map((i) => i.mapa).filter(Boolean);

async function removerMapas(analise) {
  await Promise.allSettled(
    nomesDosMapas(analise).map((nome) => fs.rm(path.join(PASTA_MAPAS, nome), { force: true })),
  );
}

/**
 * Roda o indice de verde (ExG) em todas as imagens do voo e grava uma analise
 * automatica com o mapa colorido de cada imagem. O status do voo acompanha:
 * em_processamento -> concluido, ou falhou se alguma imagem nao puder ser lida.
 */
export async function analisarVoo(voo) {
  const imagens = await prisma.imagemVoo.findMany({
    where: { id_voo: voo.id_voo },
    orderBy: { criado_em: "asc" },
  });
  if (imagens.length === 0) {
    throw erros.validacao(
      [{ campo: "imagens", mensagem: "o voo nao tem imagens" }],
      "Envie ao menos uma imagem do voo antes de analisar.",
    );
  }

  await prisma.voo.update({ where: { id_voo: voo.id_voo }, data: { status_processamento: "em_processamento" } });
  const id = crypto.randomUUID();
  const gravados = [];

  try {
    await fs.mkdir(PASTA_MAPAS, { recursive: true });
    const porImagem = [];
    for (const [i, imagem] of imagens.entries()) {
      const r = await analisarImagem(storage.caminhoAbsoluto(imagem.caminho));
      const nomeMapa = `${id}-${i}.png`;
      await fs.writeFile(path.join(PASTA_MAPAS, nomeMapa), r.mapaPng);
      gravados.push(nomeMapa);
      porImagem.push({
        id_imagem: imagem.id_imagem,
        nome: imagem.nome_original,
        saudavel: r.saudavel,
        atencao: r.atencao,
        critico: r.critico,
        exg_medio: r.exg_medio,
        mapa: nomeMapa,
      });
    }

    const resumo = resumir(porImagem);
    const [analise] = await prisma.$transaction([
      prisma.analise.create({
        data: {
          id_analise: id,
          id_voo: voo.id_voo,
          tipo_analise: "RGB",
          origem: "automatica",
          status: "concluido",
          nivel_risco: resumo.nivel,
          percentual_area_afetada: resumo.afetada,
          resultado: textoResultado(resumo, imagens.length),
          detalhes: { metodo: "ExG", versao: VERSAO_METODO, limiares: LIMIARES, resumo, por_imagem: porImagem },
        },
      }),
      prisma.voo.update({ where: { id_voo: voo.id_voo }, data: { status_processamento: "concluido" } }),
    ]);
    return analise;
  } catch (e) {
    await Promise.allSettled(gravados.map((nome) => fs.rm(path.join(PASTA_MAPAS, nome), { force: true })));
    await prisma.voo.update({ where: { id_voo: voo.id_voo }, data: { status_processamento: "falhou" } });
    logger.error({ err: e, id_voo: voo.id_voo }, "falha na analise automatica");
    throw erros.validacao(
      [{ campo: "imagens", mensagem: "nao foi possivel processar as imagens" }],
      "Não foi possível processar as imagens deste voo.",
    );
  }
}

/** Caminho do mapa colorido de uma imagem (pela posicao) de uma analise automatica. */
export function caminhoMapa(analise, indice) {
  const nome = nomesDosMapas(analise)[indice];
  if (!nome) throw erros.naoEncontrado("Mapa nao encontrado");
  return path.join(PASTA_MAPAS, nome);
}
