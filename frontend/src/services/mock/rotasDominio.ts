import type { Propriedade, Talhao, Voo } from "@/types/dominio";
import { ApiError } from "../erros";
import { agora, dominio } from "./dominioStore";
import { paginar, usuarioAutenticado, type Ctx } from "./base";

type Query = URLSearchParams;

function naoEncontrado(msg: string): never {
  throw new ApiError("NAO_ENCONTRADO", msg, 404);
}

function conflito(msg: string, details?: unknown): never {
  throw new ApiError("CONFLITO", msg, 409, details);
}

// ─── Propriedades ────────────────────────────────────────────────────────────

function minhasPropriedades(idUsuario: string): Propriedade[] {
  return dominio.propriedades.filter((p) => p.id_usuario === idUsuario);
}

function acharPropriedade(id: string, idUsuario: string): Propriedade {
  const p = dominio.propriedades.find((x) => x.id_propriedade === id && x.id_usuario === idUsuario);
  if (!p) naoEncontrado("Propriedade não encontrada");
  return p;
}

function acharTalhao(id: string, idUsuario: string): Talhao {
  const t = dominio.talhoes.find((x) => x.id_talhao === id);
  if (!t) naoEncontrado("Talhão não encontrado");
  acharPropriedade(t.id_propriedade, idUsuario); // valida posse
  return t;
}

function acharVoo(id: string, idUsuario: string): Voo {
  const v = dominio.voos.find((x) => x.id_voo === id);
  if (!v) naoEncontrado("Voo não encontrado");
  acharTalhao(v.id_talhao, idUsuario); // valida posse
  return v;
}

