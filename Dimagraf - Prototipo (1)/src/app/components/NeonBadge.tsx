import type { EstadoCarpeta, CanalAduana } from './mockData';
import { getEstadoColor, getEstadoBg } from './mockData';

interface NeonBadgeProps {
  estado: EstadoCarpeta;
  size?: 'sm' | 'md';
}

export function NeonBadge({ estado, size = 'md' }: NeonBadgeProps) {
  const color = getEstadoColor(estado);
  const bg = getEstadoBg(estado);
  const fs = size === 'sm' ? 12 : 13;
  const px = size === 'sm' ? '8px' : '10px';
  const py = size === 'sm' ? '2px' : '4px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: fs,
        fontWeight: 500,
        letterSpacing: '-0.12px',
        color,
        background: `${color}0a`,
        border: `1px solid ${color}1f`,
        borderRadius: 12,
        padding: `${py} ${px}`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {estado}
    </span>
  );
}

interface CanalBadgeProps {
  canal: CanalAduana;
}

export function CanalBadge({ canal }: CanalBadgeProps) {
  const map = {
    'Verde':    { color: '#1a7a4a', bg: 'rgba(26,122,74,0.08)', label: 'Canal Verde' },
    'Rojo':     { color: '#c4001a', bg: 'rgba(196,0,26,0.08)',  label: 'Canal Rojo'  },
    'Pendiente':{ color: '#6e6e73', bg: 'rgba(110,110,115,0.08)', label: 'Pendiente'  },
  };
  const cfg = map[canal];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        fontWeight: canal === 'Rojo' ? 600 : 500,
        letterSpacing: '-0.12px',
        color: cfg.color,
        background: `${cfg.color}0a`,
        border: `1px solid ${cfg.color}22`,
        borderRadius: 12,
        padding: '3px 10px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
