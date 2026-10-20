// Visão geral com dados reais, histórico de análises e relatórios.
import type { Page } from "@playwright/test";
import { criarConta, diasAtras, expect, semRolagemHorizontal, test } from "./apoio";

/** Duas fazendas, 4 talhões (um sem voos) e 13 análises em datas variadas. */
async function cenario(page: Page) {
  const { api } = await criarConta(page, "Marta Produtora");
  const fA = (await api.post("/propriedades", { nome_fazenda: "Fazenda Aurora", cidade: "Matão", estado: "SP" })).id_propriedade;
  const fB = (await api.post("/propriedades", { nome_fazenda: "Fazenda Bela Vista", cidade: "Uberaba", estado: "MG" })).id_propriedade;
  const tA1 = (await api.post("/talhoes", { id_propriedade: fA, nome_talhao: "Aurora 1", cultura: "Soja", area_hectares: 120 })).id_talhao;
  const tA2 = (await api.post("/talhoes", { id_propriedade: fA, nome_talhao: "Aurora 2", cultura: "Milho", area_hectares: 80 })).id_talhao;
  const tB1 = (await api.post("/talhoes", { id_propriedade: fB, nome_talhao: "Bela 1", cultura: "Café", area_hectares: 40 })).id_talhao;
  await api.post("/talhoes", { id_propriedade: fB, nome_talhao: "Bela 2 (novo)" });
  const riscos = ["baixo", "medio", "alto", "critico"];
  for (let i = 0; i < 12; i++) {
    const talhao = [tA1, tA2, tB1][i % 3];
    const voo = (await api.post("/voos", { id_talhao: talhao, data_voo: diasAtras(5 + i * 25) })).id_voo;
    const nivel = talhao === tB1 && i < 3 ? "critico" : riscos[i % 4];
    await api.post(`/voos/${voo}/analises`, { tipo_analise: i % 2 ? "NDVI" : "RGB", nivel_risco: nivel, percentual_area_afetada: 5 + i * 4, resultado: `Análise ${i}` });
  }
  const antigo = (await api.post("/voos", { id_talhao: tA1, data_voo: diasAtras(400) })).id_voo;
  await api.post(`/voos/${antigo}/analises`, { tipo_analise: "termico", nivel_risco: "baixo", resultado: "Antigo" });
  return { fA, fB, tA1 };
}

test("visão geral mostra os dados reais e guarda os filtros na URL", async ({ page }) => {
  const { fB } = await cenario(page);
  await page.goto("/dashboard");
  await expect(page.getByText("240 ha")).toBeVisible();
  await expect(page.getByText("Vamos começar?")).toHaveCount(0);
  const talhoes = page.locator("section[aria-labelledby=titulo-talhoes] li");
  await expect(talhoes).toHaveCount(4);
  await expect(talhoes.first()).toContainText("Bela 1");
  await expect(talhoes.first()).toContainText("Crítico");
  await expect(page.getByText("Sem análise").first()).toBeVisible();

  await page.selectOption("#filtro-propriedade", fB);
  await expect(page).toHaveURL(new RegExp(`propriedade=${fB}`));
  await expect(talhoes).toHaveCount(2);
  await page.selectOption("#filtro-periodo", "365");
  await page.reload();
  await expect(page.locator("#filtro-periodo")).toHaveValue("365");
  await expect(page.locator("#filtro-propriedade")).toHaveValue(fB);

  await talhoes.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/dashboard\/voos\//);
});

test("histórico: paginação, filtros removíveis e link para a análise", async ({ page }) => {
  const { fA, tA1 } = await cenario(page);
  await page.goto("/dashboard/analises");
  await expect(page.getByText("13 análise(s) encontrada(s)")).toBeVisible();
  await expect(page.locator("table tbody tr")).toHaveCount(10);
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(page).toHaveURL(/pagina=2/);

  await page.selectOption("#f-risco", "critico");
  await expect(page).not.toHaveURL(/pagina=/);
  await expect(page.getByRole("button", { name: "Remover filtro Crítico" })).toBeVisible();
  await expect.poll(async () => {
    const linhas = await page.locator("table tbody tr").count();
    return linhas > 0 && linhas === await page.locator("table tbody tr", { hasText: "Crítico" }).count();
  }).toBe(true);

  await page.selectOption("#f-prop", fA);
  await expect(page.locator("#f-talhao")).toBeEnabled();
  await page.selectOption("#f-talhao", tA1);
  await expect(page.getByRole("button", { name: "Remover filtro Aurora 1" })).toBeVisible();
  await page.getByRole("button", { name: "Remover filtro Fazenda Aurora" }).click();
  await expect(page).not.toHaveURL(/id_talhao|id_propriedade/);

  await page.fill("#f-inicio", diasAtras(10));
  await page.fill("#f-fim", diasAtras(100));
  await expect(page.getByText("A data inicial deve ser anterior à final.")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).first().click();
  await page.selectOption("#f-tipo", "multispectral");
  await expect(page.getByText("Nenhuma análise com esses filtros")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).first().click();

  await page.locator("table tbody tr").first().getByRole("link", { name: /Abrir/ }).click();
  await expect(page).toHaveURL(/#analise-/);
  const alvo = page.url().split("#")[1];
  await expect(page.locator(`#${alvo}`)).toBeInViewport();
});

test("relatórios: pré-visualização e download do PDF", async ({ page }) => {
  await cenario(page);
  await page.goto("/dashboard/relatorios");
  await expect(page.getByRole("button", { name: "Visualizar" })).toHaveCount(10);
  await page.getByRole("button", { name: "Visualizar" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("Recomendação:");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("dialog").getByRole("button", { name: "Baixar PDF" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^relatorio-.+\.pdf$/);
});

test("conta nova não vê dados de demonstração", async ({ page }) => {
  await criarConta(page);
  await page.goto("/dashboard");
  await expect(page.getByText("Vamos começar?")).toBeVisible();
  await expect(page.getByText(/João Silva|Fazenda São João/)).toHaveCount(0);
  await page.goto("/dashboard/relatorios");
  await expect(page.getByText("Nenhum relatório ainda")).toBeVisible();
});

test("painel e histórico cabem no celular @celular", async ({ page }) => {
  await cenario(page);
  for (const url of ["/dashboard", "/dashboard/analises", "/dashboard/relatorios"]) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await semRolagemHorizontal(page);
  }
  await page.goto("/dashboard/analises");
  await expect(page.locator("ul.md\\:hidden li")).toHaveCount(10); // vira cartões
  await expect(page.locator("#form-filtros")).toBeHidden(); // filtros recolhidos
  await page.getByRole("button", { name: "Filtros" }).click();
  await expect(page.locator("#form-filtros")).toBeVisible();
});
