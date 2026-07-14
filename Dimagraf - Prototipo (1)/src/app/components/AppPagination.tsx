import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppButton } from './AppButton';
import { color } from './theme';
export function AppPagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null;
  return <nav aria-label="Paginación" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AppButton aria-label="Página anterior" variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} icon={<ChevronLeft size={14} />} /><span aria-live="polite" style={{ fontSize: 12, color: color.muted }}>Página {page} de {pageCount}</span><AppButton aria-label="Página siguiente" variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)} icon={<ChevronRight size={14} />} /></nav>;
}
