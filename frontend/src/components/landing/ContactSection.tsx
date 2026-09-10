import { useState } from "react";
import { CheckCircle, Mail, MapPin, Phone } from "lucide-react";

const campos = [
  { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva", colSpan: 2 },
  { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br", colSpan: 1 },
  { key: "telefone", label: "Telefone", type: "tel", placeholder: "(16) 99999-0000", colSpan: 1 },
  { key: "cidade", label: "Cidade / Estado", type: "text", placeholder: "Ribeirão Preto, SP", colSpan: 1 },
  { key: "hectares", label: "Área (hectares)", type: "number", placeholder: "100", colSpan: 1 },
] as const;

const culturas = ["Soja", "Milho", "Cana-de-açúcar", "Café", "Algodão", "Citros", "Eucalipto", "Outro"];
const servicos = [
  "NDVI / Saúde vegetativa",
  "Falhas de plantio",
  "Plantas daninhas",
  "Contagem de árvores",
  "Monitoramento completo",
  "Relatório personalizado",
];

const contatos = [
  { icon: Phone, title: "Telefone", info: "+55 (16) 99999-0000" },
  { icon: Mail, title: "Email", info: "contato@agrovision.com.br" },
  { icon: MapPin, title: "Localização", info: "Ribeirão Preto, SP — Brasil" },
];

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  cultura: string;
  hectares: string;
  servico: string;
  mensagem: string;
};

const ESTADO_INICIAL: FormState = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  cultura: "",
  hectares: "",
  servico: "",
  mensagem: "",
};

export function ContactSection() {
  const [formData, setFormData] = useState<FormState>(ESTADO_INICIAL);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contato" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div
              className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Mail className="w-4 h-4" /> Solicitar Análise
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
              Solicite seu
              <span className="text-[#1B5E20] block">orçamento gratuito</span>
            </h2>
            <p className="text-[#4a5568] mb-10 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Preencha o formulário e nossa equipe técnica entrará em contato em até 2 horas úteis com uma proposta
              personalizada para sua propriedade.
            </p>

            <div className="space-y-6">
              {contatos.map(({ icon: Icon, title, info }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div
                      className="text-xs text-[#4a5568] uppercase tracking-wider"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {title}
                    </div>
                    <div className="text-[#212121] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                      {info}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitted ? (
            <div className="bg-[#E8F5E9] rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-96">
              <div className="w-16 h-16 rounded-full bg-[#1B5E20] flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Solicitação recebida!
              </h3>
              <p className="text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
                Nossa equipe entrará em contato em até 2 horas úteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F8F9FA] rounded-2xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-4">
                {campos.map(({ key, label, type, placeholder, colSpan }) => (
                  <div key={key} className={colSpan === 2 ? "col-span-2" : ""}>
                    <label
                      className="block text-sm font-medium text-[#212121] mb-1.5"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                ))}

                <div>
                  <label
                    className="block text-sm font-medium text-[#212121] mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Tipo de cultura
                  </label>
                  <select
                    value={formData.cultura}
                    onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <option value="">Selecionar...</option>
                    {culturas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-[#212121] mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Serviço desejado
                  </label>
                  <select
                    value={formData.servico}
                    onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <option value="">Selecionar...</option>
                    {servicos.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label
                    className="block text-sm font-medium text-[#212121] mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Mensagem (opcional)
                  </label>
                  <textarea
                    placeholder="Descreva sua necessidade..."
                    rows={3}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Solicitar Análise Gratuita
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
