import { useState } from "react";
import { Modal } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario, Campo, Input, Select } from "@/components/comum/Form";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { mensagemDoErro } from "@/services/erros";
import { ESTADOS_UF, propriedadeFormSchema } from "./schemas";
import type { Propriedade, PropriedadePayload } from "@/types/dominio";

interface Props {
  aberto: boolean;
  inicial?: Propriedade | null;
  onFechar: () => void;
  onSalvar: (dados: PropriedadePayload) => Promise<void>;
}

export function PropriedadeFormModal({ aberto, inicial, onFechar, onSalvar }: Props) {
  const [form, setForm] = useState({
    nome_fazenda: inicial?.nome_fazenda ?? "",
    estado: inicial?.estado ?? "",
    cidade: inicial?.cidade ?? "",
    area_total_hectares: inicial?.area_total_hectares?.toString() ?? "",
  });
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const editar = Boolean(inicial);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErroApi(null);
    const r = validarCom(propriedadeFormSchema, form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await onSalvar({
        nome_fazenda: r.dados.nome_fazenda,
        estado: r.dados.estado,
        cidade: r.dados.cidade,
        area_total_hectares: r.dados.area_total_hectares ?? null,
      });
      onFechar();
    } catch (err) {
      setErroApi(mensagemDoErro(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={editar ? "Editar propriedade" : "Nova propriedade"} onFechar={onFechar}>
      <form onSubmit={submeter} className="space-y-4">
        {erroApi && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {erroApi}
          </div>
        )}

        <Campo label="Nome da fazenda" erro={erros.nome_fazenda}>
          <Input
            value={form.nome_fazenda}
            erro={!!erros.nome_fazenda}
            onChange={(e) => setForm({ ...form, nome_fazenda: e.target.value })}
            placeholder="Fazenda Santa Clara"
            autoFocus
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Estado (UF)" erro={erros.estado}>
            <Select
              value={form.estado}
              erro={!!erros.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="">Selecionar...</option>
              {ESTADOS_UF.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Campo>

          <Campo label="Cidade" erro={erros.cidade}>
            <Input
              value={form.cidade}
              erro={!!erros.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              placeholder="Ribeirão Preto"
            />
          </Campo>
        </div>

        <Campo label="Área total (hectares)" erro={erros.area_total_hectares} dica="Opcional">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.area_total_hectares}
            erro={!!erros.area_total_hectares}
            onChange={(e) => setForm({ ...form, area_total_hectares: e.target.value })}
            placeholder="320.5"
          />
        </Campo>

        <div className="flex justify-end gap-3 pt-2">
          <BotaoSecundario type="button" onClick={onFechar}>
            Cancelar
          </BotaoSecundario>
          <BotaoPrimario type="submit" carregando={salvando}>
            {editar ? "Salvar" : "Criar propriedade"}
          </BotaoPrimario>
        </div>
      </form>
    </Modal>
  );
}