export const rotasDominio: Array<{
  metodo: string;
  regex: RegExp;
  handler: (ctx: Ctx, params: Record<string, string>, query: Query) => unknown;
}> = [
  // Propriedades
  {
    metodo: "GET",
    regex: /^\/propriedades$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      let itens = minhasPropriedades(u.id_usuario);
      const estado = q.get("estado");
      const busca = q.get("busca")?.toLowerCase();
      if (estado) itens = itens.filter((p) => p.estado === estado.toUpperCase());
      if (busca) itens = itens.filter((p) => p.nome_fazenda.toLowerCase().includes(busca));
      itens = [...itens].sort((a, b) => b.criado_em.localeCompare(a.criado_em));
      return paginar(itens, q);
    },
  },
  {
    metodo: "POST",
    regex: /^\/propriedades$/,
    handler: (c) => {
      const u = usuarioAutenticado();
      const b = c.body as Partial<Propriedade>;
      const nova: Propriedade = {
        id_propriedade: crypto.randomUUID(),
        id_usuario: u.id_usuario,
        nome_fazenda: String(b.nome_fazenda),
        estado: String(b.estado).toUpperCase(),
        cidade: String(b.cidade),
        area_total_hectares: b.area_total_hectares ?? null,
        criado_em: agora(),
        atualizado_em: agora(),
      };
      dominio.propriedades.push(nova);
      dominio.salvar("propriedades");
      return { data: nova };
    },
  },
  {
    metodo: "GET",
    regex: /^\/propriedades\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      return { data: acharPropriedade(p.id, u.id_usuario) };
    },
  },
  {
    metodo: "PATCH",
    regex: /^\/propriedades\/(?<id>[^/]+)$/,
    handler: (c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharPropriedade(p.id, u.id_usuario);
      const b = c.body as Partial<Propriedade>;
      Object.assign(alvo, {
        nome_fazenda: b.nome_fazenda ?? alvo.nome_fazenda,
        estado: b.estado ? String(b.estado).toUpperCase() : alvo.estado,
        cidade: b.cidade ?? alvo.cidade,
        area_total_hectares:
          b.area_total_hectares === undefined ? alvo.area_total_hectares : b.area_total_hectares,
        atualizado_em: agora(),
      });
      dominio.salvar("propriedades");
      return { data: alvo };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/propriedades\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharPropriedade(p.id, u.id_usuario);
      const deps = dominio.talhoes.filter((t) => t.id_propriedade === alvo.id_propriedade).length;
      if (deps > 0) conflito("Propriedade possui talhões vinculados", { talhoes: deps });
      dominio.propriedades = dominio.propriedades.filter((x) => x.id_propriedade !== alvo.id_propriedade);
      dominio.salvar("propriedades");
      return { data: undefined };
    },
  },

  // Talhoes
  {
    metodo: "GET",
    regex: /^\/talhoes$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      const idsMinhas = new Set(minhasPropriedades(u.id_usuario).map((p) => p.id_propriedade));
      let itens = dominio.talhoes.filter((t) => idsMinhas.has(t.id_propriedade));
      const idProp = q.get("id_propriedade");
      const status = q.get("status");
      const cultura = q.get("cultura")?.toLowerCase();
      if (idProp) itens = itens.filter((t) => t.id_propriedade === idProp);
      if (status) itens = itens.filter((t) => t.status === status);
      if (cultura) itens = itens.filter((t) => (t.cultura ?? "").toLowerCase().includes(cultura));
      itens = [...itens].sort((a, b) => b.criado_em.localeCompare(a.criado_em));
      return paginar(itens, q);
    },
  },
  {
    metodo: "POST",
    regex: /^\/talhoes$/,
    handler: (c) => {
      const u = usuarioAutenticado();
      const b = c.body as Partial<Talhao>;
      acharPropriedade(String(b.id_propriedade), u.id_usuario);
      const novo: Talhao = {
        id_talhao: crypto.randomUUID(),
        id_propriedade: String(b.id_propriedade),
        nome_talhao: String(b.nome_talhao),
        cultura: b.cultura ?? null,
        area_hectares: b.area_hectares ?? null,
        latitude: b.latitude ?? null,
        longitude: b.longitude ?? null,
        geojson: b.geojson ?? null,
        status: b.status ?? "ativo",
        criado_em: agora(),
        atualizado_em: agora(),
      };
      dominio.talhoes.push(novo);
      dominio.salvar("talhoes");
      return { data: novo };
    },
  },
  {
    metodo: "GET",
    regex: /^\/talhoes\/(?<id>[^/]+)$/,
    handler: (_c, p) => ({ data: acharTalhao(p.id, usuarioAutenticado().id_usuario) }),
  },
  {
    metodo: "PATCH",
    regex: /^\/talhoes\/(?<id>[^/]+)$/,
    handler: (c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharTalhao(p.id, u.id_usuario);
      const b = c.body as Partial<Talhao>;
      for (const k of ["nome_talhao", "cultura", "area_hectares", "latitude", "longitude", "status", "geojson"] as const) {
        if (b[k] !== undefined) (alvo as unknown as Record<string, unknown>)[k] = b[k];
      }
      alvo.atualizado_em = agora();
      dominio.salvar("talhoes");
      return { data: alvo };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/talhoes\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharTalhao(p.id, u.id_usuario);
      const deps = dominio.voos.filter((v) => v.id_talhao === alvo.id_talhao).length;
      if (deps > 0) conflito("Talhão possui voos vinculados", { voos: deps });
      dominio.talhoes = dominio.talhoes.filter((x) => x.id_talhao !== alvo.id_talhao);
      dominio.salvar("talhoes");
      return { data: undefined };
    },
  },

  // Voos
  {
    metodo: "GET",
    regex: /^\/voos$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      const idsMinhas = new Set(minhasPropriedades(u.id_usuario).map((p) => p.id_propriedade));
      const idsTalhoes = new Set(
        dominio.talhoes.filter((t) => idsMinhas.has(t.id_propriedade)).map((t) => t.id_talhao),
      );
      let itens = dominio.voos.filter((v) => idsTalhoes.has(v.id_talhao));
      const idTalhao = q.get("id_talhao");
      const inicio = q.get("data_inicio");
      const fim = q.get("data_fim");
      if (idTalhao) itens = itens.filter((v) => v.id_talhao === idTalhao);
      if (inicio) itens = itens.filter((v) => v.data_voo >= inicio);
      if (fim) itens = itens.filter((v) => v.data_voo <= fim);
      itens = [...itens].sort((a, b) => b.data_voo.localeCompare(a.data_voo));
      return paginar(itens, q);
    },
  },
  {
    metodo: "POST",
    regex: /^\/voos$/,
    handler: (c) => {
      const u = usuarioAutenticado();
      const b = c.body as Partial<Voo>;
      acharTalhao(String(b.id_talhao), u.id_usuario);
      const novo: Voo = {
        id_voo: crypto.randomUUID(),
        id_talhao: String(b.id_talhao),
        data_voo: new Date(String(b.data_voo)).toISOString(),
        altitude_metros: b.altitude_metros ?? null,
        modelo_drone: b.modelo_drone ?? null,
        operador: b.operador ?? null,
        observacoes: b.observacoes ?? null,
        status_processamento: "pendente",
        criado_em: agora(),
      };
      dominio.voos.push(novo);
      dominio.salvar("voos");
      return { data: novo };
    },
  },
  {
    metodo: "GET",
    regex: /^\/voos\/(?<id>[^/]+)$/,
    handler: (_c, p) => ({ data: acharVoo(p.id, usuarioAutenticado().id_usuario) }),
  },
  {
    metodo: "PATCH",
    regex: /^\/voos\/(?<id>[^/]+)$/,
    handler: (c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharVoo(p.id, u.id_usuario);
      const b = c.body as Partial<Voo>;
      for (const k of [
        "data_voo",
        "altitude_metros",
        "modelo_drone",
        "operador",
        "observacoes",
        "status_processamento",
      ] as const) {
        if (b[k] !== undefined) (alvo as unknown as Record<string, unknown>)[k] = b[k];
      }
      dominio.salvar("voos");
      return { data: alvo };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/voos\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharVoo(p.id, u.id_usuario);
      dominio.voos = dominio.voos.filter((x) => x.id_voo !== alvo.id_voo);
      dominio.salvar("voos");
      return { data: undefined };
    },
  },
];
