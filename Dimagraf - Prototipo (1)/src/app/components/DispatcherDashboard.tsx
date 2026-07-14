import { useState } from 'react';
import { ArrowLeft, Edit2, Check, X, ChevronRight, FolderOpen, ShieldCheck, ShieldAlert, DatabaseZap } from 'lucide-react';
import { fieldLabel, formInput, getModalPrimaryButtonStyle, getModalSecondaryButtonStyle, getModalShellStyle, getSearchWrapStyle, modalBody, modalCloseButton, modalFooter, modalHeader, modalOverlay, pageShell, tableHeadCell, tableHeadRow, tableShell } from './chromeStyles';
import { MetricCardGrid } from './MetricCardGrid';
import { PROVEEDORES, getEstadoColor, type Carpeta, type Subcarpeta, type DespachoTipo } from './mockData';
import { CanalBadge, NeonBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { TransportModeIcon } from './TransportModeIcon';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { color } from './theme';
import { FormField as Field } from './FormField';
import { AppButton } from './AppButton';

const INK = color.ink;
const MUTED = color.muted;
const PARCHMENT = color.parchment;
const HAIRLINE = color.hairline;
const GREEN = color.brand;
const CANVAS = color.canvas;

const CANAL_CFG = {
  Verde:    { color: '#1a7a4a', bg: 'rgba(26,122,74,0.10)',  border: 'rgba(26,122,74,0.30)'  },
  Rojo:     { color: '#c4001a', bg: 'rgba(196,0,26,0.10)',   border: 'rgba(196,0,26,0.30)'   },
  Pendiente:{ color: '#b45309', bg: 'rgba(180,83,9,0.10)',   border: 'rgba(180,83,9,0.30)'   },
};

const DESPACHO_OPTS: DespachoTipo[] = ['Despacho Directo', 'ZFI', 'ZFE'];

interface DispatcherData {
  gastosARS: string;
  vepUSD: string;
  fechaOficializacion: string;
  fechaSalidaPuerto: string;
  despachoTipo: DespachoTipo | '';
  canalAduana: 'Verde' | 'Rojo' | 'Pendiente';
}

function emptyData(sub: Subcarpeta): DispatcherData {
  return {
    gastosARS:          sub.gastosARS          ? String(sub.gastosARS)          : '',
    vepUSD:             sub.vepUSD             ? String(sub.vepUSD)             : '',
    fechaOficializacion:sub.fechaOficializacion ?? '',
    fechaSalidaPuerto:  sub.fechaSalidaPuerto  ?? '',
    despachoTipo:       sub.despachoTipo       ?? '',
    canalAduana:        sub.canalAduana,
  };
}

function hasData(d: DispatcherData): boolean {
  return !!(d.gastosARS || d.vepUSD || d.fechaOficializacion || d.fechaSalidaPuerto || d.despachoTipo);
}

// ── Canal badge ───────────────────────────────────────────────────────────────

// ── Field row for the edit modal ──────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  ...formInput,
  fontSize: 13,
};

// ── Edit modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  carpetaNumero: string;
  sub: Subcarpeta;
  data: DispatcherData;
  onSave: (data: DispatcherData) => void;
  onClose: () => void;
}

