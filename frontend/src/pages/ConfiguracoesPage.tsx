import { useState, type FormEvent } from "react";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { PageHeader } from "@/components/comum/PageHeader";
import { BotaoPrimario, Campo, Input } from "@/components/comum/Form";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { ApiError } from "@/services/erros";

const perfilSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome.").max(150, "Nome muito longo."),
    telefone: z
      .string()
      .trim()
      .max(20, "Telefone muito longo.")
      .refine((t) => t === "" || [10, 11].includes(t.replace(/\D/g, "").length), "Informe o telefone com DDD."),
    senha: z.string(),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === "" || d.senha.length >= 8, { message: "A senha precisa ter pelo menos 8 caracteres.", path: ["senha"] })
  .refine((d) => d.senha === d.confirmar, { message: "As senhas não conferem.", path: ["confirmar"] });

export function ConfiguracoesPage() {
  const { usuario, atualizarPerfil } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (!usuario) return null;
  const contaGoogle = usuario.provedor_auth === "google";

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(null);
    setSalvo(false);
    const r = validarCom(perfilSchema, { nome, telefone, senha, confirmar });
    if (!r.ok) return setErros(r.erros);
    setErros({});
    setSalvando(true);
    try {
      await atualizarPerfil({
        nome: r.dados.nome,
        telefone: r.dados.telefone || null,
        ...(r.dados.senha ? { senha: r.dados.senha } : {}),
      });
      setSenha("");
      setConfirmar("");
      setSalvo(true);
    } catch (err) {
      setErroGeral(err instanceof ApiError ? err.message : "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader titulo="Configurações" descricao="Dados da sua conta." />

      <form onSubmit={salvar} noValidate className="bg-white rounded-lg border border-border p-6 space-y-4">
        <Campo label="Nome completo" erro={erros.nome}>
          <Input id="cfg-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" erro={!!erros.nome} />
        </Campo>
        <Campo label="Email" dica="O email é usado para entrar e não pode ser alterado por aqui.">
          <Input id="cfg-email" value={usuario.email} disabled />
        </Campo>
        <Campo label="Telefone (opcional)" erro={erros.telefone}>
          <Input id="cfg-telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(16) 99999-0000" autoComplete="tel" erro={!!erros.telefone} />
        </Campo>

        {!contaGoogle && (
          <fieldset className="pt-2 border-t border-border space-y-4">
            <legend className="pt-4 text-sm font-semibold text-[#212121]">Trocar senha (opcional)</legend>
            <Campo label="Nova senha" erro={erros.senha}>
              <Input id="cfg-senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" erro={!!erros.senha} />
            </Campo>
            <Campo label="Confirmar nova senha" erro={erros.confirmar}>
              <Input id="cfg-confirmar" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" erro={!!erros.confirmar} />
            </Campo>
          </fieldset>
        )}

        {erroGeral && <p role="alert" className="text-sm text-red-600">{erroGeral}</p>}
        {salvo && (
          <p role="status" className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" /> Alterações salvas.
          </p>
        )}

        <BotaoPrimario type="submit" carregando={salvando}>Salvar alterações</BotaoPrimario>
      </form>
    </div>
  );
}
