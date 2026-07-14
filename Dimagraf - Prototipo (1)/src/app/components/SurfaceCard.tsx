import type { CSSProperties, ReactNode } from 'react';
import { color, radius, shadow } from './theme';
export function SurfaceCard({ children, style, as: Tag = 'section' }: { children: ReactNode; style?: CSSProperties; as?: 'section' | 'article' | 'div' }) {
  return <Tag style={{ minWidth: 0, background: color.surface, border: `1px solid ${color.hairline}`, borderRadius: radius.lg, boxShadow: shadow.soft, overflow: 'hidden', ...style }}>{children}</Tag>;
}
