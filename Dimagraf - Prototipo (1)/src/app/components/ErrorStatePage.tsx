import { AlertTriangle, Home, RefreshCw, SearchX } from 'lucide-react';

type ErrorVariant = '404' | '500' | 'generic';

const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const HAIRLINE = '#d2d2d7';
const GREEN = '#1a5c38';
const CANVAS = '#ffffff';

const COPY: Record<ErrorVariant, { code: string; title: string; description: string; icon: 'search' | 'alert' }> = {
  '404': {
    code: '404',
    title: 'Pagina no encontrada',
    description: 'La ruta o recurso que estas buscando no existe o fue movido.',
    icon: 'search',
  },
  '500': {
    code: '500',
    title: 'Error interno',
    description: 'Ocurrio un problema inesperado. Intenta nuevamente en unos segundos.',
    icon: 'alert',
  },
  generic: {
    code: 'Error',
    title: 'No pudimos cargar esta pantalla',
    description: 'Hubo un problema de renderizado o de estado de la aplicacion.',
    icon: 'alert',
  },
};

function ActionButton({ label, onClick, icon, primary = false }: { label: string; onClick: () => void; icon: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        borderRadius: 9999,
        border: primary ? 'none' : `1px solid ${HAIRLINE}`,
        background: primary ? GREEN : CANVAS,
        color: primary ? '#ffffff' : MUTED,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function ErrorStatePage({
  variant,
  onRetry,
  onGoHome,
}: {
  variant: ErrorVariant;
  onRetry: () => void;
  onGoHome: () => void;
}) {
  const content = COPY[variant];
  const Icon = content.icon === 'search' ? SearchX : AlertTriangle;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(28px, 5vw, 72px) clamp(14px, 3vw, 24px)', minHeight: '58vh', display: 'grid', alignItems: 'center' }}>
      <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 24, background: CANVAS, boxShadow: '0 8px 24px rgba(16,24,40,0.06)', padding: 'clamp(22px, 4vw, 40px)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 9999, background: 'rgba(196,0,26,0.08)', color: '#c4001a', marginBottom: 16 }}>
          <Icon size={28} />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: MUTED, marginBottom: 8 }}>{content.code}</div>
        <h1 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 34px)', color: INK, letterSpacing: '-0.02em' }}>{content.title}</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 560, fontSize: 15, lineHeight: 1.45, color: MUTED }}>{content.description}</p>

        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <ActionButton label="Reintentar" onClick={onRetry} icon={<RefreshCw size={14} />} primary />
          <ActionButton label="Ir al inicio" onClick={onGoHome} icon={<Home size={14} />} />
        </div>
      </div>
    </div>
  );
}
