import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronRight, Plane, Plus } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario } from "@/components/comum/Form";
import { BotoesEditarExcluir, Detalhes, TituloSecao } from "@/components/comum/Detalhes";
import { StatusProcessamentoBadge, StatusTalhaoBadge } from "@/components/comum/StatusBadge";
import { TalhaoFormModal } from "@/features/dominio/TalhaoFormModal";
import { VooFormModal } from "@/features/dominio/VooFormModal";
import { useQuery } from "@/hooks/useQuery";
import * as talhaoService from "@/services/talhoes";
import * as propService from "@/services/propriedades";
import * as vooService from "@/services/voos";
import { area, coordenadas, data } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";

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
  const [novoVoo, setNovoVoo] = useState(false);

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

  if (talhao.loading) return <Carregando />;
  if (talhao.error || !talhao.data)
    return (
      <div>
        <EstadoErro erro={talhao.error} onTentarNovamente={talhao.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para Fazendas
          </Link>
        </div>
      </div>
    );

  const t = talhao.data;
  const lista = voos.data?.itens ?? [];
  const nomeFazenda = prop.data?.nome_fazenda ?? "Propriedade";

  return (
    <div>
      <PageHeader
        titulo={t.nome_talhao}
        descricao={`${nomeFazenda} · ${t.cultura ?? "cultura não informada"}`}
        breadcrumbs={[
          { label: "Fazendas", to: "/propriedades" },
          { label: nomeFazenda, to: `/propriedades/${idProp}` },
          { label: t.nome_talhao },
        ]}
        acao={<BotoesEditarExcluir nome={t.nome_talhao} aoEditar={() => setEditar(true)} aoExcluir={() => setExcluir(true)} />}
      />

      {erroAcao && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      <Detalhes
        itens={[
          ["Área", area(t.area_hectares)],
          ["Situação", <StatusTalhaoBadge status={t.status} />],
          ["Coordenadas", coordenadas(t.latitude, t.longitude)],
          ["Voos", voos.data ? lista.length : "—"],
        ]}
      />

      <TituloSecao
        titulo="Voos"
        acao={
          lista.length > 0 ? (
            <BotaoPrimario onClick={() => setNovoVoo(true)}>
              <Plus className="w-4 h-4" /> Registrar voo
            </BotaoPrimario>
          ) : undefined
        }
      />

      {voos.loading && !voos.data && <Carregando />}
      {voos.error && <EstadoErro erro={voos.error} onTentarNovamente={voos.refetch} />}
      {!voos.error && voos.data &&
        (lista.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum voo registrado"
            descricao="Registre cada sobrevoo de drone neste talhão. As imagens e análises ficam vinculadas ao voo."
            acao={
              <BotaoPrimario onClick={() => setNovoVoo(true)}>
                <Plus className="w-4 h-4" /> Registrar primeiro voo
              </BotaoPrimario>
            }
          />
        ) : (
          <ul className="bg-white rounded-2xl border border-border divide-y divide-border" style={{ fontFamily: "Inter, sans-serif" }}>
            {lista.map((v) => (
              <li key={v.id_voo}>
                <Link to={`/voos/${v.id_voo}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8F9FA]">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <Plane className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#212121]">Voo de {data(v.data_voo)}</div>
                    <div className="text-sm text-[#4a5568] truncate">
                      {[v.modelo_drone, v.altitude_metros ? `${v.altitude_metros} m` : null, v.operador].filter(Boolean).join(" · ") ||
                        "Sem detalhes"}
                    </div>
                  </div>
                  <StatusProcessamentoBadge status={v.status_processamento} />
                  <span className="hidden sm:block text-xs text-[#4a5568] whitespace-nowrap text-right">
                    {v.total_imagens ?? 0} imagem(ns)
                    <br />
                    {v.total_analises ?? 0} análise(s)
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#4a5568]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ))}

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
        key={`voo-${novoVoo}`}
        aberto={novoVoo}
        idTalhao={id}
        inicial={null}
        onFechar={() => setNovoVoo(false)}
        onSalvar={async (dados) => {
          const novo = await vooService.criar(dados);
          navigate(`/voos/${novo.id_voo}`);
        }}
      />

      <ConfirmarExclusao
        aberto={excluir}
        mensagem={`Excluir o talhão "${t.nome_talhao}"? Voos vinculados impedem a exclusão.`}
        processando={processando}
        onConfirmar={removerTalhao}
        onCancelar={() => setExcluir(false)}
      />
    </div>
  );
}
