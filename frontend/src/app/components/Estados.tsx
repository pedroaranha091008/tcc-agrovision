import type { ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { ApiError } from "../lib/api";

/** Estado vazio com chamada para a primeira ação. */
export function EstadoVazio({ icon: Icon, titulo, texto, acao }: { icon: LucideIcon; titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#A5D6A7] p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#1B5E20]" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-[#212121] mb-1 font-display">{titulo}</h2>
      <p className="text-sm text-[#4a5568] mb-6 max-w-md mx-auto">{texto}</p>
      {acao}
    </div>
  );
}

/** Erro ao carregar uma página: 404 vira "não encontrado", o resto oferece tentar de novo. */
export function EstadoErro({ erro, aoTentarNovamente, voltarPara }: { erro: ApiError; aoTentarNovamente: () => void; voltarPara: { to: string; label: string } }) {
  const naoEncontrado = erro.status === 404;
  return (
    <div role="alert" className="bg-white rounded-2xl border border-border p-10 text-center">
      <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" aria-hidden />
      <h2 className="text-lg font-bold text-[#212121] mb-1 font-display">{naoEncontrado ? "Não encontrado" : "Não foi possível carregar"}</h2>
      <p className="text-sm text-[#4a5568] mb-6">{naoEncontrado ? "Este registro não existe ou foi excluído." : erro.message}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {!naoEncontrado && <button onClick={aoTentarNovamente} className="px-4 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32]">Tentar novamente</button>}
        <Link to={voltarPara.to} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]">{voltarPara.label}</Link>
      </div>
    </div>
  );
}

export function BotaoPrimario({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all">
      {children}
    </button>
  );
}

export function LinkPrimario({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link to={to} className="inline-flex items-center justify-center gap-2 bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] transition-all">
      {children}
    </Link>
  );
}
