import type { CSSProperties, ReactNode } from 'react';
import { color, radius, shadow } from './theme';

export interface DataColumn<Row> { key: string; header: ReactNode; cell: (row: Row) => ReactNode; width?: number | string; align?: CSSProperties['textAlign']; hideOnMobile?: boolean; }
interface Props<Row> { rows: Row[]; columns: DataColumn<Row>[]; getRowKey: (row: Row) => string; empty?: ReactNode; density?: 'compact' | 'regular'; minWidth?: number; }

export function DataTable<Row>({ rows, columns, getRowKey, empty = 'No hay resultados.', density = 'regular', minWidth = 720 }: Props<Row>) {
  const padding = density === 'compact' ? '9px 12px' : '12px 16px';
  return <div style={{ border: `1px solid ${color.hairline}`, borderRadius: radius.lg, overflow: 'hidden', background: color.surface, boxShadow: shadow.soft }}><div style={{ width: '100%', overflowX: 'auto' }}><table style={{ width: '100%', minWidth, borderCollapse: 'collapse' }}><thead><tr style={{ background: '#fafbfd', borderBottom: `1px solid ${color.hairline}` }}>{columns.map(column => <th key={column.key} scope="col" style={{ width: column.width, padding, textAlign: column.align || 'left', fontSize: 11, fontWeight: 600, color: color.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{column.header}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={getRowKey(row)} style={{ borderBottom: `1px solid ${color.hairline}` }}>{columns.map(column => <td key={column.key} style={{ padding, textAlign: column.align || 'left', color: color.ink, fontSize: 13 }}>{column.cell(row)}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div role="status" style={{ padding: 36, textAlign: 'center', color: color.muted }}>{empty}</div>}</div></div>;
}
