import type { ReactNode } from 'react';
import { color, radius, shadow } from './theme';
export function SectionCard({ children, title }: { children: ReactNode; title?: string }) {
  return <section style={{ minWidth: 0, background: color.canvas, overflow: 'hidden', border: `1px solid ${color.borderTint}`, borderRadius: radius.lg, boxShadow: shadow.soft }}>{title && <div style={{ padding: '14px 16px 12px', fontSize: 12, fontWeight: 700, color: color.ink, letterSpacing: '0.02em', textTransform: 'uppercase', borderBottom: `1px solid ${color.borderTintSoft}` }}>{title}</div>}<div style={{ padding: 16 }}>{children}</div></section>;
}
