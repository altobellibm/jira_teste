// Datas e horas são guardadas como texto ISO simples ("2026-12-15", "2026-12-15T09:30"),
// que se compara em ordem alfabética e dispensa fuso horário.

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** "2026-12-15T09:30" → { date: "2026-12-15", time: "09:30" }. Aceita valores parciais. */
export function splitDateTime(value: string): { date: string; time: string } {
  const [date = '', time = ''] = value.split('T');
  return { date, time };
}

export const joinDateTime = (date: string, time: string): string => (date || time ? `${date}T${time}` : '');

/** "2026-12-15" → "15/12/2026". Devolve o texto original se não for uma data ISO. */
export function formatDate(iso: string): string {
  if (!DATE_RE.test(iso)) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** "2026-12-15T09:30" → "15/12/2026 09:30". */
export function formatDateTime(iso: string): string {
  if (!DATETIME_RE.test(iso)) return iso;
  const { date, time } = splitDateTime(iso);
  return `${formatDate(date)} ${time}`;
}
