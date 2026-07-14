import { useState } from 'react';
import { Filter } from 'lucide-react';
import { SearchField } from './SearchField';
import { filterGroup, getFilterChipStyle } from './chromeStyles';
import { color, radius } from './theme';

export interface FilterOption<Value extends string | number> { value: Value; label: string; count?: number; }
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0 }}>
      <SearchField value={search} onChange={onSearchChange} placeholder={searchPlaceholder} ariaLabel={searchAriaLabel} />
      <button type="button" onClick={() => setExpanded(!isExpanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, padding: 0, flexShrink: 0, background: isExpanded ? activeColor : color.canvas, color: isExpanded ? '#fff' : activeColor, border: `1px solid ${activeColor}`, borderRadius: radius.pill, cursor: 'pointer', boxShadow: isExpanded ? `0 6px 14px ${activeColor}2e` : '0 1px 2px rgba(16,24,40,0.04)' }}><Filter size={14} aria-hidden="true" /></button>
    </div>
    {isExpanded && <div style={{ ...filterGroup, width: '100%', padding: 0, gap: 6, background: 'transparent', border: 'none', overflow: 'visible', flexWrap: 'wrap' }}>{options.map(option => {
      const hasCountResolver = typeof getOptionCount === 'function';
      const rawCount = typeof option.count === 'number' ? option.count : (hasCountResolver ? getOptionCount(option.value) : undefined);
      const optionCount = typeof rawCount === 'number' && Number.isFinite(rawCount) ? Math.max(0, Math.trunc(rawCount)) : 0;
      const isActive = value === option.value;

      return (
        <button type="button" key={String(option.value)} onClick={() => onValueChange(option.value)} aria-pressed={isActive} style={{ ...getFilterChipStyle(isActive, activeColor), display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>{option.label}</span>
          {(typeof option.count === 'number' || hasCountResolver) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 9999, fontSize: 11, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: isActive ? '#ffffff' : '#344054', background: isActive ? activeColor : '#eef2f7', border: `1px solid ${isActive ? `${activeColor}33` : '#cbd5e1'}` }}>
              {optionCount}
            </span>
          )}
        </button>
      );
    })}</div>}
  </div>;
}
