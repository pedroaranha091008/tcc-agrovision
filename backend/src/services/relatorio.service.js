import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";
import { gerarRecomendacao, VERSAO_REGRAS } from "../utils/recomendacao.js";
import { caminhoAbsolutoPdf, gerarPdfRelatorio, removerPdf } from "../utils/pdf.js";

function analiseCompleta(analise) {
  return (
    analise.status === "concluido" &&
    analise.nivel_risco != null &&
    analise.resultado != null &&
    String(analise.resultado).trim() !== ""
  );
}

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(consulta, ["gerado_em"], {
    gerado_em: "desc",
  });
  const where = {
    analise: {
      voo: { talhao: { propriedade: { id_usuario: idUsuario } } },
    },
  };
  if (consulta.id_analise) where.id_analise = consulta.id_analise;

  const [itens, total] = await Promise.all([
    prisma.relatorio.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        analise: {
          include: { voo: { include: { talhao: { include: { propriedade: true } } } } },
        },
      },
    }),
    prisma.relatorio.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function obter(idUsuario, idRelatorio) {
  const relatorio = await prisma.relatorio.findFirst({
    where: {
      id_relatorio: idRelatorio,
      analise: { voo: { talhao: { propriedade: { id_usuario: idUsuario } } } },
    },
    include: {
      analise: {
        include: { voo: { include: { talhao: { include: { propriedade: true } } } } },
      },
    },
  });
  if (!relatorio) throw erros.naoEncontrado("Relatorio nao encontrado");
  return relatorio;
}

/**
 * Gera (ou regenera) o relatorio de uma analise concluida.
 * O PDF tem nome deterministico por analise; regenerar sobrescreve.
 */
export async function gerar(idUsuario, idAnalise) {
  const analise = await prisma.analise.findFirst({
    where: {
      id_analise: idAnalise,
      voo: { talhao: { propriedade: { id_usuario: idUsuario } } },
    },
    include: { voo: { include: { talhao: { include: { propriedade: true } } } } },
  });
  if (!analise) throw erros.naoEncontrado("Analise nao encontrada");
  if (!analiseCompleta(analise)) {
    throw erros.conflito(
      "Analise incompleta: e necessario status 'concluido', nivel de risco e resultado preenchidos",
    );
  }

  const recomendacao = gerarRecomendacao(analise);
  const propriedade = analise.voo.talhao.propriedade;
  const talhao = analise.voo.talhao;

  let caminho;
  try {
    ({ caminho } = await gerarPdfRelatorio({
      propriedade,
      talhao,
      voo: analise.voo,
      analise,
      recomendacao,
    }));
  } catch (e) {
    throw erros.interno("Falha ao gerar o PDF do relatorio");
  }

  try {
    const existente = await prisma.relatorio.findFirst({ where: { id_analise: idAnalise } });
    const dados = {
      id_analise: idAnalise,
      caminho_pdf: caminho,
      versao_regras: VERSAO_REGRAS,
      recomendacao: recomendacao.texto,
    };

    const relatorio = existente
      ? await prisma.relatorio.update({
          where: { id_relatorio: existente.id_relatorio },
          data: { caminho_pdf: caminho, versao_regras: VERSAO_REGRAS, recomendacao: recomendacao.texto },
        })
      : await prisma.relatorio.create({ data: dados });

    return { relatorio, recomendacao };
  } catch (e) {
    // PDF ja escrito em disco mas o registro no banco falhou: remove o
    // arquivo para nao deixar um PDF orfao sem relatorio correspondente.
    await removerPdf(caminho);
    throw e;
  }
}

export async function caminhoDownload(idUsuario, idRelatorio) {
  const relatorio = await obter(idUsuario, idRelatorio);
  return {
    caminho_absoluto: caminhoAbsolutoPdf(relatorio.caminho_pdf),
    nome_arquivo: `relatorio-${relatorio.id_analise}.pdf`,
  };
}

export async function remover(idUsuario, idRelatorio) {
  const relatorio = await obter(idUsuario, idRelatorio);
  await prisma.relatorio.delete({ where: { id_relatorio: relatorio.id_relatorio } });
  await removerPdf(relatorio.caminho_pdf);
}
