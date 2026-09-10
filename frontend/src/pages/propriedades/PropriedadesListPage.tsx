import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Search, Tractor, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { Paginacao } from "@/components/comum/Paginacao";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario, Select } from "@/components/comum/Form";
import { PropriedadeFormModal } from "@/features/dominio/PropriedadeFormModal";
import { useQuery } from "@/hooks/useQuery";
import { ESTADOS_UF } from "@/features/dominio/schemas";
import * as service from "@/services/propriedades";
import { area, data } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import type { Propriedade, PropriedadePayload } from "@/types/dominio";

export function PropriedadesListPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [estado, setEstado] = useState("");

  const [modalForm, setModalForm] = useState<{ aberto: boolean; alvo: Propriedade | null }>({
    aberto: false,
    alvo: null,
  });
  const [excluir, setExcluir] = useState<Propriedade | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const q = useQuery(
    (signal) =>
      service.listar({ pagina, por_pagina: 10, busca: buscaAplicada || undefined, estado: estado || undefined }, signal),
    [pagina, buscaAplicada, estado],
  );

  async function salvar(dados: PropriedadePayload) {
    if (modalForm.alvo) await service.atualizar(modalForm.alvo.id_propriedade, dados);
    else await service.criar(dados);
    q.refetch();
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    setExcluindo(true);
    setErroAcao(null);
    try {
      await service.remover(excluir.id_propriedade);
      setExcluir(null);
      q.refetch();
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        titulo="Propriedades"
        descricao="Gerencie as fazendas monitoradas"
        acao={
          <BotaoPrimario onClick={() => setModalForm({ aberto: true, alvo: null })}>
            <Plus className="w-4 h-4" /> Nova propriedade
          </BotaoPrimario>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <form
          className="relative flex-1 min-w-[200px]"
          onSubmit={(e) => {
            e.preventDefault();
            setPagina(1);
            setBuscaAplicada(busca.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome da fazenda..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
          />
        </form>
        <Select
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

      {erroAcao && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      {q.loading && <Carregando />}
      {q.error && <EstadoErro erro={q.error} onTentarNovamente={q.refetch} />}

      {!q.loading && !q.error && q.data && (
        <>
          {q.data.itens.length === 0 ? (
            <EstadoVazio
              titulo={buscaAplicada || estado ? "Nenhuma propriedade encontrada" : "Nenhuma propriedade cadastrada"}
              descricao={
                buscaAplicada || estado
                  ? "Ajuste os filtros para ver outros resultados."
                  : "Cadastre a primeira fazenda para começar a monitorar talhões e voos."
              }
              acao={
                !buscaAplicada && !estado ? (
                  <BotaoPrimario onClick={() => setModalForm({ aberto: true, alvo: null })}>
                    <Plus className="w-4 h-4" /> Nova propriedade
                  </BotaoPrimario>
                ) : undefined
              }
            />
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  <thead>
                    <tr className="bg-[#F8F9FA] text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">
                      <th className="px-5 py-3">Fazenda</th>
                      <th className="px-5 py-3">Local</th>
                      <th className="px-5 py-3">Área</th>
                      <th className="px-5 py-3">Criada em</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {q.data.itens.map((p) => (
                      <tr key={p.id_propriedade} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/propriedades/${p.id_propriedade}`}
                            className="font-medium text-[#1B5E20] hover:underline flex items-center gap-2"
                          >
                            <Tractor className="w-4 h-4" /> {p.nome_fazenda}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-[#4a5568]">
                          {p.cidade} — {p.estado}
                        </td>
                        <td className="px-5 py-3.5 text-[#4a5568]">{area(p.area_total_hectares)}</td>
                        <td className="px-5 py-3.5 text-[#4a5568]">{data(p.criado_em)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setModalForm({ aberto: true, alvo: p })}
                              className="p-1.5 rounded-lg hover:bg-[#E8F5E9] text-[#4a5568] hover:text-[#1B5E20] transition-colors"
                              aria-label={`Editar ${p.nome_fazenda}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExcluir(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a5568] hover:text-red-600 transition-colors"
                              aria-label={`Excluir ${p.nome_fazenda}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {q.data.meta && <Paginacao meta={q.data.meta} onPagina={setPagina} />}
        </>
      )}

      <PropriedadeFormModal
        key={`${modalForm.aberto}-${modalForm.alvo?.id_propriedade ?? "novo"}`}
        aberto={modalForm.aberto}
        inicial={modalForm.alvo}
        onFechar={() => setModalForm({ aberto: false, alvo: null })}
        onSalvar={salvar}
      />

      <ConfirmarExclusao
        aberto={Boolean(excluir)}
        mensagem={`Excluir a propriedade "${excluir?.nome_fazenda}"? Esta ação não pode ser desfeita.`}
        processando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => {
          setExcluir(null);
          setErroAcao(null);
        }}
      />
    </div>
  );
}
