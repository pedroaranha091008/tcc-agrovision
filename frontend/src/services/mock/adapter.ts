import type { ApiEnvelope } from "@/types/api";
import type { ImagemVoo } from "@/types/dominio";
import { ApiError } from "../erros";
import { mockDb, paraUsuarioPublico } from "./db";
import { abrirSessao, idDoToken, usuarioAutenticado, type Ctx } from "./base";
import { rotasDominio, acharVoo, acharAnalise } from "./rotasDominio";
import { agora, dominio } from "./dominioStore";
import {
  UPLOAD_ALLOWED_MIME,
  UPLOAD_MAX_FILE_MB,
  UPLOAD_MAX_FILES,
  extensaoValida,
} from "@/features/voos/uploadConfig";

/**
 * Adaptador do modo mock (VITE_API_MOCK=true). Implementa auth/perfil aqui e
 * delega o dominio agricola para rotasDominio.
 */

const LATENCIA_MS = 300;
const espera = () => new Promise((r) => setTimeout(r, LATENCIA_MS));

type Handler = (ctx: Ctx, params: Record<string, string>, query: URLSearchParams) => unknown;

const rotasAuth: Array<{ metodo: string; regex: RegExp; handler: Handler }> = [
  {
    metodo: "POST",
    regex: /^\/auth\/registro$/,
    handler: ({ body }) => {
      const b = body as { nome: string; email: string; senha: string; telefone?: string };
      if (mockDb.acharPorEmail(b.email)) {
        throw new ApiError("CONFLITO", "Não foi possível concluir o cadastro com esses dados", 409);
      }
      const u = mockDb.criarUsuario({
        nome: b.nome,
        email: b.email,
        senha: b.senha,
        telefone: b.telefone ?? null,
        provedor_auth: "local",
      });
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/login$/,
    handler: ({ body }) => {
      const b = body as { email: string; senha: string };
      const u = mockDb.acharPorEmail(b.email);
      if (!u || u.senha !== b.senha) {
        throw new ApiError("CREDENCIAIS_INVALIDAS", "Credenciais inválidas", 401);
      }
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/google$/,
    handler: () => {
      const email = "google.demo@agrovision.local";
      let u = mockDb.acharPorEmail(email);
      if (!u) {
        u = mockDb.criarUsuario({
          nome: "Usuário Google (demo)",
          email,
          senha: null,
          provedor_auth: "google",
          google_sub: "mock-google-sub",
          email_verificado: true,
        });
      }
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/refresh$/,
    handler: ({ body }) => {
      const b = body as { refresh_token: string };
      const id = mockDb.refreshTokens.get(b.refresh_token) ?? idDoToken(b.refresh_token);
      const u = id ? mockDb.acharPorId(id) : undefined;
      if (!u) throw new ApiError("SESSAO_EXPIRADA", "Sessão inválida ou expirada", 401);
      mockDb.refreshTokens.delete(b.refresh_token);
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/logout$/,
    handler: ({ body }) => {
      const b = body as { refresh_token: string };
      mockDb.refreshTokens.delete(b.refresh_token);
      return { data: { mensagem: "Sessão encerrada" } };
    },
  },
  {
    metodo: "GET",
    regex: /^\/usuarios\/me$/,
    handler: () => ({ data: paraUsuarioPublico(usuarioAutenticado()) }),
  },
  {
    metodo: "PATCH",
    regex: /^\/usuarios\/me$/,
    handler: ({ body }) => {
      const u = usuarioAutenticado();
      const b = body as { nome?: string; telefone?: string | null; senha?: string };
      if (b.nome !== undefined) u.nome = b.nome;
      if (b.telefone !== undefined) u.telefone = b.telefone;
      if (b.senha !== undefined) u.senha = b.senha;
      u.atualizado_em = new Date().toISOString();
      mockDb.persistir();
      return { data: paraUsuarioPublico(u) };
    },
  },
];

const TODAS = [...rotasAuth, ...rotasDominio];

export async function mockRequest<T>(metodo: string, caminho: string, ctx: Ctx): Promise<ApiEnvelope<T>> {
  await espera();
  const [semQuery, queryStr = ""] = caminho.split("?");
  const query = new URLSearchParams(queryStr);

  for (const rota of TODAS) {
    if (rota.metodo !== metodo) continue;
    const m = semQuery.match(rota.regex);
    if (!m) continue;
    return (rota.handler as Handler)(ctx, m.groups ?? {}, query) as ApiEnvelope<T>;
  }
  throw new ApiError("NAO_ENCONTRADO", `Mock sem rota para ${metodo} ${semQuery}`, 404);
}

const REGEX_UPLOAD = /^\/voos\/(?<id>[^/]+)\/imagens$/;

/**
 * Simula o upload multipart com progresso incremental por arquivo,
 * respeitando os mesmos limites documentados no backend (UPLOAD_*).
 */
export async function mockUpload<T>(
  caminho: string,
  formData: FormData,
  onProgresso?: (p: number) => void,
  signal?: AbortSignal,
): Promise<ApiEnvelope<T>> {
  const m = caminho.match(REGEX_UPLOAD);
  if (!m?.groups) throw new ApiError("NAO_ENCONTRADO", `Mock sem rota de upload para ${caminho}`, 404);

  const usuario = usuarioAutenticado();
  const voo = acharVoo(m.groups.id, usuario.id_usuario);

  const arquivos = formData.getAll("imagens").filter((v): v is File => v instanceof File);
  if (arquivos.length === 0) {
    throw new ApiError("REQUISICAO_INVALIDA", "Envie ao menos uma imagem no campo 'imagens'", 400);
  }
  if (arquivos.length > UPLOAD_MAX_FILES) {
    throw new ApiError("REQUISICAO_INVALIDA", `Máximo de ${UPLOAD_MAX_FILES} arquivos por envio`, 400);
  }
  for (const f of arquivos) {
    if (!UPLOAD_ALLOWED_MIME.includes(f.type) || !extensaoValida(f.name)) {
      throw new ApiError("TIPO_NAO_SUPORTADO", `Arquivo "${f.name}" tem tipo não permitido`, 415);
    }
    if (f.size > UPLOAD_MAX_FILE_MB * 1024 * 1024) {
      throw new ApiError("ARQUIVO_GRANDE", `Arquivo "${f.name}" excede ${UPLOAD_MAX_FILE_MB} MB`, 413);
    }
  }

  const novas: ImagemVoo[] = [];
  for (let i = 0; i < arquivos.length; i++) {
    const f = arquivos[i];
    for (let p = 20; p <= 100; p += 20) {
      if (signal?.aborted) throw new DOMException("Upload cancelado", "AbortError");
      await new Promise((r) => setTimeout(r, 90));
      const percentualGlobal = Math.round(((i + p / 100) / arquivos.length) * 100);
      onProgresso?.(percentualGlobal);
    }
    novas.push({
      id_imagem: crypto.randomUUID(),
      id_voo: voo.id_voo,
      nome_original: f.name,
      nome_armazenado: `${Date.now()}-${f.name}`,
      mime_type: f.type,
      tamanho_bytes: f.size,
      caminho: URL.createObjectURL(f),
      criado_em: agora(),
    });
  }

  dominio.imagens.push(...novas);
  return { data: novas as unknown as T };
}

const REGEX_DOWNLOAD = /^\/relatorios\/(?<id>[^/]+)\/download$/;

/**
 * Gera um PDF de demonstracao no navegador (via canvas) para o modo mock,
 * ja que nao ha backend real produzindo o arquivo.
 */
export async function mockDownload(caminho: string): Promise<Blob> {
  const m = caminho.match(REGEX_DOWNLOAD);
  if (!m?.groups) throw new ApiError("NAO_ENCONTRADO", `Mock sem rota de download para ${caminho}`, 404);

  const usuario = usuarioAutenticado();
  const relatorio = dominio.relatorios.find((r) => r.id_relatorio === m.groups!.id);
  if (!relatorio) throw new ApiError("NAO_ENCONTRADO", "Relatório não encontrado", 404);
  acharAnalise(relatorio.id_analise, usuario.id_usuario);

  await new Promise((r) => setTimeout(r, 400));

  const texto = [
    "AgroVision - Relatorio de Analise (demonstracao/mock)",
    `Relatorio: ${relatorio.id_relatorio}`,
    `Analise: ${relatorio.id_analise}`,
    `Versao das regras: ${relatorio.versao_regras}`,
    `Gerado em: ${relatorio.gerado_em}`,
    "",
    "Recomendacao:",
    relatorio.recomendacao,
  ].join("\n");

  return new Blob([texto], { type: "application/pdf" });
}
