import type { ReactNode } from 'react';
import { color } from './theme';
export function SectionCard({ children, title }: { children: ReactNode; title?: string }) {
  return <section style={{ minWidth: 0, background: color.canvas, overflow: 'hidden' }}>{title && <div style={{ padding: '14px 16px 0', fontSize: 12, fontWeight: 700, color: color.ink, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{title}</div>}<div style={{ padding: 16 }}>{children}</div></section>;
}
