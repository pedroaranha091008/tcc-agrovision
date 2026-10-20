import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ChevronRight, Plane, Plus } from "lucide-react";
import { api } from "../../../lib/api";
import { formatarArea, formatarData, STATUS_TALHAO } from "../../../lib/format";
import type { TalhaoDetalhe } from "../../../lib/types";
import { useCarregar } from "../../../lib/useCarregar";
import { Carregando } from "../../../components/Carregando";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { BotaoPrimario, EstadoErro, EstadoVazio } from "../../../components/Estados";
import { ConfirmarExclusao, Modal } from "../../../components/Modal";
import { CabecalhoPagina } from "../DashboardLayout";
import { FormTalhao, FormVoo } from "./formularios";
import { BotoesEditarExcluir, Detalhes, useExclusao } from "./comum";

export function TalhaoPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [novoVoo, setNovoVoo] = useState(false);
  const { dados: t, erro, carregando, recarregar } = useCarregar(() => api<TalhaoDetalhe>(`/talhoes/${id}`), [id]);
  const exclusao = useExclusao(`/talhoes/${id}`, () => {
    toast.success("Talhão excluído");
    navigate(t ? `/dashboard/fazendas/${t.propriedade.id_propriedade}` : "/dashboard/fazendas", { replace: true });
  });

  if (carregando && !t) return <Carregando />;
  if (erro || !t) return erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard/fazendas", label: "Voltar para Fazendas" }} /> : null;

  const coordenadas = t.latitude !== null && t.longitude !== null
    ? <a className="text-[#1B5E20] underline" href={`https://www.google.com/maps?q=${t.latitude},${t.longitude}`} target="_blank" rel="noopener noreferrer">{t.latitude}, {t.longitude}</a>
    : "—";

  return (
    <>
      <Breadcrumbs itens={[
        { label: "Fazendas", to: "/dashboard/fazendas" },
        { label: t.propriedade.nome_fazenda, to: `/dashboard/fazendas/${t.propriedade.id_propriedade}` },
        { label: t.nome_talhao },
      ]} />
      <CabecalhoPagina titulo={t.nome_talhao} descricao={`${t.propriedade.nome_fazenda} · ${t.cultura ?? "cultura não informada"}`}
        acao={<BotoesEditarExcluir nome={t.nome_talhao} aoEditar={() => setEditando(true)} aoExcluir={exclusao.abrir} />} />

      <section className="bg-white rounded-2xl border border-border p-5 mb-6" aria-label="Dados do talhão">
        <Detalhes itens={[
          ["Área", formatarArea(t.area_hectares)],
          ["Situação", <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_TALHAO[t.status].classe}`}>{STATUS_TALHAO[t.status].label}</span>],
          ["Coordenadas", coordenadas],
          ["Voos", t.voos.length],
        ]} />
      </section>

      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-[#212121] font-display">Voos</h2>
        {t.voos.length > 0 && <BotaoPrimario onClick={() => setNovoVoo(true)}><Plus className="w-4 h-4" aria-hidden /> Registrar voo</BotaoPrimario>}
      </div>

      {t.voos.length === 0 ? (
        <EstadoVazio icon={Plane} titulo="Nenhum voo registrado"
          texto="Registre cada sobrevoo de drone neste talhão. As imagens e análises ficam vinculadas ao voo."
          acao={<BotaoPrimario onClick={() => setNovoVoo(true)}><Plus className="w-4 h-4" aria-hidden /> Registrar primeiro voo</BotaoPrimario>} />
      ) : (
        <ul className="bg-white rounded-2xl border border-border divide-y divide-border">
          {t.voos.map(v => (
            <li key={v.id_voo}>
              <Link to={`/dashboard/voos/${v.id_voo}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8F9FA]">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0"><Plane className="w-5 h-5 text-[#1B5E20]" aria-hidden /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#212121]">Voo de {formatarData(v.data_voo)}</div>
                  <div className="text-sm text-[#4a5568] truncate">
                    {[v.modelo_drone, v.altitude_metros ? `${v.altitude_metros} m` : null, v.operador].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </div>
                </div>
                <span className="text-xs text-[#4a5568] whitespace-nowrap text-right">{v.total_imagens} imagem(ns)<br />{v.total_analises} análise(s)</span>
                <ChevronRight className="w-4 h-4 text-[#4a5568]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal aberto={editando} aoFechar={() => setEditando(false)} titulo="Editar talhão">
        <FormTalhao idPropriedade={t.id_propriedade} inicial={t} aoCancelar={() => setEditando(false)}
          aoSalvar={() => { setEditando(false); toast.success("Talhão atualizado"); recarregar(); }} />
      </Modal>
      <Modal aberto={novoVoo} aoFechar={() => setNovoVoo(false)} titulo="Registrar voo" descricao={`${t.propriedade.nome_fazenda} · ${t.nome_talhao}`}>
        <FormVoo idTalhao={t.id_talhao} aoCancelar={() => setNovoVoo(false)}
          aoSalvar={v => { setNovoVoo(false); toast.success("Voo registrado"); navigate(`/dashboard/voos/${v.id_voo}`); }} />
      </Modal>
      <ConfirmarExclusao {...exclusao.props} bloqueado={t.voos.length > 0}
        titulo={t.voos.length > 0 ? "Não é possível excluir ainda" : "Excluir talhão?"}
        mensagem={t.voos.length > 0
          ? <>O talhão <strong>{t.nome_talhao}</strong> tem {t.voos.length} voo(s) registrado(s). Exclua os voos primeiro.</>
          : <>O talhão <strong>{t.nome_talhao}</strong> será excluído permanentemente.</>} />
    </>
  );
}
