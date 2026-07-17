import { useState } from 'react';
import { CheckCircle, AlertTriangle, ChevronRight, X, ArrowLeft, Download } from 'lucide-react';
import { fieldLabel, formInput, formTextarea, getModalDestructiveButtonStyle, getModalSecondaryButtonStyle, getModalShellStyle, getSearchWrapStyle, modalBody, modalCloseButton, modalFooter, modalHeader, modalOverlay, pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableShell } from './chromeStyles';
import { CARPETAS, PROVEEDORES, type Subcarpeta, type Articulo } from './mockData';
import { useIsMobile } from './ui/use-mobile';
import { TransportModeIcon } from './TransportModeIcon';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { color } from './theme';
import { AppButton } from './AppButton';

const INK = color.ink;
const MUTED = color.muted;
const PARCHMENT = color.parchment;
const HAIRLINE = color.hairline;
const GREEN = color.brand;
const CANVAS = color.canvas;

type WView = 'agenda' | 'checkin';

interface Reception {
  sub: Subcarpeta;
  carpetaNumero: string;
  proveedorNombre: string;
  articulos: Articulo[];
  articulosEmbarque: { articuloId: string; cantidad: number }[];
}

function buildReceptions(): Reception[] {
  const recs: Reception[] = [];
  for (const carpeta of CARPETAS) {
    const prov = PROVEEDORES.find(p => p.id === carpeta.proveedorId);
    for (const sub of carpeta.subcarpetas) {
      if (sub.estado === 'En Stock' || sub.estado === 'En Tránsito') continue;
      if (sub.canalAduana === 'Pendiente') continue;
      recs.push({ sub, carpetaNumero: carpeta.numero, proveedorNombre: prov?.nombre || '—', articulos: carpeta.articulos, articulosEmbarque: sub.articulosEmbarque });
    }
  }
  return recs;
}

