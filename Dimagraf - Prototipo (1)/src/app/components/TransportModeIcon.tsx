import { Plane, Ship, Truck } from 'lucide-react';
import { color, radius } from './theme';

interface Props {
  transporte?: string;
  size?: number;
  compact?: boolean;
}

export function TransportModeIcon({ transporte, size = 16, compact = false }: Props) {
  const normalized = transporte?.toLocaleLowerCase('es') ?? '';
  const Icon = normalized.includes('terrestre') ? Truck : normalized.includes('aéreo') || normalized.includes('aereo') ? Plane : Ship;

  return (
    <span
      role="img"
      aria-label={`Transporte ${transporte || 'no informado'}`}
      title={transporte || 'Transporte no informado'}
      style={{ width: compact ? 26 : 36, height: compact ? 26 : 36, display: 'inline-grid', placeItems: 'center', flexShrink: 0, borderRadius: radius.pill, color: color.brand, background: `${color.brand}0d`, border: `1px solid ${color.brand}22` }}
    >
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}
