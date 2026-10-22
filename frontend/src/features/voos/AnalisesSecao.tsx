import { useState } from "react";
import { Link } from "react-router";
import { ClipboardEdit, Map, Pencil, Sparkles, Trash2 } from "lucide-react";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { BotaoPrimario } from "@/components/comum/Form";
import { RiscoBadge, StatusProcessamentoBadge } from "@/components/comum/StatusBadge";
import { TituloSecao } from "@/components/comum/Detalhes";
import { AnaliseFormModal } from "@/features/dominio/AnaliseFormModal";
import { analiseCompleta, BotaoPdf, CaixaRecomendacao } from "@/features/relatorios/Relatorio";
import { ImagemProtegida } from "@/components/comum/ImagemProtegida";
import * as analiseService from "@/services/analises";
import { dataHora, numero } from "@/lib/formatar";
import { ApiError, mensagemDoErro } from "@/services/erros";
import { TIPO_LABEL } from "@/types/dashboard";
import type { Analise } from "@/types/dominio";

const pct = (n: number) => `${numero(n)}%`;

function CartaoAnalise({
  analise,
  aoEditar,
  aoExcluir,
}: {
  analise: Analise;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  const resumo = analise.detalhes?.resumo;
  const mapas = analise.detalhes?.por_imagem ?? [];
  return (
    <article
      id={`analise-${analise.id_analise}`}
      className="bg-white rounded-2xl border border-border p-5 scroll-mt-20"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {TIPO_LABEL[analise.tipo_analise] ?? analise.tipo_analise}
          </h3>
          <p className="text-xs text-[#4a5568]">
            {analise.origem === "automatica" ? "Análise automática" : "Registrada manualmente"} ·{" "}
            {dataHora(analise.data_analise)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {analise.status !== "concluido" && <StatusProcessamentoBadge status={analise.status} />}
          <RiscoBadge nivel={analise.nivel_risco} />
          <BotaoPdf idAnalise={analise.id_analise} disponivel={analiseCompleta(analise)} compacto />
          <button
            onClick={aoEditar}
            className="p-1.5 rounded-lg text-[#4a5568] hover:bg-[#E8F5E9] hover:text-[#1B5E20]"
            aria-label="Editar análise"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={aoExcluir} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" aria-label="Excluir análise">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {analise.percentual_area_afetada != null && (
        <p className="text-sm text-[#212121] mb-3">
          Área afetada: <strong>{pct(analise.percentual_area_afetada)}</strong>
        </p>
      )}

      {resumo && (
        <div className="mb-4">
          <div
            className="flex h-3 rounded-full overflow-hidden bg-[#F8F9FA]"
            role="img"
            aria-label={`Vegetação vigorosa ${resumo.saudavel}%, atenção ${resumo.atencao}%, pouca ou nenhuma vegetação ${resumo.critico}%`}
          >
            <div style={{ width: `${resumo.saudavel}%`, background: "#43A047" }} />
            <div style={{ width: `${resumo.atencao}%`, background: "#FBC02D" }} />
            <div style={{ width: `${resumo.critico}%`, background: "#E53935" }} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#4a5568]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Vegetação vigorosa {pct(resumo.saudavel)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Atenção {pct(resumo.atencao)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Pouca/nenhuma vegetação {pct(resumo.critico)}
            </span>
          </div>
        </div>
      )}

      {analise.resultado && <p className="text-sm text-[#4a5568] whitespace-pre-line">{analise.resultado}</p>}

      {analise.recomendacao && (
        <div className="mt-4">
          <CaixaRecomendacao recomendacao={analise.recomendacao} />
        </div>
      )}

      {mapas.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-[#212121]">Mapas por imagem</h4>
            <Link
              to={`/analises/${analise.id_analise}`}
              className="inline-flex items-center gap-1 text-xs text-[#1B5E20] font-semibold hover:underline"
            >
              <Map className="w-3.5 h-3.5" /> Comparar com as fotos
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mapas.map((img, i) => (
              <li key={`${img.id_imagem}-${i}`}>
                <ImagemProtegida
                  caminho={`/analises/${analise.id_analise}/mapas/${i}`}
                  alt={`Mapa de vegetação de ${img.nome}`}
                  className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                />
                <p className="text-xs text-[#4a5568] mt-1 truncate" title={img.nome}>
                  {img.nome} · {pct(img.saudavel)} vigorosa
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function AnalisesSecao({
  idVoo,
  itens,
  carregando,
  temImagens,
  onAlterado,
}: {
  idVoo: string;
  itens: Analise[];
  carregando: boolean;
  temImagens: boolean;
  onAlterado: () => void;
}) {
  const [modal, setModal] = useState<{ aberto: boolean; alvo: Analise | null }>({ aberto: false, alvo: null });
  const [excluirAlvo, setExcluirAlvo] = useState<Analise | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);

  async function analisar() {
    setAnalisando(true);
    setErro(null);
    try {
      await analiseService.analisarVoo(idVoo);
      onAlterado();
    } catch (err) {
      // 422 aqui nao e campo de formulario: o servidor explica o motivo (sem imagens, foto ilegivel).
      setErro(err instanceof ApiError && err.status === 422 ? err.message : mensagemDoErro(err));
    } finally {
      setAnalisando(false);
    }
  }

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
      setExcluirAlvo(null);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section aria-label="Análises do voo" style={{ fontFamily: "Inter, sans-serif" }}>
      <TituloSecao
        titulo="Análises"
        total={itens.length}
        acao={
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setModal({ aberto: true, alvo: null })}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-[#212121] hover:bg-[#F8F9FA]"
            >
              <ClipboardEdit className="w-4 h-4" aria-hidden /> Registrar manualmente
            </button>
            <BotaoPrimario
              onClick={analisar}
              carregando={analisando}
              disabled={!temImagens}
              title={temImagens ? undefined : "Envie as imagens do voo primeiro"}
            >
              {!analisando && <Sparkles className="w-4 h-4" />}
              {analisando ? "Analisando imagens..." : "Analisar imagens"}
            </BotaoPrimario>
          </div>
        }
      />

      {!temImagens && !carregando && (
        <p className="text-sm text-[#4a5568] mb-4">
          Envie as imagens do voo acima para liberar a análise automática. Laudos feitos por um agrônomo podem ser
          registrados manualmente.
        </p>
      )}

      {erro && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erro}
        </div>
      )}

      {!carregando && itens.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-[#A5D6A7] p-8 text-center text-sm text-[#4a5568]">
          Nenhuma análise ainda. A análise automática calcula o índice de verde de cada foto e mostra onde há pouca
          vegetação.
        </div>
      )}

      {itens.length > 0 && (
        <div className="space-y-4">
          {itens.map((a) => (
            <CartaoAnalise
              key={a.id_analise}
              analise={a}
              aoEditar={() => setModal({ aberto: true, alvo: a })}
              aoExcluir={() => setExcluirAlvo(a)}
            />
          ))}
        </div>
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
        mensagem="Excluir esta análise? Os mapas dela também serão apagados. Relatórios gerados a partir dela podem impedir a exclusão."
        processando={processando}
        onConfirmar={excluir}
        onCancelar={() => setExcluirAlvo(null)}
      />
    </section>
  );
}
