import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EstadoVazio } from "@/components/comum/Estados";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario } from "@/components/comum/Form";
import { RiscoBadge, StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { AnaliseFormModal } from "@/features/dominio/AnaliseFormModal";
import * as analiseService from "@/services/analises";
import { data, numero } from "@/lib/formatar";
import { mensagemDoErro } from "@/services/erros";
import type { Analise } from "@/types/dominio";

const ROTULO_TIPO: Record<string, string> = {
  NDVI: "NDVI",
  RGB: "RGB",
  termico: "Térmico",
  multispectral: "Multiespectral",
  outro: "Outro",
};

export function AnalisesSecao({
  idVoo,
  itens,
  carregando,
  onAlterado,
}: {
  idVoo: string;
  itens: Analise[];
  carregando: boolean;
  onAlterado: () => void;
}) {
  const [modal, setModal] = useState<{ aberto: boolean; alvo: Analise | null }>({ aberto: false, alvo: null });
  const [excluirAlvo, setExcluirAlvo] = useState<Analise | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir() {
    if (!excluirAlvo) return;
    setProcessando(true);
    setErro(null);
    try {
      await analiseService.remover(excluirAlvo.id_analise);
      setExcluirAlvo(null);
      onAlterado();
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <BotaoPrimario onClick={() => setModal({ aberto: true, alvo: null })}>
          <Plus className="w-4 h-4" /> Registrar análise
        </BotaoPrimario>
      </div>

      {erro && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erro}
        </div>
      )}

      {!carregando && itens.length === 0 && (
        <EstadoVazio
          titulo="Nenhuma análise registrada"
          descricao="Registre o tipo de análise, o risco identificado e o percentual de área afetada."
          acao={
            <BotaoPrimario onClick={() => setModal({ aberto: true, alvo: null })}>
              <Plus className="w-4 h-4" /> Registrar análise
            </BotaoPrimario>
          }
        />
      )}

      {itens.length > 0 && (
        <ul className="space-y-3">
          {itens.map((a) => (
            <li key={a.id_analise} className="bg-white rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded-full font-medium">
                    {ROTULO_TIPO[a.tipo_analise] ?? a.tipo_analise}
                  </span>
                  <RiscoBadge nivel={a.nivel_risco} />
                  <StatusProcessamentoBadge status={a.status} />
                  {a.percentual_area_afetada != null && (
                    <span className="text-xs text-[#4a5568]">
                      {numero(a.percentual_area_afetada)}% da área afetada
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal({ aberto: true, alvo: a })}
                    className="p-1.5 rounded-lg hover:bg-[#E8F5E9] text-[#4a5568] hover:text-[#1B5E20] transition-colors"
                    aria-label="Editar análise"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExcluirAlvo(a)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a5568] hover:text-red-600 transition-colors"
                    aria-label="Excluir análise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {a.resultado && (
                <p className="text-sm text-[#212121] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  {a.resultado}
                </p>
              )}
              <p className="text-xs text-[#4a5568] mt-2 flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
                Registrada em {data(a.data_analise)}
                <Link to={`/analises/${a.id_analise}`} className="text-[#1B5E20] font-medium hover:underline">
                  Ver detalhes
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}

      <AnaliseFormModal
        key={`${modal.aberto}-${modal.alvo?.id_analise ?? "nova"}`}
        aberto={modal.aberto}
        idVoo={idVoo}
        inicial={modal.alvo}
        onFechar={() => setModal({ aberto: false, alvo: null })}
        onSalvar={async (dados) => {
          if (modal.alvo) await analiseService.atualizar(modal.alvo.id_analise, dados);
          else await analiseService.criar(dados);
          onAlterado();
        }}
      />

      <ConfirmarExclusao
        aberto={Boolean(excluirAlvo)}
        mensagem="Excluir esta análise? Relatórios gerados a partir dela podem impedir a exclusão."
        processando={processando}
        onConfirmar={excluir}
        onCancelar={() => setExcluirAlvo(null)}
      />
    </div>
  );
}
