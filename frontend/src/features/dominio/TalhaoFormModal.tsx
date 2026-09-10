import { useState } from "react";
import { Modal } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario, Campo, Input, Select } from "@/components/comum/Form";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { mensagemDoErro } from "@/services/erros";
import { talhaoFormSchema } from "./schemas";
import type { Talhao, TalhaoPayload } from "@/types/dominio";

interface Props {
  aberto: boolean;
  idPropriedade: string;
  inicial?: Talhao | null;
  onFechar: () => void;
  onSalvar: (dados: TalhaoPayload) => Promise<void>;
}

export function TalhaoFormModal({ aberto, idPropriedade, inicial, onFechar, onSalvar }: Props) {
  const [form, setForm] = useState({
    nome_talhao: inicial?.nome_talhao ?? "",
    cultura: inicial?.cultura ?? "",
    area_hectares: inicial?.area_hectares?.toString() ?? "",
    latitude: inicial?.latitude?.toString() ?? "",
    longitude: inicial?.longitude?.toString() ?? "",
    status: inicial?.status ?? "ativo",
  });
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const editar = Boolean(inicial);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErroApi(null);
    const r = validarCom(talhaoFormSchema, form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await onSalvar({
        id_propriedade: idPropriedade,
        nome_talhao: r.dados.nome_talhao,
        cultura: r.dados.cultura ?? null,
        area_hectares: r.dados.area_hectares ?? null,
        latitude: r.dados.latitude ?? null,
        longitude: r.dados.longitude ?? null,
        status: r.dados.status,
      });
      onFechar();
    } catch (err) {
      setErroApi(mensagemDoErro(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={editar ? "Editar talhão" : "Novo talhão"} onFechar={onFechar}>
      <form onSubmit={submeter} className="space-y-4">
        {erroApi && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {erroApi}
          </div>
        )}

        <Campo label="Nome do talhão" erro={erros.nome_talhao}>
          <Input
            value={form.nome_talhao}
            erro={!!erros.nome_talhao}
            onChange={(e) => setForm({ ...form, nome_talhao: e.target.value })}
            placeholder="Talhão Norte"
            autoFocus
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Cultura" erro={erros.cultura} dica="Opcional">
            <Input
              value={form.cultura ?? ""}
              onChange={(e) => setForm({ ...form, cultura: e.target.value })}
              placeholder="Soja"
            />
          </Campo>
          <Campo label="Área (ha)" erro={erros.area_hectares} dica="Opcional">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.area_hectares}
              erro={!!erros.area_hectares}
              onChange={(e) => setForm({ ...form, area_hectares: e.target.value })}
              placeholder="42.7"
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Latitude" erro={erros.latitude} dica="Opcional">
            <Input
              type="number"
              step="0.0000001"
              value={form.latitude}
              erro={!!erros.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-21.1767"
            />
          </Campo>
          <Campo label="Longitude" erro={erros.longitude} dica="Opcional">
            <Input
              type="number"
              step="0.0000001"
              value={form.longitude}
              erro={!!erros.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="-47.8208"
            />
          </Campo>
        </div>

        <Campo label="Status" erro={erros.status}>
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="em_analise">Em análise</option>
          </Select>
        </Campo>

        <div className="flex justify-end gap-3 pt-2">
          <BotaoSecundario type="button" onClick={onFechar}>
            Cancelar
          </BotaoSecundario>
          <BotaoPrimario type="submit" carregando={salvando}>
            {editar ? "Salvar" : "Criar talhão"}
          </BotaoPrimario>
        </div>
      </form>
    </Modal>
  );
}
