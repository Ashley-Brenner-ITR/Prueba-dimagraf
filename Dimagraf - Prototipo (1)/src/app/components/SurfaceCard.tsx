import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { color, radius, shadow } from './theme';

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  style?: CSSProperties;
  as?: 'section' | 'article' | 'div';
};

export function SurfaceCard({ children, style, as: Tag = 'section', ...props }: SurfaceCardProps) {
  return <Tag {...props} style={{ minWidth: 0, background: color.surface, border: `1px solid ${color.borderTint}`, borderRadius: radius.lg, boxShadow: shadow.soft, overflow: 'hidden', ...style }}>{children}</Tag>;
}
