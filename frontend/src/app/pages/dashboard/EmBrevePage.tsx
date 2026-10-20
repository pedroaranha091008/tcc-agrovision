import { Link } from "react-router";
import { Activity, Calendar, CheckCircle, FileText, Tractor, type LucideIcon } from "lucide-react";
import { CabecalhoPagina } from "./DashboardLayout";

type Secao = { titulo: string; descricao: string; icon: LucideIcon; recursos: string[] };

export const SECOES_EM_BREVE: Record<"analises" | "relatorios" | "fazendas" | "agendamentos", Secao> = {
  fazendas: {
    titulo: "Fazendas",
    descricao: "Cadastre suas propriedades e divida-as em talhões.",
    icon: Tractor,
    recursos: ["Cadastro de propriedades com cidade, estado e área", "Talhões com cultura, área e localização", "Mapa de cada talhão"],
  },
  analises: {
    titulo: "Minhas Análises",
    descricao: "Envie as imagens do drone e acompanhe o histórico de monitoramentos.",
    icon: Activity,
    recursos: ["Envio de imagens captadas pelo drone", "Identificação de falhas, plantas daninhas e áreas críticas", "Histórico com filtros por data, talhão e tipo de análise"],
  },
  relatorios: {
    titulo: "Relatórios",
    descricao: "Relatórios técnicos de cada análise, prontos para baixar.",
    icon: FileText,
    recursos: ["Relatório em PDF com mapas e indicadores", "Recomendações agronômicas por talhão", "Compartilhamento com o agrônomo responsável"],
  },
  agendamentos: {
    titulo: "Agendamentos",
    descricao: "Agende voos de drone com a nossa equipe.",
    icon: Calendar,
    recursos: ["Solicitar data de voo por talhão", "Acompanhar status do agendamento", "Lembretes antes do voo"],
  },
};

export function EmBrevePage({ secao }: { secao: keyof typeof SECOES_EM_BREVE }) {
  const { titulo, descricao, icon: Icon, recursos } = SECOES_EM_BREVE[secao];
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]">Voltar à visão geral</Link>
          <Link to="/#contato" className="px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32]">Solicitar um voo com a equipe</Link>
        </div>
      </div>
    </>
  );
}
