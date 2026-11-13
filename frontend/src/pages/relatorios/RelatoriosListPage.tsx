import { useState } from "react";
import { Link } from "react-router";
import { Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { Paginacao } from "@/components/comum/Paginacao";
import { NIVEL_RISCO_LABEL, RiscoBadge } from "@/components/comum/StatusBadge";
import { BotaoPdf } from "@/features/relatorios/Relatorio";
import { useQuery } from "@/hooks/useQuery";
import * as monitoramentoService from "@/services/monitoramentos";
import * as propriedadeService from "@/services/propriedades";
import { data } from "@/lib/formatar";
import { TIPO_LABEL } from "@/types/dashboard";
import type { NivelRisco } from "@/types/dominio";

const RISCOS: NivelRisco[] = ["baixo", "medio", "alto", "critico"];
const classeFiltro =
  "px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A]";

/**
 * Cada analise concluida tem um relatorio em PDF: ele e gerado na hora do
 * download, sempre com os dados atuais (resultado, recomendacao e mapas).
 */
export function RelatoriosListPage() {
  const [pagina, setPagina] = useState(1);
  const [idPropriedade, setIdPropriedade] = useState("");
  const [nivelRisco, setNivelRisco] = useState<NivelRisco | "">("");

  const propriedades = useQuery((s) => propriedadeService.listar({ por_pagina: 100 }, s), []);
  const q = useQuery(
    (s) =>
      monitoramentoService.historico(
        {
          pagina,
          por_pagina: 12,
          id_propriedade: idPropriedade || undefined,
          nivel_risco: nivelRisco || undefined,
        },
        s,
      ),
    [pagina, idPropriedade, nivelRisco],
  );

  const filtrando = Boolean(idPropriedade || nivelRisco);

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <PageHeader
        titulo="Relatórios"
        descricao="Cada análise gera um relatório em PDF com resultado, recomendação e mapas."
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <label className="sr-only" htmlFor="rel-propriedade">
          Propriedade
        </label>
        <select
          id="rel-propriedade"
          value={idPropriedade}
          onChange={(e) => {
            setPagina(1);
            setIdPropriedade(e.target.value);
          }}
          className={classeFiltro}
        >
          <option value="">Todas as propriedades</option>
          {propriedades.data?.itens.map((p) => (
            <option key={p.id_propriedade} value={p.id_propriedade}>
              {p.nome_fazenda}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="rel-risco">
          Nível de risco
        </label>
        <select
          id="rel-risco"
          value={nivelRisco}
          onChange={(e) => {
            setPagina(1);
            setNivelRisco(e.target.value as NivelRisco | "");
          }}
          className={classeFiltro}
        >
          <option value="">Todos os níveis de risco</option>
          {RISCOS.map((n) => (
            <option key={n} value={n}>
              {NIVEL_RISCO_LABEL[n]}
            </option>
          ))}
        </select>
      </div>

      {q.loading && !q.data && <Carregando />}
      {q.error && <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />}

      {!q.error && q.data && (
        <>
          {q.data.itens.length === 0 ? (
            <EstadoVazio
              titulo={filtrando ? "Nenhum relatório para os filtros escolhidos" : "Nenhum relatório ainda"}
              descricao={
                filtrando
                  ? "Ajuste os filtros para ver outros relatórios."
                  : "Os relatórios aparecem aqui assim que um voo tiver uma análise com nível de risco."
              }
              acao={
                filtrando ? undefined : (
                  <Link to="/propriedades" className="text-sm text-[#1B5E20] font-semibold hover:underline">
                    Ir para Fazendas
                  </Link>
                )
              }
            />
          ) : (
            <ul className="bg-white rounded-2xl border border-border divide-y divide-border">
              {q.data.itens.map((item) => (
                <li key={item.id_analise} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-[12rem]">
                    <div className="text-sm text-[#212121]">
                      <span className="font-medium">{item.talhao.nome_talhao}</span>{" "}
                      <span className="text-[#4a5568]">· {item.propriedade.nome_fazenda}</span>
                    </div>
                    <div className="text-xs text-[#4a5568]">
                      Voo de {data(item.voo.data_voo)} · {TIPO_LABEL[item.tipo_analise]} ·{" "}
                      {item.origem === "automatica" ? "automática" : "manual"}
                    </div>
                  </div>
                  <RiscoBadge nivel={item.nivel_risco} />
                  <Link
                    to={`/analises/${item.id_analise}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-[#212121] hover:bg-[#F8F9FA]"
                  >
                    <Eye className="w-4 h-4" aria-hidden /> Visualizar
                  </Link>
                  <BotaoPdf
                    idAnalise={item.id_analise}
                    disponivel={item.status === "concluido" && item.nivel_risco != null}
                  />
                </li>
              ))}
            </ul>
          )}

          {q.data.meta && <Paginacao meta={q.data.meta} onPagina={setPagina} />}
        </>
      )}
    </div>
  );
}
