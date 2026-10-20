import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { normalizar } from "../../utils/serializers.js";
import { garantirDono } from "../analises/analises.service.js";
import { recomendar } from "./recomendacoes.js";
import { gerarPdf } from "./pdf.js";

/** Análise com toda a hierarquia (para pré-visualização e para o PDF) e a recomendação por regras. */
export async function detalhe(idAnalise, idUsuario) {
  await garantirDono(idAnalise, idUsuario);
  const analise = normalizar(
    await prisma.analise.findUnique({
      where: { id_analise: idAnalise },
      include: {
        voo: {
          select: {
            id_voo: true, data_voo: true, modelo_drone: true, operador: true, altitude_metros: true,
            talhao: {
              select: {
                id_talhao: true, nome_talhao: true, cultura: true, area_hectares: true,
                propriedade: { select: { id_propriedade: true, nome_fazenda: true, cidade: true, estado: true } }
              }
            }
          }
        }
      }
    })
  );
  return { ...analise, recomendacao: recomendar(analise) };
}

export async function pdf(idAnalise, idUsuario) {
  const analise = await detalhe(idAnalise, idUsuario);
  if (!analise.nivel_risco) {
    throw new AppError("Esta análise ainda não tem resultado completo para gerar o relatório.", 422, "ANALISE_INCOMPLETA");
  }
  const conteudo = await gerarPdf(analise, analise.recomendacao);
  const talhao = analise.voo.talhao.nome_talhao.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  const nomeArquivo = `relatorio-${talhao || "talhao"}-${analise.voo.data_voo.toISOString().slice(0, 10)}.pdf`;
  return { conteudo, nomeArquivo };
}
