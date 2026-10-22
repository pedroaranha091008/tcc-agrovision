import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario } from "@/components/comum/Form";
import { BotoesEditarExcluir, Detalhes, TituloSecao } from "@/components/comum/Detalhes";
import { StatusTalhaoBadge } from "@/components/comum/StatusBadge";
import { PropriedadeFormModal } from "@/features/dominio/PropriedadeFormModal";
import { TalhaoFormModal } from "@/features/dominio/TalhaoFormModal";
import { useQuery } from "@/hooks/useQuery";
import * as propService from "@/services/propriedades";
import * as talhaoService from "@/services/talhoes";
import { area, data } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";

export function PropriedadeDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const prop = useQuery((s) => propService.obter(id, s), [id]);
  const talhoes = useQuery((s) => talhaoService.listar({ id_propriedade: id, por_pagina: 100 }, s), [id]);

  const [editarProp, setEditarProp] = useState(false);
  const [excluirProp, setExcluirProp] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const [novoTalhao, setNovoTalhao] = useState(false);

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

  if (prop.loading) return <Carregando />;
  if (prop.error || !prop.data)
    return (
      <div>
        <EstadoErro erro={prop.error} onTentarNovamente={prop.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para Fazendas
          </Link>
        </div>
      </div>
    );

  const p = prop.data;
  const lista = talhoes.data?.itens ?? [];
  const areaTalhoes = lista.reduce((soma, t) => soma + (t.area_hectares ?? 0), 0);

  return (
    <div>
      <PageHeader
        titulo={p.nome_fazenda}
        descricao={`${p.cidade} — ${p.estado}`}
        breadcrumbs={[{ label: "Fazendas", to: "/propriedades" }, { label: p.nome_fazenda }]}
        acao={<BotoesEditarExcluir nome={p.nome_fazenda} aoEditar={() => setEditarProp(true)} aoExcluir={() => setExcluirProp(true)} />}
      />

      {erroAcao && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      <Detalhes
        itens={[
          ["Área total", area(p.area_total_hectares)],
          ["Talhões", talhoes.data ? lista.length : "—"],
          ["Área em talhões", talhoes.data ? area(areaTalhoes) : "—"],
          ["Cadastrada em", data(p.criado_em)],
        ]}
      />

      <TituloSecao
        titulo="Talhões"
        acao={
          lista.length > 0 ? (
            <BotaoPrimario onClick={() => setNovoTalhao(true)}>
              <Plus className="w-4 h-4" /> Novo talhão
            </BotaoPrimario>
          ) : undefined
        }
      />

      {talhoes.loading && !talhoes.data && <Carregando />}
      {talhoes.error && <EstadoErro erro={talhoes.error} onTentarNovamente={talhoes.refetch} />}
      {!talhoes.error && talhoes.data &&
        (lista.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum talhão nesta propriedade"
            descricao="Divida a fazenda em talhões (as áreas de plantio) para registrar voos e análises."
            acao={
              <BotaoPrimario onClick={() => setNovoTalhao(true)}>
                <Plus className="w-4 h-4" /> Novo talhão
              </BotaoPrimario>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="bg-[#F8F9FA] text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">
                    <th className="px-5 py-3">Talhão</th>
                    <th className="px-5 py-3">Cultura</th>
                    <th className="px-5 py-3">Área</th>
                    <th className="px-5 py-3">Situação</th>
                    <th className="px-5 py-3">Voos</th>
                    <th className="px-5 py-3">Último voo</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lista.map((t) => (
                    <tr
                      key={t.id_talhao}
                      className="hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                      onClick={() => navigate(`/talhoes/${t.id_talhao}`)}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/talhoes/${t.id_talhao}`}
                          className="font-medium text-[#1B5E20] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.nome_talhao}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#212121]">{t.cultura ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#212121]">{area(t.area_hectares)}</td>
                      <td className="px-5 py-3.5">
                        <StatusTalhaoBadge status={t.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[#212121]">{t.total_voos ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#212121]">{t.ultimo_voo ? data(t.ultimo_voo) : "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <ChevronRight className="w-4 h-4 text-[#4a5568] inline" aria-hidden />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

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
        key={`talhao-${novoTalhao}`}
        aberto={novoTalhao}
        idPropriedade={id}
        inicial={null}
        onFechar={() => setNovoTalhao(false)}
        onSalvar={async (dados) => {
          await talhaoService.criar(dados);
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
    </div>
  );
}
