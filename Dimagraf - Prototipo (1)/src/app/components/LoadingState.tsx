import type { CSSProperties } from 'react';

const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const HAIRLINE = '#d2d2d7';
const SURFACE = '#f8fafc';
const CANVAS = '#ffffff';

function shimmerStyle(delayMs = 0): CSSProperties {
  return {
    background: 'linear-gradient(90deg, #eef0f4 0%, #f7f9fc 45%, #eef0f4 100%)',
    backgroundSize: '220% 100%',
    animation: `app-shimmer 1.25s ease-in-out ${delayMs}ms infinite`,
  };
}

function block(width: string | number, height: number, radius = 999): CSSProperties {
  return {
    width,
    height,
    borderRadius: radius,
    ...shimmerStyle(),
  };
}

export function AppLoaderSkeleton({ title = 'Cargando informacion...' }: { title?: string }) {
  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: 'clamp(20px, 4vw, 48px) clamp(14px, 3vw, 32px) clamp(28px, 5vw, 56px)' }}>
      <style>{`@keyframes app-shimmer { 0% { background-position: 220% 0; } 100% { background-position: -220% 0; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 16, height: 16, borderRadius: 999, background: '#1a5c38', animation: 'app-loader-pulse 1.1s ease-in-out infinite alternate' }} />
        <div style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{title}</div>
      </div>

      <style>{`@keyframes app-loader-pulse { 0% { opacity: 0.3; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }`}</style>

      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <div style={block('28%', 28, 10)} />
        <div style={block('42%', 14, 8)} />
      </div>

      <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 20, overflow: 'hidden', background: CANVAS, boxShadow: '0 4px 14px rgba(16,24,40,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <div style={{ ...block('100%', 40, 14), flex: 1 }} />
          <div style={block(40, 40, 999)} />
        </div>

        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: SURFACE, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={block(72, 30)} />
          <div style={block(108, 30)} />
          <div style={block(98, 30)} />
          <div style={block(88, 30)} />
        </div>

        <div style={{ padding: '8px 0' }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 120px', gap: 12, padding: '12px 14px', borderBottom: idx < 5 ? `1px solid ${HAIRLINE}` : 'none' }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ ...block('52%', 14, 8), ...shimmerStyle(idx * 80) }} />
                <div style={{ ...block('74%', 12, 8), ...shimmerStyle(idx * 80) }} />
              </div>
              <div style={{ ...block('88%', 13, 8), ...shimmerStyle(idx * 80) }} />
              <div style={{ ...block('70%', 13, 8), ...shimmerStyle(idx * 80) }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>Preparando datos y vistas...</div>
    </div>
  );
}
