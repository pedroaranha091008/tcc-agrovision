import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, ImageUp, RotateCcw, Trash2, X } from "lucide-react";
import { api, apiUpload, ApiError } from "../../../lib/api";
import { formatarBytes, formatarDataHora } from "../../../lib/format";
import type { ConfiguracaoUpload, ImagemVoo } from "../../../lib/types";
import { useCarregar } from "../../../lib/useCarregar";
import { ImagemProtegida } from "../../../components/ImagemProtegida";
import { ConfirmarExclusao } from "../../../components/Modal";

type ItemFila = {
  chave: string;
  arquivo: File;
  estado: "aguardando" | "enviando" | "enviado" | "erro";
  progresso: number;
  erro?: string;
  /** Falhas de rede/servidor podem ser repetidas; arquivo inválido não adianta reenviar. */
  podeRepetir?: boolean;
};

const ENVIOS_SIMULTANEOS = 2;
const chaveDe = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

/** Upload com fila: cada arquivo vai numa requisição, com progresso próprio e opção de repetir só os que falharam. */
export function ImagensVoo({ idVoo, imagens, aoMudar }: { idVoo: string; imagens: ImagemVoo[]; aoMudar: () => void }) {
  const { dados: config } = useCarregar(() => api<ConfiguracaoUpload>("/imagens/configuracao"), []);
  const [fila, setFila] = useState<ItemFila[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [excluir, setExcluir] = useState<ImagemVoo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emAndamento = useRef(new Set<string>());

  const atualizar = (chave: string, mudanca: Partial<ItemFila>) =>
    setFila(f => f.map(i => (i.chave === chave ? { ...i, ...mudanca } : i)));

  /** Valida no navegador o que dá para validar antes de gastar banda. */
  const validar = (arquivo: File): string | undefined => {
    if (!config) return undefined;
    const ext = "." + (arquivo.name.split(".").pop() ?? "").toLowerCase();
    if (!config.extensoes.includes(ext)) return `Formato não aceito. Envie ${config.formatos.join(", ")}.`;
    if (arquivo.size > config.tamanho_max_mb * 1024 * 1024) return `Maior que ${config.tamanho_max_mb} MB.`;
    return undefined;
  };

  const enviarUm = async (item: ItemFila) => {
    if (emAndamento.current.has(item.chave)) return; // evita envio duplicado por clique repetido
    emAndamento.current.add(item.chave);
    atualizar(item.chave, { estado: "enviando", progresso: 0, erro: undefined });
    try {
      await apiUpload(`/voos/${idVoo}/imagens`, "imagens", [item.arquivo], p => atualizar(item.chave, { progresso: p }));
      atualizar(item.chave, { estado: "enviado", progresso: 1 });
      aoMudar();
    } catch (e) {
      const temporario = !(e instanceof ApiError) || e.status === 0 || e.status === 429 || e.status >= 500;
      atualizar(item.chave, { estado: "erro", podeRepetir: temporario, erro: e instanceof ApiError ? (e.details?.[0]?.mensagem ?? e.message) : "Falha no envio." });
    } finally {
      emAndamento.current.delete(item.chave);
    }
  };

  const processar = async (itens: ItemFila[]) => {
    const pendentes = [...itens];
    const trabalhador = async () => { for (let item = pendentes.shift(); item; item = pendentes.shift()) await enviarUm(item); };
    await Promise.all(Array.from({ length: ENVIOS_SIMULTANEOS }, trabalhador));
  };

  const adicionar = (lista: FileList | null) => {
    if (!lista?.length) return;
    const jaNaFila = new Set(fila.filter(i => i.estado !== "enviado").map(i => i.chave));
    const novos: ItemFila[] = [];
    for (const arquivo of Array.from(lista)) {
      const chave = chaveDe(arquivo);
      if (jaNaFila.has(chave)) continue;
      jaNaFila.add(chave);
      const erro = validar(arquivo);
      novos.push({ chave, arquivo, estado: erro ? "erro" : "aguardando", progresso: 0, erro });
    }
    if (!novos.length) return;
    setFila(f => [...f.filter(i => !novos.some(n => n.chave === i.chave)), ...novos]);
    processar(novos.filter(n => n.estado === "aguardando"));
  };

  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    adicionar(e.dataTransfer.files);
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await api(`/imagens/${excluir.id_imagem}`, { method: "DELETE" });
      setExcluir(null);
      toast.success("Imagem excluída");
      aoMudar();
    } catch (e) {
      setErroExclusao(e instanceof ApiError ? e.message : "Não foi possível excluir.");
    } finally {
      setExcluindo(false);
    }
  };

  const falhas = fila.filter(i => i.estado === "erro" && i.podeRepetir);
  const visiveis = fila.filter(i => i.estado !== "enviado");

  return (
    <section aria-labelledby="titulo-imagens" className="mb-8">
      <h2 id="titulo-imagens" className="text-lg font-bold text-[#212121] mb-4 font-display">Imagens do voo <span className="text-sm font-normal text-[#4a5568]">({imagens.length})</span></h2>

      <div
        onDragOver={e => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${arrastando ? "border-[#1B5E20] bg-[#E8F5E9]" : "border-[#A5D6A7] bg-white"}`}>
        <ImageUp className="w-9 h-9 text-[#1B5E20] mx-auto mb-2" aria-hidden />
        <p className="text-sm text-[#212121] mb-1">Arraste as fotos do drone para cá ou</p>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] mt-1">
          Escolher imagens
        </button>
        <input ref={inputRef} type="file" multiple className="sr-only" aria-label="Escolher imagens do voo"
          accept={config ? [...config.extensoes, ...config.tipos_mime].join(",") : "image/*"}
          onChange={e => { adicionar(e.target.files); e.target.value = ""; }} />
        <p className="text-xs text-[#4a5568] mt-3">
          {config ? `Formatos: ${config.formatos.join(", ")} · até ${config.tamanho_max_mb} MB por arquivo` : "Carregando limites..."}
          <br />Use fotos tiradas de cima para baixo: céu, estradas e construções contam como área sem vegetação na análise.
        </p>
      </div>

      {visiveis.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Envios">
          {visiveis.map(item => (
            <li key={item.chave} className="bg-white border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                {item.estado === "erro"
                  ? <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden />
                  : <ImageUp className="w-4 h-4 text-[#1B5E20] flex-shrink-0" aria-hidden />}
                <span className="text-sm text-[#212121] truncate flex-1">{item.arquivo.name}</span>
                <span className="text-xs text-[#4a5568] whitespace-nowrap">
                  {item.estado === "enviando" ? `${Math.round(item.progresso * 100)}%` : item.estado === "aguardando" ? "Na fila" : formatarBytes(item.arquivo.size)}
                </span>
                {item.estado === "erro" && item.podeRepetir && (
                  <button onClick={() => enviarUm(item)} className="p-1 text-[#1B5E20] hover:bg-[#E8F5E9] rounded-lg" aria-label={`Tentar enviar ${item.arquivo.name} de novo`}><RotateCcw className="w-4 h-4" /></button>
                )}
                {item.estado === "erro" && (
                  <button onClick={() => setFila(f => f.filter(i => i.chave !== item.chave))} className="p-1 text-[#4a5568] hover:bg-[#F8F9FA] rounded-lg" aria-label={`Remover ${item.arquivo.name} da lista`}><X className="w-4 h-4" /></button>
                )}
              </div>
              {item.estado === "enviando" && (
                <div className="mt-2 h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden" role="progressbar" aria-label={`Enviando ${item.arquivo.name}`} aria-valuenow={Math.round(item.progresso * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-[#2E7D32] transition-all" style={{ width: `${item.progresso * 100}%` }} />
                </div>
              )}
              {item.erro && <p className="mt-1 text-xs text-red-600">{item.erro}</p>}
            </li>
          ))}
        </ul>
      )}
      {falhas.length > 1 && (
        <button onClick={() => processar(falhas)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20] hover:underline">
          <RotateCcw className="w-4 h-4" aria-hidden /> Tentar novamente as {falhas.length} que falharam
        </button>
      )}

      {imagens.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imagens.map(img => (
            <li key={img.id_imagem} className="bg-white border border-border rounded-xl overflow-hidden">
              <ImagemProtegida caminho={`/imagens/${img.id_imagem}/arquivo?miniatura=1`} alt={img.nome_original} className="w-full aspect-[4/3] object-cover" />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#212121] truncate" title={img.nome_original}>{img.nome_original}</p>
                  <button onClick={() => { setErroExclusao(null); setExcluir(img); }} className="p-1 -m-1 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0" aria-label={`Excluir ${img.nome_original}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#4a5568] mt-0.5">
                  {img.mime_type.replace("image/", "").toUpperCase()} · {formatarBytes(img.tamanho_bytes)}{img.largura ? ` · ${img.largura}×${img.altura}` : ""}
                </p>
                <p className="text-xs text-[#4a5568] flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" aria-hidden /> {formatarDataHora(img.criado_em)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmarExclusao aberto={!!excluir} aoFechar={() => setExcluir(null)} aoConfirmar={confirmarExclusao} excluindo={excluindo} erro={erroExclusao}
        titulo="Excluir imagem?" mensagem={<>A imagem <strong>{excluir?.nome_original}</strong> será apagada. Análises já feitas continuam salvas.</>} />
    </section>
  );
}
