import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { ChevronRight, MapPin, Plus, Tractor } from "lucide-react";
import { api } from "../../../lib/api";
import { formatarArea } from "../../../lib/format";
import type { PropriedadeResumo } from "../../../lib/types";
import { useCarregar } from "../../../lib/useCarregar";
import { Carregando } from "../../../components/Carregando";
import { BotaoPrimario, EstadoErro, EstadoVazio } from "../../../components/Estados";
import { Modal } from "../../../components/Modal";
import { CabecalhoPagina } from "../DashboardLayout";
import { FormPropriedade } from "./formularios";

export function FazendasPage() {
  const navigate = useNavigate();
  const [criando, setCriando] = useState(false);
  const { dados, erro, carregando, recarregar } = useCarregar(() => api<PropriedadeResumo[]>("/propriedades"), []);

  const botaoNova = <BotaoPrimario onClick={() => setCriando(true)}><Plus className="w-4 h-4" aria-hidden /> Nova propriedade</BotaoPrimario>;

  return (
    <>
      <CabecalhoPagina titulo="Fazendas" descricao="Suas propriedades e os talhões de cada uma." acao={dados && dados.length > 0 ? botaoNova : undefined} />

      {carregando && !dados ? <Carregando />
        : erro ? <EstadoErro erro={erro} aoTentarNovamente={recarregar} voltarPara={{ to: "/dashboard", label: "Voltar à visão geral" }} />
        : dados && dados.length === 0 ? (
          <EstadoVazio icon={Tractor} titulo="Cadastre sua primeira fazenda"
            texto="Comece pela propriedade. Depois você divide em talhões e registra os voos de drone de cada um."
            acao={botaoNova} />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {dados?.map(p => (
              <li key={p.id_propriedade}>
                <Link to={`/dashboard/fazendas/${p.id_propriedade}`}
                  className="group block bg-white rounded-2xl border border-border p-5 hover:border-[#66BB6A] hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                      <Tractor className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#4a5568] group-hover:text-[#1B5E20] group-hover:translate-x-0.5 transition-all" aria-hidden />
                  </div>
                  <h2 className="font-bold text-[#212121] font-display">{p.nome_fazenda}</h2>
                  <p className="text-sm text-[#4a5568] flex items-center gap-1 mb-4"><MapPin className="w-3.5 h-3.5" aria-hidden /> {p.cidade} — {p.estado}</p>
                  <div className="flex gap-6 text-sm">
                    <div><div className="text-xs text-[#4a5568]">Área total</div><div className="font-semibold text-[#212121]">{formatarArea(p.area_total_hectares)}</div></div>
                    <div><div className="text-xs text-[#4a5568]">Talhões</div><div className="font-semibold text-[#212121]">{p.total_talhoes}</div></div>
                    <div><div className="text-xs text-[#4a5568]">Área em talhões</div><div className="font-semibold text-[#212121]">{formatarArea(p.area_talhoes_hectares)}</div></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

      <Modal aberto={criando} aoFechar={() => setCriando(false)} titulo="Nova propriedade">
        <FormPropriedade aoCancelar={() => setCriando(false)}
          aoSalvar={p => { setCriando(false); toast.success("Propriedade cadastrada"); navigate(`/dashboard/fazendas/${p.id_propriedade}`); }} />
      </Modal>
    </>
  );
}
