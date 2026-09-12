/**
 * Ajusta uma data para o fim do dia (23:59:59.999 UTC).
 *
 * Os filtros "data_fim" chegam de um <input type="date"> como "2026-02-01",
 * que o zod (z.coerce.date()) interpreta como meia-noite UTC daquele dia.
 * Usar esse valor direto num "<=" excluiria qualquer registro feito mais
 * tarde no mesmo dia. Esta funcao move o limite para o ultimo instante do
 * dia para que "ate 01/02" inclua o dia 01/02 inteiro.
 */
export function fimDoDia(data) {
  const d = new Date(data);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