export function WarehouseReception() {
  const [view, setView] = useState<WView>('agenda');
  const [selectedRec, setSelectedRec] = useState<Reception | null>(null);
  const [search, setSearch] = useState('');
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [showIncident, setShowIncident] = useState(false);
  const [incidentTipo, setIncidentTipo] = useState('Faltante de Producto');
  const [incidentCant, setIncidentCant] = useState(0);
  const [incidentComment, setIncidentComment] = useState('');
  const isMobile = useIsMobile();

  const allReceptions = buildReceptions();
  const receptions = allReceptions.filter(rec => {
    if (!search) return true;
    const q = normalizeSearchTerm(search);
    return [rec.sub.numero, rec.carpetaNumero, rec.proveedorNombre].some(value => normalizeSearchTerm(value).includes(q));
  });

  const handleSelect = (rec: Reception) => {
    setSelectedRec(rec);
    const init: Record<string, number> = {};
    rec.articulosEmbarque.forEach(ae => { init[ae.articuloId] = ae.cantidad; });
    setCantidades(init);
    setView('checkin');
  };

  const hasDiscrepancy = selectedRec?.articulosEmbarque.some(ae => (cantidades[ae.articuloId] ?? ae.cantidad) !== ae.cantidad) ?? false;

  return (
    <div style={pageShell}>

      {/* ── Back / header ─────────────────────────────────────── */}
      {view !== 'agenda' && (
        <AppButton
          variant="tertiary"
          size="sm"
          onClick={() => { setView('agenda'); setSelectedRec(null); setShowIncident(false); }}
          icon={<ArrowLeft size={14} />}
          style={{ padding: '5px 0', marginBottom: 20, fontWeight: 400 }}
        >
          Volver al Dashboard
        </AppButton>
      )}

      <div style={{ ...pageHeader, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>
            {view === 'agenda' ? 'Recepciones' : selectedRec?.sub.numero}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>
            {view === 'agenda'
              ? 'Depósito Garín · Control de ingreso físico'
              : `${selectedRec?.proveedorNombre} · ${selectedRec?.sub.transporte} · ${selectedRec?.sub.contenedores} contenedor(es)`}
          </p>
        </div>
        {view === 'agenda' && (
          <div style={pageActions}>
            <AppButton size="sm" icon={<Download size={13} />}>Exportar</AppButton>
          </div>
        )}
      </div>

      {/* ── AGENDA ────────────────────────────────────────────── */}
      {view === 'agenda' && (
        <>
          <div style={tableShell}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
              <div style={getSearchWrapStyle(400)}>
                <SearchField value={search} onChange={setSearch} placeholder="Buscar por subcarpeta, carpeta, proveedor..." />
              </div>
            </div>
            {isMobile ? (
              <div>
                {receptions.map((rec, i) => {
                  const hasInc = rec.sub.incidencias?.length > 0;
                  return (
                    <button
                      key={rec.sub.id}
                      onClick={() => handleSelect(rec)}
                      style={{ width: '100%', padding: '16px', border: 'none', borderBottom: i < receptions.length - 1 ? `1px solid ${HAIRLINE}` : 'none', borderLeft: hasInc ? '3px solid #c4001a' : '3px solid transparent', background: hasInc ? 'rgba(196,0,26,0.02)' : CANVAS, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <TransportModeIcon transporte={rec.sub.transporte} size={15} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{rec.sub.numero}</div>
                            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{rec.sub.transporte} · {rec.carpetaNumero}</div>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: HAIRLINE }} />
                      </div>
                      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PROVEEDOR</div>
                          <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{rec.proveedorNombre}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ETA</div>
                            <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{rec.sub.eta}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ARTÍCULOS</div>
                            <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{rec.sub.contenedores}</div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>SAP TX.18 / REMITO</div>
                          <div style={{ fontSize: 13, color: rec.sub.ingresoSAP18 ? '#b45309' : MUTED, fontWeight: rec.sub.ingresoSAP18 ? 600 : 400, marginTop: 2 }}>{rec.sub.ingresoSAP18 || '—'}</div>
                        </div>
                        <div>
                          {hasInc
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c4001a' }}><AlertTriangle size={12} /> {rec.sub.incidencias.length} incidencia(s)</span>
                            : <span style={{ fontSize: 12, color: MUTED }}>Sin incidencias</span>
                          }
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={tableHeadRow}>
                    {['EMBARQUE', 'PROVEEDOR', 'ETA', 'CANTIDAD DE ARTÍCULOS', 'SAP TX.18 / REMITO', 'INCIDENCIAS', ''].map(col => (
                      <th key={col} style={tableHeadCell}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receptions.map((rec, i) => {
                    const hasInc = rec.sub.incidencias?.length > 0;
                    return (
                      <tr
                        key={rec.sub.id}
                        onClick={() => handleSelect(rec)}
                        style={{
                          borderBottom: i < receptions.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                          borderLeft: hasInc ? '3px solid #c4001a' : '3px solid transparent',
                          background: hasInc ? 'rgba(196,0,26,0.02)' : CANVAS,
                          cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                        onMouseLeave={e => (e.currentTarget.style.background = hasInc ? 'rgba(196,0,26,0.02)' : CANVAS)}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <TransportModeIcon transporte={rec.sub.transporte} size={15} />
                            <div><div style={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: '-0.2px' }}>{rec.sub.numero}</div><div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{rec.sub.transporte} · {rec.carpetaNumero}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 14, color: INK }}>{rec.proveedorNombre}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 13, color: INK, fontVariantNumeric: 'tabular-nums' }}>{rec.sub.eta}</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{rec.sub.contenedores}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 13, color: rec.sub.ingresoSAP18 ? '#b45309' : MUTED, fontWeight: rec.sub.ingresoSAP18 ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>
                            {rec.sub.ingresoSAP18 || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {hasInc
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c4001a' }}><AlertTriangle size={12} /> {rec.sub.incidencias.length} incidencia(s)</span>
                            : <span style={{ fontSize: 12, color: MUTED }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <ChevronRight size={15} style={{ color: HAIRLINE }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {receptions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 32px', color: MUTED, fontSize: 17 }}>Sin recepciones pendientes.</div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
            {receptions.length} embarque(s) con pre-aviso entrante
          </div>

        </>
      )}

      {/* ── CHECK-IN ─────────────────────────────────────────── */}
      {view === 'checkin' && selectedRec && (
        <div>
          {hasDiscrepancy && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 18px', background: 'rgba(196,0,26,0.06)', border: '1px solid rgba(196,0,26,0.2)', borderRadius: 11, fontSize: 13, color: '#c4001a', marginBottom: 20 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              Discrepancia detectada. Al guardar se abrirá un reclamo en el Dashboard de Importaciones.
            </div>
          )}

          {/* Stock control table */}
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 10, letterSpacing: '0.04em' }}>CONTROL DE STOCK FÍSICO</div>
          <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
            {isMobile ? (
              <div>
                {selectedRec.articulosEmbarque.map((ae, i) => {
                  const art = selectedRec.articulos.find(a => a.id === ae.articuloId);
                  if (!art) return null;
                  const cantReal = cantidades[ae.articuloId] ?? ae.cantidad;
                  const ok = cantReal === ae.cantidad;
                  return (
                    <div key={ae.articuloId} style={{ padding: '16px', borderBottom: i < selectedRec.articulosEmbarque.length - 1 ? `1px solid ${HAIRLINE}` : 'none', borderLeft: ok ? '3px solid transparent' : '3px solid #c4001a', background: ok ? CANVAS : 'rgba(196,0,26,0.02)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{art.codigoSAP}</div>
                      <div style={{ fontSize: 14, color: INK, marginTop: 4 }}>{art.descripcion}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>UM</div>
                          <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{art.um}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>CANT. TEÓRICA</div>
                          <div style={{ fontSize: 14, color: INK, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{ae.cantidad.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>CANT. REAL RECIBIDA</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="number"
                            value={cantReal}
                            onChange={e => setCantidades(prev => ({ ...prev, [ae.articuloId]: parseInt(e.target.value) || 0 }))}
                            style={{
                              width: 120,
                              padding: '8px 12px',
                              textAlign: 'center',
                              fontSize: 14,
                              fontWeight: 600,
                              color: ok ? '#1a7a4a' : '#c4001a',
                              background: PARCHMENT,
                              border: `1.5px solid ${ok ? '#1a7a4a55' : '#c4001a55'}`,
                              borderRadius: 9,
                              outline: 'none',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          />
                          {ok
                            ? <CheckCircle size={15} style={{ color: '#1a7a4a', flexShrink: 0 }} />
                            : <AlertTriangle size={15} style={{ color: '#c4001a', flexShrink: 0 }} />
                          }
                        </div>
                        {!ok && (
                          <div style={{ marginTop: 10 }}>
                            <span style={{ fontSize: 12, color: '#c4001a', background: 'rgba(196,0,26,0.08)', border: '1px solid rgba(196,0,26,0.2)', borderRadius: 9999, padding: '2px 8px' }}>
                              Δ {cantReal - ae.cantidad > 0 ? '+' : ''}{(cantReal - ae.cantidad).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                        <AppButton
                          onClick={() => alert(`Entrega conforme para ${art.codigoSAP}.`)}
                          size="xs"
                          variant="success-soft"
                          icon={<CheckCircle size={12} />}
                          disabled={!ok}
                        >
                          Conforme
                        </AppButton>
                        <AppButton onClick={() => setShowIncident(true)} size="xs" variant="danger-soft" icon={<AlertTriangle size={12} />}>
                          Reportar
                        </AppButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                    {['CÓD. SAP', 'INSUMO', 'UM', 'CANT. TEÓRICA', 'CANT. REAL RECIBIDA', '', 'ACCIÓN'].map(col => (
                      <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRec.articulosEmbarque.map((ae, i) => {
                    const art = selectedRec.articulos.find(a => a.id === ae.articuloId);
                    if (!art) return null;
                    const cantReal = cantidades[ae.articuloId] ?? ae.cantidad;
                    const ok = cantReal === ae.cantidad;
                    return (
                      <tr
                        key={ae.articuloId}
                        style={{
                          borderBottom: i < selectedRec.articulosEmbarque.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                          borderLeft: ok ? '3px solid transparent' : '3px solid #c4001a',
                          background: ok ? CANVAS : 'rgba(196,0,26,0.02)',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: INK }}>{art.codigoSAP}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: INK }}>{art.descripcion}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: MUTED }}>{art.um}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: INK, fontVariantNumeric: 'tabular-nums' }}>
                          {ae.cantidad.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="number"
                              value={cantReal}
                              onChange={e => setCantidades(prev => ({ ...prev, [ae.articuloId]: parseInt(e.target.value) || 0 }))}
                              style={{
                                width: 110,
                                padding: '8px 12px',
                                textAlign: 'center',
                                fontSize: 14,
                                fontWeight: 600,
                                color: ok ? '#1a7a4a' : '#c4001a',
                                background: PARCHMENT,
                                border: `1.5px solid ${ok ? '#1a7a4a55' : '#c4001a55'}`,
                                borderRadius: 9,
                                outline: 'none',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            />
                            {ok
                              ? <CheckCircle size={15} style={{ color: '#1a7a4a', flexShrink: 0 }} />
                              : <AlertTriangle size={15} style={{ color: '#c4001a', flexShrink: 0 }} />
                            }
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {!ok && (
                            <span style={{ fontSize: 12, color: '#c4001a', background: 'rgba(196,0,26,0.08)', border: '1px solid rgba(196,0,26,0.2)', borderRadius: 9999, padding: '2px 8px' }}>
                              Δ {cantReal - ae.cantidad > 0 ? '+' : ''}{(cantReal - ae.cantidad).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <AppButton
                              onClick={() => alert(`Entrega conforme para ${art.codigoSAP}.`)}
                              size="xs"
                              variant="success-soft"
                              icon={<CheckCircle size={12} />}
                              disabled={!ok}
                            >
                              Conforme
                            </AppButton>
                            <AppButton onClick={() => setShowIncident(true)} size="xs" variant="danger-soft" icon={<AlertTriangle size={12} />}>
                              Reportar
                            </AppButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ── Incident modal ────────────────────────────────────── */}
      {showIncident && (
        <div style={{ ...modalOverlay, zIndex: 200 }}>
          <div style={getModalShellStyle(420)}>

            {/* Modal header */}
            <div style={modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>Registro de Incidencia</h2>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={() => setShowIncident(false)} icon={<X size={15} style={{ color: MUTED }} />} style={{ borderRadius: 9999 }} />
            </div>

            <div style={{ ...modalBody, padding: '20px 24px' }}>
              <div>
                <label style={fieldLabel}>TIPO DE INCIDENCIA</label>
                <select
                  value={incidentTipo}
                  onChange={e => setIncidentTipo(e.target.value)}
                  style={{ ...formInput, minHeight: 42 }}
                >
                  <option>Faltante de Producto</option>
                  <option>Mercadería Dañada / Rota</option>
                  <option>Error de SKU / Producto Equivocado</option>
                </select>
              </div>

              <div>
                <label style={fieldLabel}>CANTIDAD AFECTADA</label>
                <input
                  type="number"
                  value={incidentCant}
                  onChange={e => setIncidentCant(parseInt(e.target.value) || 0)}
                  style={{ ...formInput, minHeight: 42, fontWeight: 600, color: '#c4001a', border: '1px solid rgba(196,0,26,0.3)' }}
                />
              </div>

              <div>
                <label style={fieldLabel}>COMENTARIOS (OPCIONAL)</label>
                <textarea
                  value={incidentComment}
                  onChange={e => setIncidentComment(e.target.value)}
                  rows={3}
                  style={formTextarea}
                  placeholder="Estado de los bultos, condición de llegada..."
                />
              </div>

              <div style={modalFooter}>
                <AppButton onClick={() => setShowIncident(false)} variant="secondary" size="sm">Cancelar</AppButton>
                <AppButton onClick={() => { setShowIncident(false); alert('Incidencia registrada. Alerta enviada a Importaciones. Carpeta permanece abierta.'); }} variant="danger" size="sm" style={{ flex: 2 }}>
                  Registrar Incidencia
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
