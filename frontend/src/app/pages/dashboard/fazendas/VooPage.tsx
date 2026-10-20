import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ImageUp } from "lucide-react";
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

export function VooPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const { dados: v, erro, carregando, recarregar } = useCarregar(() => api<VooDetalhe>(`/voos/${id}`), [id]);
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

      <h2 className="text-lg font-bold text-[#212121] mb-4 font-display">Imagens e análises</h2>
      <div className="bg-white rounded-2xl border border-dashed border-[#A5D6A7] p-8 text-center">
        <ImageUp className="w-10 h-10 text-[#1B5E20] mx-auto mb-3" aria-hidden />
        <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full mb-3">Em desenvolvimento</span>
        <p className="text-sm text-[#4a5568] max-w-md mx-auto">
          Em breve você poderá enviar aqui as imagens captadas neste voo e acompanhar as análises (NDVI, falhas, plantas daninhas).
        </p>
      </div>

      <Modal aberto={editando} aoFechar={() => setEditando(false)} titulo="Editar voo">
        <FormVoo idTalhao={v.id_talhao} inicial={v} aoCancelar={() => setEditando(false)}
          aoSalvar={() => { setEditando(false); toast.success("Voo atualizado"); recarregar(); }} />
      </Modal>
      <ConfirmarExclusao {...exclusao.props} titulo="Excluir voo?"
        mensagem={<>O <strong>{titulo.toLowerCase()}</strong> será excluído permanentemente.</>} />
    </>
  );
}
