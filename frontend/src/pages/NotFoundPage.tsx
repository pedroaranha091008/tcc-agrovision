import { Link } from "react-router";
import { Leaf } from "lucide-react";

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-6 text-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-14 h-14 rounded-lg bg-[#1B5E20] flex items-center justify-center mb-6">
        <Leaf className="w-7 h-7 text-white" />
      </div>
      <p className="text-8xl font-black text-[#1B5E20] tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
        404
      </p>
      <h1 className="mt-2 text-xl font-bold text-[#212121]">Página não encontrada</h1>
      <p className="mt-2 text-[#4a5568] max-w-sm">
        O endereço acessado não existe ou foi movido. Verifique o link ou volte para o início.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-md bg-[#1B5E20] text-white font-semibold transition-all shadow-[3px_3px_0_0_#A5D6A7] hover:shadow-[1px_1px_0_0_#A5D6A7] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Voltar ao início
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-md border border-[#1B5E20]/30 text-[#1B5E20] font-semibold hover:bg-[#E8F5E9] transition-colors"
        >
          Ir para o dashboard
        </Link>
      </div>
    </div>
  );
}
