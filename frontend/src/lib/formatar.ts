const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function area(valor: number | null | undefined): string {
  if (valor == null) return "—";
  return `${nf.format(valor)} ha`;
}

export function numero(valor: number | null | undefined): string {
  return valor == null ? "—" : nf.format(valor);
}

export function data(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
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
