import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "./Carregando";

export const inputClasse = (erro?: string) =>
  `w-full px-4 py-2.5 rounded-xl border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm ${erro ? "border-red-400" : "border-border"}`;

/** Rótulo + campo + mensagem de erro, já ligados por id/aria. O filho deve usar o mesmo `id`. */
export function Campo({ id, label, erro, ajuda, children, className = "" }: {
  id: string; label: string; erro?: string; ajuda?: string; children: ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-[#212121] mb-1.5">{label}</label>
      {children}
      {erro ? <p id={`${id}-erro`} className="mt-1 text-xs text-red-600">{erro}</p>
        : ajuda ? <p className="mt-1 text-xs text-[#4a5568]">{ajuda}</p> : null}
    </div>
  );
}

/** Props de acessibilidade para um input com possível erro. */
export const ariaErro = (id: string, erro?: string) => ({
  id,
  "aria-invalid": !!erro,
  "aria-describedby": erro ? `${id}-erro` : undefined,
  className: inputClasse(erro),
});

export function ErroFormulario({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden /> {mensagem}
    </div>
  );
}

export function BotoesFormulario({ aoCancelar, salvando, rotulo = "Salvar" }: { aoCancelar: () => void; salvando: boolean; rotulo?: string }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" onClick={aoCancelar} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#212121] hover:bg-[#F8F9FA]">Cancelar</button>
      <button type="submit" disabled={salvando}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-70">
        {salvando && <Spinner claro />} {rotulo}
      </button>
    </div>
  );
}
