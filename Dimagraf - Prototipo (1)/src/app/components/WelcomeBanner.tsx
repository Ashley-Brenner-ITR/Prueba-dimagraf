import type { ReactNode } from 'react';
import { color, radius } from './theme';

interface WelcomeBannerProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function WelcomeBanner({ title, subtitle, actions }: WelcomeBannerProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 'clamp(16px, 2.5vw, 24px)',
      padding: '0 2px',
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 700, color: color.ink, lineHeight: 1.15 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#4b5563', fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
