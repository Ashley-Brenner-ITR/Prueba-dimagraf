import { Search } from 'lucide-react';
import { color, radius } from './theme';
export const normalizeSearchTerm = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
export function SearchField({ value, onChange, placeholder = 'Buscar…', ariaLabel = 'Buscar' }: { value: string; onChange: (value: string) => void; placeholder?: string; ariaLabel?: string }) {
  return <label style={{ position: 'relative', display: 'block', flex: 1, minWidth: 0, width: '100%' }}><Search aria-hidden="true" size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: color.muted }} /><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{ariaLabel}</span><input aria-label={ariaLabel} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} style={{ width: '100%', minHeight: 38, padding: '8px 12px 8px 36px', fontSize: 13, color: color.ink, background: color.canvas, border: `1px solid ${color.hairline}`, borderRadius: radius.pill, outline: 'none' }} /></label>;
}
