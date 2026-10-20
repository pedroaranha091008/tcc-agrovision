import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ChevronRight, Layers, Plus } from "lucide-react";
import { api } from "../../../lib/api";
import { formatarArea, formatarData, STATUS_TALHAO } from "../../../lib/format";
import type { PropriedadeDetalhe } from "../../../lib/types";
import { useCarregar } from "../../../lib/useCarregar";
import { Carregando } from "../../../components/Carregando";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { BotaoPrimario, EstadoErro, EstadoVazio } from "../../../components/Estados";
import { ConfirmarExclusao, Modal } from "../../../components/Modal";
import { CabecalhoPagina } from "../DashboardLayout";
import { FormPropriedade, FormTalhao } from "./formularios";
import { BotoesEditarExcluir, Detalhes, useExclusao } from "./comum";

export function PropriedadePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [novoTalhao, setNovoTalhao] = useState(false);
  const { dados: p, erro, carregando, recarregar } = useCarregar(() => api<PropriedadeDetalhe>(`/propriedades/${id}`), [id]);
  const exclusao = useExclusao(`/propriedades/${id}`, () => { toast.success("Propriedade excluída"); navigate("/dashboard/fazendas", { replace: true }); });

  if (carregando && !p) return <Carregando />;
  if (erro || !p) return erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard/fazendas", label: "Voltar para Fazendas" }} /> : null;

  const areaTalhoes = p.talhoes.reduce((s, t) => s + (t.area_hectares ?? 0), 0);

  return (
    <>
      <Breadcrumbs itens={[{ label: "Fazendas", to: "/dashboard/fazendas" }, { label: p.nome_fazenda }]} />
      <CabecalhoPagina titulo={p.nome_fazenda} descricao={`${p.cidade} — ${p.estado}`}
        acao={<BotoesEditarExcluir nome={p.nome_fazenda} aoEditar={() => setEditando(true)} aoExcluir={exclusao.abrir} />} />

      <section className="bg-white rounded-2xl border border-border p-5 mb-6" aria-label="Dados da propriedade">
        <Detalhes itens={[
          ["Área total", formatarArea(p.area_total_hectares)],
          ["Talhões", p.talhoes.length],
          ["Área em talhões", formatarArea(areaTalhoes)],
          ["Cadastrada em", formatarData(p.criado_em)],
        ]} />
      </section>

      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-[#212121] font-display">Talhões</h2>
        {p.talhoes.length > 0 && <BotaoPrimario onClick={() => setNovoTalhao(true)}><Plus className="w-4 h-4" aria-hidden /> Novo talhão</BotaoPrimario>}
      </div>

      {p.talhoes.length === 0 ? (
        <EstadoVazio icon={Layers} titulo="Nenhum talhão cadastrado"
          texto="Divida a propriedade em talhões (áreas de plantio). Cada talhão terá seus voos e análises."
          acao={<BotaoPrimario onClick={() => setNovoTalhao(true)}><Plus className="w-4 h-4" aria-hidden /> Cadastrar primeiro talhão</BotaoPrimario>} />
      ) : (
        <div className="relative bg-white rounded-2xl border border-border overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#F8F9FA]">
                {["Talhão", "Cultura", "Área", "Situação", "Voos", "Último voo"].map(h => (
                  <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
                ))}
                <th scope="col"><span className="sr-only">Abrir</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {p.talhoes.map(t => (
                <tr key={t.id_talhao} className="hover:bg-[#F8F9FA] cursor-pointer" onClick={() => navigate(`/dashboard/talhoes/${t.id_talhao}`)}>
                  <td className="px-5 py-4 text-sm font-medium">
                    <Link to={`/dashboard/talhoes/${t.id_talhao}`} className="text-[#1B5E20] hover:underline" onClick={e => e.stopPropagation()}>{t.nome_talhao}</Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#212121]">{t.cultura ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{formatarArea(t.area_hectares)}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_TALHAO[t.status].classe}`}>{STATUS_TALHAO[t.status].label}</span></td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{t.total_voos}</td>
                  <td className="px-5 py-4 text-sm text-[#4a5568]">{formatarData(t.ultimo_voo)}</td>
                  <td className="px-3"><ChevronRight className="w-4 h-4 text-[#4a5568]" aria-hidden /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal aberto={editando} aoFechar={() => setEditando(false)} titulo="Editar propriedade">
        <FormPropriedade inicial={p} aoCancelar={() => setEditando(false)}
          aoSalvar={() => { setEditando(false); toast.success("Propriedade atualizada"); recarregar(); }} />
      </Modal>
      <Modal aberto={novoTalhao} aoFechar={() => setNovoTalhao(false)} titulo="Novo talhão" descricao={p.nome_fazenda}>
        <FormTalhao idPropriedade={p.id_propriedade} aoCancelar={() => setNovoTalhao(false)}
          aoSalvar={() => { setNovoTalhao(false); toast.success("Talhão cadastrado"); recarregar(); }} />
      </Modal>
      <ConfirmarExclusao {...exclusao.props} bloqueado={p.talhoes.length > 0}
        titulo={p.talhoes.length > 0 ? "Não é possível excluir ainda" : "Excluir propriedade?"}
        mensagem={p.talhoes.length > 0
          ? <>A propriedade <strong>{p.nome_fazenda}</strong> tem {p.talhoes.length} talhão(ões). Exclua os talhões primeiro para não perder dados de voos e análises por engano.</>
          : <>A propriedade <strong>{p.nome_fazenda}</strong> será excluída permanentemente.</>} />
    </>
  );
}
