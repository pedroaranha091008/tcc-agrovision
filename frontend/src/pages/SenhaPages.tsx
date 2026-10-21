import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle, Leaf, MailCheck } from "lucide-react";
import * as authService from "@/services/auth";
import { ApiError, mensagemDoErro } from "@/services/erros";

const classeInput =
  "w-full px-4 py-3 rounded-md border border-border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm";
const classeBotao =
  "w-full py-3.5 bg-[#1B5E20] text-white font-bold rounded-md transition-all shadow-[4px_4px_0_0_#A5D6A7] hover:shadow-[2px_2px_0_0_#A5D6A7] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-70";

/** Mesmo cartão centralizado da tela de cadastro. */
function Moldura({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-6" style={{ fontFamily: "Inter, sans-serif" }}>
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
          <h1 className="text-3xl font-black text-[#212121] mb-1 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            {titulo}
          </h1>
          <p className="text-[#4a5568] text-sm mb-7">{texto}</p>
          {children}
          <p className="mt-6 text-center text-sm text-[#4a5568]">
            Lembrou a senha?{" "}
            <Link to="/login" className="text-[#1B5E20] font-semibold hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div role="alert" className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{mensagem}</span>
    </div>
  );
}

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErro("Informe um email válido.");
    setEnviando(true);
    try {
      await authService.esqueciSenha(email.trim());
      setEnviadoPara(email.trim());
    } catch (err) {
      setErro(mensagemDoErro(err));
    } finally {
      setEnviando(false);
    }
  };

  if (enviadoPara) {
    return (
      <Moldura titulo="Confira seu email" texto="Se houver uma conta com esse email, enviamos um link para criar uma nova senha.">
        <div role="status" className="rounded-md bg-[#E8F5E9] p-6 text-center">
          <MailCheck className="w-10 h-10 text-[#1B5E20] mx-auto mb-3" />
          <p className="text-sm text-[#212121]">
            Enviado para <strong>{enviadoPara}</strong>.
          </p>
          <p className="text-sm text-[#4a5568] mt-2">O link vale por 1 hora. Não encontrou? Veja a pasta de spam ou peça de novo.</p>
          <button onClick={() => setEnviadoPara(null)} className="mt-4 text-sm font-semibold text-[#1B5E20] hover:underline">
            Enviar de novo
          </button>
        </div>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Esqueceu a senha?" texto="Informe o email da sua conta e enviaremos um link para criar uma nova senha.">
      <Erro mensagem={erro} />
      <form onSubmit={enviar} noValidate className="space-y-4">
        <div>
          <label htmlFor="esq-email" className="block text-sm font-medium text-[#212121] mb-1.5">
            Email
          </label>
          <input id="esq-email" type="email" autoComplete="email" autoFocus placeholder="joao@fazenda.com.br" value={email} onChange={(e) => setEmail(e.target.value)} className={classeInput} />
        </div>
        <button type="submit" disabled={enviando} className={classeBotao} style={{ fontFamily: "Poppins, sans-serif" }}>
          {enviando ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </Moldura>
  );
}

export function RedefinirSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) return setErro("A senha deve ter ao menos 8 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não conferem.");
    setSalvando(true);
    try {
      await authService.redefinirSenha(token, senha);
      navigate("/login", { replace: true, state: { aviso: "Senha alterada. Entre com a nova senha." } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setLinkInvalido(true);
      else setErro(mensagemDoErro(err));
    } finally {
      setSalvando(false);
    }
  };

  if (linkInvalido) {
    return (
      <Moldura titulo="Link inválido ou expirado" texto="Por segurança, cada link vale uma única vez e por 1 hora.">
        <Link to="/esqueci-senha" className={classeBotao} style={{ fontFamily: "Poppins, sans-serif" }}>
          Pedir um novo link
        </Link>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Criar nova senha" texto="Escolha uma senha nova. Ao salvar, você sai de todos os dispositivos conectados.">
      <Erro mensagem={erro} />
      <form onSubmit={salvar} noValidate className="space-y-4">
        <div>
          <label htmlFor="red-senha" className="block text-sm font-medium text-[#212121] mb-1.5">
            Nova senha
          </label>
          <input id="red-senha" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} className={classeInput} />
        </div>
        <div>
          <label htmlFor="red-confirmar" className="block text-sm font-medium text-[#212121] mb-1.5">
            Confirmar nova senha
          </label>
          <input id="red-confirmar" type="password" autoComplete="new-password" placeholder="Repita a senha" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={classeInput} />
        </div>
        <button type="submit" disabled={salvando} className={classeBotao} style={{ fontFamily: "Poppins, sans-serif" }}>
          {salvando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </Moldura>
  );
}
