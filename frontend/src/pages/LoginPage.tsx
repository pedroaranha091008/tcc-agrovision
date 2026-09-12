import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AlertCircle, Leaf, LogIn } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { GoogleLoginButton } from "@/features/auth/GoogleLoginButton";
import { mensagemDoErro } from "@/services/erros";

const numeros = [
  { value: "98%", label: "Precisão" },
  { value: "48h", label: "Entrega" },
  { value: "500+", label: "Clientes" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginGoogle } = useAuth();
  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      await login({ email, senha: password });
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(
    async (idToken: string) => {
      setErro(null);
      try {
        await loginGoogle(idToken);
        navigate(destino, { replace: true });
      } catch (err) {
        setErro(mensagemDoErro(err));
      }
    },
    [loginGoogle, navigate, destino],
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&h=1200&fit=crop&auto=format"
            alt="Drone sobre lavoura de soja"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/90 to-[#0a2e0c]/95" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
              Agro<span className="text-[#A5D6A7]">Vision</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Inteligência que
            <br />
            <span className="text-[#A5D6A7]">transforma o campo</span>
          </div>
          <p className="text-white/70 mb-8" style={{ fontFamily: "Inter, sans-serif" }}>
            Acesse sua conta e monitore suas lavouras com dados precisos de mapeamento aéreo.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {numeros.map(({ value, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-[#A5D6A7]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {value}
                </div>
                <div className="text-white/60 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
          © 2026 AgroVision — Plataforma de Agricultura de Precisão
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#1B5E20]" />
            </div>
            <span className="font-bold text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>
              AgroVision
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#212121] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Bem-vindo de volta
            </h2>
            <p className="text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
              Entre na sua conta para continuar
            </p>
          </div>

          {erro && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-7">
            <GoogleLoginButton onSuccess={handleGoogle} onError={setErro} />
          </div>

          <div className="relative mb-7">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#4a5568] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                ou entre com email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#212121] mb-1.5"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="joao@fazenda.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-senha"
                  className="text-sm font-medium text-[#212121]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs text-[#1B5E20] hover:underline"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Esqueci a senha
                </button>
              </div>
              <input
                id="login-senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border text-[#1B5E20] focus:ring-[#66BB6A] accent-[#1B5E20]"
              />
              <label htmlFor="remember" className="text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
                Lembrar de mim
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-[#1B5E20] font-semibold hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
