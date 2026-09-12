const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function area(valor: number | null | undefined): string {
  if (valor == null) return "—";
  return `${nf.format(valor)} ha`;
}

export function numero(valor: number | null | undefined): string {
  return valor == null ? "—" : nf.format(valor);
}

const formatoDataUTC = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

/**
 * Formata so a data (sem hora), em UTC.
 *
 * Campos "so data" (data_voo, e os filtros "de"/"ate" vindos de
 * <input type="date">) chegam como meia-noite UTC do dia escolhido. Formatar
 * em horario local do navegador desloca um dia para tras em qualquer fuso
 * negativo (todo o Brasil): um voo em "2026-03-15" apareceria como "14/03".
 * Formatando em UTC, o dia exibido e sempre o dia que foi de fato escolhido.
 */
export function data(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : formatoDataUTC.format(d);
}

export function dataHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** yyyy-mm-dd para <input type="date"> */
export function paraInputDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function coordenadas(lat: number | null, lon: number | null): string {
  if (lat == null || lon == null) return "—";
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}
