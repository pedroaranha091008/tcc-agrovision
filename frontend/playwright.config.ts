import { defineConfig, devices } from "@playwright/test";

// Testes de ponta a ponta: abrem o site no Chrome instalado na máquina e usam a API e o banco de verdade.
// Pré-requisito: MySQL/MariaDB no ar e backend/.env configurado (veja backend/README.md).
export default defineConfig({
  testDir: "e2e",
  workers: 1, // os testes compartilham o mesmo banco
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-relatorio" }]],
  outputDir: "e2e-resultados",
  use: {
    baseURL: "http://localhost:5173",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: true,
  },
  projects: [
    { name: "computador", use: { viewport: { width: 1366, height: 860 } }, grepInvert: /@celular/ },
    { name: "celular", use: { ...devices["Pixel 7"], channel: "chrome" }, grep: /@celular/ },
  ],
  // Sobe API e site se ainda não estiverem rodando.
  webServer: [
    { command: "npm --prefix ../backend start", url: "http://localhost:3000/api/v1/status", reuseExistingServer: true, timeout: 60_000 },
    { command: "npm run dev -- --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: true, timeout: 60_000 },
  ],
  globalTeardown: "./e2e/limpeza.ts",
});
