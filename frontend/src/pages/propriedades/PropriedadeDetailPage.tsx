import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Layers, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario } from "@/components/comum/Form";
import { StatusTalhaoBadge } from "@/components/comum/StatusBadge";
import { PropriedadeFormModal } from "@/features/dominio/PropriedadeFormModal";
import { TalhaoFormModal } from "@/features/dominio/TalhaoFormModal";
import { useQuery } from "@/hooks/useQuery";
import * as propService from "@/services/propriedades";
import * as talhaoService from "@/services/talhoes";
import { area, data } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import type { Talhao } from "@/types/dominio";

export function PropriedadeDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const prop = useQuery((s) => propService.obter(id, s), [id]);
  const talhoes = useQuery((s) => talhaoService.listar({ id_propriedade: id, por_pagina: 100 }, s), [id]);

  const [editarProp, setEditarProp] = useState(false);
  const [excluirProp, setExcluirProp] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const [modalTalhao, setModalTalhao] = useState<{ aberto: boolean; alvo: Talhao | null }>({
    aberto: false,
    alvo: null,
  });
  const [excluirTalhao, setExcluirTalhao] = useState<Talhao | null>(null);

  async function removerProp() {
    setProcessando(true);
    setErroAcao(null);
    try {
      await propService.remover(id);
      navigate("/propriedades", { replace: true });
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
      setProcessando(false);
    }
  }

  async function removerTalhao() {
    if (!excluirTalhao) return;
    setProcessando(true);
    setErroAcao(null);
    try {
      await talhaoService.remover(excluirTalhao.id_talhao);
      setExcluirTalhao(null);
      talhoes.refetch();
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
    } finally {
      setProcessando(false);
    }
  }

  if (prop.loading) return <Carregando />;
  if (prop.error || !prop.data)
    return (
      <div className="max-w-4xl mx-auto">
        <EstadoErro erro={prop.error} onTentarNovamente={prop.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para propriedades
          </Link>
        </div>
      </div>
    );

  const p = prop.data;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        titulo={p.nome_fazenda}
        breadcrumbs={[{ label: "Propriedades", to: "/propriedades" }, { label: p.nome_fazenda }]}
        acao={
          <div className="flex gap-2">
            <BotaoSecundario onClick={() => setEditarProp(true)}>
              <Pencil className="w-4 h-4" /> Editar
            </BotaoSecundario>
            <BotaoSecundario onClick={() => setExcluirProp(true)}>
              <Trash2 className="w-4 h-4" /> Excluir
            </BotaoSecundario>
          </div>
        }
      />

      {erroAcao && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border p-5 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Local
            </dt>
            <dd className="text-[#212121] font-medium mt-0.5">
              {p.cidade} — {p.estado}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Área total</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{area(p.area_total_hectares)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Criada em</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{data(p.criado_em)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#212121] flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          <Layers className="w-4 h-4" /> Talhões
        </h2>
        <BotaoPrimario onClick={() => setModalTalhao({ aberto: true, alvo: null })}>
          <Plus className="w-4 h-4" /> Novo talhão
        </BotaoPrimario>
      </div>

      {talhoes.loading && <Carregando />}
      {talhoes.error && <EstadoErro erro={talhoes.error} onTentarNovamente={talhoes.refetch} />}
      {!talhoes.loading && !talhoes.error && talhoes.data && (
        talhoes.data.itens.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum talhão nesta propriedade"
            descricao="Cadastre o primeiro talhão para registrar voos e análises."
            acao={
              <BotaoPrimario onClick={() => setModalTalhao({ aberto: true, alvo: null })}>
                <Plus className="w-4 h-4" /> Novo talhão
              </BotaoPrimario>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {talhoes.data.itens.map((t) => (
              <div key={t.id_talhao} className="bg-white rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <Link
                    to={`/talhoes/${t.id_talhao}`}
                    className="font-semibold text-[#1B5E20] hover:underline"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {t.nome_talhao}
                  </Link>
                  <StatusTalhaoBadge status={t.status} />
                </div>
                <p className="text-sm text-[#4a5568] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.cultura ?? "Sem cultura definida"} · {area(t.area_hectares)}
                </p>
                <div className="flex justify-end gap-1 mt-2">
                  <button
                    onClick={() => setModalTalhao({ aberto: true, alvo: t })}
                    className="p-1.5 rounded-lg hover:bg-[#E8F5E9] text-[#4a5568] hover:text-[#1B5E20] transition-colors"
                    aria-label={`Editar ${t.nome_talhao}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExcluirTalhao(t)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a5568] hover:text-red-600 transition-colors"
                    aria-label={`Excluir ${t.nome_talhao}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <PropriedadeFormModal
        key={`editar-${editarProp}`}
        aberto={editarProp}
        inicial={p}
        onFechar={() => setEditarProp(false)}
        onSalvar={async (dados) => {
          await propService.atualizar(id, dados);
          prop.refetch();
        }}
      />

      <TalhaoFormModal
        key={`talhao-${modalTalhao.aberto}-${modalTalhao.alvo?.id_talhao ?? "novo"}`}
        aberto={modalTalhao.aberto}
        idPropriedade={id}
        inicial={modalTalhao.alvo}
        onFechar={() => setModalTalhao({ aberto: false, alvo: null })}
        onSalvar={async (dados) => {
          if (modalTalhao.alvo) await talhaoService.atualizar(modalTalhao.alvo.id_talhao, dados);
          else await talhaoService.criar(dados);
          talhoes.refetch();
        }}
      />

      <ConfirmarExclusao
        aberto={excluirProp}
        mensagem={`Excluir a propriedade "${p.nome_fazenda}"? Talhões vinculados impedem a exclusão.`}
        processando={processando}
        onConfirmar={removerProp}
        onCancelar={() => setExcluirProp(false)}
      />

      <ConfirmarExclusao
        aberto={Boolean(excluirTalhao)}
        mensagem={`Excluir o talhão "${excluirTalhao?.nome_talhao}"? Voos vinculados impedem a exclusão.`}
        processando={processando}
        onConfirmar={removerTalhao}
        onCancelar={() => setExcluirTalhao(null)}
      />
    </div>
  );
}
