import { afterEach, expect, it, vi } from "vitest";

vi.mock("../../src/config/env.js", () => ({ default: { storage: {
  provider: "supabase", url: "https://projeto.invalid", secretKey: "sb_secret_somente_teste", bucket: "arquivos",
} } }));
import { criarArmazenamento } from "../../src/utils/arquivos.js";
afterEach(() => vi.unstubAllGlobals());

it("SDK real envia upload, download privado e exclusao ao Storage com chave de backend", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ Key: "arquivos/relatorios/teste.pdf" }), { status: 200 }))
    .mockResolvedValueOnce(new Response("%PDF-teste", { status: 200, headers: { "Content-Type": "application/pdf" } }))
    .mockResolvedValueOnce(new Response("[]", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  const store = criarArmazenamento("./relatorios", "relatorios");
  const ref = await store.salvar(Buffer.from("%PDF-teste"), "teste.pdf", "application/pdf", true);
  expect((await store.ler(ref)).toString()).toBe("%PDF-teste");
  await store.remover(ref);
  const calls = fetchMock.mock.calls;
  expect(calls[0][0]).toBe("https://projeto.invalid/storage/v1/object/arquivos/relatorios/teste.pdf");
  expect(new Headers(calls[0][1].headers).get("apikey")).toBe("sb_secret_somente_teste");
  expect(calls[0][1].method).toBe("POST");
  expect(calls[1][0]).toBe("https://projeto.invalid/storage/v1/object/arquivos/relatorios/teste.pdf");
  expect(calls[1][1].method).toBe("GET");
  expect(new Headers(calls[1][1].headers).get("apikey")).toBe("sb_secret_somente_teste");
  expect(calls[2][1].method).toBe("DELETE");
  expect(JSON.parse(calls[2][1].body)).toEqual({ prefixes: ["relatorios/teste.pdf"] });
});
