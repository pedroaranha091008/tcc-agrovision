import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Pencil, Plane, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario } from "@/components/comum/Form";
import { StatusProcessamentoBadge, StatusTalhaoBadge } from "@/components/comum/StatusBadge";
import { TalhaoFormModal } from "@/features/dominio/TalhaoFormModal";
import { VooFormModal } from "@/features/dominio/VooFormModal";
import { useQuery } from "@/hooks/useQuery";
import * as talhaoService from "@/services/talhoes";
import * as propService from "@/services/propriedades";
import * as vooService from "@/services/voos";
import { area, coordenadas, data } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import type { Voo } from "@/types/dominio";

export function TalhaoDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const talhao = useQuery((s) => talhaoService.obter(id, s), [id]);
  const idProp = talhao.data?.id_propriedade ?? "";
  const prop = useQuery((s) => (idProp ? propService.obter(idProp, s) : Promise.resolve(null)), [idProp]);
  const voos = useQuery((s) => vooService.listar({ id_talhao: id, por_pagina: 100 }, s), [id]);

  const [editar, setEditar] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [modalVoo, setModalVoo] = useState<{ aberto: boolean; alvo: Voo | null }>({ aberto: false, alvo: null });
  const [excluirVoo, setExcluirVoo] = useState<Voo | null>(null);

  async function removerTalhao() {
    setProcessando(true);
    setErroAcao(null);
    try {
      await talhaoService.remover(id);
      navigate(idProp ? `/propriedades/${idProp}` : "/propriedades", { replace: true });
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
      setProcessando(false);
    }
  }

  async function removerVoo() {
    if (!excluirVoo) return;
    setProcessando(true);
    setErroAcao(null);
    try {
      await vooService.remover(excluirVoo.id_voo);
      setExcluirVoo(null);
      voos.refetch();
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
    } finally {
      setProcessando(false);
    }
  }

  if (talhao.loading) return <Carregando />;
  if (talhao.error || !talhao.data)
    return (
      <div className="max-w-4xl mx-auto">
        <EstadoErro erro={talhao.error} onTentarNovamente={talhao.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para propriedades
          </Link>
        </div>
      </div>
    );

  const t = talhao.data;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        titulo={t.nome_talhao}
        breadcrumbs={[
          { label: "Propriedades", to: "/propriedades" },
          { label: prop.data?.nome_fazenda ?? "Propriedade", to: `/propriedades/${idProp}` },
          { label: t.nome_talhao },
        ]}
        acao={
          <div className="flex gap-2">
            <BotaoSecundario onClick={() => setEditar(true)}>
              <Pencil className="w-4 h-4" /> Editar
            </BotaoSecundario>
            <BotaoSecundario onClick={() => setExcluir(true)}>
              <Trash2 className="w-4 h-4" /> Excluir
            </BotaoSecundario>
          </div>
        }
      />

      {erroAcao && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-5 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <dl className="grid sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Cultura</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{t.cultura ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Área</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{area(t.area_hectares)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Coordenadas</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{coordenadas(t.latitude, t.longitude)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Status</dt>
            <dd className="mt-1">
              <StatusTalhaoBadge status={t.status} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#212121] flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          <Plane className="w-4 h-4" /> Voos
        </h2>
        <BotaoPrimario onClick={() => setModalVoo({ aberto: true, alvo: null })}>
          <Plus className="w-4 h-4" /> Novo voo
        </BotaoPrimario>
      </div>

      {voos.loading && <Carregando />}
      {voos.error && <EstadoErro erro={voos.error} onTentarNovamente={voos.refetch} />}
      {!voos.loading && !voos.error && voos.data && (
        voos.data.itens.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum voo neste talhão"
            descricao="Registre um voo para depois enviar imagens e análises."
            acao={
              <BotaoPrimario onClick={() => setModalVoo({ aberto: true, alvo: null })}>
                <Plus className="w-4 h-4" /> Novo voo
              </BotaoPrimario>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="bg-[#F8F9FA] text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">Drone</th>
                    <th className="px-5 py-3">Operador</th>
                    <th className="px-5 py-3">Processamento</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {voos.data.itens.map((v) => (
                    <tr key={v.id_voo} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/voos/${v.id_voo}`} className="font-medium text-[#1B5E20] hover:underline">
                          {data(v.data_voo)}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#4a5568]">{v.modelo_drone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#4a5568]">{v.operador ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <StatusProcessamentoBadge status={v.status_processamento} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setModalVoo({ aberto: true, alvo: v })}
                            className="p-1.5 rounded-lg hover:bg-[#E8F5E9] text-[#4a5568] hover:text-[#1B5E20] transition-colors"
                            aria-label="Editar voo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExcluirVoo(v)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a5568] hover:text-red-600 transition-colors"
                            aria-label="Excluir voo"
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
        )
      )}

      <TalhaoFormModal
        key={`editar-${editar}`}
        aberto={editar}
        idPropriedade={idProp}
        inicial={t}
        onFechar={() => setEditar(false)}
        onSalvar={async (dados) => {
          await talhaoService.atualizar(id, dados);
          talhao.refetch();
        }}
      />

      <VooFormModal
        key={`voo-${modalVoo.aberto}-${modalVoo.alvo?.id_voo ?? "novo"}`}
        aberto={modalVoo.aberto}
        idTalhao={id}
        inicial={modalVoo.alvo}
        onFechar={() => setModalVoo({ aberto: false, alvo: null })}
        onSalvar={async (dados) => {
          if (modalVoo.alvo) await vooService.atualizar(modalVoo.alvo.id_voo, dados);
          else await vooService.criar(dados);
          voos.refetch();
        }}
      />

      <ConfirmarExclusao
        aberto={excluir}
        mensagem={`Excluir o talhão "${t.nome_talhao}"? Voos vinculados impedem a exclusão.`}
        processando={processando}
        onConfirmar={removerTalhao}
        onCancelar={() => setExcluir(false)}
      />

      <ConfirmarExclusao
        aberto={Boolean(excluirVoo)}
        mensagem={`Excluir o voo de ${data(excluirVoo?.data_voo)}?`}
        processando={processando}
        onConfirmar={removerVoo}
        onCancelar={() => setExcluirVoo(null)}
      />
    </div>
  );
}
