// Fechas de calendario en zona horaria LOCAL del dispositivo.
// `new Date().toISOString()` devuelve UTC: para un usuario en América que
// registra de noche, la fecha UTC ya es "mañana" y rompe rachas/calendario.

/** Fecha local como 'YYYY-MM-DD'. */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parsea 'YYYY-MM-DD' como fecha local (new Date(str) lo interpretaría en UTC). */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
