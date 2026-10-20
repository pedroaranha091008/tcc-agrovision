import { Link } from "react-router";
import { Calendar, CheckCircle, type LucideIcon } from "lucide-react";
import { CabecalhoPagina } from "./DashboardLayout";

type Secao = { titulo: string; descricao: string; icon: LucideIcon; recursos: string[]; enquantoIsso?: { texto: string; link: { to: string; label: string } } };

export const SECOES_EM_BREVE: Record<"agendamentos", Secao> = {
  agendamentos: {
    titulo: "Agendamentos",
    descricao: "Agende voos de drone com a nossa equipe.",
    icon: Calendar,
    recursos: ["Solicitar data de voo por talhão", "Acompanhar status do agendamento", "Lembretes antes do voo"],
  },
};

export function EmBrevePage({ secao }: { secao: keyof typeof SECOES_EM_BREVE }) {
  const { titulo, descricao, icon: Icon, recursos, enquantoIsso } = SECOES_EM_BREVE[secao];
  return (
    <>
      <CabecalhoPagina titulo={titulo} descricao={descricao} />
      <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mx-auto mb-5">
          <Icon className="w-8 h-8 text-[#1B5E20]" aria-hidden />
        </div>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full mb-4">Em desenvolvimento</span>
        <h2 className="text-xl font-bold text-[#212121] mb-2 font-display">Esta área estará disponível em breve</h2>
        <p className="text-[#4a5568] text-sm mb-6">Estamos construindo esta parte da plataforma. Ela vai permitir:</p>
        <ul className="text-left inline-block space-y-2 mb-8">
          {recursos.map(r => (
            <li key={r} className="flex items-start gap-2 text-sm text-[#212121]">
              <CheckCircle className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" aria-hidden /> {r}
            </li>
          ))}
        </ul>
        {enquantoIsso && <p className="text-sm text-[#212121] bg-[#E8F5E9] rounded-xl p-3 mb-6">{enquantoIsso.texto}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]">Voltar à visão geral</Link>
          {enquantoIsso
            ? <Link to={enquantoIsso.link.to} className="px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32]">{enquantoIsso.link.label}</Link>
            : <Link to="/#contato" className="px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32]">Solicitar um voo com a equipe</Link>}
        </div>
      </div>
    </>
  );
}
