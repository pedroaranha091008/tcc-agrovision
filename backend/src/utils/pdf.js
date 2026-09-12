import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import env from "../config/env.js";

const RAIZ = path.resolve(env.report.dir);

// "startsWith(RAIZ)" sozinho aceita um irmao com prefixo igual (RAIZ=/a/relatorios
// tambem "contem" /a/relatorios-evil). Exige que o caminho seja a propria raiz
// ou comece com a raiz seguida do separador de diretorio.
function dentroDaRaiz(alvo) {
  return alvo === RAIZ || alvo.startsWith(RAIZ + path.sep);
}

function linha(doc, rotulo, valor) {
  doc.font("Helvetica-Bold").text(`${rotulo}: `, { continued: true });
  doc.font("Helvetica").text(valor ?? "-");
}

/**
 * Gera (ou regenera) o PDF de uma analise de forma deterministica.
 * O nome do arquivo depende apenas do id da analise, entao regenerar
 * sobrescreve o anterior sem criar orfaos.
 *
 * @returns {Promise<{ caminho: string }>}
 */
export async function gerarPdfRelatorio({ propriedade, talhao, voo, analise, recomendacao }) {
  await fsp.mkdir(RAIZ, { recursive: true });
  const nome = `relatorio-${analise.id_analise}.pdf`;
  const destino = path.join(RAIZ, nome);
  // sufixo aleatorio: duas geracoes concorrentes da MESMA analise (duplo
  // clique, requisicao repetida) escrevem em arquivos .tmp distintos em vez
  // de disputar o mesmo arquivo e corromper o PDF final.
  const tmp = `${destino}.${crypto.randomBytes(6).toString("hex")}.tmp`;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(tmp);
    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(18).text("AgroVision - Relatorio de Analise");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10).fillColor("#555")
      .text(`Gerado em ${new Date().toISOString()}`);
    doc.fillColor("#000").moveDown();

    doc.fontSize(12);
    doc.font("Helvetica-Bold").fontSize(13).text("Propriedade");
    doc.fontSize(11);
    linha(doc, "Fazenda", propriedade.nome_fazenda);
    linha(doc, "Local", `${propriedade.cidade} - ${propriedade.estado}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(13).text("Talhao");
    doc.fontSize(11);
    linha(doc, "Nome", talhao.nome_talhao);
    linha(doc, "Cultura", talhao.cultura);
    linha(doc, "Area (ha)", talhao.area_hectares != null ? String(talhao.area_hectares) : "-");
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(13).text("Voo");
    doc.fontSize(11);
    linha(doc, "Data", new Date(voo.data_voo).toISOString().slice(0, 10));
    linha(doc, "Drone", voo.modelo_drone);
    linha(doc, "Operador", voo.operador);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(13).text("Analise");
    doc.fontSize(11);
    linha(doc, "Tipo", analise.tipo_analise);
    linha(doc, "Nivel de risco", analise.nivel_risco);
    linha(
      doc,
      "Area afetada (%)",
      analise.percentual_area_afetada != null ? String(analise.percentual_area_afetada) : "-",
    );
    linha(doc, "Resultado", analise.resultado);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(13).text("Recomendacao");
    doc.fontSize(11).font("Helvetica").text(recomendacao.texto, { align: "justify" });
    doc.moveDown();
    doc.fontSize(9).fillColor("#777")
      .text(
        "Esta recomendacao e baseada em regras versionadas e nao constitui diagnostico automatico por IA.",
      );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  await fsp.rename(tmp, destino);
  return { caminho: path.relative(process.cwd(), destino) };
}

export async function removerPdf(caminhoRelativo) {
  const alvo = path.resolve(caminhoRelativo);
  if (!dentroDaRaiz(alvo)) return;
  await fsp.rm(alvo, { force: true });
}

export function caminhoAbsolutoPdf(caminhoRelativo) {
  return path.resolve(caminhoRelativo);
}
