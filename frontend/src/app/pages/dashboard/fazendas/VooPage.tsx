import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import { formatarArea, formatarData } from "../../../lib/format";
import type { VooDetalhe } from "../../../lib/types";
import { useCarregar } from "../../../lib/useCarregar";
import { Carregando } from "../../../components/Carregando";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EstadoErro } from "../../../components/Estados";
import { ConfirmarExclusao, Modal } from "../../../components/Modal";
import { CabecalhoPagina } from "../DashboardLayout";
import { FormVoo } from "./formularios";
import { BotoesEditarExcluir, Detalhes, useExclusao } from "./comum";
import { ImagensVoo } from "./ImagensVoo";
import { AnalisesVoo } from "./AnalisesVoo";

export function VooPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [editando, setEditando] = useState(false);
  const { dados: v, erro, carregando, recarregar } = useCarregar(() => api<VooDetalhe>(`/voos/${id}`), [id]);
  const carregou = !!v;

  // Links do histórico (#analise-<id>) rolam até a análise depois que a página carrega.
  useEffect(() => {
    if (carregou && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [carregou, hash]);
  const exclusao = useExclusao(`/voos/${id}`, () => {
    toast.success("Voo excluído");
    navigate(v ? `/dashboard/talhoes/${v.talhao.id_talhao}` : "/dashboard/fazendas", { replace: true });
  });

  if (carregando && !v) return <Carregando />;
  if (erro || !v) return erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard/fazendas", label: "Voltar para Fazendas" }} /> : null;

  const titulo = `Voo de ${formatarData(v.data_voo)}`;

  return (
    <>
      <Breadcrumbs itens={[
        { label: "Fazendas", to: "/dashboard/fazendas" },
        { label: v.talhao.propriedade.nome_fazenda, to: `/dashboard/fazendas/${v.talhao.propriedade.id_propriedade}` },
        { label: v.talhao.nome_talhao, to: `/dashboard/talhoes/${v.talhao.id_talhao}` },
        { label: titulo },
      ]} />
      <CabecalhoPagina titulo={titulo} descricao={`${v.talhao.propriedade.nome_fazenda} · ${v.talhao.nome_talhao} · ${formatarArea(v.talhao.area_hectares)}`}
        acao={<BotoesEditarExcluir nome={titulo} aoEditar={() => setEditando(true)} aoExcluir={exclusao.abrir} />} />

      <section className="bg-white rounded-2xl border border-border p-5 mb-6" aria-label="Dados do voo">
        <Detalhes itens={[
          ["Data", formatarData(v.data_voo)],
          ["Altitude", v.altitude_metros ? `${v.altitude_metros} m` : "—"],
          ["Drone", v.modelo_drone ?? "—"],
          ["Operador", v.operador ?? "—"],
        ]} />
        {v.observacoes && <p className="mt-4 pt-4 border-t border-border text-sm text-[#4a5568] whitespace-pre-line"><strong className="text-[#212121]">Observações:</strong> {v.observacoes}</p>}
      </section>

      <ImagensVoo idVoo={v.id_voo} imagens={v.imagens} aoMudar={recarregar} />
      <AnalisesVoo idVoo={v.id_voo} analises={v.analises} totalImagens={v.imagens.length} aoMudar={recarregar} />

      <Modal aberto={editando} aoFechar={() => setEditando(false)} titulo="Editar voo">
        <FormVoo idTalhao={v.id_talhao} inicial={v} aoCancelar={() => setEditando(false)}
          aoSalvar={() => { setEditando(false); toast.success("Voo atualizado"); recarregar(); }} />
      </Modal>
      <ConfirmarExclusao {...exclusao.props} bloqueado={v.imagens.length + v.analises.length > 0}
        titulo={v.imagens.length + v.analises.length > 0 ? "Não é possível excluir ainda" : "Excluir voo?"}
        mensagem={v.imagens.length + v.analises.length > 0
          ? <>Este voo tem {v.imagens.length} imagem(ns) e {v.analises.length} análise(s). Exclua-as primeiro.</>
          : <>O <strong>{titulo.toLowerCase()}</strong> será excluído permanentemente.</>} />
    </>
  );
}
