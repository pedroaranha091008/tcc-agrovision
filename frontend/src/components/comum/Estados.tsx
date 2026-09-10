import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { mensagemDoErro } from "@/services/erros";

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-[#4a5568]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Loader2 className="w-7 h-7 animate-spin text-[#1B5E20]" />
      <span className="text-sm">{texto}</span>
    </div>
  );
}

export function EstadoErro({ erro, onTentarNovamente }: { erro: unknown; onTentarNovamente?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-14 px-6 text-center"
      style={{ fontFamily: "Inter, sans-serif" }}
      role="alert"
    >
      <AlertTriangle className="w-8 h-8 text-red-500" />
      <p className="text-sm text-red-700 max-w-sm">{mensagemDoErro(erro)}</p>
      {onTentarNovamente && (
        <button
          onClick={onTentarNovamente}
          className="mt-1 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white py-16 px-6 text-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-1">
        <Inbox className="w-6 h-6 text-[#1B5E20]" />
      </div>
      <h3 className="font-semibold text-[#212121]" style={{ fontFamily: "Poppins, sans-serif" }}>
        {titulo}
      </h3>
      {descricao && <p className="text-sm text-[#4a5568] max-w-sm">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}
