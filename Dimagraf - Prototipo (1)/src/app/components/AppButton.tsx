import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { color, radius } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft' | 'success-soft';
type Size = 'xs' | 'sm' | 'md';
type ExtendedVariant = Variant | 'tertiary';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ExtendedVariant; size?: Size; icon?: ReactNode; }

const variants: Record<ExtendedVariant, CSSProperties> = {
  primary: { background: color.brand, color: '#fff', border: `1px solid ${color.brand}` },
  secondary: { background: color.canvas, color: color.ink, border: `1px solid ${color.borderTint}` },
  tertiary: { background: 'transparent', color: color.muted, border: `1px solid ${color.borderTint}` },
  ghost: { background: 'transparent', color: color.muted, border: '1px solid transparent' },
  danger: { background: color.danger, color: '#fff', border: '1px solid transparent' },
  'danger-soft': { background: `${color.danger}0d`, color: color.danger, border: `1px solid ${color.danger}22` },
  'success-soft': { background: `${color.success}0d`, color: color.success, border: `1px solid ${color.success}22` },
};
const sizes: Record<Size, CSSProperties> = {
  xs: { minHeight: 28, padding: '5px 9px', fontSize: 11 },
  sm: { minHeight: 34, padding: '7px 12px', fontSize: 12 },
  md: { minHeight: 40, padding: '9px 16px', fontSize: 13 },
};

export function AppButton({ variant = 'primary', size = 'md', icon, children, style, type = 'button', ...props }: Props) {
  const iconOnly = Boolean(icon) && !children;
  const iconOnlyStyle: CSSProperties = iconOnly
    ? { width: size === 'xs' ? 28 : size === 'sm' ? 34 : 40, padding: 0 }
    : {};

  return <button type={type} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.pill, fontWeight: 600, cursor: props.disabled ? 'default' : 'pointer', opacity: props.disabled ? 0.5 : 1, whiteSpace: 'nowrap', transition: 'background-color .18s ease, border-color .18s ease, color .18s ease', ...variants[variant], ...sizes[size], ...iconOnlyStyle, ...style }} {...props}>{icon}{children}</button>;
}
