import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle, Mail, MapPin, Phone } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { CONTATO, CULTURAS, SERVICOS, telefoneHref } from "../../lib/site";
import { emailValido, mascaraTelefone, telefoneValido } from "../../lib/validation";
import { Spinner } from "../../components/Carregando";

type Campos = { nome: string; email: string; telefone: string; cidade: string; cultura: string; hectares: string; servico: string; mensagem: string };
type Erros = Partial<Record<keyof Campos, string>>;

const VAZIO: Campos = { nome: "", email: "", telefone: "", cidade: "", cultura: "", hectares: "", servico: "", mensagem: "" };

function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 3) e.nome = "Informe seu nome completo.";
  if (!emailValido(c.email)) e.email = "Informe um email válido, ex.: joao@fazenda.com.br";
  if (!telefoneValido(c.telefone)) e.telefone = "Informe o telefone com DDD.";
  if (c.cidade.trim().length < 3) e.cidade = "Informe a cidade e o estado.";
  const ha = Number(c.hectares);
  if (!c.hectares || !Number.isFinite(ha) || ha <= 0) e.hectares = "Informe uma área maior que zero.";
  else if (ha > 1_000_000) e.hectares = "Área muito grande — confira o valor.";
  if (!c.cultura) e.cultura = "Selecione a cultura.";
  if (!c.servico) e.servico = "Selecione o serviço.";
  if (c.mensagem.length > 2000) e.mensagem = "Mensagem muito longa (máx. 2000 caracteres).";
  return e;
}

const inputBase = "w-full px-4 py-2.5 rounded-xl border bg-white text-[#212121] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm";

