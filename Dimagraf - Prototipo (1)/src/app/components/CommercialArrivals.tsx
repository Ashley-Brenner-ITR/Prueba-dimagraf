import { useState } from 'react';
import { Download, Search, Filter, Package, Clock3, Users, Ship, Truck, Plane } from 'lucide-react';
import { filterGroup, filtersSurface, getFilterChipStyle, getPrimaryButtonStyle, getResponsiveTableStyle, getSearchWrapStyle, pageActions, pageHeader, pageShell, searchInput, tableHeadCell, tableHeadRow, tableScrollArea, tableShell } from './chromeStyles';
import { MetricCardGrid } from './MetricCardGrid';
import { CARPETAS, PROVEEDORES } from './mockData';
import { useIsMobile } from './ui/use-mobile';

const INK      = '#1d1d1f';
const MUTED    = '#6e6e73';
const PARCHMENT= '#f5f5f7';
const HAIRLINE = '#d2d2d7';
const GREEN    = '#1a5c38';
const CANVAS   = '#ffffff';

interface ArrivalRow {
  codigoSAP: string; descripcion: string; linea: string;
  carpetaNumero: string; subcarpetaNumero: string;
  proveedor: string; cantidadViaje: number; um: string;
  eta: string; transporte: string;
}

function buildArrivals(): ArrivalRow[] {
  const rows: ArrivalRow[] = [];
  for (const carpeta of CARPETAS) {
    const prov = PROVEEDORES.find(p => p.id === carpeta.proveedorId);
    for (const sub of carpeta.subcarpetas) {
      if (sub.estado === 'Cerrada' || sub.estado === 'Recibida') continue;
      for (const ae of sub.articulosEmbarque) {
        const art = carpeta.articulos.find(a => a.id === ae.articuloId);
        if (!art) continue;
        rows.push({ codigoSAP: art.codigoSAP, descripcion: art.descripcion, linea: art.linea, carpetaNumero: carpeta.numero, subcarpetaNumero: sub.numero, proveedor: prov?.nombre || '—', cantidadViaje: ae.cantidad, um: art.um, eta: sub.eta, transporte: sub.transporte });
      }
    }
  }
  return rows.sort((a, b) => a.eta.localeCompare(b.eta));
}

