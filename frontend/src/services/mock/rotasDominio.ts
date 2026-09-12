import type { Analise, Propriedade, Talhao, Voo } from "@/types/dominio";
import type { Relatorio } from "@/types/relatorio";
import { ApiError } from "../erros";
import { agora, dominio } from "./dominioStore";
import { paginar, usuarioAutenticado, type Ctx } from "./base";
import { gerarRecomendacao, VERSAO_REGRAS } from "./recomendacao";

type Query = URLSearchParams;

function naoEncontrado(msg: string): never {
  throw new ApiError("NAO_ENCONTRADO", msg, 404);
}

function conflito(msg: string, details?: unknown): never {
  throw new ApiError("CONFLITO", msg, 409, details);
}

// Filtros "ate" (data_fim) chegam como "2026-02-01" (so a data, de um
// <input type="date">), mas os registros sao strings ISO completas com hora
// ("2026-02-01T14:00:00.000Z"). Comparando string a string, um registro feito
// mais tarde no mesmo dia escolhido e sempre "maior" que a data pura e
// ficaria de fora de um "<=" — por isso empurramos o limite pro fim do dia
// antes de comparar (mesmo raciocinio usado no backend real).
function fimDoDia(dataSomente: string): string {
  return `${dataSomente}T23:59:59.999Z`;
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

export function acharVoo(id: string, idUsuario: string): Voo {
  const v = dominio.voos.find((x) => x.id_voo === id);
  if (!v) naoEncontrado("Voo não encontrado");
  acharTalhao(v.id_talhao, idUsuario); // valida posse
  return v;
}

export function acharAnalise(id: string, idUsuario: string): Analise {
  const a = dominio.analises.find((x) => x.id_analise === id);
  if (!a) naoEncontrado("Análise não encontrada");
  acharVoo(a.id_voo, idUsuario); // valida posse
  return a;
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
      if (fim) itens = itens.filter((v) => v.data_voo <= fimDoDia(fim));
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
      // Mesma regra do backend real: nao apagar um voo que ainda tem
      // analises ou imagens, para nao deixar registros orfaos e inacessiveis.
      const analises = dominio.analises.filter((a) => a.id_voo === alvo.id_voo).length;
      if (analises > 0) conflito("Voo possui análises vinculadas", { analises });
      const imagens = dominio.imagens.filter((i) => i.id_voo === alvo.id_voo).length;
      if (imagens > 0) {
        conflito("Voo possui imagens vinculadas; remova as imagens primeiro", { imagens });
      }
      dominio.voos = dominio.voos.filter((x) => x.id_voo !== alvo.id_voo);
      dominio.salvar("voos");
      return { data: undefined };
    },
  },

  // Imagens do voo (upload real vai por mockUpload, ver imagensMock.ts)
  {
    metodo: "GET",
    regex: /^\/voos\/(?<id>[^/]+)\/imagens$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      acharVoo(p.id, u.id_usuario);
      return { data: dominio.imagens.filter((i) => i.id_voo === p.id) };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/voos\/(?<id>[^/]+)\/imagens\/(?<idImagem>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      acharVoo(p.id, u.id_usuario);
      const img = dominio.imagens.find((i) => i.id_imagem === p.idImagem && i.id_voo === p.id);
      if (!img) naoEncontrado("Imagem não encontrada");
      dominio.imagens = dominio.imagens.filter((i) => i.id_imagem !== img.id_imagem);
      // O mock cria uma blob: URL por imagem enviada (ver mockUpload); sem
      // revogar, cada envio+exclusao vaza memoria pelo resto da sessao da aba.
      if (img.caminho.startsWith("blob:")) URL.revokeObjectURL(img.caminho);
      return { data: undefined };
    },
  },

  // Analises
  {
    metodo: "GET",
    regex: /^\/analises$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      const idsMinhas = new Set(minhasPropriedades(u.id_usuario).map((p) => p.id_propriedade));
      const idsTalhoes = new Set(
        dominio.talhoes.filter((t) => idsMinhas.has(t.id_propriedade)).map((t) => t.id_talhao),
      );
      const idsVoos = new Set(dominio.voos.filter((v) => idsTalhoes.has(v.id_talhao)).map((v) => v.id_voo));
      let itens = dominio.analises.filter((a) => idsVoos.has(a.id_voo));
      const idVoo = q.get("id_voo");
      const tipo = q.get("tipo_analise");
      const risco = q.get("nivel_risco");
      if (idVoo) itens = itens.filter((a) => a.id_voo === idVoo);
      if (tipo) itens = itens.filter((a) => a.tipo_analise === tipo);
      if (risco) itens = itens.filter((a) => a.nivel_risco === risco);
      itens = [...itens].sort((a, b) => b.data_analise.localeCompare(a.data_analise));
      return paginar(itens, q);
    },
  },
  {
    metodo: "POST",
    regex: /^\/analises$/,
    handler: (c) => {
      const u = usuarioAutenticado();
      const b = c.body as Partial<Analise>;
      acharVoo(String(b.id_voo), u.id_usuario);
      const nova: Analise = {
        id_analise: crypto.randomUUID(),
        id_voo: String(b.id_voo),
        tipo_analise: b.tipo_analise ?? "outro",
        nivel_risco: b.nivel_risco ?? null,
        percentual_area_afetada: b.percentual_area_afetada ?? null,
        resultado: b.resultado ?? null,
        url_arquivo: null,
        status: b.status ?? "concluido",
        data_analise: agora(),
        atualizado_em: agora(),
      };
      dominio.analises.push(nova);
      return { data: nova };
    },
  },
  {
    metodo: "GET",
    regex: /^\/analises\/(?<id>[^/]+)$/,
    handler: (_c, p) => ({ data: acharAnalise(p.id, usuarioAutenticado().id_usuario) }),
  },
  {
    metodo: "PATCH",
    regex: /^\/analises\/(?<id>[^/]+)$/,
    handler: (c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharAnalise(p.id, u.id_usuario);
      const b = c.body as Partial<Analise>;
      for (const k of ["tipo_analise", "nivel_risco", "percentual_area_afetada", "resultado", "status"] as const) {
        if (b[k] !== undefined) (alvo as unknown as Record<string, unknown>)[k] = b[k];
      }
      alvo.atualizado_em = agora();
      return { data: alvo };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/analises\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const alvo = acharAnalise(p.id, u.id_usuario);
      // Mesma regra do backend real: um relatorio ja gerado para esta
      // analise impede a exclusao, em vez de deixa-lo orfao e inacessivel.
      const relatorios = dominio.relatorios.filter((r) => r.id_analise === alvo.id_analise).length;
      if (relatorios > 0) conflito("Análise possui relatórios gerados", { relatorios });
      dominio.analises = dominio.analises.filter((x) => x.id_analise !== alvo.id_analise);
      return { data: undefined };
    },
  },

  // Dashboard
  {
    metodo: "GET",
    regex: /^\/dashboard$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      const idPropriedade = q.get("id_propriedade");
      const dataInicio = q.get("data_inicio");
      const dataFim = q.get("data_fim");

      let props = minhasPropriedades(u.id_usuario);
      if (idPropriedade) props = props.filter((p) => p.id_propriedade === idPropriedade);
      const idsProp = new Set(props.map((p) => p.id_propriedade));

      const talhoes = dominio.talhoes.filter((t) => idsProp.has(t.id_propriedade));
      const idsTalhao = new Set(talhoes.map((t) => t.id_talhao));

      let voos = dominio.voos.filter((v) => idsTalhao.has(v.id_talhao));
      if (dataInicio) voos = voos.filter((v) => v.data_voo >= dataInicio);
      if (dataFim) voos = voos.filter((v) => v.data_voo <= fimDoDia(dataFim));
      const idsVoo = new Set(voos.map((v) => v.id_voo));

      const analises = dominio.analises.filter((a) => idsVoo.has(a.id_voo));

      const distribuicaoRisco = { baixo: 0, medio: 0, alto: 0, critico: 0, sem_classificacao: 0 };
      for (const a of analises) {
        const chave = (a.nivel_risco ?? "sem_classificacao") as keyof typeof distribuicaoRisco;
        distribuicaoRisco[chave] += 1;
      }

      const porTipo = new Map<string, number>();
      for (const a of analises) porTipo.set(a.tipo_analise, (porTipo.get(a.tipo_analise) ?? 0) + 1);

      const areaMonitorada = talhoes.reduce((soma, t) => soma + (t.area_hectares ?? 0), 0);

      const porMes = new Map<string, { mes: string; voos: number; analises: number }>();
      for (const v of [...voos].sort((a, b) => a.data_voo.localeCompare(b.data_voo))) {
        const mes = v.data_voo.slice(0, 7);
        const atual = porMes.get(mes) ?? { mes, voos: 0, analises: 0 };
        atual.voos += 1;
        atual.analises += dominio.analises.filter((a) => a.id_voo === v.id_voo).length;
        porMes.set(mes, atual);
      }

      return {
        data: {
          indicadores: {
            total_propriedades: props.length,
            total_talhoes: talhoes.length,
            total_voos: voos.length,
            total_analises: analises.length,
            area_monitorada_hectares: areaMonitorada,
            problemas_detectados:
              distribuicaoRisco.medio + distribuicaoRisco.alto + distribuicaoRisco.critico,
            distribuicao_risco: distribuicaoRisco,
            distribuicao_tipo: [...porTipo.entries()].map(([tipo_analise, total]) => ({ tipo_analise, total })),
          },
          series: [...porMes.values()],
        },
      };
    },
  },

  // Historico de monitoramentos (join analise + voo + talhao + propriedade)
  {
    metodo: "GET",
    regex: /^\/monitoramentos$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      const idsProp = new Set(minhasPropriedades(u.id_usuario).map((p) => p.id_propriedade));
      const talhaoPorId = new Map(dominio.talhoes.filter((t) => idsProp.has(t.id_propriedade)).map((t) => [t.id_talhao, t]));
      const propPorId = new Map(dominio.propriedades.filter((p) => idsProp.has(p.id_propriedade)).map((p) => [p.id_propriedade, p]));
      const vooPorId = new Map(dominio.voos.filter((v) => talhaoPorId.has(v.id_talhao)).map((v) => [v.id_voo, v]));

      let itens = dominio.analises
        .filter((a) => vooPorId.has(a.id_voo))
        .map((a) => {
          const voo = vooPorId.get(a.id_voo)!;
          const talhao = talhaoPorId.get(voo.id_talhao)!;
          const prop = propPorId.get(talhao.id_propriedade)!;
          return {
            id_analise: a.id_analise,
            tipo_analise: a.tipo_analise,
            nivel_risco: a.nivel_risco,
            percentual_area_afetada: a.percentual_area_afetada,
            status: a.status,
            data_analise: a.data_analise,
            voo: { id_voo: voo.id_voo, data_voo: voo.data_voo },
            talhao: { id_talhao: talhao.id_talhao, nome_talhao: talhao.nome_talhao, cultura: talhao.cultura },
            propriedade: {
              id_propriedade: prop.id_propriedade,
              nome_fazenda: prop.nome_fazenda,
              cidade: prop.cidade,
              estado: prop.estado,
            },
          };
        });

      const dataInicio = q.get("data_inicio");
      const dataFim = q.get("data_fim");
      const idPropriedade = q.get("id_propriedade");
      const idTalhao = q.get("id_talhao");
      const tipo = q.get("tipo_analise");
      if (dataInicio) itens = itens.filter((i) => i.data_analise >= dataInicio);
      if (dataFim) itens = itens.filter((i) => i.data_analise <= fimDoDia(dataFim));
      if (idPropriedade) itens = itens.filter((i) => i.propriedade.id_propriedade === idPropriedade);
      if (idTalhao) itens = itens.filter((i) => i.talhao.id_talhao === idTalhao);
      if (tipo) itens = itens.filter((i) => i.tipo_analise === tipo);

      itens = [...itens].sort((a, b) => b.data_analise.localeCompare(a.data_analise));
      return paginar(itens, q);
    },
  },

  // Relatorios e recomendacoes
  {
    metodo: "GET",
    regex: /^\/relatorios$/,
    handler: (_c, _p, q) => {
      const u = usuarioAutenticado();
      let itens = dominio.relatorios.filter((r) => {
        try {
          acharAnalise(r.id_analise, u.id_usuario);
          return true;
        } catch {
          return false;
        }
      });
      const idAnalise = q.get("id_analise");
      if (idAnalise) itens = itens.filter((r) => r.id_analise === idAnalise);
      itens = itens.map((r) => ({ ...r, analise: contextoAnalise(r.id_analise) }));
      itens = [...itens].sort((a, b) => b.gerado_em.localeCompare(a.gerado_em));
      return paginar(itens, q);
    },
  },
  {
    metodo: "POST",
    regex: /^\/relatorios$/,
    handler: (c) => {
      const u = usuarioAutenticado();
      const b = c.body as { id_analise: string };
      const a = acharAnalise(b.id_analise, u.id_usuario);

      const completa = a.status === "concluido" && a.nivel_risco != null && Boolean(a.resultado?.trim());
      if (!completa) {
        conflito(
          "Análise incompleta: é necessário status 'concluido', nível de risco e resultado preenchidos",
        );
      }

      const recomendacao = gerarRecomendacao(a);
      const existente = dominio.relatorios.find((r) => r.id_analise === a.id_analise);
      const relatorio: Relatorio = {
        id_relatorio: existente?.id_relatorio ?? crypto.randomUUID(),
        id_analise: a.id_analise,
        versao_regras: VERSAO_REGRAS,
        recomendacao: recomendacao.texto,
        gerado_em: agora(),
      };
      if (existente) Object.assign(existente, relatorio);
      else dominio.relatorios.push(relatorio);

      return { data: { relatorio, recomendacao } };
    },
  },
  {
    metodo: "GET",
    regex: /^\/relatorios\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const r = dominio.relatorios.find((x) => x.id_relatorio === p.id);
      if (!r) naoEncontrado("Relatório não encontrado");
      acharAnalise(r.id_analise, u.id_usuario);
      return { data: { ...r, analise: contextoAnalise(r.id_analise) } };
    },
  },
  {
    metodo: "DELETE",
    regex: /^\/relatorios\/(?<id>[^/]+)$/,
    handler: (_c, p) => {
      const u = usuarioAutenticado();
      const r = dominio.relatorios.find((x) => x.id_relatorio === p.id);
      if (!r) naoEncontrado("Relatório não encontrado");
      acharAnalise(r.id_analise, u.id_usuario);
      dominio.relatorios = dominio.relatorios.filter((x) => x.id_relatorio !== r.id_relatorio);
      return { data: undefined };
    },
  },
];

function contextoAnalise(idAnalise: string) {
  const a = dominio.analises.find((x) => x.id_analise === idAnalise)!;
  const voo = dominio.voos.find((v) => v.id_voo === a.id_voo)!;
  const talhao = dominio.talhoes.find((t) => t.id_talhao === voo.id_talhao)!;
  const propriedade = dominio.propriedades.find((p) => p.id_propriedade === talhao.id_propriedade)!;
  return {
    id_analise: a.id_analise,
    tipo_analise: a.tipo_analise,
    nivel_risco: a.nivel_risco,
    percentual_area_afetada: a.percentual_area_afetada,
    status: a.status,
    voo: {
      id_voo: voo.id_voo,
      data_voo: voo.data_voo,
      talhao: {
        id_talhao: talhao.id_talhao,
        nome_talhao: talhao.nome_talhao,
        propriedade: {
          id_propriedade: propriedade.id_propriedade,
          nome_fazenda: propriedade.nome_fazenda,
          cidade: propriedade.cidade,
          estado: propriedade.estado,
        },
      },
    },
  };
}
