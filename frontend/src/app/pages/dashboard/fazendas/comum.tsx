import { useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "../../../lib/api";

/** Estado e ação de exclusão com confirmação; mostra o motivo quando a API recusa (ex.: tem dependentes). */
export function useExclusao(caminho: string, aoExcluir: () => void) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const confirmar = async () => {
    setExcluindo(true);
    setErro(null);
    try {
      await api(caminho, { method: "DELETE" });
      setAberto(false);
      aoExcluir();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir.");
    } finally {
      setExcluindo(false);
    }
  };

  return {
    abrir: () => { setErro(null); setAberto(true); },
    props: { aberto, aoFechar: () => setAberto(false), aoConfirmar: confirmar, excluindo, erro },
  };
}

export function BotoesEditarExcluir({ nome, aoEditar, aoExcluir }: { nome: string; aoEditar: () => void; aoExcluir: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={aoEditar} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-[#212121] hover:bg-[#F8F9FA]" aria-label={`Editar ${nome}`}>
        <Pencil className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Editar</span>
      </button>
      <button onClick={aoExcluir} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50" aria-label={`Excluir ${nome}`}>
        <Trash2 className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Excluir</span>
      </button>
    </div>
  );
}

/** Lista de definições (rótulo: valor) para os cartões de detalhe. */
export function Detalhes({ itens }: { itens: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt className="text-xs uppercase tracking-wide text-[#4a5568]">{rotulo}</dt>
          <dd className="text-sm font-medium text-[#212121] mt-0.5 break-words">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
