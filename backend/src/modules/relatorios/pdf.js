// Monta o PDF do relatório de uma análise. É gerado na hora a cada download (determinístico, sem
// arquivos guardados), então nunca há relatório desatualizado nem arquivo órfão no disco.
import fs from "node:fs/promises";
import PDFDocument from "pdfkit";
import { caminho } from "../../utils/armazenamento.js";

const VERDE = "#1B5E20";
const CINZA = "#4a5568";
const TEXTO = "#212121";
const CORES_RISCO = { baixo: "#2E7D32", medio: "#B7950B", alto: "#E65100", critico: "#C62828" };
const ROTULOS_RISCO = { baixo: "Risco baixo", medio: "Atenção", alto: "Risco alto", critico: "Crítico" };
const TIPOS = { NDVI: "NDVI", RGB: "Índice de verde (RGB)", termico: "Térmica", multispectral: "Multiespectral", outro: "Outra" };

const data = (d) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
const dataHora = (d) => new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
const num = (n) => Number(n).toLocaleString("pt-BR");
const area = (n) => (n === null || n === undefined ? "—" : `${num(n)} ha`);

function secao(doc, titulo) {
  doc.moveDown(0.8);
  if (doc.y > doc.page.height - 140) doc.addPage();
  doc.font("Helvetica-Bold").fontSize(12).fillColor(VERDE).text(titulo);
  doc.moveTo(doc.page.margins.left, doc.y + 2).lineTo(doc.page.width - doc.page.margins.right, doc.y + 2).strokeColor("#C8E6C9").lineWidth(1).stroke();
  doc.moveDown(0.5);
}

/** Tabela simples de duas colunas (rótulo: valor). */
function campos(doc, pares) {
  const x = doc.page.margins.left;
  const largura = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  for (const [rotulo, valor] of pares) {
    const y = doc.y;
    doc.font("Helvetica").fontSize(9).fillColor(CINZA).text(rotulo, x, y, { width: 130 });
    doc.font("Helvetica").fontSize(10).fillColor(TEXTO).text(String(valor ?? "—"), x + 135, y, { width: largura - 135 });
    doc.moveDown(0.25);
  }
  doc.x = x;
}

