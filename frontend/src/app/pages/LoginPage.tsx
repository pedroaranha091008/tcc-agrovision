import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, LogIn } from "lucide-react";
import loginImg from "../../assets/login.jpg";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Carregando";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { CONTATO } from "../lib/site";
import { emailValido } from "../lib/validation";

const inputBase = "w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm";

/** Painel com foto à esquerda, compartilhado por login e cadastro em telas grandes. */
export function PainelLateral() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
      <div className="absolute inset-0">
        <img src={loginImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/90 to-[#0a2e0c]/95" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      </div>

      <div className="relative z-10">
        <Link to="/" aria-label="Voltar para a página inicial"><Logo variante="claro" /></Link>
      </div>

      <div className="relative z-10">
        <div className="text-4xl font-bold text-white mb-4 font-display">
          Inteligência que<br /><span className="text-[#A5D6A7]">transforma o campo</span>
        </div>
        <p className="text-white/70 mb-8">
          Acesse sua conta e monitore suas lavouras com dados precisos de mapeamento aéreo.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[{ value: "98%", label: "Precisão" }, { value: "48h", label: "Entrega" }, { value: "500+", label: "Clientes" }].map(({ value, label }) => (
            <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#A5D6A7] font-display">{value}</div>
              <div className="text-white/60 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-white/40 text-xs">© 2026 AgroVision — Plataforma de Agricultura de Precisão</div>
    </div>
  );
}

export function GoogleEmBreve() {
  return (
    <>
      <button type="button" disabled
        className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border border-border bg-white text-[#212121]/60 font-medium text-sm cursor-not-allowed">
        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continuar com Google
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-[#E8F5E9] text-[#1B5E20] px-2 py-0.5 rounded-full">Em breve</span>
      </button>
      <div className="relative my-7">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-4 text-[#4a5568] text-sm">ou use seu email</span></div>
      </div>
    </>
  );
}

export function LoginPage() {
  const { usuario, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (usuario) return <Navigate to={destino} replace />;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!emailValido(email)) return setErro("Informe um email válido.");
    if (!senha) return setErro("Informe sua senha.");

    setCarregando(true);
    try {
      await entrar(email.trim(), senha, lembrar);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <PainelLateral />

      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex mb-8" aria-label="Voltar para a página inicial"><Logo tamanho="sm" /></Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#212121] mb-2 font-display">Bem-vindo de volta</h1>
            <p className="text-[#4a5568]">Entre na sua conta para continuar</p>
          </div>

          <GoogleEmBreve />

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#212121] mb-1.5">Email</label>
              <input id="login-email" type="email" autoComplete="email" placeholder="joao@fazenda.com.br" value={email} onChange={e => setEmail(e.target.value)} className={inputBase} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-senha" className="text-sm font-medium text-[#212121]">Senha</label>
                <button type="button" className="text-xs text-[#1B5E20] hover:underline"
                  onClick={() => toast.info("Recuperação de senha em breve", { description: `Por enquanto, escreva para ${CONTATO.email} que redefinimos sua senha.` })}>
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <input id="login-senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} className={`${inputBase} pr-11`} />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#4a5568] hover:text-[#1B5E20]">
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="login-lembrar" checked={lembrar} onChange={e => setLembrar(e.target.checked)} className="w-4 h-4 rounded accent-[#1B5E20]" />
              <label htmlFor="login-lembrar" className="text-sm text-[#4a5568]">Manter conectado neste dispositivo</label>
            </div>

            {erro && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden /> {erro}
              </div>
            )}

            <button type="submit" disabled={carregando}
              className="w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 font-display">
              {carregando ? <><Spinner claro /> Entrando...</> : <><LogIn className="w-5 h-5" aria-hidden /> Entrar</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4a5568]">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-[#1B5E20] font-semibold hover:underline">Criar conta gratuita</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
