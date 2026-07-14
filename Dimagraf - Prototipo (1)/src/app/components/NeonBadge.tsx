import type { EstadoCarpeta, CanalAduana } from './mockData';
import { StatusBadge } from './StatusBadge';

interface NeonBadgeProps {
  estado: EstadoCarpeta;
  size?: 'sm' | 'md';
}

export function NeonBadge({ estado, size = 'md' }: NeonBadgeProps) {
  const tone = estado === 'Cerrada' ? 'neutral' : estado === 'En Tránsito' ? 'violet' : estado === 'En Aduana' ? 'info' : estado === 'Activa' ? 'warning' : 'success';
  return <StatusBadge tone={tone} size={size} dot>{estado}</StatusBadge>;
}

interface CanalBadgeProps {
  canal: CanalAduana;
}

export function CanalBadge({ canal }: CanalBadgeProps) {
  const tone = canal === 'Verde' ? 'success' : canal === 'Rojo' ? 'danger' : 'neutral';
  return <StatusBadge tone={tone} dot>{canal === 'Pendiente' ? 'Pendiente' : `Canal ${canal}`}</StatusBadge>;
}
