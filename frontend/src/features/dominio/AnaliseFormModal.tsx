import { useState } from "react";
import { Modal } from "@/components/comum/Modal";
import { BotaoPrimario, BotaoSecundario, Campo, Select, Textarea } from "@/components/comum/Form";
import { validarCom, type ErrosCampo } from "@/lib/formularios";
import { mensagemDoErro } from "@/services/erros";
import { analiseFormSchema } from "./schemas";
import type { Analise, AnalisePayload, NivelRisco, StatusProcessamento, TipoAnalise } from "@/types/dominio";

interface Props {
  aberto: boolean;
  idVoo: string;
  inicial?: Analise | null;
  onFechar: () => void;
  onSalvar: (dados: AnalisePayload) => Promise<void>;
}

export function AnaliseFormModal({ aberto, idVoo, inicial, onFechar, onSalvar }: Props) {
  const [form, setForm] = useState({
    tipo_analise: inicial?.tipo_analise ?? ("NDVI" as TipoAnalise),
    nivel_risco: inicial?.nivel_risco ?? "",
    percentual_area_afetada: inicial?.percentual_area_afetada?.toString() ?? "",
    resultado: inicial?.resultado ?? "",
    status: inicial?.status ?? ("concluido" as StatusProcessamento),
  });
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const editar = Boolean(inicial);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErroApi(null);
    const r = validarCom(analiseFormSchema, form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await onSalvar({
        id_voo: idVoo,
        tipo_analise: r.dados.tipo_analise,
        nivel_risco: (r.dados.nivel_risco as NivelRisco | undefined) ?? null,
        percentual_area_afetada: r.dados.percentual_area_afetada ?? null,
        resultado: r.dados.resultado ?? null,
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
    <Modal aberto={aberto} titulo={editar ? "Editar análise" : "Registrar análise"} onFechar={onFechar}>
      <form onSubmit={submeter} className="space-y-4">
        {erroApi && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {erroApi}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Tipo de análise" erro={erros.tipo_analise}>
            <Select
              value={form.tipo_analise}
              onChange={(e) => setForm({ ...form, tipo_analise: e.target.value as TipoAnalise })}
            >
              <option value="NDVI">NDVI</option>
              <option value="RGB">RGB</option>
              <option value="termico">Térmico</option>
              <option value="multispectral">Multiespectral</option>
              <option value="outro">Outro</option>
            </Select>
          </Campo>

          <Campo label="Nível de risco" erro={erros.nivel_risco} dica="Opcional">
            <Select value={form.nivel_risco} onChange={(e) => setForm({ ...form, nivel_risco: e.target.value })}>
              <option value="">Sem classificação</option>
              <option value="baixo">Baixo (saudável)</option>
              <option value="medio">Médio (atenção)</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </Select>
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Área afetada (%)" erro={erros.percentual_area_afetada} dica="Opcional, 0 a 100">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.percentual_area_afetada}
              onChange={(e) => setForm({ ...form, percentual_area_afetada: e.target.value })}
              placeholder="22.5"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#212121] text-sm focus:outline-none focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent ${
                erros.percentual_area_afetada ? "border-red-300" : "border-border"
              }`}
            />
          </Campo>

          <Campo label="Status" erro={erros.status}>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StatusProcessamento })}
            >
              <option value="pendente">Pendente</option>
              <option value="em_processamento">Em processamento</option>
              <option value="concluido">Concluído</option>
              <option value="falhou">Falhou</option>
            </Select>
          </Campo>
        </div>

        <Campo label="Resultado" erro={erros.resultado} dica="Descrição do achado (opcional)">
          <Textarea
            rows={3}
            value={form.resultado ?? ""}
            onChange={(e) => setForm({ ...form, resultado: e.target.value })}
            placeholder="Ex.: falha de plantio na porção norte do talhão."
          />
        </Campo>

        <div className="flex justify-end gap-3 pt-2">
          <BotaoSecundario type="button" onClick={onFechar}>
            Cancelar
          </BotaoSecundario>
          <BotaoPrimario type="submit" carregando={salvando}>
            {editar ? "Salvar" : "Registrar análise"}
          </BotaoPrimario>
        </div>
      </form>
    </Modal>
  );
}
