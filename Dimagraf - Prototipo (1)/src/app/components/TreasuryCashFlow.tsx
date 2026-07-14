import { useState } from 'react';
import { Download, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableScrollArea, tableShell } from './chromeStyles';
import { MetricCardGrid } from './MetricCardGrid';
import { OBLIGACIONES_PAGO, CARPETAS, type ObligacionPago } from './mockData';
import { NeonBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { normalizeSearchTerm } from './SearchField';
import { color } from './theme';
import { FilterToolbar } from './FilterToolbar';
import { AppButton } from './AppButton';

const INK = color.ink;
const MUTED = color.muted;
const PARCHMENT = color.parchment;
const HAIRLINE = color.hairline;
const GREEN = color.brand;
const VIOLET   = '#5b21b6';
const CANVAS = color.canvas;

export function TreasuryCashFlow() {
  const [horizonte, setHorizonte] = useState(30);
  const [pagos, setPagos] = useState<ObligacionPago[]>(OBLIGACIONES_PAGO);
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();
  const TODAY = new Date('2026-05-28');

  const daysLeft = (fecha: string) => Math.ceil((new Date(fecha).getTime() - TODAY.getTime()) / 86400000);

  const byHorizonte = pagos.filter(p => daysLeft(p.vencimiento) <= horizonte);

  const filtered = byHorizonte.filter(p => {
    if (!search) return true;
    const q = normalizeSearchTerm(search);
    return (
      normalizeSearchTerm(p.carpetaNumero).includes(q) ||
      normalizeSearchTerm(p.subcarpetaNumero).includes(q) ||
      normalizeSearchTerm(p.proveedor).includes(q)
    );
  });

  const pendientes = filtered.filter(p => p.estado === 'Pendiente de Pago');
  const criticos   = pendientes.filter(p => daysLeft(p.vencimiento) <= 7);
  const total      = pendientes.reduce((s, p) => s + p.importeARS, 0);

  const toggleEstado = (id: string) => {
    setPagos(prev => prev.map(p => p.id === id ? { ...p, estado: p.estado === 'Pendiente de Pago' ? 'Transferencia Emitida' : 'Pendiente de Pago' } : p));
  };

  const getCarpetaEstado = (carpetaNumero: string) => {
    return CARPETAS.find(c => c.numero === carpetaNumero)?.estado ?? null;
  };

  return (
    <div style={pageShell}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{ ...pageHeader, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>Flujo de Caja</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>Proyección de importaciones · Tesorería</p>
        </div>
        <div style={pageActions}>
          <AppButton size="sm" icon={<Download size={13} />}>Exportar</AppButton>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <MetricCardGrid
        items={[
          { label: `Vencimientos en ${horizonte}d`, value: byHorizonte.length, color: INK, icon: <Clock size={16} /> },
          { label: 'Pendientes de Pago', value: pendientes.length, color: '#b45309', icon: <DollarSign size={16} /> },
          { label: 'Críticos (≤ 7 días)', value: criticos.length, color: '#c4001a', icon: <AlertTriangle size={16} /> },
          { label: 'Total Comprometido ARS', value: `$${(total/1e6).toFixed(1)}M`, color: VIOLET, icon: <DollarSign size={16} /> },
        ]}
      />

      {/* ── Table ──────────────────────────────────────────── */}
      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por carpeta, subcarpeta, proveedor..." searchAriaLabel="Buscar pagos" options={[{ value: 7, label: '7 días' }, { value: 15, label: '15 días' }, { value: 30, label: '30 días' }]} value={horizonte} onValueChange={setHorizonte} />
        </div>
        {isMobile ? (
          <div>
            {filtered.map((p, i) => {
              const dl = daysLeft(p.vencimiento);
              const isPaid = p.estado === 'Transferencia Emitida';
              const isCrit = !isPaid && dl <= 7;
              const carpetaEstado = getCarpetaEstado(p.carpetaNumero);

              return (
                <div key={p.id} style={{ padding: '16px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', borderLeft: isCrit ? '3px solid #c4001a' : '3px solid transparent', background: isCrit ? 'rgba(196,0,26,0.03)' : isPaid ? 'rgba(26,122,74,0.03)' : CANVAS }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.carpetaNumero}</div>
                      {p.subcarpetaNumero && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.subcarpetaNumero}</div>}
                    </div>
                    {carpetaEstado ? <NeonBadge estado={carpetaEstado} size="sm" /> : <span style={{ fontSize: 12, color: MUTED }}>—</span>}
                  </div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PROVEEDOR</div>
                      <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{p.proveedor}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>VENCIMIENTO</div>
                        <div style={{ fontSize: 14, fontWeight: isCrit ? 600 : 400, color: isCrit ? '#c4001a' : INK, marginTop: 2 }}>{p.vencimiento}</div>
                        <div style={{ fontSize: 12, color: isCrit ? '#c4001a' : MUTED, marginTop: 2 }}>{dl > 0 ? `en ${dl} días` : dl === 0 ? 'HOY' : `vencido ${Math.abs(dl)}d`}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>MONEDA</div>
                        <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{p.moneda}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>IMPORTE</div>
                        <div style={{ fontSize: 14, color: INK, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{p.importe.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>EQUIV. ARS</div>
                        <div style={{ fontSize: 13, color: INK, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>$ {p.importeARS.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    {isPaid
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#1a7a4a' }}><CheckCircle size={13} /> Emitida</span>
                      : <AppButton onClick={() => toggleEstado(p.id)} size="xs" variant="success-soft">Marcar emitida</AppButton>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={tableScrollArea}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableHeadRow}>
                  {['Carpeta / Sub.', 'Proveedor', 'Fecha de pago', 'Moneda', 'Importe', 'Equiv. ARS', 'Estado', 'Acción'].map(col => (
                    <th key={col} style={tableHeadCell}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const dl = daysLeft(p.vencimiento);
                  const isPaid   = p.estado === 'Transferencia Emitida';
                  const isCrit   = !isPaid && dl <= 7;
                  const carpetaEstado = getCarpetaEstado(p.carpetaNumero);

                  return (
                    <tr key={p.id} style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                      borderLeft: isCrit ? '3px solid #c4001a' : '3px solid transparent',
                      background: isCrit ? 'rgba(196,0,26,0.03)' : isPaid ? 'rgba(26,122,74,0.03)' : CANVAS,
                    }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.carpetaNumero}</div>
                        {p.subcarpetaNumero && <div style={{ fontSize: 12, color: MUTED }}>{p.subcarpetaNumero}</div>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: MUTED }}>{p.proveedor}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: isCrit ? 600 : 400, color: isCrit ? '#c4001a' : INK, fontVariantNumeric: 'tabular-nums' }}>{p.vencimiento}</div>
                        <div style={{ fontSize: 12, color: isCrit ? '#c4001a' : MUTED }}>
                          {dl > 0 ? `en ${dl} días` : dl === 0 ? 'HOY' : `vencido ${Math.abs(dl)}d`}
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: MUTED }}>{p.moneda}</td>
                      <td style={{ padding: '13px 16px', fontSize: 14, color: INK, fontVariantNumeric: 'tabular-nums' }}>{p.importe.toLocaleString()}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: INK, fontVariantNumeric: 'tabular-nums' }}>$ {p.importeARS.toLocaleString()}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {carpetaEstado ? <NeonBadge estado={carpetaEstado} size="sm" /> : <span style={{ fontSize: 13, color: MUTED }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {isPaid
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#1a7a4a' }}><CheckCircle size={13} /> Emitida</span>
                          : <AppButton onClick={() => toggleEstado(p.id)} size="xs" variant="success-soft">Marcar emitida</AppButton>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: MUTED, fontSize: 17 }}>Sin vencimientos en el horizonte seleccionado.</div>
        )}
      </div>
    </div>
  );
}