export async function gerarPdf(analise, recomendacao) {
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true, info: { Title: "Relatório de análise — AgroVision", Author: "AgroVision" } });
  const partes = [];
  doc.on("data", (p) => partes.push(p));
  const fim = new Promise((resolve, reject) => { doc.on("end", resolve); doc.on("error", reject); });

  const { voo } = analise;
  const { talhao } = voo;
  const { propriedade } = talhao;
  const largura = doc.page.width - 100;

  // Cabeçalho
  doc.rect(0, 0, doc.page.width, 90).fill(VERDE);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#FFFFFF").text("AgroVision", 50, 28);
  doc.font("Helvetica").fontSize(11).fillColor("#C8E6C9").text("Relatório de análise da lavoura", 50, 56);
  doc.font("Helvetica").fontSize(9).fillColor("#C8E6C9").text(`Nº ${analise.id_analise.slice(0, 8).toUpperCase()}`, 50, 40, { width: largura, align: "right" });
  doc.y = 110;
  doc.x = 50;

  // Destaque do risco
  const nivel = analise.nivel_risco;
  doc.roundedRect(50, doc.y, largura, 56, 8).fill("#F8F9FA");
  doc.font("Helvetica-Bold").fontSize(16).fillColor(CORES_RISCO[nivel] ?? TEXTO).text(ROTULOS_RISCO[nivel] ?? "Sem classificação", 66, doc.y + 12);
  const afetada = analise.percentual_area_afetada;
  doc.font("Helvetica").fontSize(10).fillColor(CINZA)
    .text(`${TIPOS[analise.tipo_analise]} · ${afetada !== null ? `área afetada: ${num(afetada)}%` : "área afetada não informada"}`, 66, doc.y + 2);
  doc.y = 110 + 56 + 6;
  doc.x = 50;

  secao(doc, "Identificação");
  campos(doc, [
    ["Propriedade", `${propriedade.nome_fazenda} — ${propriedade.cidade}/${propriedade.estado}`],
    ["Talhão", [talhao.nome_talhao, talhao.cultura, area(talhao.area_hectares)].filter(Boolean).join(" · ")],
    ["Data do voo", data(voo.data_voo)],
    ["Drone / operador", [voo.modelo_drone, voo.operador].filter(Boolean).join(" · ") || "—"],
    ["Altitude", voo.altitude_metros ? `${num(voo.altitude_metros)} m` : "—"],
    ["Análise", `${analise.origem === "automatica" ? "Automática (índice de verde ExG)" : "Registrada manualmente"} em ${dataHora(analise.data_analise)}`]
  ]);

  const resumo = analise.detalhes?.resumo;
  if (resumo) {
    secao(doc, "Cobertura vegetal");
    const y = doc.y;
    let x = 50;
    for (const [valor, cor] of [[resumo.saudavel, "#43A047"], [resumo.atencao, "#FBC02D"], [resumo.critico, "#E53935"]]) {
      const w = (largura * valor) / 100;
      if (w > 0) doc.rect(x, y, w, 12).fill(cor);
      x += w;
    }
    doc.y = y + 18;
    doc.font("Helvetica").fontSize(9).fillColor(CINZA)
      .text(`Vegetação vigorosa: ${num(resumo.saudavel)}%   ·   Atenção: ${num(resumo.atencao)}%   ·   Pouca ou nenhuma vegetação: ${num(resumo.critico)}%`, 50);
  }

  if (analise.resultado) {
    secao(doc, "Resultado");
    doc.font("Helvetica").fontSize(10).fillColor(TEXTO).text(analise.resultado, { width: largura, lineGap: 2 });
  }

  if (recomendacao) {
    secao(doc, `Recomendação — ${recomendacao.titulo}`);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXTO).text(`Prazo: ${recomendacao.prazo}`);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10).fillColor(TEXTO).list(recomendacao.acoes, { bulletRadius: 2, textIndent: 12, lineGap: 2, width: largura - 12 });
    doc.moveDown(0.4);
    doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(CINZA).text(`${recomendacao.aviso} (Regras versão ${recomendacao.versao}.)`, { width: largura });
  }

  const mapas = analise.detalhes?.por_imagem ?? [];
  if (mapas.length) {
    const larguraMapa = (largura - 16) / 2;
    const alturaMapa = larguraMapa * 0.62;
    // Não deixa o título da seção sozinho no fim da página, separado dos mapas.
    if (doc.y + alturaMapa + 110 > doc.page.height - 60) doc.addPage();
    secao(doc, "Mapas de vegetação por imagem");
    doc.font("Helvetica").fontSize(8.5).fillColor(CINZA).text("Verde: vegetação vigorosa · Amarelo: atenção · Vermelho: pouca ou nenhuma vegetação.");
    doc.moveDown(0.4);
    for (const [i, img] of mapas.slice(0, 6).entries()) {
      if (i % 2 === 0 && doc.y + alturaMapa + 30 > doc.page.height - 60) doc.addPage();
      const x = 50 + (i % 2) * (larguraMapa + 16);
      const y = doc.y;
      try {
        const buffer = await fs.readFile(caminho("analises", img.mapa));
        doc.image(buffer, x, y, { fit: [larguraMapa, alturaMapa], align: "center", valign: "center" });
      } catch {
        doc.rect(x, y, larguraMapa, alturaMapa).fill("#F8F9FA");
        doc.font("Helvetica").fontSize(8).fillColor(CINZA).text("Mapa indisponível", x, y + alturaMapa / 2 - 4, { width: larguraMapa, align: "center" });
      }
      doc.font("Helvetica").fontSize(8).fillColor(CINZA)
        .text(`${img.nome} — ${num(img.saudavel)}% vigorosa`, x, y + alturaMapa + 4, { width: larguraMapa, ellipsis: true, height: 10 });
      doc.y = i % 2 === 0 && i < mapas.length - 1 ? y : y + alturaMapa + 22;
    }
    if (mapas.length > 6) doc.font("Helvetica").fontSize(8.5).fillColor(CINZA).text(`+ ${mapas.length - 6} mapa(s) disponíveis na plataforma.`, 50);
  }

  // Rodapé em todas as páginas
  const geradoEm = dataHora(new Date());
  const paginas = doc.bufferedPageRange();
  for (let i = 0; i < paginas.count; i++) {
    doc.switchToPage(i);
    const yRodape = doc.page.height - 40;
    doc.page.margins.bottom = 0;
    doc.font("Helvetica").fontSize(7.5).fillColor(CINZA)
      .text(`Gerado pela AgroVision em ${geradoEm}. Este relatório apoia a decisão e não substitui a avaliação de um engenheiro agrônomo.`, 50, yRodape, { width: largura - 60 })
      .text(`Página ${i + 1} de ${paginas.count}`, 50, yRodape, { width: largura, align: "right" });
  }

  doc.end();
  await fim;
  return Buffer.concat(partes);
}
