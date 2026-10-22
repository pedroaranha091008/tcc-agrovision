import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PageHeader } from "@/components/comum/PageHeader";
import { Carregando, EstadoErro } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotoesEditarExcluir, Detalhes, TituloSecao } from "@/components/comum/Detalhes";
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
import { area, data, numero } from "@/lib/formatar";
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

  // So mostra o carregando na primeira busca; ao atualizar, mantem a tela.
  if (voo.loading && !voo.data) return <Carregando />;
  if (voo.error || !voo.data)
    return (
      <div>
        <EstadoErro erro={voo.error} onTentarNovamente={voo.refetch} />
        <div className="mt-4 text-center">
          <Link to="/propriedades" className="text-sm text-[#1B5E20] hover:underline">
            Voltar para Fazendas
          </Link>
        </div>
      </div>
    );

  const v = voo.data;
  const titulo = `Voo de ${data(v.data_voo)}`;
  const nomeFazenda = prop.data?.nome_fazenda ?? "Propriedade";
  const nomeTalhao = talhao.data?.nome_talhao ?? "Talhão";

  return (
    <div>
      <PageHeader
        titulo={titulo}
        descricao={[nomeFazenda, nomeTalhao, talhao.data?.area_hectares != null ? area(talhao.data.area_hectares) : null]
          .filter(Boolean)
          .join(" · ")}
        breadcrumbs={[
          { label: "Fazendas", to: "/propriedades" },
          { label: nomeFazenda, to: idProp ? `/propriedades/${idProp}` : undefined },
          { label: nomeTalhao, to: idTalhao ? `/talhoes/${idTalhao}` : undefined },
          { label: titulo },
        ]}
        acao={<BotoesEditarExcluir nome={titulo} aoEditar={() => setEditar(true)} aoExcluir={() => setExcluir(true)} />}
      />

      {erroAcao && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroAcao}
        </div>
      )}

      <Detalhes
        itens={[
          ["Altitude", v.altitude_metros != null ? `${numero(v.altitude_metros)} m` : "—"],
          ["Drone", v.modelo_drone ?? "—"],
          ["Operador", v.operador ?? "—"],
          ["Processamento", <StatusProcessamentoBadge status={v.status_processamento} />],
        ]}
      />
      {v.observacoes && (
        <p className="-mt-3 mb-6 text-sm text-[#4a5568] whitespace-pre-line" style={{ fontFamily: "Inter, sans-serif" }}>
          <strong className="text-[#212121]">Observações:</strong> {v.observacoes}
        </p>
      )}

      <section className="mb-8">
        <TituloSecao titulo="Imagens do voo" total={imagens.data?.length} />
        {imagens.error ? (
          <EstadoErro erro={imagens.error} onTentarNovamente={imagens.refetch} />
        ) : (
          <ImagensSecao
            idVoo={id}
            itens={imagens.data ?? []}
            carregando={imagens.loading}
            onAlterado={() => {
              imagens.refetch();
              voo.refetch();
            }}
          />
        )}
      </section>

      <section>
        {analises.error ? (
          <EstadoErro erro={analises.error} onTentarNovamente={analises.refetch} />
        ) : (
          <AnalisesSecao
            idVoo={id}
            itens={analises.data?.itens ?? []}
            carregando={analises.loading}
            temImagens={(imagens.data?.length ?? 0) > 0}
            onAlterado={() => {
              analises.refetch();
              voo.refetch();
            }}
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
