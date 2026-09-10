import { Link } from "react-router";
import { Leaf } from "lucide-react";

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-6 text-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center mb-6">
        <Leaf className="w-7 h-7 text-white" />
      </div>
      <p className="text-6xl font-bold text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-[#212121]">Página não encontrada</h1>
      <p className="mt-2 text-[#4a5568] max-w-sm">
        O endereço acessado não existe ou foi movido. Verifique o link ou volte para o início.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white font-semibold hover:bg-[#2E7D32] transition-colors"
        >
          Voltar ao início
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl border border-[#1B5E20]/30 text-[#1B5E20] font-semibold hover:bg-[#E8F5E9] transition-colors"
        >
          Ir para o dashboard
        </Link>
      </div>
    </div>
  );
}
