export function formatDateAR(value?: string | null, fallback = '—'): string {
  if (!value) return fallback;

  const trimmed = String(value).trim();
  if (!trimmed) return fallback;

  const onlyDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (onlyDateMatch) {
    const [, year, month, day] = onlyDateMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getEtaStatusLabel(eta?: string | null, today = new Date()): string {
  if (!eta) return 'Sin ETA';

  const parsed = new Date(eta);
  if (Number.isNaN(parsed.getTime())) return 'ETA inválido';

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const etaDate = new Date(parsed);
  etaDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((etaDate.getTime() - startOfToday.getTime()) / 86400000);

  if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Llega hoy';
  return `En ${diffDays}d`;
}
