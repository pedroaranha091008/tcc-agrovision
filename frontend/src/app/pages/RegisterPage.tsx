import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AlertTriangle, Building2, Leaf, Tractor } from "lucide-react";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Carregando";
import { GoogleEmBreve, PainelLateral } from "./LoginPage";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import type { TipoUsuario } from "../lib/site";
import { emailValido, SENHA_MINIMA } from "../lib/validation";

type Campos = { nome: string; email: string; senha: string; confirmar: string };
type Erros = Partial<Record<keyof Campos | "termos", string>>;

const TIPOS: { value: TipoUsuario; label: string; icon: typeof Tractor }[] = [
  { value: "produtor", label: "Produtor", icon: Tractor },
  { value: "agronomo", label: "Agrônomo", icon: Leaf },
  { value: "empresa", label: "Empresa", icon: Building2 },
];

const CAMPOS: { key: keyof Campos; label: string; type: string; placeholder: string; autoComplete: string }[] = [
  { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br", autoComplete: "email" },
  { key: "senha", label: "Senha", type: "password", placeholder: `Mínimo ${SENHA_MINIMA} caracteres`, autoComplete: "new-password" },
  { key: "confirmar", label: "Confirmar senha", type: "password", placeholder: "Repita a senha", autoComplete: "new-password" },
];

function validar(c: Campos, termos: boolean): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 3) e.nome = "Informe seu nome completo.";
  if (!emailValido(c.email)) e.email = "Informe um email válido.";
  if (c.senha.length < SENHA_MINIMA) e.senha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  else if (!/[A-Za-z]/.test(c.senha) || !/\d/.test(c.senha)) e.senha = "Use letras e números na senha.";
  if (c.confirmar !== c.senha) e.confirmar = "As senhas não conferem.";
  if (!termos) e.termos = "É preciso aceitar os termos para criar a conta.";
  return e;
}

export function RegisterPage() {
  const { usuario, cadastrar } = useAuth();
  const navigate = useNavigate();
  const [campos, setCampos] = useState<Campos>({ nome: "", email: "", senha: "", confirmar: "" });
  const [tipo, setTipo] = useState<TipoUsuario>("produtor");
  const [termos, setTermos] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (usuario) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(null);
    const encontrados = validar(campos, termos);
    setErros(encontrados);
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) return document.getElementById(`cad-${primeiro}`)?.focus();

    setCarregando(true);
    try {
      await cadastrar({ nome: campos.nome.trim(), email: campos.email.trim(), senha: campos.senha, tipo_usuario: tipo });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_JA_CADASTRADO") setErros({ email: err.message });
        else if (err.details) setErros(Object.fromEntries(err.details.map(d => [d.campo, d.mensagem])));
        setErroGeral(err.message);
      } else setErroGeral("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <PainelLateral />

      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="lg:hidden inline-flex mb-8" aria-label="Voltar para a página inicial"><Logo tamanho="sm" /></Link>

          <h1 className="text-3xl font-bold text-[#212121] mb-2 font-display">Criar conta</h1>
          <p className="text-[#4a5568] text-sm mb-7">Comece a mapear sua lavoura gratuitamente</p>

          <GoogleEmBreve />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {CAMPOS.map(({ key, label, type, placeholder, autoComplete }) => (
              <div key={key}>
                <label htmlFor={`cad-${key}`} className="block text-sm font-medium text-[#212121] mb-1.5">{label}</label>
                <input id={`cad-${key}`} type={type} placeholder={placeholder} autoComplete={autoComplete}
                  value={campos[key]}
                  onChange={e => { setCampos({ ...campos, [key]: e.target.value }); setErros({ ...erros, [key]: undefined }); }}
                  aria-invalid={!!erros[key]} aria-describedby={erros[key] ? `cad-${key}-erro` : undefined}
                  className={`w-full px-4 py-3 rounded-xl border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm ${erros[key] ? "border-red-400" : "border-border"}`} />
                {erros[key] && <p id={`cad-${key}-erro`} className="mt-1 text-xs text-red-600">{erros[key]}</p>}
              </div>
            ))}

            <fieldset>
              <legend className="block text-sm font-medium text-[#212121] mb-2">Tipo de usuário</legend>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {TIPOS.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" role="radio" aria-checked={tipo === value}
                    onClick={() => setTipo(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${tipo === value ? "border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20]" : "border-border text-[#4a5568] hover:border-[#A5D6A7]"}`}>
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="cad-termos" checked={termos} onChange={e => { setTermos(e.target.checked); setErros({ ...erros, termos: undefined }); }}
                  aria-invalid={!!erros.termos} className="w-4 h-4 mt-0.5 rounded accent-[#1B5E20]" />
                <label htmlFor="cad-termos" className="text-sm text-[#4a5568]">
                  Li e aceito os <Link to="/termos" target="_blank" className="text-[#1B5E20] underline">Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" className="text-[#1B5E20] underline">Política de Privacidade</Link>.
                </label>
              </div>
              {erros.termos && <p className="mt-1 text-xs text-red-600">{erros.termos}</p>}
            </div>

            {erroGeral && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden /> {erroGeral}
              </div>
            )}

            <button type="submit" disabled={carregando}
              className="w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 font-display">
              {carregando ? <><Spinner claro /> Criando conta...</> : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#4a5568]">
            Já tem conta?{" "}
            <Link to="/login" className="text-[#1B5E20] font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
