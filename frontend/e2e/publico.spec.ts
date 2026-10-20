// Site público: o que um visitante vê antes de criar conta.
import { emailTeste, expect, semRolagemHorizontal, test } from "./apoio";

test.describe("página inicial", () => {
  test("carrega com título, idioma, favicon e todas as imagens", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/^AgroVision — /);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("link[rel=icon]")).toHaveCount(1);
    await page.waitForLoadState("networkidle");
    const quebradas = await page.$$eval("img", imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
    expect(quebradas).toEqual([]);
  });

  test("menu rola até as seções", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByRole("button", { name: "Serviços", exact: true }).click();
    await expect(page.locator("#servicos h2")).toBeInViewport();
    await page.locator("nav").getByRole("button", { name: "Contato", exact: true }).click();
    await expect(page.locator("#contato h2")).toBeInViewport();
  });

  test("'Saiba mais' mostra detalhes e 'Solicitar este serviço' preenche o orçamento", async ({ page }) => {
    await page.goto("/");
    await page.locator("#servicos").getByRole("button", { name: "Saiba mais" }).first().click();
    await expect(page.getByText("Mapa de infestação por talhão")).toBeVisible();
    await page.getByRole("button", { name: "Solicitar este serviço" }).click();
    await expect(page.locator("#orc-servico")).toHaveValue("Plantas daninhas");
  });
});

test.describe("orçamento", () => {
  test("recusa dados inválidos e mostra o erro em cada campo", async ({ page }) => {
    await page.goto("/#contato");
    await page.fill("#orc-email", "x@y");
    await page.fill("#orc-hectares", "-5");
    await page.getByRole("button", { name: "Solicitar Análise Gratuita" }).click();
    await expect(page.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(page.getByText(/Informe um email válido/)).toBeVisible();
    await expect(page.getByText("Informe uma área maior que zero.")).toBeVisible();
    await expect(page.locator("#orc-nome")).toBeFocused();
  });

  test("envia para a API e só confirma depois da resposta", async ({ page }) => {
    await page.goto("/#contato");
    await page.fill("#orc-nome", "Maria da Conceição");
    await page.fill("#orc-email", emailTeste("orcamento"));
    await page.fill("#orc-telefone", "16999990000");
    await expect(page.locator("#orc-telefone")).toHaveValue("(16) 99999-0000");
    await page.fill("#orc-cidade", "Ribeirão Preto, SP");
    await page.fill("#orc-hectares", "250");
    await page.selectOption("#orc-cultura", "Café");
    await page.selectOption("#orc-servico", "Falhas de plantio");
    const [resposta] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith("/api/v1/orcamentos")),
      page.getByRole("button", { name: "Solicitar Análise Gratuita" }).click(),
    ]);
    expect(resposta.status()).toBe(201);
    await expect(page.getByText("Solicitação recebida, Maria!")).toBeVisible();
  });

  test("se a API falhar, avisa e mostra os contatos diretos", async ({ page }) => {
    await page.route("**/api/v1/orcamentos", r => r.abort());
    await page.goto("/#contato");
    await page.fill("#orc-nome", "Maria da Conceição");
    await page.fill("#orc-email", "maria@fazenda.com.br");
    await page.fill("#orc-telefone", "16999990000");
    await page.fill("#orc-cidade", "Ribeirão Preto, SP");
    await page.fill("#orc-hectares", "10");
    await page.selectOption("#orc-cultura", "Soja");
    await page.selectOption("#orc-servico", "Falhas de plantio");
    await page.getByRole("button", { name: "Solicitar Análise Gratuita" }).click();
    await expect(page.getByRole("alert")).toContainText("Não foi possível conectar ao servidor");
    await expect(page.getByText(/Solicitação recebida/)).toHaveCount(0);
  });
});

test.describe("rotas", () => {
  test("rodapé leva às páginas legais e o Voltar funciona", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Privacidade" }).click();
    await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible();
    await expect(page.getByText(/cookie de sessão, protegido \(httpOnly\)/)).toBeVisible();
    await page.goBack();
    await expect(page.locator("#hero")).toBeVisible();
  });

  test("endereço inexistente mostra página 404", async ({ page }) => {
    await page.goto("/nao-existe");
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("painel sem login manda para o login", async ({ page }) => {
    await page.goto("/dashboard/fazendas");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("celular @celular", () => {
  test("home, menu e formulário cabem na tela", async ({ page }) => {
    await page.goto("/");
    await semRolagemHorizontal(page);
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.locator("nav div.md\\:hidden")).toContainText("Dashboard");
    await page.getByRole("button", { name: "Fechar menu" }).click();
    await page.locator("#contato").scrollIntoViewIfNeeded();
    const colunas = await page.$eval("#contato form .grid", g => getComputedStyle(g).gridTemplateColumns.split(" ").length);
    expect(colunas).toBe(1);
  });
});
