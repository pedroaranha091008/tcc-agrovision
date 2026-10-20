import fs from "node:fs";
import path from "node:path";
import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";

export const API = "http://localhost:3000/api/v1";
export const SENHA = "senha1234";
export const ARQUIVOS = path.join(import.meta.dirname, "arquivos");

let contador = 0;
/** Emails de teste usam um domínio reservado, que o script de limpeza apaga no final. */
export const emailTeste = (nome: string) => `${nome}.${Date.now()}.${++contador}@teste.agrovision.dev`;

export const diasAtras = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

/** Atalhos para montar cenários direto pela API (mais rápido que pela tela). */
export function clienteApi(request: APIRequestContext, token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  return {
    async post<T = Record<string, string>>(caminho: string, data: unknown): Promise<T> {
      const r = await request.post(API + caminho, { data, headers });
      expect(r.ok(), `POST ${caminho} → ${r.status()}`).toBeTruthy();
      return (await r.json()).data;
    },
    async enviarImagem(idVoo: string, arquivo: string) {
      const r = await request.post(`${API}/voos/${idVoo}/imagens`, { headers, multipart: { imagens: { name: arquivo, mimeType: "image/jpeg", buffer: fs.readFileSync(path.join(ARQUIVOS, arquivo)) } } });
      expect(r.ok()).toBeTruthy();
    },
  };
}

/**
 * Cria uma conta e deixa o navegador logado: o cadastro pela API grava o cookie de sessão
 * no mesmo contexto do navegador, e o lembrete "agrovision.sessao" faz o site recuperar a sessão ao abrir.
 */
export async function criarConta(page: Page, nome = "Produtor Teste") {
  const email = emailTeste(nome.split(" ")[0].toLowerCase());
  const r = await page.request.post(`${API}/auth/cadastro`, { data: { nome, email, senha: SENHA } });
  expect(r.status()).toBe(201);
  const { token } = (await r.json()).data;
  await page.addInitScript(() => localStorage.setItem("agrovision.sessao", "1"));
  return { email, token, api: clienteApi(page.request, token) };
}

/** Confere que a página não tem rolagem horizontal (problema comum no celular). */
export async function semRolagemHorizontal(page: Page) {
  const largura = page.viewportSize()!.width;
  await expect.poll(() => page.evaluate(() => Math.max(innerWidth, document.documentElement.scrollWidth))).toBeLessThanOrEqual(largura);
}

/**
 * test com verificação automática: falha se a página tiver erro de JavaScript ou erro no console.
 * Respostas HTTP de erro ("Failed to load resource") são ignoradas porque vários testes as provocam de propósito.
 */
export const test = base.extend<{ semErrosNoConsole: void }>({
  semErrosNoConsole: [async ({ page }, use) => {
    const erros: string[] = [];
    page.on("pageerror", e => erros.push(`Erro de JavaScript: ${e.message}`));
    page.on("console", m => { if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) erros.push(m.text()); });
    await use();
    expect(erros, "erros no console do navegador").toEqual([]);
  }, { auto: true }],
});

export { expect };
