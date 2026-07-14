import type { ReactNode } from 'react';
import { color } from './theme';
export function PageHeader({ title, subtitle, actions, backAction }: { title: string; subtitle?: ReactNode; actions?: ReactNode; backAction?: ReactNode }) {
  return <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 'clamp(16px,3vw,32px)' }}><div>{backAction}<h1 style={{ margin: 0, color: color.ink }}>{title}</h1>{subtitle && <div style={{ marginTop: 5, color: color.muted, fontSize: 14 }}>{subtitle}</div>}</div>{actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}</header>;
}
