import { useState } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Ship, Eye, Download } from 'lucide-react';
import { filterGroup, filtersSurface, getAutoFitGridStyle, getPrimaryButtonStyle, getResponsiveTableStyle, getSearchWrapStyle, getSegmentButtonStyle, pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableScrollArea, tableShell, segmentedControl } from './chromeStyles';
import { CARPETAS, PROVEEDORES, getEstadoColor, type Carpeta } from './mockData';
import { MetricCardGrid } from './MetricCardGrid';
import { NeonBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { color as themeColor } from './theme';

const INK = themeColor.ink;
const MUTED = themeColor.muted;
const PARCHMENT = themeColor.parchment;
const HAIRLINE = themeColor.hairline;
const GREEN = themeColor.brand;
const VIOLET   = '#5b21b6';
const CANVAS = themeColor.canvas;

interface Props {
  onViewCarpeta: (id: string) => void;
  carpetasList?: Carpeta[];
  section: 'kpi' | 'audit';
  onSectionChange: (section: 'kpi' | 'audit') => void;
}

const trendData = [
  { mes: 'Ene', carpetas: 4, monto: 280 },
  { mes: 'Feb', carpetas: 6, monto: 410 },
  { mes: 'Mar', carpetas: 5, monto: 365 },
  { mes: 'Abr', carpetas: 8, monto: 520 },
  { mes: 'May', carpetas: 5, monto: 388 },
];

export function DirectorDashboard({ onViewCarpeta, carpetasList, section, onSectionChange }: Props) {
  const isMobile = useIsMobile();
  const list = carpetasList ?? CARPETAS;

  const activas    = list.filter(c => c.estado !== 'Cerrada');
  const criticas   = list.filter(c => c.estado === 'Con Incidencia' || c.subcarpetas.some(s => s.canalAduana === 'Rojo'));
  const totalMonto = activas.reduce((s, c) => s + c.montoTotal, 0);
  const contenedores = list.flatMap(c => c.subcarpetas).filter(s => s.estado !== 'Cerrada').reduce((s, sub) => s + sub.contenedores, 0);
  import { AppButton } from './AppButton';
  const costeo = list.filter(c => c.coeficienteReal !== null);
  const desvios = costeo.filter(c => Math.abs((c.coeficienteReal! - c.coeficienteEst) / c.coeficienteEst) > 0.05);

  return (
    <div style={pageShell}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{ ...pageHeader, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>Control Gerencial</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>Monitoreo ejecutivo · Solo lectura</p>
        </div>
        <div style={pageActions}>
          <div style={segmentedControl}>
            <button onClick={() => onSectionChange('kpi')} style={getSegmentButtonStyle(section === 'kpi')}>KPIs</button>
            <button onClick={() => onSectionChange('audit')} style={getSegmentButtonStyle(section === 'audit')}>Auditoría Costos</button>
                <AppButton size="sm" icon={<Download size={13} />}>Exportar</AppButton>
          </button>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <MetricCardGrid
        items={[
          { label: 'Contenedores en Tránsito', value: contenedores, color: VIOLET, icon: <Ship size={16} /> },
          { label: 'Monto Comprometido', value: `€${(totalMonto / 1000).toFixed(0)}K`, color: VIOLET, icon: <DollarSign size={16} /> },
          { label: 'Alertas Críticas', value: criticas.length, color: '#c4001a', icon: <AlertTriangle size={16} /> },
          { label: 'Desvíos Costo > 5%', value: desvios.length, color: '#b45309', icon: <TrendingUp size={16} /> },
        ]}
      />

      {section === 'kpi' ? (
        <>
          {/* ── Critical Alerts ────────────────────────────── */}
          {criticas.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: '0 0 12px', letterSpacing: '-0.2px' }}>Alertas Críticas</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criticas.map(c => {
                  const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                  const color = getEstadoColor(c.estado);
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: isMobile ? '8px 12px' : 16, padding: isMobile ? '12px 14px' : '14px 18px', border: `1px solid ${color}`, borderRadius: 12, background: `${color}12` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <AlertTriangle size={15} style={{ color, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{c.numero}</span>
                        <NeonBadge estado={c.estado} size="sm" />
                      </div>
                      <span style={{ fontSize: 13, color: MUTED, flex: 1, minWidth: isMobile ? '100%' : 120 }}>{c.ultimoHito}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                              <AppButton size="xs" variant="secondary" icon={<Eye size={12} />} onClick={() => onViewCarpeta(c.id)} style={{ flexShrink: 0 }}>
                                Ver
                              </AppButton>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Charts ─────────────────────────────────────── */}
          <div style={getAutoFitGridStyle(320, 16)}>
            <SimpleBarChart
              title="CARPETAS ABIERTAS POR MES — 2026"
              data={trendData.map(d => ({ label: d.mes, value: d.carpetas }))}
              color={VIOLET}
            />
            <SimpleBarChart
              title="MONTO IMPORTADO POR MES — €K"
              data={trendData.map(d => ({ label: d.mes, value: d.monto }))}
              color={VIOLET}
            />
          </div>
        </>
      ) : (
        <AuditPanel onViewCarpeta={onViewCarpeta} list={list} />
      )}
    </div>
  );
}

function SimpleBarChart({ title, data, color }: { title: string; data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, padding: '24px', background: CANVAS }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 16, letterSpacing: '0.04em' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
        {data.map(d => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '-0.1px' }}>{d.value}</span>
            <div style={{ width: '100%', background: color, opacity: 0.72, borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 100}%`, minHeight: 4 }} />
            <span style={{ fontSize: 11, color: MUTED }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditPanel({ onViewCarpeta, list }: { onViewCarpeta: (id: string) => void; list: typeof CARPETAS }) {
  const [search, setSearch] = useState('');
  const costeo = list.filter(c => c.coeficienteReal !== null).filter(c => {
    const query = normalizeSearchTerm(search);
    if (!query) return true;
    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
    return [c.numero, prov?.nombre].some(value => normalizeSearchTerm(value).includes(query));
  });

  return (
    <div>
      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <div style={{ ...filtersSurface, justifyContent: 'space-between', marginBottom: 0, padding: 0, gap: 12, background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.2px' }}>
              Auditoría de Costos — Variación de Coeficientes
            </h2>
            <div style={getSearchWrapStyle(300)}>
              <SearchField value={search} onChange={setSearch} placeholder="Buscar carpeta o proveedor..." />
            </div>
          </div>
        </div>
        <div style={tableScrollArea}>
          <table style={getResponsiveTableStyle(860)}>
            <thead>
              <tr style={tableHeadRow}>
                {['Carpeta', 'Proveedor', 'Coef. Estimado', 'Coef. Real', 'Variación', 'Observaciones', ''].map(col => (
                  <th key={col} style={tableHeadCell}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costeo.map((c, i) => {
                const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                const desv = c.coeficienteReal! - c.coeficienteEst;
                const pct  = (desv / c.coeficienteEst) * 100;
                const alert = Math.abs(pct) > 5;
                const color = alert ? (pct > 0 ? '#b84800' : VIOLET) : '#1a7a4a';
                return (
                  <tr key={c.id} style={{ borderBottom: i < costeo.length - 1 ? `1px solid ${HAIRLINE}` : 'none', borderLeft: alert ? `3px solid ${color}` : '3px solid transparent', background: alert ? `${color}06` : CANVAS }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: INK }}>{c.numero}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: MUTED }}>{prov?.nombre}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: INK, fontVariantNumeric: 'tabular-nums' }}>{c.coeficienteEst.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{c.coeficienteReal!.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color, padding: '3px 10px', background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 9999 }}>
                        {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: MUTED, maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.observaciones || '(sin observaciones)'}</div>
                    </td>
                            <AppButton type="button" size="xs" variant="tertiary" icon={<Eye size={14} />} onClick={() => onViewCarpeta(c.id)} aria-label={`Ver ${c.numero}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {costeo.length === 0 && <div style={{ textAlign: 'center', padding: '64px', color: MUTED }}>Sin coeficientes reales cargados.</div>}
      </div>
    </div>
  );
}
