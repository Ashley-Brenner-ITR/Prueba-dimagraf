import type { ReactNode } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { CanalBadge } from './NeonBadge';
import { TransportModeIcon } from './TransportModeIcon';
import { StatusBadge } from './StatusBadge';
import { color, radius } from './theme';

const INK = color.ink;
const MUTED = color.muted;

const SHIPMENT_STATES: Record<string, { color: string; background: string; label: string }> = {
  'Pendiente de embarque': { color: '#b45309', background: 'rgba(180,83,9,0.08)', label: 'Pendiente de embarque' },
  'En Tránsito': { color: '#5b21b6', background: 'rgba(91,33,182,0.08)', label: 'En Tránsito' },
  'Arribado Aduana': { color: '#0066cc', background: 'rgba(0,102,204,0.08)', label: 'Arribado aduana' },
  Oficializado: { color: '#1a5c38', background: 'rgba(26,92,56,0.08)', label: 'Oficializado' },
  'En Stock': { color: '#1a7a4a', background: 'rgba(26,122,74,0.08)', label: 'En stock' },
  Recibida: { color: '#1a7a4a', background: 'rgba(26,122,74,0.08)', label: 'Recibida en depósito' },
};

interface ShipmentCardProps {
  numero: string;
  estado: string;
  transporte?: string;
  eta?: string;
  canalAduana?: string;
  forwarder?: string;
  documento?: string;
  incidentCount?: number;
  expanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
}

export function ShipmentCard({ numero, estado, transporte, eta, canalAduana, forwarder, documento, incidentCount = 0, expanded = false, onToggle, children }: ShipmentCardProps) {
  const config = SHIPMENT_STATES[estado] ?? { color: MUTED, background: 'rgba(110,110,115,0.08)', label: estado };
  const borderColor = incidentCount > 0 ? '#c4001a' : config.color;
  const content = (
    <>
      <span style={{ minWidth: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
        <TransportModeIcon transporte={transporte} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{numero}</span>
            <StatusBadge tone={estado === 'Pendiente de embarque' ? 'warning' : estado === 'En Tránsito' ? 'violet' : estado === 'Arribado Aduana' ? 'info' : 'success'}>{config.label}</StatusBadge>
            <CanalBadge canal={canalAduana} />
          </span>
          <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transporte || 'Transporte no informado'} · ETA {eta || '—'}</span>
          {(forwarder !== undefined || documento !== undefined) && <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{forwarder || 'Sin forwarder'} · BL: {documento || '—'}</span>}
        </span>
      </span>
      {(incidentCount > 0 || onToggle) && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {incidentCount > 0 && <span style={{ fontSize: 13, color: '#c4001a', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={13} /> {incidentCount} incidencia(s)</span>}
          {onToggle && <ChevronRight size={15} style={{ color: MUTED, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
        </span>
      )}
    </>
  );

  return (
    <article style={{ minWidth: 0, border: `1px solid ${borderColor}`, borderRadius: radius.sm, overflow: 'hidden', background: color.surface }}>
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={expanded} style={{ width: '100%', minHeight: 72, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>{content}</button>
      ) : (
        <div style={{ minHeight: 72, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 12, padding: '13px 14px' }}>{content}</div>
      )}
      {children}
    </article>
  );
}