export function CommercialArrivals() {
  const [lineaFilter, setLineaFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();
  const arrivals = buildArrivals();
  const TODAY = '2026-05-28';

  const filtered = arrivals.filter(r => {
    const matchLinea = lineaFilter === 'Todos' || r.linea === lineaFilter;
    const matchSearch = !search || r.codigoSAP.includes(search) || r.descripcion.toLowerCase().includes(search.toLowerCase()) || r.proveedor.toLowerCase().includes(search.toLowerCase());
    return matchLinea && matchSearch;
  });

  const daysLeft = (eta: string) => Math.ceil((new Date(eta).getTime() - new Date(TODAY).getTime()) / 86400000);

  return (
    <div style={pageShell}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{ ...pageHeader, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>Matriz de Arrivals</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>Cargas entrantes · Solo lectura · Sin datos de costos</p>
        </div>
        <div style={pageActions}>
          <button style={{ ...getPrimaryButtonStyle(), flexShrink: 0 }}>
            <Download size={14} /> Exportar (.xlsx)
          </button>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <MetricCardGrid
        marginBottom={24}
        items={[
          { label: 'Ítems en Viaje', value: filtered.length, color: '#5b21b6', icon: <Package size={16} /> },
          { label: 'Arrivals en ≤ 30 días', value: filtered.filter(r => daysLeft(r.eta) <= 30 && daysLeft(r.eta) >= 0).length, color: '#b45309', icon: <Clock3 size={16} /> },
          { label: 'Proveedores Activos', value: new Set(filtered.map(r => r.proveedor)).size, color: '#1a5c38', icon: <Users size={16} /> },
        ]}
      />

      {/* ── Table ──────────────────────────────────────────── */}
      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <div style={{ ...filtersSurface, marginBottom: 0, padding: 0, gap: 12, alignItems: 'center', background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <div style={{ ...getSearchWrapStyle(360), flex: '1 1 360px', minWidth: 0 }}>
              <Search size={14} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por código SAP, descripción, proveedor..."
                style={searchInput}
              />
            </div>
            <div style={filterGroup}>
              <Filter size={13} style={{ color: MUTED }} />
              {['Todos', 'LCA', 'LDA'].map(f => (
                <button key={f} onClick={() => setLineaFilter(f)} style={getFilterChipStyle(lineaFilter === f)}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={tableScrollArea}>
          {isMobile ? (
            <div style={{ padding: '0' }}>
              {filtered.map((row, i) => {
                const dl = daysLeft(row.eta);
                const etaColor = dl <= 0 ? '#c4001a' : dl <= 7 ? '#b45309' : INK;
                const isOverdue = dl <= 0;
                const isNear = dl > 0 && dl <= 7;
                const TransIcon = row.transporte === 'Marítimo' ? Ship : row.transporte === 'Terrestre' ? Truck : Plane;
                return (
                  <div key={`${row.subcarpetaNumero}-${row.codigoSAP}-${i}`} style={{ padding: '14px 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}>
                    {/* Row 1: Subcarpeta + ETA alineado derecha */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{row.subcarpetaNumero}</span>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>
                        <span style={{ color: MUTED, fontWeight: 400 }}>{row.eta}</span>
                        {isOverdue && <span style={{ color: '#c4001a', fontWeight: 700, marginLeft: 6 }}>Vencido</span>}
                        {isNear && <span style={{ color: '#b45309', fontWeight: 600, marginLeft: 6 }}>en {dl}d</span>}
                      </span>
                    </div>
                    {/* Row 2: Descripción */}
                    <div style={{ fontSize: 13, color: INK, marginTop: 4, lineHeight: 1.35 }}>{row.descripcion}</div>
                    {/* Row 3: info secundaria en línea */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: MUTED, flexWrap: 'wrap' }}>
                      <span>{row.proveedor}</span>
                      <span>·</span>
                      <span style={{ fontWeight: 500, color: INK }}>{row.cantidadViaje.toLocaleString()} {row.um}</span>
                      <span>·</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><TransIcon size={11} /> {row.transporte}</span>
                      <span>·</span>
                      <span>{row.linea}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          <table style={getResponsiveTableStyle(860)}>
            <thead>
              <tr style={tableHeadRow}>
                {['Cód. SAP', 'Descripción / Producto', 'Línea', 'Proveedor', 'Cant. en Viaje', 'Transporte', 'ETA'].map(col => (
                  <th key={col} style={tableHeadCell}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const dl = daysLeft(row.eta);
                const etaColor = dl <= 0 ? '#c4001a' : dl <= 7 ? '#b45309' : dl <= 15 ? '#1a7a4a' : INK;
                const TransIcon = row.transporte === 'Marítimo' ? Ship : row.transporte === 'Terrestre' ? Truck : Plane;
                return (
                  <tr key={`${row.subcarpetaNumero}-${row.codigoSAP}`} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                    onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                    onMouseLeave={e => (e.currentTarget.style.background = CANVAS)}
                  >
                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: INK }}>{row.codigoSAP}</td>
                    <td style={{ padding: '13px 16px', fontSize: 14, color: INK }}>{row.descripcion}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 12, color: MUTED, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, padding: '2px 8px' }}>{row.linea}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: MUTED }}>{row.proveedor}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{row.cantidadViaje.toLocaleString()}</span>
                      <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{row.um}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: MUTED }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <TransIcon size={13} color={MUTED} /> {row.transporte}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 13 }}>
                        <span style={{ color: MUTED, fontWeight: 400 }}>{row.eta}</span>
                        {dl <= 0 && <span style={{ color: '#c4001a', fontWeight: 700, marginLeft: 6 }}>Vencido</span>}
                        {dl > 0 && dl <= 7 && <span style={{ color: '#b45309', fontWeight: 600, marginLeft: 6 }}>en {dl}d</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: MUTED, fontSize: 17 }}>No hay arrivals con los filtros aplicados.</div>
        )}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>{filtered.length} ítem(s) en viaje</div>
    </div>
  );
}
