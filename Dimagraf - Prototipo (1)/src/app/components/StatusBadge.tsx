import type { ReactNode } from 'react';
import { color, radius } from './theme';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'violet';
const tones: Record<Tone, string> = { neutral: color.muted, brand: color.brand, success: color.success, warning: color.warning, danger: color.danger, info: color.info, violet: color.violet };

export function StatusBadge({ children, tone = 'neutral', size = 'md', dot = false, icon }: { children: ReactNode; tone?: Tone; size?: 'sm' | 'md'; dot?: boolean; icon?: ReactNode }) {
  const value = tones[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: size === 'sm' ? '2px 8px' : '3px 10px', borderRadius: radius.pill, border: `1px solid ${value}22`, background: `${value}0a`, color: value, fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{dot && <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: value }} />}{icon}{children}</span>;
}
