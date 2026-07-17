import { useState } from 'react';
import { Filter } from 'lucide-react';
import { SearchField } from './SearchField';
import { filterGroup } from './chromeStyles';
import { color, radius } from './theme';

export interface FilterOption<Value extends string | number> { value: Value; label: string; count?: number; color?: string; }
interface Props<Value extends string | number> {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel?: string;
  options: readonly FilterOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  activeColor?: string;
  getOptionCount?: (value: Value) => number;
}

export function FilterToolbar<Value extends string | number>({ search, onSearchChange, searchPlaceholder, searchAriaLabel = 'Buscar', options, value, onValueChange, expanded, onExpandedChange, activeColor = color.brand, getOptionCount }: Props<Value>) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded ?? internalExpanded;
  const setExpanded = onExpandedChange ?? setInternalExpanded;
  return <div style={{ display: 'grid', gap: 10, width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, flexWrap: 'wrap' }}>
      <SearchField value={search} onChange={onSearchChange} placeholder={searchPlaceholder} ariaLabel={searchAriaLabel} />
      <button type="button" onClick={() => setExpanded(!isExpanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, padding: 0, flexShrink: 0, background: isExpanded ? activeColor : color.canvas, color: isExpanded ? '#fff' : activeColor, border: `1px solid ${isExpanded ? activeColor : color.hairline}`, borderRadius: radius.pill, cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}><Filter size={14} aria-hidden="true" /></button>
    </div>
    {isExpanded && <div style={{ position: 'relative', display: 'flex', justifyContent: 'stretch', width: '100%', paddingTop: 6 }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 14, width: 12, height: 12, background: color.canvas, borderTop: `1px solid ${color.hairline}`, borderLeft: `1px solid ${color.hairline}`, transform: 'rotate(45deg)', boxShadow: '-2px -2px 6px rgba(16,24,40,0.03)' }} />
      <div style={{ ...filterGroup, width: '100%', padding: 10, gap: 8, background: color.canvas, border: `1px solid ${color.hairline}`, borderRadius: radius.lg, boxShadow: '0 12px 28px rgba(16,24,40,0.08)', overflow: 'visible', flexWrap: 'wrap' }}>{options.map(option => {
      const hasCountResolver = typeof getOptionCount === 'function';
      const rawCount = typeof option.count === 'number' ? option.count : (hasCountResolver ? getOptionCount(option.value) : undefined);
      const optionCount = typeof rawCount === 'number' && Number.isFinite(rawCount) ? Math.max(0, Math.trunc(rawCount)) : 0;
      const isActive = value === option.value;
      const chipColor = option.color || activeColor;

      return (
        <button type="button" key={String(option.value)} onClick={() => onValueChange(option.value)} aria-pressed={isActive} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          minHeight: 32, padding: '6px 12px', fontSize: 12, fontWeight: isActive ? 600 : 500,
          borderRadius: 9999,
          color: isActive ? chipColor : color.ink,
          background: isActive ? `${chipColor}0c` : color.canvas,
          border: `1px solid ${isActive ? chipColor : color.hairline}`,
          cursor: 'pointer', whiteSpace: 'normal', textAlign: 'left', flexShrink: 0,
          transition: 'all 0.15s ease',
        }}>
          {option.color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: chipColor, flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />}
          <span>{option.label}</span>
          {(typeof option.count === 'number' || hasCountResolver) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, fontSize: 10, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: isActive ? chipColor : '#667085', background: isActive ? `${chipColor}14` : 'rgba(102,112,133,0.06)', border: 'none' }}>
              {optionCount}
            </span>
          )}
        </button>
      );
    })}</div></div>}
  </div>;
}
