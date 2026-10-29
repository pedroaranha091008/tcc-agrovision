import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const mocks = vi.hoisted(() => ({
  env: { storage: { provider: "local", bucket: "arquivos", url: "https://projeto.invalid", secretKey: "segredo-teste" } },
  upload: vi.fn(), remove: vi.fn(), download: vi.fn(), from: vi.fn(),
}));
vi.mock("../../src/config/env.js", () => ({ default: mocks.env }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ storage: { from: mocks.from } }) }));
import { criarArmazenamento } from "../../src/utils/arquivos.js";

let dir;
beforeEach(async () => {
  vi.clearAllMocks();
  mocks.env.storage.provider = "local";
  mocks.from.mockReturnValue({ upload: mocks.upload, remove: mocks.remove, download: mocks.download });
  mocks.upload.mockResolvedValue({ data: {}, error: null });
  mocks.remove.mockResolvedValue({ data: [], error: null });
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "agrovision-storage-"));
});
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe("armazenamento local e Supabase privado", () => {
  it("salva, le, substitui PDF e remove arquivo local", async () => {
    const store = criarArmazenamento(dir, "relatorios");
    const ref = await store.salvar(Buffer.from("original"), "teste.pdf", "application/pdf");
    expect((await store.ler(ref)).toString()).toBe("original");
    await store.salvar(Buffer.from("novo"), "teste.pdf", "application/pdf", true);
    expect((await store.ler(ref)).toString()).toBe("novo");
    await store.remover(ref);
    await expect(store.ler(ref)).rejects.toMatchObject({ status: 404 });
  });

  it("impede leitura e exclusao fora da pasta local", async () => {
    const store = criarArmazenamento(dir, "imagens");
    const fora = path.join(dir, "..", "fora.jpg");
    await expect(store.ler(fora)).rejects.toMatchObject({ status: 400 });
    await expect(store.remover(fora)).rejects.toMatchObject({ status: 400 });
    await expect(store.salvar(Buffer.from("x"), "../fora.jpg", "image/jpeg")).rejects.toMatchObject({ status: 400 });
  });

  it("envia bytes/MIME ao bucket e le/remove por referencia sem URL publica", async () => {
    mocks.env.storage.provider = "supabase";
    const store = criarArmazenamento(dir, "imagens");
    const bytes = Buffer.from("imagem");
    const ref = await store.salvar(bytes, "foto.tiff", "image/tiff");
    expect(ref).toBe("supabase://arquivos/imagens/foto.tiff");
    expect(mocks.upload).toHaveBeenCalledWith("imagens/foto.tiff", bytes, { contentType: "image/tiff", upsert: false });
    mocks.download.mockResolvedValue({ data: new Blob([bytes]), error: null });
    expect(await store.ler(ref)).toEqual(bytes);
    await store.remover(ref);
    expect(mocks.remove).toHaveBeenCalledWith(["imagens/foto.tiff"]);
    expect(await fs.readdir(dir)).toEqual([]);
  });

  it("rejeita outro bucket, prefixo e traversal antes de acessar o provedor", async () => {
    mocks.env.storage.provider = "supabase";
    const store = criarArmazenamento(dir, "imagens");
    for (const ref of ["supabase://outro/imagens/a.jpg", "supabase://arquivos/relatorios/a.pdf", "supabase://arquivos/imagens/../a.jpg"]) {
      await expect(store.ler(ref)).rejects.toMatchObject({ status: 400 });
      await expect(store.remover(ref)).rejects.toMatchObject({ status: 400 });
    }
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("nao grava no disco quando o Supabase falha e nao expoe detalhes", async () => {
    mocks.env.storage.provider = "supabase";
    mocks.upload.mockResolvedValue({ error: { message: "detalhe privado" } });
    const store = criarArmazenamento(dir, "imagens");
    await expect(store.salvar(Buffer.from("x"), "foto.jpg", "image/jpeg")).rejects.toMatchObject({ status: 503, code: "ARMAZENAMENTO_INDISPONIVEL" });
    expect(await fs.readdir(dir)).toEqual([]);
    mocks.remove.mockRejectedValue(new Error("segredo"));
    await expect(store.remover("supabase://arquivos/imagens/foto.jpg")).rejects.toMatchObject({ status: 503 });
  });

  it("ainda le referencia local antiga quando novos uploads usam Supabase", async () => {
    const store = criarArmazenamento(dir, "imagens");
    const ref = await store.salvar(Buffer.from("antigo"), "foto.jpg", "image/jpeg");
    mocks.env.storage.provider = "supabase";
    expect((await store.ler(ref)).toString()).toBe("antigo");
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
