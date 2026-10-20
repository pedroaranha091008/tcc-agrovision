// Propriedade → talhão → voo: cadastro, navegação, edição, exclusão e isolamento entre usuários.
import { criarConta, expect, semRolagemHorizontal, test } from "./apoio";

test("percorre toda a hierarquia pela tela", async ({ page }) => {
  await criarConta(page);
  await page.goto("/dashboard/fazendas");
  await expect(page.getByText("Cadastre sua primeira fazenda")).toBeVisible();

  // Propriedade (com validação)
  await page.getByRole("button", { name: "Nova propriedade" }).click();
  await page.getByRole("button", { name: "Cadastrar propriedade" }).click();
  await expect(page.getByText("Informe o nome da fazenda.")).toBeVisible();
  await page.fill("#prop-nome", "Fazenda Boa Esperança");
  await page.fill("#prop-cidade", "Sertãozinho");
  await page.selectOption("#prop-estado", "SP");
  await page.fill("#prop-area", "450,5");
  await page.getByRole("button", { name: "Cadastrar propriedade" }).click();
  await expect(page.getByRole("heading", { name: "Fazenda Boa Esperança" })).toBeVisible();
  await expect(page.getByText("450,5 ha")).toBeVisible();
  const urlPropriedade = page.url();

  // Talhões
  await page.getByRole("button", { name: "Cadastrar primeiro talhão" }).click();
  await page.fill("#tal-nome", "Talhão Norte");
  await page.selectOption("#tal-cultura", "Soja");
  await page.fill("#tal-area", "120");
  await page.fill("#tal-lat", "-95");
  await page.getByRole("button", { name: "Cadastrar talhão" }).click();
  await expect(page.getByText("A latitude deve ser no mínimo -90.")).toBeVisible();
  await page.fill("#tal-lat", "-21.1375");
  await page.fill("#tal-lng", "-47.9903");
  await page.getByRole("button", { name: "Cadastrar talhão" }).click();
  await expect(page.getByRole("link", { name: "Talhão Norte" })).toBeVisible();
  await page.getByRole("button", { name: "Novo talhão" }).click();
  await page.fill("#tal-nome", "Talhão Sul");
  await page.fill("#tal-area", "80");
  await page.getByRole("button", { name: "Cadastrar talhão" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.getByText("200 ha")).toBeVisible(); // soma das áreas

  // Voo
  await page.getByRole("link", { name: "Talhão Norte" }).click();
  await expect(page.getByRole("link", { name: "-21.1375, -47.9903" })).toBeVisible();
  await page.getByRole("button", { name: "Registrar primeiro voo" }).click();
  await page.fill("#voo-data", "2026-10-12");
  await page.fill("#voo-drone", "DJI Mavic 3M");
  await page.getByRole("button", { name: "Registrar voo" }).click();
  await expect(page.getByRole("heading", { name: "Voo de 12/10/2026" })).toBeVisible(); // sem voltar um dia
  await expect(page.locator("nav[aria-label='Você está em'] li")).toHaveCount(4);

  // Exclusão: propriedade com talhões é bloqueada; talhão sem voos pode ser excluído
  await page.goto(urlPropriedade);
  await page.getByRole("button", { name: "Excluir Fazenda Boa Esperança" }).click();
  await expect(page.getByRole("dialog")).toContainText("Exclua os talhões primeiro");
  await expect(page.getByRole("dialog").getByRole("button", { name: "Excluir" })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: "Entendi" }).click();
  await page.getByRole("link", { name: "Talhão Sul" }).click();
  await page.getByRole("button", { name: "Excluir Talhão Sul" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page).toHaveURL(urlPropriedade);
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("outro usuário não abre a fazenda pela URL", async ({ page, browser }) => {
  const { api } = await criarConta(page);
  const prop = await api.post("/propriedades", { nome_fazenda: "Fazenda Privada", cidade: "Franca", estado: "SP" });

  const outroContexto = await browser.newContext();
  const outraPagina = await outroContexto.newPage();
  await criarConta(outraPagina, "Curioso Teste");
  await outraPagina.goto(`/dashboard/fazendas/${prop.id_propriedade}`);
  await expect(outraPagina.getByText("Não encontrado")).toBeVisible();
  await outroContexto.close();
});

test("propriedade e modal cabem no celular @celular", async ({ page }) => {
  const { api } = await criarConta(page);
  const prop = await api.post("/propriedades", { nome_fazenda: "Fazenda Celular", cidade: "Franca", estado: "SP" });
  await api.post("/talhoes", { id_propriedade: prop.id_propriedade, nome_talhao: "T1", cultura: "Soja", area_hectares: 10 });
  await page.goto(`/dashboard/fazendas/${prop.id_propriedade}`);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await semRolagemHorizontal(page);
  await page.getByRole("button", { name: "Novo talhão" }).click();
  const largura = await page.getByRole("dialog").evaluate(d => d.getBoundingClientRect().width);
  expect(largura).toBeLessThanOrEqual(page.viewportSize()!.width);
});
