import { useRef, useState } from "react";
import { z } from "zod";
import { AlertTriangle, CheckCircle, Mail, MapPin, Phone } from "lucide-react";
import { Kicker } from "./Kicker";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { ApiError } from "@/services/erros";
import { solicitarOrcamento } from "@/services/orcamentos";

const campos = [
  { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva", colSpan: 2, autoComplete: "name" },
  { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br", colSpan: 1, autoComplete: "email" },
  { key: "telefone", label: "Telefone", type: "tel", placeholder: "(16) 99999-0000", colSpan: 1, autoComplete: "tel" },
  { key: "cidade", label: "Cidade / Estado", type: "text", placeholder: "Ribeirão Preto, SP", colSpan: 1, autoComplete: "address-level2" },
  { key: "hectares", label: "Área (hectares)", type: "text", placeholder: "100", colSpan: 1, autoComplete: "off" },
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

const TELEFONE = "+55 (16) 99999-0000";
const EMAIL = "contato@agrovision.com.br";
const contatos = [
  { icon: Phone, title: "Telefone", info: TELEFONE, href: `tel:+${TELEFONE.replace(/\D/g, "")}` },
  { icon: Mail, title: "Email", info: EMAIL, href: `mailto:${EMAIL}` },
  { icon: MapPin, title: "Localização", info: "Ribeirão Preto, SP — Brasil", href: null },
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

const orcamentoSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().trim().email("Informe um email válido, ex.: joao@fazenda.com.br"),
  telefone: z.string().refine((t) => [10, 11].includes(t.replace(/\D/g, "").length), "Informe o telefone com DDD."),
  cidade: z.string().trim().min(3, "Informe a cidade e o estado."),
  hectares: z
    .string()
    .transform((v) => Number(v.trim().replace(",", ".")))
    .pipe(z.number({ message: "Informe a área em hectares." }).positive("Informe uma área maior que zero.").max(1_000_000, "Área muito grande — confira o valor.")),
  cultura: z.string().min(1, "Selecione a cultura."),
  servico: z.string().min(1, "Selecione o serviço."),
  mensagem: z.string().max(2000, "Mensagem muito longa (máx. 2000 caracteres)."),
});

/** Formata enquanto digita: (16) 99999-0000 */
function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Nomes dos campos na API -> campos do formulário (para mostrar os erros de validação do servidor no lugar certo).
const CAMPO_DA_API: Record<string, keyof FormState> = { area_hectares: "hectares" };

const classeCampo = (erro?: string) =>
  `w-full px-4 py-2.5 rounded-md border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm ${
    erro ? "border-red-400" : "border-border"
  }`;

export function ContactSection() {
  const [formData, setFormData] = useState<FormState>(ESTADO_INICIAL);
  const [erros, setErros] = useState<ErrosCampo>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const alterar = (campo: keyof FormState, valor: string) => {
    setFormData((f) => ({ ...f, [campo]: campo === "telefone" ? mascaraTelefone(valor) : valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: "" }));
  };

  const acessivel = (campo: keyof FormState) => ({
    id: `orc-${campo}`,
    "aria-invalid": erros[campo] ? true : undefined,
    "aria-describedby": erros[campo] ? `orc-${campo}-erro` : undefined,
    className: classeCampo(erros[campo]),
    style: { fontFamily: "Inter, sans-serif" },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroEnvio(null);
    const r = validarCom(orcamentoSchema, formData);
    if (!r.ok) {
      setErros(r.erros);
      const primeiro = Object.keys(r.erros)[0];
      formRef.current?.querySelector<HTMLElement>(`#orc-${primeiro}`)?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      await solicitarOrcamento({
        nome: r.dados.nome,
        email: r.dados.email,
        telefone: formData.telefone,
        cidade: r.dados.cidade,
        cultura: r.dados.cultura,
        area_hectares: r.dados.hectares,
        servico: r.dados.servico,
        mensagem: r.dados.mensagem.trim() || undefined,
      });
      setEnviadoPara(r.dados.nome.split(" ")[0]);
      setFormData(ESTADO_INICIAL);
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.details) && err.details.length) {
        const daApi: ErrosCampo = {};
        for (const d of err.details as { campo: string; mensagem: string }[]) {
          daApi[CAMPO_DA_API[d.campo] ?? d.campo] = d.mensagem;
        }
        setErros(daApi);
      }
      setErroEnvio(
        err instanceof ApiError && err.status !== 0
          ? err.message
          : "Não foi possível enviar sua solicitação agora.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const Erro = ({ campo }: { campo: keyof FormState }) =>
    erros[campo] ? (
      <p id={`orc-${campo}-erro`} className="mt-1 text-xs text-red-600">
        {erros[campo]}
      </p>
    ) : null;

  const Rotulo = ({ campo, children }: { campo: keyof FormState; children: string }) => (
    <label htmlFor={`orc-${campo}`} className="block text-sm font-medium text-[#212121] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
      {children}
    </label>
  );

  return (
    <section id="contato" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <Kicker>Solicitar Análise</Kicker>
            <h2
              className="text-5xl md:text-6xl font-black text-[#212121] mb-6 tracking-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Solicite seu
              <span className="text-[#1B5E20] block">orçamento gratuito</span>
            </h2>
            <p className="text-[#4a5568] mb-10 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Preencha o formulário e nossa equipe técnica entrará em contato em até 2 horas úteis com uma proposta
              personalizada para sua propriedade.
            </p>

            <div className="space-y-6">
              {contatos.map(({ icon: Icon, title, info, href }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-md bg-[#1B5E20] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-[#4a5568] uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
                      {title}
                    </div>
                    {href ? (
                      <a href={href} className="text-[#212121] font-medium hover:text-[#1B5E20] hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>
                        {info}
                      </a>
                    ) : (
                      <div className="text-[#212121] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                        {info}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {enviadoPara ? (
            <div role="status" className="bg-[#E8F5E9] rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-96">
              <div className="w-16 h-16 rounded-full bg-[#1B5E20] flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Solicitação recebida, {enviadoPara}!
              </h3>
              <p className="text-[#4a5568] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
                Nossa equipe entrará em contato em até 2 horas úteis pelo telefone ou email informado.
              </p>
              <button onClick={() => setEnviadoPara(null)} className="text-sm font-semibold text-[#1B5E20] hover:underline">
                Enviar outra solicitação
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="bg-[#F8F9FA] rounded-lg p-6 sm:p-8 border-2 border-[#212121]/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campos.map(({ key, label, type, placeholder, colSpan, autoComplete }) => (
                  <div key={key} className={colSpan === 2 ? "sm:col-span-2" : ""}>
                    <Rotulo campo={key}>{label}</Rotulo>
                    <input
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      inputMode={key === "hectares" ? "decimal" : key === "telefone" ? "tel" : undefined}
                      value={formData[key]}
                      onChange={(e) => alterar(key, e.target.value)}
                      {...acessivel(key)}
                    />
                    <Erro campo={key} />
                  </div>
                ))}

                <div>
                  <Rotulo campo="cultura">Tipo de cultura</Rotulo>
                  <select value={formData.cultura} onChange={(e) => alterar("cultura", e.target.value)} {...acessivel("cultura")}>
                    <option value="">Selecionar...</option>
                    {culturas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Erro campo="cultura" />
                </div>

                <div>
                  <Rotulo campo="servico">Serviço desejado</Rotulo>
                  <select value={formData.servico} onChange={(e) => alterar("servico", e.target.value)} {...acessivel("servico")}>
                    <option value="">Selecionar...</option>
                    {servicos.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Erro campo="servico" />
                </div>

                <div className="sm:col-span-2">
                  <Rotulo campo="mensagem">Mensagem (opcional)</Rotulo>
                  <textarea
                    placeholder="Descreva sua necessidade..."
                    rows={3}
                    maxLength={2000}
                    value={formData.mensagem}
                    onChange={(e) => alterar("mensagem", e.target.value)}
                    {...acessivel("mensagem")}
                    className={`${classeCampo(erros.mensagem)} resize-none`}
                  />
                  <Erro campo="mensagem" />
                </div>
              </div>

              {erroEnvio && (
                <div role="alert" className="mt-5 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{erroEnvio}</p>
                    <p className="mt-1">
                      Se preferir, fale direto com a gente: <a className="underline" href={contatos[0].href!}>{TELEFONE}</a> ou{" "}
                      <a className="underline" href={contatos[1].href!}>{EMAIL}</a>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-6 py-4 bg-[#1B5E20] text-white font-bold rounded-md transition-all shadow-[4px_4px_0_0_#0a2e0c] hover:shadow-[2px_2px_0_0_#0a2e0c] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {enviando && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {enviando ? "Enviando..." : "Solicitar Análise Gratuita"}
              </button>
              <p className="mt-3 text-xs text-center text-[#4a5568]">
                Usamos seus dados apenas para responder a esta solicitação. Veja a{" "}
                <a href="/privacidade" className="underline">Política de Privacidade</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
