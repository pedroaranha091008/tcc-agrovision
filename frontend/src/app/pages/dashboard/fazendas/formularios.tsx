import { useState, type FormEvent } from "react";
import { api, ApiError } from "../../../lib/api";
import { CULTURAS } from "../../../lib/site";
import { hojeInputData, numeroOuNulo, paraInputData, STATUS_TALHAO, UFS } from "../../../lib/format";
import type { Propriedade, StatusTalhao, Talhao, Voo } from "../../../lib/types";
import { ariaErro, BotoesFormulario, Campo, ErroFormulario } from "../../../components/Form";

type Erros = Record<string, string | undefined>;

/** Hook comum: guarda erros por campo, envia e traduz erros de validação da API para os campos. */
function useEnvio<T>() {
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const enviar = async (validar: () => Erros, requisicao: () => Promise<T>, aoSalvar: (r: T) => void) => {
    setErroGeral(null);
    const locais = validar();
    setErros(locais);
    if (Object.values(locais).some(Boolean)) return;
    setSalvando(true);
    try {
      aoSalvar(await requisicao());
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) setErros(Object.fromEntries(err.details.map(d => [d.campo, d.mensagem])));
        setErroGeral(err.message);
      } else setErroGeral("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const limpar = (campo: string) => setErros(e => ({ ...e, [campo]: undefined }));
  return { erros, erroGeral, salvando, enviar, limpar };
}

const numeroInvalido = (texto: string, { min, max, nome }: { min?: number; max?: number; nome: string }) => {
  const n = numeroOuNulo(texto);
  if (n === null) return undefined;
  if (Number.isNaN(n)) return `Informe ${nome} como número.`;
  if (min !== undefined && n < min) return `${nome[0].toUpperCase() + nome.slice(1)} deve ser no mínimo ${min}.`;
  if (max !== undefined && n > max) return `${nome[0].toUpperCase() + nome.slice(1)} deve ser no máximo ${max}.`;
  return undefined;
};

const texto = (s: string) => (s.trim() ? s.trim() : null);

// ─── Propriedade ─────────────────────────────────────────────────────────────

export function FormPropriedade({ inicial, aoSalvar, aoCancelar }: { inicial?: Propriedade; aoSalvar: (p: Propriedade) => void; aoCancelar: () => void }) {
  const [nome, setNome] = useState(inicial?.nome_fazenda ?? "");
  const [cidade, setCidade] = useState(inicial?.cidade ?? "");
  const [estado, setEstado] = useState(inicial?.estado ?? "");
  const [area, setArea] = useState(inicial?.area_total_hectares?.toString() ?? "");
  const { erros, erroGeral, salvando, enviar, limpar } = useEnvio<Propriedade>();

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    enviar(
      () => ({
        nome_fazenda: nome.trim().length < 2 ? "Informe o nome da fazenda." : undefined,
        cidade: cidade.trim().length < 2 ? "Informe a cidade." : undefined,
        estado: !estado ? "Selecione o estado." : undefined,
        area_total_hectares: numeroInvalido(area, { min: 0.01, max: 1_000_000, nome: "a área" }),
      }),
      () => api<Propriedade>(inicial ? `/propriedades/${inicial.id_propriedade}` : "/propriedades", {
        method: inicial ? "PATCH" : "POST",
        body: { nome_fazenda: nome.trim(), cidade: cidade.trim(), estado, area_total_hectares: numeroOuNulo(area) },
      }),
      aoSalvar,
    );
  };

  return (
    <form onSubmit={submeter} noValidate className="space-y-4">
      <Campo id="prop-nome" label="Nome da fazenda" erro={erros.nome_fazenda}>
        <input {...ariaErro("prop-nome", erros.nome_fazenda)} value={nome} maxLength={200} placeholder="Fazenda São João" autoFocus
          onChange={e => { setNome(e.target.value); limpar("nome_fazenda"); }} />
      </Campo>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Campo id="prop-cidade" label="Cidade" erro={erros.cidade} className="sm:col-span-2">
          <input {...ariaErro("prop-cidade", erros.cidade)} value={cidade} maxLength={150} placeholder="Ribeirão Preto"
            onChange={e => { setCidade(e.target.value); limpar("cidade"); }} />
        </Campo>
        <Campo id="prop-estado" label="Estado" erro={erros.estado}>
          <select {...ariaErro("prop-estado", erros.estado)} value={estado} onChange={e => { setEstado(e.target.value); limpar("estado"); }}>
            <option value="">UF</option>
            {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Campo>
      </div>
      <Campo id="prop-area" label="Área total (hectares) — opcional" erro={erros.area_total_hectares}>
        <input {...ariaErro("prop-area", erros.area_total_hectares)} value={area} inputMode="decimal" placeholder="320"
          onChange={e => { setArea(e.target.value); limpar("area_total_hectares"); }} />
      </Campo>
      <ErroFormulario mensagem={erroGeral} />
      <BotoesFormulario aoCancelar={aoCancelar} salvando={salvando} rotulo={inicial ? "Salvar alterações" : "Cadastrar propriedade"} />
    </form>
  );
}

// ─── Talhão ──────────────────────────────────────────────────────────────────

export function FormTalhao({ idPropriedade, inicial, aoSalvar, aoCancelar }: {
  idPropriedade: string; inicial?: Talhao; aoSalvar: (t: Talhao) => void; aoCancelar: () => void;
}) {
  const [nome, setNome] = useState(inicial?.nome_talhao ?? "");
  const [cultura, setCultura] = useState(inicial?.cultura ?? "");
  const [area, setArea] = useState(inicial?.area_hectares?.toString() ?? "");
  const [lat, setLat] = useState(inicial?.latitude?.toString() ?? "");
  const [lng, setLng] = useState(inicial?.longitude?.toString() ?? "");
  const [status, setStatus] = useState<StatusTalhao>(inicial?.status ?? "ativo");
  const { erros, erroGeral, salvando, enviar, limpar } = useEnvio<Talhao>();

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    const corpo = {
      nome_talhao: nome.trim(), cultura: texto(cultura), area_hectares: numeroOuNulo(area),
      latitude: numeroOuNulo(lat), longitude: numeroOuNulo(lng), status,
    };
    enviar(
      () => ({
        nome_talhao: !nome.trim() ? "Informe o nome do talhão." : undefined,
        area_hectares: numeroInvalido(area, { min: 0.01, max: 1_000_000, nome: "a área" }),
        latitude: numeroInvalido(lat, { min: -90, max: 90, nome: "a latitude" }),
        longitude: numeroInvalido(lng, { min: -180, max: 180, nome: "a longitude" }),
      }),
      () => api<Talhao>(inicial ? `/talhoes/${inicial.id_talhao}` : "/talhoes", {
        method: inicial ? "PATCH" : "POST",
        body: inicial ? corpo : { ...corpo, id_propriedade: idPropriedade },
      }),
      aoSalvar,
    );
  };

  return (
    <form onSubmit={submeter} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="tal-nome" label="Nome do talhão" erro={erros.nome_talhao}>
          <input {...ariaErro("tal-nome", erros.nome_talhao)} value={nome} maxLength={150} placeholder="Talhão A" autoFocus
            onChange={e => { setNome(e.target.value); limpar("nome_talhao"); }} />
        </Campo>
        <Campo id="tal-cultura" label="Cultura" erro={erros.cultura}>
          <select {...ariaErro("tal-cultura", erros.cultura)} value={cultura} onChange={e => setCultura(e.target.value)}>
            <option value="">Não informada</option>
            {CULTURAS.map(c => <option key={c} value={c}>{c}</option>)}
            {cultura && !CULTURAS.includes(cultura) && <option value={cultura}>{cultura}</option>}
          </select>
        </Campo>
        <Campo id="tal-area" label="Área (hectares)" erro={erros.area_hectares}>
          <input {...ariaErro("tal-area", erros.area_hectares)} value={area} inputMode="decimal" placeholder="98"
            onChange={e => { setArea(e.target.value); limpar("area_hectares"); }} />
        </Campo>
        <Campo id="tal-status" label="Situação" erro={erros.status}>
          <select {...ariaErro("tal-status", erros.status)} value={status} onChange={e => setStatus(e.target.value as StatusTalhao)}>
            {Object.entries(STATUS_TALHAO).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </Campo>
        <Campo id="tal-lat" label="Latitude (opcional)" erro={erros.latitude} ajuda="Ex.: -21.1775">
          <input {...ariaErro("tal-lat", erros.latitude)} value={lat} inputMode="decimal"
            onChange={e => { setLat(e.target.value); limpar("latitude"); }} />
        </Campo>
        <Campo id="tal-lng" label="Longitude (opcional)" erro={erros.longitude} ajuda="Ex.: -47.8103">
          <input {...ariaErro("tal-lng", erros.longitude)} value={lng} inputMode="decimal"
            onChange={e => { setLng(e.target.value); limpar("longitude"); }} />
        </Campo>
      </div>
      <ErroFormulario mensagem={erroGeral} />
      <BotoesFormulario aoCancelar={aoCancelar} salvando={salvando} rotulo={inicial ? "Salvar alterações" : "Cadastrar talhão"} />
    </form>
  );
}

// ─── Voo ─────────────────────────────────────────────────────────────────────

export function FormVoo({ idTalhao, inicial, aoSalvar, aoCancelar }: {
  idTalhao: string; inicial?: Voo; aoSalvar: (v: Voo) => void; aoCancelar: () => void;
}) {
  const [data, setData] = useState(paraInputData(inicial?.data_voo) || hojeInputData());
  const [altitude, setAltitude] = useState(inicial?.altitude_metros?.toString() ?? "");
  const [drone, setDrone] = useState(inicial?.modelo_drone ?? "");
  const [operador, setOperador] = useState(inicial?.operador ?? "");
  const [obs, setObs] = useState(inicial?.observacoes ?? "");
  const { erros, erroGeral, salvando, enviar, limpar } = useEnvio<Voo>();

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    const corpo = { data_voo: data, altitude_metros: numeroOuNulo(altitude), modelo_drone: texto(drone), operador: texto(operador), observacoes: texto(obs) };
    enviar(
      () => ({
        data_voo: !data ? "Informe a data do voo." : undefined,
        altitude_metros: numeroInvalido(altitude, { min: 1, max: 1000, nome: "a altitude" }),
      }),
      () => api<Voo>(inicial ? `/voos/${inicial.id_voo}` : "/voos", {
        method: inicial ? "PATCH" : "POST",
        body: inicial ? corpo : { ...corpo, id_talhao: idTalhao },
      }),
      aoSalvar,
    );
  };

  return (
    <form onSubmit={submeter} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="voo-data" label="Data do voo" erro={erros.data_voo}>
          <input type="date" {...ariaErro("voo-data", erros.data_voo)} value={data} autoFocus
            onChange={e => { setData(e.target.value); limpar("data_voo"); }} />
        </Campo>
        <Campo id="voo-altitude" label="Altitude (metros)" erro={erros.altitude_metros}>
          <input {...ariaErro("voo-altitude", erros.altitude_metros)} value={altitude} inputMode="decimal" placeholder="120"
            onChange={e => { setAltitude(e.target.value); limpar("altitude_metros"); }} />
        </Campo>
        <Campo id="voo-drone" label="Modelo do drone" erro={erros.modelo_drone}>
          <input {...ariaErro("voo-drone", erros.modelo_drone)} value={drone} maxLength={100} placeholder="DJI Mavic 3 Multispectral"
            onChange={e => setDrone(e.target.value)} />
        </Campo>
        <Campo id="voo-operador" label="Operador" erro={erros.operador}>
          <input {...ariaErro("voo-operador", erros.operador)} value={operador} maxLength={150} placeholder="Nome do piloto"
            onChange={e => setOperador(e.target.value)} />
        </Campo>
      </div>
      <Campo id="voo-obs" label="Observações (opcional)" erro={erros.observacoes}>
        <textarea {...ariaErro("voo-obs", erros.observacoes)} value={obs} maxLength={2000} rows={3} placeholder="Condições do tempo, problemas no voo..."
          onChange={e => setObs(e.target.value)} />
      </Campo>
      <ErroFormulario mensagem={erroGeral} />
      <BotoesFormulario aoCancelar={aoCancelar} salvando={salvando} rotulo={inicial ? "Salvar alterações" : "Registrar voo"} />
    </form>
  );
}
