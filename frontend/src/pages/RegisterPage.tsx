import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, Leaf } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { GoogleLoginButton } from "@/features/auth/GoogleLoginButton";
import { mensagemDoErro } from "@/services/erros";

const campos = [
  { key: "nome", label: "Nome completo", type: "text", placeholder: "João da Silva", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", placeholder: "joao@fazenda.com.br", autoComplete: "email" },
  { key: "senha", label: "Senha", type: "password", placeholder: "Mínimo 8 caracteres", autoComplete: "new-password" },
  {
    key: "confirmar",
    label: "Confirmar senha",
    type: "password",
    placeholder: "Repita a senha",
    autoComplete: "new-password",
  },
] as const;

type FormState = { nome: string; email: string; senha: string; confirmar: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const { registrar, loginGoogle } = useAuth();
  const [form, setForm] = useState<FormState>({ nome: "", email: "", senha: "", confirmar: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (form.senha.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await registrar({ nome: form.nome, email: form.email, senha: form.senha });
      navigate("/dashboard", { replace: true });
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
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setErro(mensagemDoErro(err));
      }
    },
    [loginGoogle, navigate],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mx-auto mb-8 justify-center">
          <div className="w-9 h-9 rounded-md bg-[#1B5E20] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Agro<span className="text-[#66BB6A]">Vision</span>
          </span>
        </Link>

        <div className="bg-white rounded-lg p-8 border-2 border-[#212121]/10">
          <h2 className="text-3xl font-black text-[#212121] mb-1 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            Criar conta
          </h2>
          <p className="text-[#4a5568] text-sm mb-7" style={{ fontFamily: "Inter, sans-serif" }}>
            Comece a mapear sua lavoura gratuitamente
          </p>

          {erro && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="mb-6">
            <GoogleLoginButton onSuccess={handleGoogle} onError={setErro} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#4a5568] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                ou cadastre com email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {campos.map(({ key, label, type, placeholder, autoComplete }) => (
              <div key={key}>
                <label
                  htmlFor={`cad-${key}`}
                  className="block text-sm font-medium text-[#212121] mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {label}
                </label>
                <input
                  id={`cad-${key}`}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-md border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1B5E20] text-white font-bold rounded-md transition-all shadow-[4px_4px_0_0_#A5D6A7] hover:shadow-[2px_2px_0_0_#A5D6A7] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:shadow-[4px_4px_0_0_#A5D6A7] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando
                  conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
            Já tem conta?{" "}
            <Link to="/login" className="text-[#1B5E20] font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
