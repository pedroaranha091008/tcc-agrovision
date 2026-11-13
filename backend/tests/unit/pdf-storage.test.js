import { expect, it, vi } from "vitest";

const salvar = vi.hoisted(() => vi.fn().mockResolvedValue("supabase://arquivos/relatorios/relatorio-a1.pdf"));
vi.mock("../../src/utils/arquivos.js", () => ({ criarArmazenamento: () => ({ salvar }) }));
vi.mock("../../src/config/env.js", () => ({ default: { report: { dir: "./relatorios" } } }));
vi.mock("../../src/utils/storage.js", () => ({ mapas: { ler: vi.fn() } }));
import { gerarPdfRelatorio } from "../../src/utils/pdf.js";

it("gera um PDF real em memoria e o entrega ao storage", async () => {
  const resultado = await gerarPdfRelatorio({
    propriedade: { nome_fazenda: "Teste", cidade: "Teste", estado: "SP" },
    talhao: { nome_talhao: "Talhao", cultura: "Milho", area_hectares: 1 },
    voo: { data_voo: "2026-10-29" },
    analise: {
      id_analise: "a1",
      tipo_analise: "RGB",
      nivel_risco: "baixo",
      resultado: "Teste",
      data_analise: "2026-10-29T12:00:00Z",
    },
    recomendacao: {
      titulo: "Teste",
      prazo: "30 dias",
      acoes: ["Recomendacao de teste"],
      aviso: "Aviso de teste.",
      versao: "2.0.0",
    },
  });
  expect(resultado.caminho).toBe("supabase://arquivos/relatorios/relatorio-a1.pdf");
  const [bytes, nome, mime, upsert] = salvar.mock.calls[0];
  expect(Buffer.isBuffer(bytes)).toBe(true);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.toString()).toContain("%%EOF");
  expect([nome, mime, upsert]).toEqual(["relatorio-a1.pdf", "application/pdf", true]);
});
