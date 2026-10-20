import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ClipboardEdit, Sparkles, Trash2 } from "lucide-react";
import { api, ApiError } from "../../../lib/api";
import { formatarDataHora, NIVEIS_RISCO, numeroOuNulo, TIPOS_ANALISE } from "../../../lib/format";
import type { Analise, NivelRisco, TipoAnalise } from "../../../lib/types";
import { Spinner } from "../../../components/Carregando";
import { ariaErro, BotoesFormulario, Campo, ErroFormulario } from "../../../components/Form";
import { ImagemProtegida } from "../../../components/ImagemProtegida";
import { ConfirmarExclusao, Modal } from "../../../components/Modal";
import { RiscoBadge } from "../../../components/RiscoBadge";
import { CORES_STATUS } from "../../../components/FarmMap";

function FormAnaliseManual({ idVoo, aoSalvar, aoCancelar }: { idVoo: string; aoSalvar: () => void; aoCancelar: () => void }) {
  const [tipo, setTipo] = useState<TipoAnalise | "">("");
  const [nivel, setNivel] = useState<NivelRisco | "">("");
  const [percentual, setPercentual] = useState("");
  const [resultado, setResultado] = useState("");
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(null);
    const pct = numeroOuNulo(percentual);
    const locais = {
      tipo_analise: !tipo ? "Selecione o tipo de análise." : undefined,
      nivel_risco: !nivel ? "Selecione o nível de risco." : undefined,
      percentual_area_afetada: pct !== null && (Number.isNaN(pct) || pct < 0 || pct > 100) ? "O percentual vai de 0 a 100." : undefined,
      resultado: resultado.trim().length < 3 ? "Descreva o resultado." : undefined,
    };
    setErros(locais);
    if (Object.values(locais).some(Boolean)) return;
    setSalvando(true);
    try {
      await api(`/voos/${idVoo}/analises`, { method: "POST", body: { tipo_analise: tipo, nivel_risco: nivel, percentual_area_afetada: pct, resultado: resultado.trim() } });
      aoSalvar();
    } catch (err) {
      if (err instanceof ApiError && err.details) setErros(Object.fromEntries(err.details.map(d => [d.campo, d.mensagem])));
      setErroGeral(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="an-tipo" label="Tipo de análise" erro={erros.tipo_analise}>
          <select {...ariaErro("an-tipo", erros.tipo_analise)} value={tipo} onChange={e => setTipo(e.target.value as TipoAnalise)} autoFocus>
            <option value="">Selecionar...</option>
            {Object.entries(TIPOS_ANALISE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Campo>
        <Campo id="an-nivel" label="Nível de risco" erro={erros.nivel_risco}>
          <select {...ariaErro("an-nivel", erros.nivel_risco)} value={nivel} onChange={e => setNivel(e.target.value as NivelRisco)}>
            <option value="">Selecionar...</option>
            {Object.entries(NIVEIS_RISCO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Campo>
      </div>
      <Campo id="an-pct" label="Área afetada (%) — opcional" erro={erros.percentual_area_afetada}>
        <input {...ariaErro("an-pct", erros.percentual_area_afetada)} value={percentual} inputMode="decimal" placeholder="12,5" onChange={e => setPercentual(e.target.value)} />
      </Campo>
      <Campo id="an-resultado" label="Resultado / laudo" erro={erros.resultado}>
        <textarea {...ariaErro("an-resultado", erros.resultado)} value={resultado} rows={4} maxLength={5000}
          placeholder="Ex.: falhas de plantio concentradas na linha 12; recomenda-se replantio." onChange={e => setResultado(e.target.value)} />
      </Campo>
      <ErroFormulario mensagem={erroGeral} />
      <BotoesFormulario aoCancelar={aoCancelar} salvando={salvando} rotulo="Registrar análise" />
    </form>
  );
}

const pct = (n: number) => `${n.toLocaleString("pt-BR")}%`;

function CartaoAnalise({ analise, aoExcluir }: { analise: Analise; aoExcluir: () => void }) {
  const resumo = analise.detalhes?.resumo;
  return (
    <article id={`analise-${analise.id_analise}`} className="bg-white rounded-2xl border border-border p-5 scroll-mt-20">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-[#212121] font-display">{TIPOS_ANALISE[analise.tipo_analise]}</h3>
          <p className="text-xs text-[#4a5568]">
            {analise.origem === "automatica" ? "Análise automática" : "Registrada manualmente"} · {formatarDataHora(analise.data_analise)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RiscoBadge nivel={analise.nivel_risco} />
          <button onClick={aoExcluir} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" aria-label="Excluir análise"><Trash2 className="w-4 h-4" /></button>
        </div>
      </header>

      {analise.percentual_area_afetada !== null && (
        <p className="text-sm text-[#212121] mb-3">Área afetada: <strong>{pct(analise.percentual_area_afetada)}</strong></p>
      )}

      {resumo && (
        <div className="mb-4">
          <div className="flex h-3 rounded-full overflow-hidden" role="img"
            aria-label={`Vegetação vigorosa ${resumo.saudavel}%, atenção ${resumo.atencao}%, pouca ou nenhuma vegetação ${resumo.critico}%`}>
            <div style={{ width: `${resumo.saudavel}%`, background: CORES_STATUS.saudavel.fill }} />
            <div style={{ width: `${resumo.atencao}%`, background: CORES_STATUS.atencao.fill }} />
            <div style={{ width: `${resumo.critico}%`, background: CORES_STATUS.critico.fill }} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#4a5568]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Vegetação vigorosa {pct(resumo.saudavel)}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Atenção {pct(resumo.atencao)}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Pouca/nenhuma vegetação {pct(resumo.critico)}</span>
          </div>
        </div>
      )}

      {analise.resultado && <p className="text-sm text-[#4a5568] whitespace-pre-line">{analise.resultado}</p>}

      {analise.detalhes?.por_imagem && analise.detalhes.por_imagem.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#212121] mb-2">Mapas por imagem</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {analise.detalhes.por_imagem.map((img, i) => (
              <li key={img.mapa}>
                <ImagemProtegida caminho={`/analises/${analise.id_analise}/mapas/${i}`} alt={`Mapa de vegetação de ${img.nome}`} className="w-full aspect-[4/3] object-cover rounded-lg border border-border" />
                <p className="text-xs text-[#4a5568] mt-1 truncate" title={img.nome}>{img.nome} · {pct(img.saudavel)} vigorosa</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function AnalisesVoo({ idVoo, analises, totalImagens, aoMudar }: { idVoo: string; analises: Analise[]; totalImagens: number; aoMudar: () => void }) {
  const [analisando, setAnalisando] = useState(false);
  const [manual, setManual] = useState(false);
  const [excluir, setExcluir] = useState<Analise | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const analisar = async () => {
    setAnalisando(true);
    try {
      await api(`/voos/${idVoo}/analises/automatica`, { method: "POST" });
      toast.success("Análise concluída");
      aoMudar();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Não foi possível analisar.");
    } finally {
      setAnalisando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await api(`/analises/${excluir.id_analise}`, { method: "DELETE" });
      setExcluir(null);
      toast.success("Análise excluída");
      aoMudar();
    } catch (e) {
      setErroExclusao(e instanceof ApiError ? e.message : "Não foi possível excluir.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <section aria-labelledby="titulo-analises">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 id="titulo-analises" className="text-lg font-bold text-[#212121] font-display">Análises <span className="text-sm font-normal text-[#4a5568]">({analises.length})</span></h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setManual(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#212121] hover:bg-[#F8F9FA]">
            <ClipboardEdit className="w-4 h-4" aria-hidden /> Registrar manualmente
          </button>
          <button onClick={analisar} disabled={analisando || totalImagens === 0}
            title={totalImagens === 0 ? "Envie imagens do voo primeiro" : undefined}
            className="inline-flex items-center justify-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed">
            {analisando ? <Spinner claro /> : <Sparkles className="w-4 h-4" aria-hidden />}
            {analisando ? "Analisando imagens..." : "Analisar imagens"}
          </button>
        </div>
      </div>

      {totalImagens === 0 && (
        <p className="text-sm text-[#4a5568] mb-4">Para a análise automática, envie primeiro as imagens do voo. Laudos feitos por um agrônomo podem ser registrados manualmente.</p>
      )}

      {analises.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#A5D6A7] p-8 text-center text-sm text-[#4a5568]">
          Nenhuma análise ainda. A análise automática calcula o índice de verde de cada foto e mostra onde há pouca vegetação.
        </div>
      ) : (
        <div className="space-y-4">
          {analises.map(a => <CartaoAnalise key={a.id_analise} analise={a} aoExcluir={() => { setErroExclusao(null); setExcluir(a); }} />)}
        </div>
      )}

      <Modal aberto={manual} aoFechar={() => setManual(false)} titulo="Registrar análise" descricao="Use para laudos de agrônomo ou resultados de outro software.">
        <FormAnaliseManual idVoo={idVoo} aoCancelar={() => setManual(false)} aoSalvar={() => { setManual(false); toast.success("Análise registrada"); aoMudar(); }} />
      </Modal>
      <ConfirmarExclusao aberto={!!excluir} aoFechar={() => setExcluir(null)} aoConfirmar={confirmarExclusao} excluindo={excluindo} erro={erroExclusao}
        titulo="Excluir análise?" mensagem="A análise e seus mapas serão apagados permanentemente." />
    </section>
  );
}
