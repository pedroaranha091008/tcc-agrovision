import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Activity, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoSecundario } from "@/components/comum/Form";
import { StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { VooFormModal } from "@/features/dominio/VooFormModal";
import { ImagensSecao } from "@/features/voos/ImagensSecao";
import { AnalisesSecao } from "@/features/voos/AnalisesSecao";
import { useQuery } from "@/hooks/useQuery";
import * as vooService from "@/services/voos";
import * as talhaoService from "@/services/talhoes";
import * as propService from "@/services/propriedades";
import * as imagemService from "@/services/imagens";
import * as analiseService from "@/services/analises";
import { data, numero } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";

export function VooDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const voo = useQuery((s) => vooService.obter(id, s), [id]);
  const idTalhao = voo.data?.id_talhao ?? "";
  const talhao = useQuery((s) => (idTalhao ? talhaoService.obter(idTalhao, s) : Promise.resolve(null)), [idTalhao]);
  const idProp = talhao.data?.id_propriedade ?? "";
  const prop = useQuery((s) => (idProp ? propService.obter(idProp, s) : Promise.resolve(null)), [idProp]);

  const imagens = useQuery((s) => imagemService.listarDoVoo(id, s), [id]);
  const analises = useQuery((s) => analiseService.listar({ id_voo: id, por_pagina: 100 }, s), [id]);

  const [editar, setEditar] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function removerVoo() {
    setProcessando(true);
    setErroAcao(null);
    try {
      await vooService.remover(id);
      navigate(idTalhao ? `/talhoes/${idTalhao}` : "/propriedades", { replace: true });
    } catch (err) {
      setErroAcao(mensagemDoErro(err));
      setProcessando(false);
    }
  }

  if (voo.loading) return <Carregando />;
  if (voo.error || !voo.data)
    return (
      <div className="max-w-4xl mx-auto">
        <EstadoErro erro={voo.error} onTentarNovamente={voo.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para propriedades
          </Link>
        </div>
      </div>
    );

  const v = voo.data;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        titulo={`Voo de ${data(v.data_voo)}`}
        breadcrumbs={[
          { label: "Propriedades", to: "/propriedades" },
          { label: prop.data?.nome_fazenda ?? "Propriedade", to: idProp ? `/propriedades/${idProp}` : undefined },
          { label: talhao.data?.nome_talhao ?? "Talhão", to: idTalhao ? `/talhoes/${idTalhao}` : undefined },
          { label: data(v.data_voo) },
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
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Data do voo</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{data(v.data_voo)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Altitude</dt>
            <dd className="text-[#212121] font-medium mt-0.5">
              {v.altitude_metros != null ? `${numero(v.altitude_metros)} m` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Processamento</dt>
            <dd className="mt-1">
              <StatusProcessamentoBadge status={v.status_processamento} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Drone</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{v.modelo_drone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Operador</dt>
            <dd className="text-[#212121] font-medium mt-0.5">{v.operador ?? "—"}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs text-[#4a5568] uppercase tracking-wide">Observações</dt>
            <dd className="text-[#212121] mt-0.5">{v.observacoes ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <section className="mb-8">
        <h2
          className="font-bold text-[#212121] flex items-center gap-2 mb-3"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <ImageIcon className="w-4 h-4" /> Imagens
        </h2>
        {imagens.error ? (
          <EstadoErro erro={imagens.error} onTentarNovamente={imagens.refetch} />
        ) : (
          <ImagensSecao
            idVoo={id}
            itens={imagens.data ?? []}
            carregando={imagens.loading}
            onAlterado={imagens.refetch}
          />
        )}
      </section>

      <section>
        <h2
          className="font-bold text-[#212121] flex items-center gap-2 mb-3"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <Activity className="w-4 h-4" /> Análises
        </h2>
        {analises.error ? (
          <EstadoErro erro={analises.error} onTentarNovamente={analises.refetch} />
        ) : (
          <AnalisesSecao
            idVoo={id}
            itens={analises.data?.itens ?? []}
            carregando={analises.loading}
            onAlterado={analises.refetch}
          />
        )}
      </section>

      <VooFormModal
        key={`editar-${editar}`}
        aberto={editar}
        idTalhao={idTalhao}
        inicial={v}
        onFechar={() => setEditar(false)}
        onSalvar={async (dados) => {
          await vooService.atualizar(id, dados);
          voo.refetch();
        }}
      />

      <ConfirmarExclusao
        aberto={excluir}
        mensagem={`Excluir o voo de ${data(v.data_voo)}? Esta ação não pode ser desfeita.`}
        processando={processando}
        onConfirmar={removerVoo}
        onCancelar={() => setExcluir(false)}
      />
    </div>
  );
}