function Campo({ id, label, erro, children, className = "" }: { id: string; label: string; erro?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-[#212121] mb-1.5">{label}</label>
      {children}
      {erro && <p id={`${id}-erro`} className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

export function ContactSection({ servicoEscolhido }: { servicoEscolhido: { servico: string; vez: number } | null }) {
  const [campos, setCampos] = useState<Campos>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // "Solicitar este serviço" na seção de serviços preenche o campo e traz o formulário.
  useEffect(() => {
    if (!servicoEscolhido) return;
    setEnviado(null);
    setCampos(c => ({ ...c, servico: servicoEscolhido.servico }));
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  }, [servicoEscolhido]);

  const alterar = (campo: keyof Campos, valor: string) => {
    setCampos(c => ({ ...c, [campo]: valor }));
    if (erros[campo]) setErros(e => ({ ...e, [campo]: undefined }));
  };

  const props = (campo: keyof Campos) => ({
    id: `orc-${campo}`,
    value: campos[campo],
    "aria-invalid": !!erros[campo],
    "aria-describedby": erros[campo] ? `orc-${campo}-erro` : undefined,
    className: `${inputBase} ${erros[campo] ? "border-red-400" : "border-border"}`,
  });

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErroEnvio(null);
    const encontrados = validar(campos);
    setErros(encontrados);
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) {
      formRef.current?.querySelector<HTMLElement>(`#orc-${primeiro}`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      await api("/orcamentos", {
        method: "POST",
        publico: true,
        body: {
          nome: campos.nome.trim(),
          email: campos.email.trim(),
          telefone: campos.telefone,
          cidade: campos.cidade.trim(),
          cultura: campos.cultura,
          area_hectares: Number(campos.hectares),
          servico: campos.servico,
          mensagem: campos.mensagem.trim() || undefined,
        },
      });
      setEnviado(campos.nome.trim().split(" ")[0]);
      setCampos(VAZIO);
    } catch (erro) {
      if (erro instanceof ApiError && erro.details) {
        const daApi: Erros = {};
        for (const d of erro.details) daApi[(d.campo === "area_hectares" ? "hectares" : d.campo) as keyof Campos] = d.mensagem;
        setErros(daApi);
      }
      setErroEnvio(erro instanceof ApiError ? erro.message : "Não foi possível enviar sua solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="contato" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <Mail className="w-4 h-4" aria-hidden /> Solicitar Análise
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 font-display">
              Solicite seu
              <span className="text-[#1B5E20] block">orçamento gratuito</span>
            </h2>
            <p className="text-[#4a5568] mb-10 leading-relaxed">
              Preencha o formulário e nossa equipe técnica entrará em contato em até 2 horas úteis com uma proposta personalizada para sua propriedade.
            </p>

            <div className="space-y-6">
              {[
                { icon: Phone, title: "Telefone", info: CONTATO.telefone, href: telefoneHref(CONTATO.telefone) },
                { icon: Mail, title: "Email", info: CONTATO.email, href: `mailto:${CONTATO.email}` },
                { icon: MapPin, title: "Localização", info: CONTATO.cidade, href: null },
              ].map(({ icon: Icon, title, info, href }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1B5E20]" aria-hidden />
                  </div>
                  <div>
                    <div className="text-xs text-[#4a5568] uppercase tracking-wider">{title}</div>
                    {href
                      ? <a href={href} className="text-[#212121] font-medium hover:text-[#1B5E20] hover:underline">{info}</a>
                      : <div className="text-[#212121] font-medium">{info}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {enviado ? (
            <div role="status" className="bg-[#E8F5E9] rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-96">
              <div className="w-16 h-16 rounded-full bg-[#1B5E20] flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" aria-hidden />
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-2 font-display">Solicitação recebida, {enviado}!</h3>
              <p className="text-[#4a5568] mb-6">Nossa equipe entrará em contato em até 2 horas úteis pelo telefone ou email informado.</p>
              <button onClick={() => setEnviado(null)} className="text-sm font-semibold text-[#1B5E20] hover:underline">Enviar outra solicitação</button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={enviar} noValidate className="bg-[#F8F9FA] rounded-2xl p-6 sm:p-8 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo id="orc-nome" label="Nome completo" erro={erros.nome} className="sm:col-span-2">
                  <input type="text" placeholder="João da Silva" autoComplete="name" maxLength={150} {...props("nome")} onChange={e => alterar("nome", e.target.value)} />
                </Campo>
                <Campo id="orc-email" label="Email" erro={erros.email}>
                  <input type="email" placeholder="joao@fazenda.com.br" autoComplete="email" maxLength={255} {...props("email")} onChange={e => alterar("email", e.target.value)} />
                </Campo>
                <Campo id="orc-telefone" label="Telefone" erro={erros.telefone}>
                  <input type="tel" placeholder="(16) 99999-0000" autoComplete="tel" inputMode="tel" {...props("telefone")} onChange={e => alterar("telefone", mascaraTelefone(e.target.value))} />
                </Campo>
                <Campo id="orc-cidade" label="Cidade / Estado" erro={erros.cidade}>
                  <input type="text" placeholder="Ribeirão Preto, SP" autoComplete="address-level2" maxLength={150} {...props("cidade")} onChange={e => alterar("cidade", e.target.value)} />
                </Campo>
                <Campo id="orc-hectares" label="Área (hectares)" erro={erros.hectares}>
                  <input type="number" placeholder="100" min={0.1} step="any" inputMode="decimal" {...props("hectares")} onChange={e => alterar("hectares", e.target.value)} />
                </Campo>
                <Campo id="orc-cultura" label="Tipo de cultura" erro={erros.cultura}>
                  <select {...props("cultura")} onChange={e => alterar("cultura", e.target.value)}>
                    <option value="">Selecionar...</option>
                    {CULTURAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Campo>
                <Campo id="orc-servico" label="Serviço desejado" erro={erros.servico}>
                  <select {...props("servico")} onChange={e => alterar("servico", e.target.value)}>
                    <option value="">Selecionar...</option>
                    {SERVICOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Campo>
                <Campo id="orc-mensagem" label="Mensagem (opcional)" erro={erros.mensagem} className="sm:col-span-2">
                  <textarea placeholder="Descreva sua necessidade..." rows={3} maxLength={2000} {...props("mensagem")} className={`${props("mensagem").className} resize-none`} onChange={e => alterar("mensagem", e.target.value)} />
                </Campo>
              </div>

              {erroEnvio && (
                <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold">{erroEnvio}</p>
                    <p className="mt-1">Se preferir, fale direto com a gente: <a className="underline" href={telefoneHref(CONTATO.telefone)}>{CONTATO.telefone}</a> ou <a className="underline" href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.</p>
                  </div>
                </div>
              )}

              <button type="submit" disabled={enviando}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 font-display">
                {enviando ? <><Spinner claro /> Enviando...</> : "Solicitar Análise Gratuita"}
              </button>
              <p className="mt-3 text-xs text-center text-[#4a5568]">
                Usamos seus dados apenas para responder a esta solicitação. Veja a <Link to="/privacidade" className="underline">Política de Privacidade</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
