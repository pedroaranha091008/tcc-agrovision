import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, MailCheck } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { emailValido, SENHA_MINIMA } from "../lib/validation";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Carregando";
import { PainelLateral } from "./LoginPage";

const inputBase = "w-full px-4 py-3 rounded-xl border bg-[#F8F9FA] focus:bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent transition-all text-sm";
const botao = "w-full py-3.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-bold rounded-xl hover:from-[#2E7D32] hover:to-[#388E3C] transition-all disabled:opacity-70 flex items-center justify-center gap-2 font-display";

function Moldura({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <PainelLateral />
      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex mb-8" aria-label="Voltar para a página inicial"><Logo tamanho="sm" /></Link>
          <h1 className="text-3xl font-bold text-[#212121] mb-2 font-display">{titulo}</h1>
          <p className="text-[#4a5568] mb-8">{texto}</p>
          {children}
          <p className="mt-6 text-center text-sm text-[#4a5568]">
            Lembrou a senha? <Link to="/login" className="text-[#1B5E20] font-semibold hover:underline">Voltar para o login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden /> {mensagem}
    </div>
  );
}

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!emailValido(email)) return setErro("Informe um email válido.");
    setEnviando(true);
    try {
      await api("/auth/esqueci-senha", { method: "POST", body: { email: email.trim() }, publico: true });
      setEnviadoPara(email.trim());
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviadoPara) {
    return (
      <Moldura titulo="Confira seu email" texto="Se houver uma conta com esse email, enviamos um link para criar uma nova senha.">
        <div role="status" className="rounded-2xl bg-[#E8F5E9] p-6 text-center">
          <MailCheck className="w-10 h-10 text-[#1B5E20] mx-auto mb-3" aria-hidden />
          <p className="text-sm text-[#212121]">Enviado para <strong>{enviadoPara}</strong>.</p>
          <p className="text-sm text-[#4a5568] mt-2">O link vale por 1 hora. Não encontrou? Veja a pasta de spam ou peça de novo.</p>
          <button onClick={() => setEnviadoPara(null)} className="mt-4 text-sm font-semibold text-[#1B5E20] hover:underline">Enviar de novo</button>
        </div>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Esqueceu a senha?" texto="Informe o email da sua conta e enviaremos um link para criar uma nova senha.">
      <form onSubmit={enviar} noValidate className="space-y-4">
        <div>
          <label htmlFor="esq-email" className="block text-sm font-medium text-[#212121] mb-1.5">Email</label>
          <input id="esq-email" type="email" autoComplete="email" autoFocus placeholder="joao@fazenda.com.br" value={email}
            onChange={e => setEmail(e.target.value)} className={`${inputBase} border-border`} />
        </div>
        <Erro mensagem={erro} />
        <button type="submit" disabled={enviando} className={botao}>
          {enviando ? <><Spinner claro /> Enviando...</> : "Enviar link"}
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
  const [erros, setErros] = useState<{ senha?: string; confirmar?: string }>({});
  const [erro, setErro] = useState<string | null>(null);
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const encontrados = {
      senha: senha.length < SENHA_MINIMA ? `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`
        : !/[A-Za-z]/.test(senha) || !/\d/.test(senha) ? "Use letras e números na senha." : undefined,
      confirmar: confirmar !== senha ? "As senhas não conferem." : undefined,
    };
    setErros(encontrados);
    if (encontrados.senha || encontrados.confirmar) return;
    setSalvando(true);
    try {
      await api("/auth/redefinir-senha", { method: "POST", body: { token, senha }, publico: true });
      navigate("/login", { replace: true, state: { aviso: "Senha alterada. Entre com a nova senha." } });
    } catch (err) {
      if (err instanceof ApiError && err.code === "LINK_INVALIDO") setLinkInvalido(true);
      else setErro(err instanceof ApiError ? err.campo("senha") ?? err.message : "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (linkInvalido) {
    return (
      <Moldura titulo="Link inválido ou expirado" texto="Por segurança, cada link vale uma única vez e por 1 hora.">
        <Link to="/esqueci-senha" className={botao}>Pedir um novo link</Link>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Criar nova senha" texto="Escolha uma senha nova. Ao salvar, você sai de todos os dispositivos conectados.">
      <form onSubmit={salvar} noValidate className="space-y-4">
        {([["senha", "Nova senha", senha, setSenha], ["confirmar", "Confirmar nova senha", confirmar, setConfirmar]] as const).map(([campo, rotulo, valor, mudar]) => (
          <div key={campo}>
            <label htmlFor={`red-${campo}`} className="block text-sm font-medium text-[#212121] mb-1.5">{rotulo}</label>
            <input id={`red-${campo}`} type="password" autoComplete="new-password" value={valor}
              placeholder={campo === "senha" ? `Mínimo ${SENHA_MINIMA} caracteres, com letras e números` : "Repita a senha"}
              aria-invalid={!!erros[campo]} aria-describedby={erros[campo] ? `red-${campo}-erro` : undefined}
              onChange={e => { mudar(e.target.value); setErros(x => ({ ...x, [campo]: undefined })); }}
              className={`${inputBase} ${erros[campo] ? "border-red-400" : "border-border"}`} />
            {erros[campo] && <p id={`red-${campo}-erro`} className="mt-1 text-xs text-red-600">{erros[campo]}</p>}
          </div>
        ))}
        <Erro mensagem={erro} />
        <button type="submit" disabled={salvando} className={botao}>
          {salvando ? <><Spinner claro /> Salvando...</> : "Salvar nova senha"}
        </button>
      </form>
    </Moldura>
  );
}
