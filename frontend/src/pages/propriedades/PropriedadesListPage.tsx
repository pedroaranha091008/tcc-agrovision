import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, MapPin, Plus, Search, Tractor } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { Paginacao } from "@/components/comum/Paginacao";
import { BotaoPrimario, Select } from "@/components/comum/Form";
import { PropriedadeFormModal } from "@/features/dominio/PropriedadeFormModal";
import { useQuery } from "@/hooks/useQuery";
import { ESTADOS_UF } from "@/features/dominio/schemas";
import * as service from "@/services/propriedades";
import { area } from "@/lib/formatar";
import type { PropriedadePayload } from "@/types/dominio";

export function PropriedadesListPage() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [estado, setEstado] = useState("");
  const [criando, setCriando] = useState(false);

  const q = useQuery(
    (signal) =>
      service.listar({ pagina, por_pagina: 12, busca: buscaAplicada || undefined, estado: estado || undefined }, signal),
    [pagina, buscaAplicada, estado],
  );

  async function salvar(dados: PropriedadePayload) {
    const nova = await service.criar(dados);
    navigate(`/propriedades/${nova.id_propriedade}`);
  }

  const filtrando = Boolean(buscaAplicada || estado);
  const botaoNova = (
    <BotaoPrimario onClick={() => setCriando(true)}>
      <Plus className="w-4 h-4" /> Nova propriedade
    </BotaoPrimario>
  );

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <PageHeader titulo="Fazendas" descricao="Suas propriedades e os talhões de cada uma." acao={botaoNova} />

      {(filtrando || (q.data?.meta?.total ?? 0) > 3) && (
        <div className="flex flex-wrap gap-3 mb-5">
          <form
            className="relative flex-1 min-w-[200px]"
            onSubmit={(e) => {
              e.preventDefault();
              setPagina(1);
              setBuscaAplicada(busca.trim());
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <label htmlFor="busca-propriedade" className="sr-only">
              Buscar por nome da fazenda
            </label>
            <input
              id="busca-propriedade"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome da fazenda..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
            />
          </form>
          <label htmlFor="filtro-estado" className="sr-only">
            Filtrar por estado
          </label>
          <Select
            id="filtro-estado"
            value={estado}
            onChange={(e) => {
              setPagina(1);
              setEstado(e.target.value);
            }}
            className="!w-auto min-w-[120px]"
          >
            <option value="">Todos os estados</option>
            {ESTADOS_UF.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </div>
      )}

      {q.loading && !q.data && <Carregando />}
      {q.error && <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />}

      {!q.error && q.data && (
        <>
          {q.data.itens.length === 0 ? (
            <EstadoVazio
              titulo={filtrando ? "Nenhuma propriedade encontrada" : "Cadastre sua primeira fazenda"}
              descricao={
                filtrando
                  ? "Ajuste os filtros para ver outros resultados."
                  : "Comece pela propriedade. Depois você divide em talhões e registra os voos de drone de cada um."
              }
              acao={filtrando ? undefined : botaoNova}
            />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {q.data.itens.map((p) => (
                <li key={p.id_propriedade}>
                  <Link
                    to={`/propriedades/${p.id_propriedade}`}
                    className="group block bg-white rounded-2xl border border-border p-5 hover:border-[#66BB6A] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                        <Tractor className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                      </div>
                      <ChevronRight
                        className="w-5 h-5 text-[#4a5568] group-hover:text-[#1B5E20] group-hover:translate-x-0.5 transition-all"
                        aria-hidden
                      />
                    </div>
                    <h2 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {p.nome_fazenda}
                    </h2>
                    <p className="text-sm text-[#4a5568] flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5" aria-hidden /> {p.cidade} — {p.estado}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <div className="text-xs text-[#4a5568]">Área total</div>
                        <div className="font-semibold text-[#212121]">{area(p.area_total_hectares)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#4a5568]">Talhões</div>
                        <div className="font-semibold text-[#212121]">{p.total_talhoes ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#4a5568]">Área em talhões</div>
                        <div className="font-semibold text-[#212121]">{area(p.area_talhoes_hectares)}</div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {q.data.meta && <Paginacao meta={q.data.meta} onPagina={setPagina} />}
        </>
      )}

      <PropriedadeFormModal
        key={`${criando}`}
        aberto={criando}
        inicial={null}
        onFechar={() => setCriando(false)}
        onSalvar={salvar}
      />
    </div>
  );
}
