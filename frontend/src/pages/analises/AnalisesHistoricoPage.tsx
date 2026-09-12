import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { Paginacao } from "@/components/comum/Paginacao";
import { FiltrosAtivos, type FiltroAtivo } from "@/components/comum/FiltrosAtivos";
import { Select } from "@/components/comum/Form";
import { RiscoBadge, StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { useQuery } from "@/hooks/useQuery";
import * as monitoramentoService from "@/services/monitoramentos";
import * as propriedadeService from "@/services/propriedades";
import * as talhaoService from "@/services/talhoes";
import { data, numero } from "@/lib/formatar";
import { TIPO_LABEL } from "@/types/dashboard";
import type { TipoAnalise } from "@/types/dominio";

const TIPOS: TipoAnalise[] = ["NDVI", "RGB", "termico", "multispectral", "outro"];

export function AnalisesHistoricoPage() {
  const [params, setParams] = useSearchParams();

  const pagina = Number(params.get("pagina") ?? "1") || 1;
  const idPropriedade = params.get("id_propriedade") ?? "";
  const idTalhao = params.get("id_talhao") ?? "";
  const tipoAnalise = (params.get("tipo_analise") ?? "") as TipoAnalise | "";
  const dataInicio = params.get("data_inicio") ?? "";
  const dataFim = params.get("data_fim") ?? "";

  function set(chave: string, valor: string) {
    const novo = new URLSearchParams(params);
    if (valor) novo.set(chave, valor);
    else novo.delete(chave);
    if (chave !== "pagina") novo.delete("pagina");
    setParams(novo, { replace: true });
  }

  const propriedades = useQuery((s) => propriedadeService.listar({ por_pagina: 100 }, s), []);
  const talhoes = useQuery(
    (s) => talhaoService.listar({ id_propriedade: idPropriedade || undefined, por_pagina: 100 }, s),
    [idPropriedade],
  );

  const q = useQuery(
    (s) =>
      monitoramentoService.historico(
        {
          pagina,
          por_pagina: 15,
          id_propriedade: idPropriedade || undefined,
          id_talhao: idTalhao || undefined,
          tipo_analise: (tipoAnalise || undefined) as TipoAnalise | undefined,
          data_inicio: dataInicio || undefined,
          data_fim: dataFim || undefined,
        },
        s,
      ),
    [pagina, idPropriedade, idTalhao, tipoAnalise, dataInicio, dataFim],
  );

  const nomePropriedade = useMemo(
    () => new Map((propriedades.data?.itens ?? []).map((p) => [p.id_propriedade, p.nome_fazenda])),
    [propriedades.data],
  );
  const nomeTalhao = useMemo(
    () => new Map((talhoes.data?.itens ?? []).map((t) => [t.id_talhao, t.nome_talhao])),
    [talhoes.data],
  );

  const filtrosAtivos: FiltroAtivo[] = [
    idPropriedade && { chave: "id_propriedade", rotulo: `Propriedade: ${nomePropriedade.get(idPropriedade) ?? "..."}` },
    idTalhao && { chave: "id_talhao", rotulo: `Talhão: ${nomeTalhao.get(idTalhao) ?? "..."}` },
    tipoAnalise && { chave: "tipo_analise", rotulo: `Tipo: ${TIPO_LABEL[tipoAnalise] ?? tipoAnalise}` },
    dataInicio && { chave: "data_inicio", rotulo: `De: ${data(dataInicio)}` },
    dataFim && { chave: "data_fim", rotulo: `Até: ${data(dataFim)}` },
  ].filter((f): f is FiltroAtivo => Boolean(f));

  const temFiltro = filtrosAtivos.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader titulo="Histórico de Análises" descricao="Monitoramentos registrados nas suas propriedades" />

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label htmlFor="filtro-propriedade" className="block text-xs font-medium text-[#4a5568] mb-1">
            Propriedade
          </label>
          <Select
            id="filtro-propriedade"
            value={idPropriedade}
            onChange={(e) => {
              set("id_propriedade", e.target.value);
              set("id_talhao", "");
            }}
            className="!w-auto min-w-[160px]"
          >
            <option value="">Todas</option>
            {propriedades.data?.itens.map((p) => (
              <option key={p.id_propriedade} value={p.id_propriedade}>
                {p.nome_fazenda}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="filtro-talhao" className="block text-xs font-medium text-[#4a5568] mb-1">
            Talhão
          </label>
          <Select
            id="filtro-talhao"
            value={idTalhao}
            onChange={(e) => set("id_talhao", e.target.value)}
            className="!w-auto min-w-[150px]"
          >
            <option value="">Todos</option>
            {talhoes.data?.itens.map((t) => (
              <option key={t.id_talhao} value={t.id_talhao}>
                {t.nome_talhao}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="filtro-tipo" className="block text-xs font-medium text-[#4a5568] mb-1">
            Tipo de análise
          </label>
          <Select
            id="filtro-tipo"
            value={tipoAnalise}
            onChange={(e) => set("tipo_analise", e.target.value)}
            className="!w-auto min-w-[150px]"
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABEL[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="filtro-data-inicio" className="block text-xs font-medium text-[#4a5568] mb-1">
            De
          </label>
          <input
            id="filtro-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => set("data_inicio", e.target.value)}
            className="px-3 py-2.5 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
          />
        </div>
        <div>
          <label htmlFor="filtro-data-fim" className="block text-xs font-medium text-[#4a5568] mb-1">
            Até
          </label>
          <input
            id="filtro-data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => set("data_fim", e.target.value)}
            className="px-3 py-2.5 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
          />
        </div>
      </div>

      <FiltrosAtivos
        itens={filtrosAtivos}
        onRemover={(chave) => set(chave, "")}
        onLimparTudo={() => setParams(new URLSearchParams(), { replace: true })}
      />

      {q.loading && <Carregando />}
      {q.error && <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />}

      {!q.loading && !q.error && q.data && (
        <>
          {q.data.itens.length === 0 ? (
            <EstadoVazio
              titulo={temFiltro ? "Nenhum resultado para os filtros aplicados" : "Nenhuma análise registrada ainda"}
              descricao={
                temFiltro
                  ? "Ajuste ou limpe os filtros para ver outros resultados."
                  : "Registre análises a partir da página de um voo para vê-las aqui."
              }
            />
          ) : (
            <>
              {/* Tabela (telas maiores) */}
              <div className="hidden sm:block bg-white rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    <thead>
                      <tr className="bg-[#F8F9FA] text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">
                        <th className="px-5 py-3">Data</th>
                        <th className="px-5 py-3">Propriedade</th>
                        <th className="px-5 py-3">Talhão</th>
                        <th className="px-5 py-3">Tipo</th>
                        <th className="px-5 py-3">Risco</th>
                        <th className="px-5 py-3">Área afetada</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {q.data.itens.map((item) => (
                        <tr key={item.id_analise} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-5 py-3.5">
                            <Link to={`/analises/${item.id_analise}`} className="font-medium text-[#1B5E20] hover:underline">
                              {data(item.data_analise)}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-[#4a5568]">{item.propriedade.nome_fazenda}</td>
                          <td className="px-5 py-3.5 text-[#4a5568]">{item.talhao.nome_talhao}</td>
                          <td className="px-5 py-3.5 text-[#4a5568]">{TIPO_LABEL[item.tipo_analise]}</td>
                          <td className="px-5 py-3.5">
                            <RiscoBadge nivel={item.nivel_risco} />
                          </td>
                          <td className="px-5 py-3.5 text-[#4a5568]">
                            {item.percentual_area_afetada != null ? `${numero(item.percentual_area_afetada)}%` : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusProcessamentoBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cartões (telas pequenas) */}
              <ul className="sm:hidden space-y-3">
                {q.data.itens.map((item) => (
                  <li key={item.id_analise}>
                    <Link
                      to={`/analises/${item.id_analise}`}
                      className="block bg-white rounded-lg border border-border p-4"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#1B5E20]">{data(item.data_analise)}</span>
                        <RiscoBadge nivel={item.nivel_risco} />
                      </div>
                      <p className="text-sm text-[#212121]">
                        {item.propriedade.nome_fazenda} — {item.talhao.nome_talhao}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-[#4a5568]">
                        <span>
                          <Activity className="w-3 h-3 inline mr-1" />
                          {TIPO_LABEL[item.tipo_analise]}
                          {item.percentual_area_afetada != null && ` · ${numero(item.percentual_area_afetada)}%`}
                        </span>
                        <StatusProcessamentoBadge status={item.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <Paginacao meta={q.data.meta} onPagina={(p) => set("pagina", String(p))} />
            </>
          )}
        </>
      )}
    </div>
  );
}
