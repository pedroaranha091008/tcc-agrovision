import { useRef, useState } from "react";
import { FileImage, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { ConfirmarExclusao } from "@/components/comum/Modal";
import { EstadoVazio } from "@/components/comum/Estados";
import * as imagemService from "@/services/imagens";
import { mensagemDoErro } from "@/services/erros";
import { data } from "@/lib/formatar";
import { validarArquivo, UPLOAD_ALLOWED_EXT, UPLOAD_MAX_FILE_MB, UPLOAD_MAX_FILES } from "./uploadConfig";
import type { ImagemVoo } from "@/types/dominio";

interface ItemFila {
  id: string;
  arquivo: File;
  progresso: number;
  status: "enviando" | "ok" | "erro";
  erro?: string;
}

function tamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagensSecao({
  idVoo,
  itens,
  carregando,
  onAlterado,
}: {
  idVoo: string;
  itens: ImagemVoo[];
  carregando: boolean;
  onAlterado: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fila, setFila] = useState<ItemFila[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [excluirAlvo, setExcluirAlvo] = useState<ImagemVoo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const enviandoAgora = fila.some((f) => f.status === "enviando");

  async function enviarUm(item: ItemFila) {
    setFila((f) => f.map((x) => (x.id === item.id ? { ...x, status: "enviando", progresso: 0, erro: undefined } : x)));
    try {
      await imagemService.enviar(idVoo, [item.arquivo], (p) =>
        setFila((f) => f.map((x) => (x.id === item.id ? { ...x, progresso: p } : x))),
      );
      setFila((f) => f.map((x) => (x.id === item.id ? { ...x, status: "ok", progresso: 100 } : x)));
      onAlterado();
    } catch (err) {
      setFila((f) =>
        f.map((x) => (x.id === item.id ? { ...x, status: "erro", erro: mensagemDoErro(err) } : x)),
      );
    }
  }

  function adicionarArquivos(lista: FileList | File[]) {
    const arquivos = Array.from(lista);
    if (arquivos.length === 0) return;

    // Vagas restantes = limite - (imagens ja salvas + as que ja estao na
    // fila e nao falharam). O excesso e listado com erro em vez de
    // simplesmente ser enviado mesmo assim.
    const jaContam = itens.length + fila.filter((f) => f.status !== "erro").length;
    const vagas = Math.max(0, UPLOAD_MAX_FILES - jaContam);
    const aEnviar = arquivos.slice(0, vagas);
    const excedentes = arquivos.slice(vagas);

    setErroLista(excedentes.length > 0 ? `No máximo ${UPLOAD_MAX_FILES} imagens por voo.` : null);

    const novos: ItemFila[] = [
      ...aEnviar.map((arquivo) => {
        const erro = validarArquivo(arquivo);
        return {
          id: crypto.randomUUID(),
          arquivo,
          progresso: 0,
          status: (erro ? "erro" : "enviando") as ItemFila["status"],
          erro: erro ?? undefined,
        };
      }),
      ...excedentes.map((arquivo) => ({
        id: crypto.randomUUID(),
        arquivo,
        progresso: 0,
        status: "erro" as const,
        erro: `Limite de ${UPLOAD_MAX_FILES} imagens por voo atingido`,
      })),
    ];

    setFila((f) => [...f, ...novos]);
    for (const item of novos) {
      if (item.status === "enviando") void enviarUm(item);
    }
  }

  async function excluir() {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await imagemService.remover(idVoo, excluirAlvo.id_imagem);
      setExcluirAlvo(null);
      onAlterado();
    } catch (err) {
      setErroLista(mensagemDoErro(err));
    } finally {
      setExcluindo(false);
    }
  }

  const filaVisivel = fila.filter((f) => f.status !== "ok");

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          adicionarArquivos(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          arrastando ? "border-[#66BB6A] bg-[#E8F5E9]" : "border-border bg-white"
        }`}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <Upload className="w-7 h-7 mx-auto text-[#1B5E20] mb-2" />
        <p className="text-sm text-[#212121] font-medium">Arraste imagens aqui ou</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] transition-colors"
        >
          Selecionar arquivos
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UPLOAD_ALLOWED_EXT.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) adicionarArquivos(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-[#4a5568] mt-2">
          JPEG, PNG ou TIFF · até {UPLOAD_MAX_FILE_MB} MB por arquivo · máximo {UPLOAD_MAX_FILES} imagens
        </p>
      </div>

      {erroLista && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {erroLista}
        </div>
      )}

      {filaVisivel.length > 0 && (
        <ul className="mt-4 space-y-2">
          {filaVisivel.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-2.5 text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <FileImage className="w-4 h-4 text-[#4a5568] flex-shrink-0" />
              <span className="flex-1 truncate">{item.arquivo.name}</span>
              {item.status === "enviando" && (
                <div
                  className="w-28 h-1.5 bg-[#E8F5E9] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label={`Enviando ${item.arquivo.name}`}
                  aria-valuenow={item.progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-[#66BB6A] transition-all"
                    style={{ width: `${item.progresso}%` }}
                  />
                </div>
              )}
              {item.status === "erro" && (
                <>
                  <span className="text-red-600 text-xs" role="alert">
                    {item.erro}
                  </span>
                  {!validarArquivo(item.arquivo) && !item.erro?.startsWith("Limite de") && (
                    <button
                      onClick={() => void enviarUm(item)}
                      className="p-1.5 rounded-lg hover:bg-[#E8F5E9] text-[#1B5E20]"
                      aria-label={`Tentar novamente: ${item.arquivo.name}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setFila((f) => f.filter((x) => x.id !== item.id))}
                className="p-1.5 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568]"
                aria-label="Remover da lista"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        {!carregando && itens.length === 0 && filaVisivel.length === 0 && (
          <EstadoVazio titulo="Nenhuma imagem enviada" descricao="Envie as imagens capturadas neste voo." />
        )}
        {itens.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {itens.map((img) => (
              <div key={img.id_imagem} className="relative group rounded-xl overflow-hidden border border-border bg-white">
                {img.caminho.startsWith("blob:") ? (
                  <img src={img.caminho} alt={img.nome_original} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-[#F8F9FA]">
                    <FileImage className="w-8 h-8 text-[#4a5568]" />
                  </div>
                )}
                <div className="p-2 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                  <p className="truncate text-[#212121] font-medium" title={img.nome_original}>
                    {img.nome_original}
                  </p>
                  <p className="text-[#4a5568]">
                    {tamanho(img.tamanho_bytes)} · {img.mime_type.replace("image/", "").toUpperCase()}
                  </p>
                  <p className="text-[#4a5568]">{data(img.criado_em)}</p>
                </div>
                <button
                  onClick={() => setExcluirAlvo(img)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-[#4a5568] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Excluir ${img.nome_original}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmarExclusao
        aberto={Boolean(excluirAlvo)}
        mensagem={`Excluir a imagem "${excluirAlvo?.nome_original}"?`}
        processando={excluindo}
        onConfirmar={excluir}
        onCancelar={() => setExcluirAlvo(null)}
      />

      {enviandoAgora && (
        <p className="mt-2 text-xs text-[#4a5568]" aria-live="polite" style={{ fontFamily: "Inter, sans-serif" }}>
          Enviando imagens, aguarde...
        </p>
      )}
    </div>
  );
}
