import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAuth, type Usuario } from "../../lib/auth";
import { api, ApiError } from "../../lib/api";
import { TIPOS_USUARIO, type TipoUsuario } from "../../lib/site";
import { mascaraTelefone, telefoneValido } from "../../lib/validation";
import { Spinner } from "../../components/Carregando";
import { CabecalhoPagina } from "./DashboardLayout";

const inputBase = "w-full px-4 py-2.5 rounded-xl border bg-white text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent text-sm";

export function SettingsPage() {
  const { usuario, atualizarUsuario, sair } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ? mascaraTelefone(usuario.telefone) : "");
  const [tipo, setTipo] = useState<TipoUsuario>(usuario?.tipo_usuario ?? "produtor");
  const [erros, setErros] = useState<{ nome?: string; telefone?: string }>({});
  const [salvando, setSalvando] = useState(false);

  if (!usuario) return null;

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const encontrados: typeof erros = {};
    if (nome.trim().length < 3) encontrados.nome = "Informe seu nome completo.";
    if (telefone && !telefoneValido(telefone)) encontrados.telefone = "Informe o telefone com DDD.";
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setSalvando(true);
    try {
      const atualizado = await api<Usuario>("/usuarios/me", {
        method: "PATCH",
        body: { nome: nome.trim(), telefone: telefone || null, tipo_usuario: tipo },
      });
      atualizarUsuario(atualizado);
      toast.success("Perfil atualizado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <CabecalhoPagina titulo="Configurações" descricao="Dados da sua conta." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={salvar} noValidate className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-bold text-[#212121] font-display">Perfil</h2>

          <div>
            <label htmlFor="cfg-nome" className="block text-sm font-medium text-[#212121] mb-1.5">Nome completo</label>
            <input id="cfg-nome" value={nome} onChange={e => setNome(e.target.value)} maxLength={150} autoComplete="name"
              aria-invalid={!!erros.nome} className={`${inputBase} ${erros.nome ? "border-red-400" : "border-border"}`} />
            {erros.nome && <p className="mt-1 text-xs text-red-600">{erros.nome}</p>}
          </div>

          <div>
            <label htmlFor="cfg-email" className="block text-sm font-medium text-[#212121] mb-1.5">Email</label>
            <input id="cfg-email" value={usuario.email} disabled className={`${inputBase} border-border bg-[#F8F9FA] text-[#4a5568]`} />
            <p className="mt-1 text-xs text-[#4a5568]">O email é usado para entrar e não pode ser alterado por aqui.</p>
          </div>

          <div>
            <label htmlFor="cfg-telefone" className="block text-sm font-medium text-[#212121] mb-1.5">Telefone (opcional)</label>
            <input id="cfg-telefone" type="tel" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} placeholder="(16) 99999-0000" autoComplete="tel"
              aria-invalid={!!erros.telefone} className={`${inputBase} ${erros.telefone ? "border-red-400" : "border-border"}`} />
            {erros.telefone && <p className="mt-1 text-xs text-red-600">{erros.telefone}</p>}
          </div>

          <div>
            <label htmlFor="cfg-tipo" className="block text-sm font-medium text-[#212121] mb-1.5">Tipo de usuário</label>
            <select id="cfg-tipo" value={tipo} onChange={e => setTipo(e.target.value as TipoUsuario)} className={`${inputBase} border-border`}>
              {Object.entries(TIPOS_USUARIO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <button type="submit" disabled={salvando}
            className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2E7D32] disabled:opacity-70">
            {salvando && <Spinner claro />} Salvar alterações
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-border p-6 h-fit">
          <h2 className="font-bold text-[#212121] mb-3 font-display">Sessão</h2>
          <p className="text-sm text-[#4a5568] mb-1">Conta criada em {new Date(usuario.data_criacao).toLocaleDateString("pt-BR")}.</p>
          <p className="text-sm text-[#4a5568] mb-5">Ao sair, você precisará informar email e senha novamente.</p>
          <button onClick={sair}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50">
            <LogOut className="w-4 h-4" aria-hidden /> Sair da conta
          </button>
        </div>
      </div>
    </>
  );
}