function EditModal({ carpetaNumero, sub, data, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<DispatcherData>({ ...data });

  const set = (field: keyof DispatcherData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ ...modalOverlay, zIndex: 300 }}>
      <div style={getModalShellStyle(520)}>

        {/* Header */}
        <div style={modalHeader}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, letterSpacing: '-0.2px' }}>{sub.numero}</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{carpetaNumero} · Datos de despacho</div>
          </div>
          <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={onClose} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
        </div>

        {/* Form */}
        <div style={modalBody}>

          {/* Canal */}
          <Field label="CANAL ADUANA">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Verde', 'Rojo'] as const).map(c => {
                const cfg = CANAL_CFG[c];
                const active = form.canalAduana === c;
                return (
                  <AppButton
                    key={c}
                    onClick={() => setForm(prev => ({ ...prev, canalAduana: c }))}
                    size="sm"
                    variant={active ? (c === 'Rojo' ? 'danger-soft' : 'success-soft') : 'secondary'}
                    style={{
                      flex: 1, fontSize: 13, fontWeight: active ? 700 : 400,
                    }}
                  >
                    {c}
                  </AppButton>
                );
              })}
            </div>
          </Field>

          {/* Despacho tipo */}
          <Field label="DESPACHO / ZFI / ZFE">
            <select value={form.despachoTipo} onChange={set('despachoTipo')} style={inputStyle}>
              <option value="">Seleccionar tipo...</option>
              {DESPACHO_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>

          {/* Montos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="GASTOS AR$ (ESTIMADO)">
              <input type="number" value={form.gastosARS} onChange={set('gastosARS')} placeholder="0"
                style={inputStyle} />
            </Field>
            <Field label="VEP USD (IMPUESTO)">
              <input type="number" value={form.vepUSD} onChange={set('vepUSD')} placeholder="0"
                style={inputStyle} />
            </Field>
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="FECHA OFICIALIZACIÓN">
              <input type="date" value={form.fechaOficializacion} onChange={set('fechaOficializacion')}
                style={inputStyle} />
            </Field>
            <Field label="FECHA SALIDA">
              <input type="date" value={form.fechaSalidaPuerto} onChange={set('fechaSalidaPuerto')}
                style={inputStyle} />
            </Field>
          </div>

          {/* Actions */}
          <div style={modalFooter}>
            <AppButton onClick={onClose} variant="secondary" size="sm">Cancelar</AppButton>
            <AppButton onClick={() => onSave(form)} size="sm" icon={<Check size={14} />}>Guardar datos</AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Carpeta detail view ───────────────────────────────────────────────────────

interface DetailViewProps {
  carpeta: Carpeta;
  dispatcherMap: Record<string, DispatcherData>;
  onSave: (subId: string, data: DispatcherData) => void;
  onBack: () => void;
  isMobile: boolean;
}

function DetailView({ carpeta, dispatcherMap, onSave, onBack, isMobile }: DetailViewProps) {
  const [editingSub, setEditingSub] = useState<Subcarpeta | null>(null);
  const prov = PROVEEDORES.find(p => p.id === carpeta.proveedorId);

  return (
    <div style={pageShell}>

      {/* Back */}
      <AppButton variant="tertiary" size="sm" onClick={onBack} icon={<ArrowLeft size={14} />} style={{ padding: '5px 0', marginBottom: 24, fontWeight: 400 }}>
        Volver al Dashboard
      </AppButton>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>{carpeta.numero}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>{prov?.nombre} · {prov?.pais}</p>
        </div>
        <NeonBadge estado={carpeta.estado} size="sm" />
      </div>

      {/* Subcarpetas */}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: '0 0 14px', letterSpacing: '-0.2px' }}>
        Embarques ({carpeta.subcarpetas.length})
      </h2>

      <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, overflow: 'hidden', background: CANVAS }}>
        {isMobile ? (
          <div>
            {carpeta.subcarpetas.map((sub, i) => {
              const d = dispatcherMap[sub.id] ?? emptyData(sub);
              const filled = hasData(d);

              return (
                <div key={sub.id} style={{ padding: '16px', borderBottom: i < carpeta.subcarpetas.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <TransportModeIcon transporte={sub.transporte} size={15} />
                      <div><div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{sub.numero}</div><div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub.transporte} · ETA {sub.eta}</div></div>
                    </div>
                    <CanalBadge canal={d.canalAduana} />
                  </div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DESPACHO</div>
                        <div style={{ fontSize: 13, color: d.despachoTipo ? INK : HAIRLINE, marginTop: 2 }}>{d.despachoTipo || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>OFICIALIZACIÓN</div>
                        <div style={{ fontSize: 13, color: d.fechaOficializacion ? INK : HAIRLINE, marginTop: 2 }}>{d.fechaOficializacion || '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>GASTOS AR$</div>
                        <div style={{ fontSize: 13, color: d.gastosARS ? INK : HAIRLINE, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{d.gastosARS ? `$ ${Number(d.gastosARS).toLocaleString()}` : '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>VEP USD</div>
                        <div style={{ fontSize: 13, color: d.vepUSD ? INK : HAIRLINE, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{d.vepUSD ? `USD ${Number(d.vepUSD).toLocaleString()}` : '—'}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>SALIDA PUERTO</div>
                      <div style={{ fontSize: 13, color: d.fechaSalidaPuerto ? INK : HAIRLINE, marginTop: 2 }}>{d.fechaSalidaPuerto || '—'}</div>
                    </div>
                  </div>
                  <AppButton onClick={() => setEditingSub(sub)} size="xs" variant={filled ? 'secondary' : 'primary'} icon={<Edit2 size={11} />} style={{ marginTop: 14 }}>
                    {filled ? 'Editar embarque' : 'Cargar embarque'}
                  </AppButton>
                </div>
              );
            })}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                {['EMBARQUE', 'CANAL', 'DESPACHO / ZFI ZFE', 'GASTOS AR$', 'VEP USD', 'F. OFICIALIZACIÓN', 'F. SALIDA PUERTO', ''].map(col => (
                  <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carpeta.subcarpetas.map((sub, i) => {
                const d = dispatcherMap[sub.id] ?? emptyData(sub);
                const filled = hasData(d);
                return (
                  <tr key={sub.id}
                    style={{ borderBottom: i < carpeta.subcarpetas.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                    onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                    onMouseLeave={e => (e.currentTarget.style.background = CANVAS)}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><TransportModeIcon transporte={sub.transporte} size={15} /><div><div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{sub.numero}</div><div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{sub.transporte} · ETA {sub.eta}</div></div></div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><CanalBadge canal={d.canalAduana} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      {d.despachoTipo
                        ? <span style={{ fontSize: 13, color: INK }}>{d.despachoTipo}</span>
                        : <span style={{ fontSize: 13, color: HAIRLINE }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {d.gastosARS
                        ? <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>$ {Number(d.gastosARS).toLocaleString()}</span>
                        : <span style={{ fontSize: 13, color: HAIRLINE }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {d.vepUSD
                        ? <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>USD {Number(d.vepUSD).toLocaleString()}</span>
                        : <span style={{ fontSize: 13, color: HAIRLINE }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: d.fechaOficializacion ? INK : HAIRLINE, fontVariantNumeric: 'tabular-nums' }}>
                      {d.fechaOficializacion || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: d.fechaSalidaPuerto ? INK : HAIRLINE, fontVariantNumeric: 'tabular-nums' }}>
                      {d.fechaSalidaPuerto || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <AppButton onClick={() => setEditingSub(sub)} size="xs" variant={filled ? 'secondary' : 'primary'} icon={<Edit2 size={11} />}>
                        {filled ? 'Editar' : 'Ingresar'}
                      </AppButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {carpeta.subcarpetas.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: MUTED }}>Esta carpeta no tiene embarques.</div>
        )}
      </div>

      {editingSub && (
        <EditModal
          carpetaNumero={carpeta.numero}
          sub={editingSub}
          data={dispatcherMap[editingSub.id] ?? emptyData(editingSub)}
          onSave={data => { onSave(editingSub.id, data); setEditingSub(null); }}
          onClose={() => setEditingSub(null)}
        />
      )}
    </div>
  );
}

// ── Main list view ────────────────────────────────────────────────────────────

interface Props {
  carpetasList: Carpeta[];
}

export function DispatcherDashboard({ carpetasList }: Props) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dispatcherMap, setDispatcherMap] = useState<Record<string, DispatcherData>>({});
  const isMobile = useIsMobile();

  const activeCarpetas = carpetasList.filter(c =>
    c.estado === 'En Aduana' || c.estado === 'En Tránsito' || c.estado === 'Oficializado' || c.estado === 'Con Incidencia'
  );

  const filtered = activeCarpetas.filter(c => {
    const q = normalizeSearchTerm(search);
    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
    return !q || [c.numero, prov?.nombre].some(value => normalizeSearchTerm(value).includes(q));
  });

  const handleSave = (subId: string, data: DispatcherData) => {
    setDispatcherMap(prev => ({ ...prev, [subId]: data }));
  };

  const selectedCarpeta = selectedId ? carpetasList.find(c => c.id === selectedId) : null;

  if (selectedCarpeta) {
    return (
      <DetailView
        carpeta={selectedCarpeta}
        dispatcherMap={dispatcherMap}
        onSave={handleSave}
        onBack={() => setSelectedId(null)}
        isMobile={isMobile}
      />
    );
  }

  // ── KPIs ──
  const totalSubs = activeCarpetas.flatMap(c => c.subcarpetas);
  const subsCanalVerde = totalSubs.filter(s => (dispatcherMap[s.id]?.canalAduana ?? s.canalAduana) === 'Verde').length;
  const subsCanalRojo  = totalSubs.filter(s => (dispatcherMap[s.id]?.canalAduana ?? s.canalAduana) === 'Rojo').length;
  const subsCargados   = totalSubs.filter(s => dispatcherMap[s.id] && hasData(dispatcherMap[s.id])).length;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, color: INK }}>Carpetas</h1>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>Gestión de despacho aduanero</p>
      </div>

      {/* KPIs */}
      <MetricCardGrid
        items={[
          { label: 'Carpetas Activas', value: activeCarpetas.length, color: INK, icon: <FolderOpen size={16} /> },
          { label: 'Canal Verde', value: subsCanalVerde, color: '#1a7a4a', icon: <ShieldCheck size={16} /> },
          { label: 'Canal Rojo', value: subsCanalRojo, color: '#c4001a', icon: <ShieldAlert size={16} /> },
          { label: 'Embarques con datos', value: subsCargados, color: '#5b21b6', icon: <DatabaseZap size={16} /> },
        ]}
      />

      {/* Table */}
      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <div style={getSearchWrapStyle(420)}>
            <SearchField value={search} onChange={setSearch} placeholder="Buscar por N° carpeta o proveedor..." />
          </div>
        </div>
        {isMobile ? (
          <div>
            {filtered.map((c, i) => {
              const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
              const subs = c.subcarpetas;
              const canales = subs.map(s => dispatcherMap[s.id]?.canalAduana ?? s.canalAduana);
              const rojos = canales.filter(ch => ch === 'Rojo').length;
              const verdes = canales.filter(ch => ch === 'Verde').length;
              const cargados = subs.filter(s => dispatcherMap[s.id] && hasData(dispatcherMap[s.id])).length;
              const hasRojo = rojos > 0;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{ width: '100%', padding: '16px', border: 'none', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', cursor: 'pointer', background: hasRojo ? 'rgba(196,0,26,0.02)' : CANVAS, borderLeft: hasRojo ? '3px solid #c4001a' : '3px solid transparent', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{c.numero}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{prov?.nombre || '—'} · {prov?.pais || '—'}</div>
                    </div>
                    <ChevronRight size={16} color={HAIRLINE} />
                  </div>
                  <div style={{ marginTop: 10 }}><NeonBadge estado={c.estado} size="sm" /></div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>EMBARQUES</div>
                      <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{subs.length} total · {cargados}/{subs.length} con datos</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>CANALES</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {verdes > 0 && <CanalBadge canal="Verde" />}
                        {rojos > 0 && <CanalBadge canal="Rojo" />}
                        {verdes === 0 && rojos === 0 && <CanalBadge canal="Pendiente" />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>SUBCARPETAS</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{subs.map(s => s.numero).join(' · ')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ÚLTIMO HITO</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{c.ultimoHito}</div>
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
                {['CARPETA', 'PROVEEDOR', 'ESTADO', 'EMBARQUES', 'CANAL RESUMEN', 'ÚLTIMO HITO', ''].map(col => (
                  <th key={col} style={tableHeadCell}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                const subs = c.subcarpetas;
                const canales = subs.map(s => dispatcherMap[s.id]?.canalAduana ?? s.canalAduana);
                const rojos  = canales.filter(ch => ch === 'Rojo').length;
                const verdes = canales.filter(ch => ch === 'Verde').length;
                const cargados = subs.filter(s => dispatcherMap[s.id] && hasData(dispatcherMap[s.id])).length;
                const hasRojo = rojos > 0;

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', cursor: 'pointer', background: hasRojo ? 'rgba(196,0,26,0.02)' : CANVAS, borderLeft: hasRojo ? '3px solid #c4001a' : '3px solid transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                    onMouseLeave={e => (e.currentTarget.style.background = hasRojo ? 'rgba(196,0,26,0.02)' : CANVAS)}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: INK, letterSpacing: '-0.2px' }}>
                      {c.numero}
                      {subs.map(s => (
                        <div key={s.id} style={{ fontSize: 12, color: MUTED, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{s.numero}</div>
                      ))}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, color: INK }}>{prov?.nombre || '—'}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{prov?.pais}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><NeonBadge estado={c.estado} size="sm" /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{subs.length}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{cargados}/{subs.length} con datos</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {verdes > 0 && <CanalBadge canal="Verde" />}
                        {rojos  > 0 && <CanalBadge canal="Rojo"  />}
                        {verdes === 0 && rojos === 0 && <CanalBadge canal="Pendiente" />}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                      <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ultimoHito}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ChevronRight size={15} color={HAIRLINE} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: MUTED, fontSize: 15 }}>Sin carpetas activas.</div>
        )}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>{filtered.length} carpeta(s) activa(s)</div>
    </div>
  );
}
