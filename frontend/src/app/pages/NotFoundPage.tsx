import { Link } from "react-router";
import { Logo } from "../components/Logo";

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-6 text-center">
      <Link to="/" className="mb-10" aria-label="Página inicial"><Logo /></Link>
      <p className="text-7xl font-bold text-[#A5D6A7] font-numeric">404</p>
      <h1 className="text-2xl font-bold text-[#212121] mt-2 mb-3 font-display">Página não encontrada</h1>
      <p className="text-[#4a5568] mb-8 max-w-md">O endereço que você acessou não existe ou foi movido.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/" className="px-6 py-3 rounded-xl bg-[#1B5E20] text-white font-semibold hover:bg-[#2E7D32]">Ir para o início</Link>
        <Link to="/dashboard" className="px-6 py-3 rounded-xl border border-border text-[#1B5E20] font-semibold hover:bg-[#E8F5E9]">Acessar minha conta</Link>
      </div>
    </main>
  );
}
