import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { color, radius } from './theme';

export function FormField({ label, error, help, children, id }: { label: string; error?: string; help?: string; children: ReactNode; id?: string }) {
  return <label htmlFor={id} style={{ display: 'grid', gap: 6, minWidth: 0 }}><span style={{ fontSize: 11, fontWeight: 600, color: error ? color.danger : color.muted, letterSpacing: '0.04em' }}>{label}</span>{children}{(error || help) && <span style={{ fontSize: 11, color: error ? color.danger : color.muted }}>{error || help}</span>}</label>;
}

export function AppInput({ style, id: providedId, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId(); const id = providedId || generatedId;
  return <input id={id} style={{ width: '100%', minHeight: 40, padding: '9px 13px', fontSize: 14, color: color.ink, background: color.surface, border: `1px solid ${props['aria-invalid'] ? color.danger : color.hairline}`, borderRadius: radius.md, outline: 'none', ...style }} {...props} />;
}
