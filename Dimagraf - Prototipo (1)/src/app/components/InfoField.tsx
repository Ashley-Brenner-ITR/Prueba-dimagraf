import type { ReactNode } from 'react';
import { color as themeColor } from './theme';
export function InfoField({ label, value, children, color }: { label: string; value?: ReactNode; children?: ReactNode; color?: string }) {
  return <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, color: themeColor.muted, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 15, color: color || themeColor.ink, lineHeight: 1.35, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>{value ?? children ?? '—'}</div></div>;
}
