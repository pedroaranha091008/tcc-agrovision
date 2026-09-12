import { Link, useParams } from "react-router";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro } from "@/components/comum/Estados";
import { RiscoBadge, StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { RelatorioSecao } from "@/features/relatorios/RelatorioSecao";
import { useQuery } from "@/hooks/useQuery";
import * as analiseService from "@/services/analises";
import * as vooService from "@/services/voos";
import * as talhaoService from "@/services/talhoes";
import * as propService from "@/services/propriedades";
import { dataHora, numero } from "@/lib/formatar";
import { TIPO_LABEL } from "@/types/dashboard";

export function AnaliseDetailPage() {
  const { id = "" } = useParams();

  const analise = useQuery((s) => analiseService.obter(id, s), [id]);
  const idVoo = analise.data?.id_voo ?? "";
  const voo = useQuery((s) => (idVoo ? vooService.obter(idVoo, s) : Promise.resolve(null)), [idVoo]);
  const idTalhao = voo.data?.id_talhao ?? "";
  const talhao = useQuery((s) => (idTalhao ? talhaoService.obter(idTalhao, s) : Promise.resolve(null)), [idTalhao]);
  const idProp = talhao.data?.id_propriedade ?? "";
  const prop = useQuery((s) => (idProp ? propService.obter(idProp, s) : Promise.resolve(null)), [idProp]);

  if (analise.loading) return <Carregando />;
  if (analise.error || !analise.data)
    return (
      <div className="max-w-3xl mx-auto">
        <EstadoErro erro={analise.error} onTentarNovamente={analise.refetch} />
        <div className="mt-4 text-center">
          <Link to="/analises" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para o histórico
          </Link>
        </div>
      </div>
    );

  const a = analise.data;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        titulo={`Análise ${TIPO_LABEL[a.tipo_analise] ?? a.tipo_analise}`}
        breadcrumbs={[
          { label: "Histórico de análises", to: "/analises" },
          { label: prop.data?.nome_fazenda ?? "Propriedade", to: idProp ? `/propriedades/${idProp}` : undefined },
          { label: talhao.data?.nome_talhao ?? "Talhão", to: idTalhao ? `/talhoes/${idTalhao}` : undefined },
          { label: TIPO_LABEL[a.tipo_analise] ?? a.tipo_analise },
        ]}
      />

      <div className="bg-white rounded-lg border border-border p-5 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <RiscoBadge nivel={a.nivel_risco} />
          <StatusProcessamentoBadge status={a.status} />
        </div>

        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Tipo</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{TIPO_LABEL[a.tipo_analise] ?? a.tipo_analise}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Área afetada</dt>
            <dd className="text-[#212121] font-medium mt-0.5">
              {a.percentual_area_afetada != null ? `${numero(a.percentual_area_afetada)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Registrada em</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{dataHora(a.data_analise)}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Resultado</dt>
            <dd className="text-[#212121] mt-0.5">{a.resultado ?? "Sem descrição registrada."}</dd>
          </div>
        </dl>

        {idVoo && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link to={`/voos/${idVoo}`} className="text-sm text-[#1B5E20] font-semibold hover:underline">
              Ver o voo desta análise →
            </Link>
          </div>
        )}
      </div>

      <RelatorioSecao analise={a} />
    </div>
  );
}
