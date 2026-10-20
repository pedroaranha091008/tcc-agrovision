// Página do voo: envio de imagens, análise automática e manual, recomendação e PDF.
import fs from "node:fs";
import path from "node:path";
import { ARQUIVOS, criarConta, expect, semRolagemHorizontal, test } from "./apoio";

async function vooVazio(page: Parameters<typeof criarConta>[0]) {
  const { api } = await criarConta(page);
  const prop = await api.post("/propriedades", { nome_fazenda: "Fazenda Santa Clara", cidade: "Jaboticabal", estado: "SP" });
  const tal = await api.post("/talhoes", { id_propriedade: prop.id_propriedade, nome_talhao: "Talhão 3", cultura: "Soja", area_hectares: 60 });
  const voo = await api.post("/voos", { id_talhao: tal.id_talhao, data_voo: "2026-10-18" });
  return { api, idVoo: voo.id_voo };
}

test("envio de imagens com validação, análise automática e PDF", async ({ page }) => {
  const { idVoo } = await vooVazio(page);
  await page.goto(`/dashboard/voos/${idVoo}`);
  await expect(page.getByText("Formatos: JPEG, PNG, TIFF · até 25 MB por arquivo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Analisar imagens" })).toBeDisabled();

  await page.setInputFiles("input[type=file]", ["lavoura.jpg", "talhao-sintetico.jpg", "anotacoes.txt", "disfarcada.jpg"].map(a => path.join(ARQUIVOS, a)));
  await expect(page.getByText("Formato não aceito. Envie JPEG, PNG, TIFF.")).toBeVisible(); // barrado no navegador
  await expect(page.getByText("O arquivo está corrompido ou não é uma imagem válida.")).toBeVisible(); // barrado no servidor
  await expect(page.getByText("Imagens do voo (2)")).toBeVisible();
  await expect.poll(() => page.$$eval("ul.grid img", is => is.filter(i => i.complete && i.naturalWidth > 0).length)).toBe(2);
  await expect(page.getByRole("button", { name: /Tentar enviar disfarcada.jpg/ })).toHaveCount(0); // arquivo inválido não tem "tentar de novo"

  await page.getByRole("button", { name: "Analisar imagens" }).click();
  await expect(page.getByText("Análise concluída")).toBeVisible();
  const cartao = page.locator("article").first();
  await expect(cartao).toContainText("Análise automática");
  await expect(cartao).toContainText(/Vegetação vigorosa \d+,\d%/); // percentual em formato brasileiro
  await expect(cartao).toContainText("não identifica pragas ou doenças");
  await expect(cartao).toContainText("Recomendação:");
  await expect(cartao).toContainText("não substituem a avaliação de um engenheiro agrônomo");
  await expect.poll(() => page.$$eval("article img", is => is.filter(i => i.complete && i.naturalWidth > 0).length)).toBe(2);

  const [download] = await Promise.all([page.waitForEvent("download"), cartao.getByRole("button", { name: "Baixar PDF" }).click()]);
  expect(download.suggestedFilename()).toBe("relatorio-talhao-3-2026-10-18.pdf");
  const pdf = fs.readFileSync(await download.path());
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
});

test("análise manual com validação e recomendação por tipo", async ({ page }) => {
  const { idVoo } = await vooVazio(page);
  await page.goto(`/dashboard/voos/${idVoo}`);
  await page.getByRole("button", { name: "Registrar manualmente" }).click();
  await page.getByRole("button", { name: "Registrar análise" }).click();
  await expect(page.getByText("Selecione o tipo de análise.")).toBeVisible();
  await page.selectOption("#an-tipo", "termico");
  await page.selectOption("#an-nivel", "critico");
  await page.fill("#an-pct", "52,5");
  await page.fill("#an-resultado", "Estresse hídrico severo na face oeste.");
  await page.getByRole("button", { name: "Registrar análise" }).click();
  await expect(page.getByText("Área afetada: 52,5%")).toBeVisible();
  await expect(page.getByText("Recomendação: Ação imediata")).toBeVisible();
  await expect(page.getByText(/irrigação/)).toBeVisible();
  await expect(page.getByText(/talhão inteiro/)).toBeVisible();

  // Voo com análise não pode ser excluído antes dela
  await page.getByRole("button", { name: /Excluir Voo/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Não é possível excluir ainda");
});

test("página do voo cabe no celular @celular", async ({ page }) => {
  const { api, idVoo } = await vooVazio(page);
  await api.enviarImagem(idVoo, "lavoura.jpg");
  await api.post(`/voos/${idVoo}/analises/automatica`, {});
  await page.goto(`/dashboard/voos/${idVoo}`);
  await expect(page.getByText("Análises (1)")).toBeVisible();
  await semRolagemHorizontal(page);
});
