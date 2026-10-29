import { beforeEach, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), delete: vi.fn(), lerPdf: vi.fn(), removerPdf: vi.fn() }));
vi.mock("../../src/config/prisma.js", () => ({ prisma: { relatorio: { findFirst: mocks.findFirst, delete: mocks.delete } } }));
vi.mock("../../src/utils/pdf.js", () => ({ lerPdf: mocks.lerPdf, removerPdf: mocks.removerPdf, gerarPdfRelatorio: vi.fn() }));
import { baixar } from "../../src/controllers/relatorio.controller.js";
import { remover } from "../../src/services/relatorio.service.js";

function app() {
  const servidor = express();
  servidor.get("/:id", (req, _res, next) => { req.usuario = { id_usuario: "dono" }; next(); }, baixar);
  servidor.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: error.message }));
  return servidor;
}
beforeEach(() => vi.resetAllMocks());

it("nao consulta Storage quando o relatorio nao pertence ao usuario", async () => {
  mocks.findFirst.mockResolvedValue(null);
  const res = await request(app()).get("/r1");
  expect(res.status).toBe(404);
  expect(mocks.lerPdf).not.toHaveBeenCalled();
  expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: {
    id_relatorio: "r1", analise: { voo: { talhao: { propriedade: { id_usuario: "dono" } } } },
  } }));
});

it("preserva o download PDF e desabilita cache compartilhado", async () => {
  mocks.findFirst.mockResolvedValue({ id_relatorio: "r1", id_analise: "a1", caminho_pdf: "supabase://arquivos/relatorios/a1.pdf" });
  mocks.lerPdf.mockResolvedValue(Buffer.from("%PDF-teste"));
  const res = await request(app()).get("/r1");
  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toContain("application/pdf");
  expect(res.headers["content-disposition"]).toContain('filename="relatorio-a1.pdf"');
  expect(res.headers["cache-control"]).toBe("private, no-store");
  expect(res.body.toString()).toBe("%PDF-teste");
});

it("mantem o registro MySQL para retry quando a exclusao remota falha", async () => {
  mocks.findFirst.mockResolvedValue({ id_relatorio: "r1", caminho_pdf: "supabase://arquivos/relatorios/a1.pdf" });
  mocks.removerPdf.mockRejectedValue(new Error("indisponivel"));
  await expect(remover("dono", "r1")).rejects.toThrow("indisponivel");
  expect(mocks.delete).not.toHaveBeenCalled();
});
