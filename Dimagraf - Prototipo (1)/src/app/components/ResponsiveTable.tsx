import type { CSSProperties, ReactNode } from 'react';
import { color, radius, shadow } from './theme';
import { useIsMobile } from './ui/use-mobile';

export interface ResponsiveColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  width?: number | string;
  align?: CSSProperties['textAlign'];
  /** Show this field as a "primary" card field on mobile */
  primary?: boolean;
  /** Hide this column in mobile card view */
  hideOnMobile?: boolean;
}

interface Props<Row> {
  rows: Row[];
  columns: ResponsiveColumn<Row>[];
  getRowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  empty?: ReactNode;
  density?: 'compact' | 'regular';
}

export function ResponsiveTable<Row>({ rows, columns, getRowKey, onRowClick, empty = 'No hay resultados.', density = 'regular' }: Props<Row>) {
  const isMobile = useIsMobile();
  const padding = density === 'compact' ? '10px 12px' : '12px 16px';

  if (isMobile) {
    // Card-based layout for mobile
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: color.muted, fontSize: 13 }}>{empty}</div>
        )}
        {rows.map(row => {
          const primaryCols = columns.filter(c => c.primary);
          const secondaryCols = columns.filter(c => !c.primary && !c.hideOnMobile);
          return (
            <div
              key={getRowKey(row)}
              onClick={() => onRowClick?.(row)}
              style={{
                background: color.canvas,
                border: `1px solid ${color.borderTint}`,
                borderRadius: radius.md,
                padding: '12px 14px',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              {primaryCols.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: secondaryCols.length > 0 ? 8 : 0 }}>
                  {primaryCols.map(col => (
                    <div key={col.key} style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>
                      {col.cell(row)}
                    </div>
                  ))}
                </div>
              )}
              {secondaryCols.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 12px' }}>
                  {secondaryCols.map(col => (
                    <div key={col.key}>
                      <div style={{ fontSize: 11, color: color.muted, marginBottom: 2 }}>{col.header}</div>
                      <div style={{ fontSize: 13, color: color.ink }}>{col.cell(row)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: Standard table
  return (
    <div style={{ border: `1px solid ${color.borderTint}`, borderRadius: radius.lg, overflow: 'hidden', background: color.surface, boxShadow: shadow.soft }}>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafefd', borderBottom: `1px solid ${color.borderTintSoft}` }}>
              {columns.map(col => (
                <th key={col.key} scope="col" style={{
                  width: col.width,
                  padding,
                  textAlign: col.align || 'left',
                  fontSize: 11,
                  fontWeight: 600,
                  color: color.muted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={getRowKey(row)}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: `1px solid ${color.borderTintSoft}`,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding,
                    textAlign: col.align || 'left',
                    color: color.ink,
                    fontSize: 13,
                  }}>{col.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div role="status" style={{ padding: 36, textAlign: 'center', color: color.muted }}>{empty}</div>
        )}
      </div>
    </div>
  );
}
