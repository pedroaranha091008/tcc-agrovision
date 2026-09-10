import { useState } from "react";
import { Modal } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario, Campo, Input, Textarea } from "@/components/comum/Form";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { mensagemDoErro } from "@/services/erros";
import { paraInputDate } from "@/lib/formatar";
import { vooFormSchema } from "./schemas";
import type { Voo, VooPayload } from "@/types/dominio";

interface Props {
  aberto: boolean;
  idTalhao: string;
  inicial?: Voo | null;
  onFechar: () => void;
  onSalvar: (dados: VooPayload) => Promise<void>;
}

export function VooFormModal({ aberto, idTalhao, inicial, onFechar, onSalvar }: Props) {
  const [form, setForm] = useState({
    data_voo: inicial ? paraInputDate(inicial.data_voo) : "",
    altitude_metros: inicial?.altitude_metros?.toString() ?? "",
    modelo_drone: inicial?.modelo_drone ?? "",
    operador: inicial?.operador ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const editar = Boolean(inicial);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErroApi(null);
    const r = validarCom(vooFormSchema, form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await onSalvar({
        id_talhao: idTalhao,
        data_voo: new Date(r.dados.data_voo).toISOString(),
        altitude_metros: r.dados.altitude_metros ?? null,
        modelo_drone: r.dados.modelo_drone ?? null,
        operador: r.dados.operador ?? null,
        observacoes: r.dados.observacoes ?? null,
      });
      onFechar();
    } catch (err) {
      setErroApi(mensagemDoErro(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={editar ? "Editar voo" : "Novo voo"} onFechar={onFechar}>
      <form onSubmit={submeter} className="space-y-4">
        {erroApi && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {erroApi}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Data do voo" erro={erros.data_voo}>
            <Input
              type="date"
              value={form.data_voo}
              erro={!!erros.data_voo}
              onChange={(e) => setForm({ ...form, data_voo: e.target.value })}
              autoFocus
            />
          </Campo>
          <Campo label="Altitude (m)" erro={erros.altitude_metros} dica="Opcional">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={form.altitude_metros}
              erro={!!erros.altitude_metros}
              onChange={(e) => setForm({ ...form, altitude_metros: e.target.value })}
              placeholder="120"
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Modelo do drone" erro={erros.modelo_drone} dica="Opcional">
            <Input
              value={form.modelo_drone ?? ""}
              onChange={(e) => setForm({ ...form, modelo_drone: e.target.value })}
              placeholder="DJI Mavic 3M"
            />
          </Campo>
          <Campo label="Operador" erro={erros.operador} dica="Opcional">
            <Input
              value={form.operador ?? ""}
              onChange={(e) => setForm({ ...form, operador: e.target.value })}
              placeholder="João Piloto"
            />
          </Campo>
        </div>

        <Campo label="Observações" erro={erros.observacoes} dica="Opcional">
          <Textarea
            rows={3}
            value={form.observacoes ?? ""}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Condições do voo, cobertura de nuvens, etc."
          />
        </Campo>

        <div className="flex justify-end gap-3 pt-2">
          <BotaoSecundario type="button" onClick={onFechar}>
            Cancelar
          </BotaoSecundario>
          <BotaoPrimario type="submit" carregando={salvando}>
            {editar ? "Salvar" : "Criar voo"}
          </BotaoPrimario>
        </div>
      </form>
    </Modal>
  );
}
