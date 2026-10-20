// Conta do cliente: cadastro, login, sessão (cookie httpOnly + renovação) e perfil.
import { criarConta, emailTeste, expect, SENHA, test } from "./apoio";

test.describe("cadastro", () => {
  test("valida senha, confirmação e termos", async ({ page }) => {
    await page.goto("/cadastro");
    await expect(page.locator("nav.fixed")).toHaveCount(0);
    await page.fill("#cad-nome", "Cliente Teste");
    await page.fill("#cad-email", "cliente@teste.com");
    await page.fill("#cad-senha", "123");
    await page.fill("#cad-confirmar", "999");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();
    await expect(page.getByText("As senhas não conferem.")).toBeVisible();
    await expect(page.getByText("É preciso aceitar os termos para criar a conta.")).toBeVisible();
    await expect(page).toHaveURL(/\/cadastro$/);
  });

  test("cria a conta e entra no painel com o nome real e o guia de primeiros passos", async ({ page }) => {
    await page.goto("/cadastro");
    await page.fill("#cad-nome", "Ana Lúcia Ferreira");
    await page.fill("#cad-email", emailTeste("ana"));
    await page.fill("#cad-senha", "minhasenha1");
    await page.fill("#cad-confirmar", "minhasenha1");
    await page.getByRole("radio", { name: "Agrônomo" }).click();
    await page.check("#cad-termos");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator("header")).toContainText("Ana Lúcia Ferreira");
    await expect(page.locator("header")).toContainText("Agrônomo");
    await expect(page.getByText("Vamos começar?")).toBeVisible();
  });
});

test.describe("login e sessão", () => {
  test("senha errada é recusada com mensagem genérica", async ({ page }) => {
    const email = emailTeste("senha");
    await page.request.post("http://localhost:3000/api/v1/auth/cadastro", { data: { nome: "Senha Teste", email, senha: SENHA } });
    await page.goto("/login");
    await page.fill("#login-email", email);
    await page.fill("#login-senha", "outrasenha1");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert")).toContainText("Email ou senha incorretos.");
  });

  test("login mantém a sessão no F5 sem guardar o token no navegador", async ({ page, context }) => {
    const email = emailTeste("login");
    await page.request.post("http://localhost:3000/api/v1/auth/cadastro", { data: { nome: "Login Teste", email, senha: SENHA } });
    await context.clearCookies();
    await page.goto("/dashboard/configuracoes");
    await expect(page).toHaveURL(/\/login$/);
    await page.fill("#login-email", email);
    await page.fill("#login-senha", SENHA);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard\/configuracoes$/); // volta para onde queria ir

    await page.reload();
    await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();

    const armazenado = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
    expect(armazenado).not.toMatch(/eyJ/); // nenhum JWT no localStorage/sessionStorage
    const cookie = (await context.cookies("http://localhost:3000/api/v1/auth")).find(c => c.name === "agrovision_renovacao");
    expect(cookie?.httpOnly).toBe(true);
  });

  test("sem 'manter conectado' o cookie é de sessão; com a opção, dura dias", async ({ page, context }) => {
    const email = emailTeste("lembrar");
    await page.request.post("http://localhost:3000/api/v1/auth/cadastro", { data: { nome: "Lembrar Teste", email, senha: SENHA } });
    for (const lembrar of [false, true]) {
      await context.clearCookies();
      await page.goto("/login");
      await page.fill("#login-email", email);
      await page.fill("#login-senha", SENHA);
      await page.locator("#login-lembrar").setChecked(lembrar);
      await page.getByRole("button", { name: "Entrar" }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
      const cookie = (await context.cookies("http://localhost:3000/api/v1/auth")).find(c => c.name === "agrovision_renovacao")!;
      if (lembrar) expect(cookie.expires * 1000 - Date.now()).toBeGreaterThan(29 * 86400000);
      else expect(cookie.expires).toBe(-1);
      await page.locator("aside").getByRole("button", { name: "Sair" }).click();
      await expect(page).toHaveURL(/\/$/);
    }
  });

  test("sair encerra a sessão: F5 não volta para dentro", async ({ page }) => {
    await criarConta(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Visão Geral" })).toBeVisible();
    await page.locator("aside").getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("nav").getByRole("link", { name: "Entrar" })).toBeVisible();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sessão que caiu no servidor manda para o login ao reabrir", async ({ page, context }) => {
    await criarConta(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Visão Geral" })).toBeVisible();
    await context.clearCookies(); // simula sessão expirada/revogada
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Google aparece como 'em breve' e 'Esqueci a senha' explica o que fazer", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Continuar com Google/ })).toBeDisabled();
    await page.getByRole("button", { name: "Esqueci a senha" }).click();
    await expect(page.getByText("Recuperação de senha em breve")).toBeVisible();
  });
});

test.describe("perfil", () => {
  test("edita telefone e tipo de usuário", async ({ page }) => {
    await criarConta(page, "Perfil Teste");
    await page.goto("/dashboard/configuracoes");
    await page.fill("#cfg-telefone", "1633334444");
    await expect(page.locator("#cfg-telefone")).toHaveValue("(16) 3333-4444");
    await page.selectOption("#cfg-tipo", "empresa");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Perfil atualizado")).toBeVisible();
    await expect(page.locator("header")).toContainText("Empresa");
  });
});
