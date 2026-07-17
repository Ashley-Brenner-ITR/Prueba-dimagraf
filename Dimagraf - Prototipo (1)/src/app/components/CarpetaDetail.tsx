import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, FileText, DollarSign, Upload, Eye, Download, ChevronRight, ChevronDown, Plus, CheckCircle, Landmark, AlertTriangle, X, Pencil, Trash2, Info, Ship, CreditCard } from 'lucide-react';
import { getAutoFitGridStyle, getResponsiveTableStyle, pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableScrollArea } from './chromeStyles';
import { CARPETAS, DESPACHANTES, getProveedor, getDespachante, type Documento, type Subcarpeta, type Carpeta } from './mockData';
import { NeonBadge, CanalBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AppButton } from './AppButton';
import { AppInput, FormField } from './FormField';
import { normalizeSearchTerm } from './SearchField';
import { InfoField as Field } from './InfoField';
import { SectionCard as Card } from './SectionCard';
import { FilterToolbar } from './FilterToolbar';
import { WelcomeBanner } from './WelcomeBanner';
import { radius } from './theme';

const INK      = '#1d1d1f';
const MUTED    = '#6e6e73';
const PARCHMENT= '#f8fafc';
const HAIRLINE = '#d2d2d7';
const GREEN    = '#1a5c38';
const GREEN_HAIRLINE = 'rgba(26,92,56,0.26)';
const GREEN_HAIRLINE_SOFT = 'rgba(26,92,56,0.16)';
const VIOLET   = '#5b21b6';
const CANVAS   = '#ffffff';
const DESPACHO_TIPO_OPTIONS = ['Despacho Directo', 'ZFI', 'ZFE'] as const;

const CURRENCY_SYMBOLS: Record<string, string> = { USD: 'US$', EUR: '€', ARS: '$' };
function formatMoney(value: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol} ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

type Tab = 'general' | 'articulos' | 'produccion' | 'subcarpetas' | 'documentos' | 'aduana' | 'costeo' | 'pagos';
type CarpetaDetailRole = 'operator' | 'director' | 'commercial' | 'treasury' | 'warehouse' | 'dispatcher' | 'admin';
type RolePermissions = {
  canEditOriginalOc: boolean;
  canEditProduccion: boolean;
  canEditAduana: boolean;
  canEditCosteo: boolean;
  canEditPagos: boolean;
  canViewProduccion: boolean;
  canViewCosteo: boolean;
  canViewPagos: boolean;
  canViewImportes: boolean;
};

const SUB_LETTERS = ['A', 'B', 'C'] as const;
type SubLetter = typeof SUB_LETTERS[number];

const ROLE_PERMISSIONS: Record<CarpetaDetailRole, RolePermissions> = {
  operator:   { canEditOriginalOc: true,  canEditProduccion: true,  canEditAduana: true,  canEditCosteo: true,  canEditPagos: false, canViewProduccion: true,  canViewCosteo: true,  canViewPagos: true,  canViewImportes: true },
  director:   { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: false, canEditCosteo: false, canEditPagos: false, canViewProduccion: true,  canViewCosteo: true,  canViewPagos: true,  canViewImportes: true },
  commercial: { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: false, canEditCosteo: false, canEditPagos: false, canViewProduccion: true,  canViewCosteo: false, canViewPagos: false, canViewImportes: false },
  treasury:   { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: false, canEditCosteo: false, canEditPagos: true,  canViewProduccion: true,  canViewCosteo: true,  canViewPagos: true,  canViewImportes: true },
  warehouse:  { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: false, canEditCosteo: false, canEditPagos: false, canViewProduccion: true,  canViewCosteo: false, canViewPagos: false, canViewImportes: false },
  dispatcher: { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: true,  canEditCosteo: false, canEditPagos: false, canViewProduccion: false, canViewCosteo: false, canViewPagos: false, canViewImportes: false },
  admin:      { canEditOriginalOc: false, canEditProduccion: false, canEditAduana: false, canEditCosteo: false, canEditPagos: false, canViewProduccion: true,  canViewCosteo: true,  canViewPagos: true,  canViewImportes: true },
};

function assignedFromSubcarpetas(articuloId: string, subcarpetas: Subcarpeta[]) {
  return subcarpetas.reduce((total, subcarpeta) => total + subcarpeta.articulosEmbarque.reduce((subTotal, articulo) => articulo.articuloId === articuloId ? subTotal + articulo.cantidad : subTotal, 0), 0);
}

function normalizeCarpetaState(carpeta: Carpeta): Carpeta {
  const articulos = carpeta.articulos.map(articulo => ({
    ...articulo,
    cantidadAsignada: assignedFromSubcarpetas(articulo.id, carpeta.subcarpetas),
  }));

  return {
    ...carpeta,
    articulos,
  };
}

interface Props { carpetaId: string; onBack: () => void; readonly?: boolean; carpetasList?: Carpeta[]; hideImportes?: boolean; initialTab?: Tab; onUpdateCarpeta?: (carpeta: Carpeta) => void; role?: CarpetaDetailRole; onSelectSubcarpeta?: (subId: string) => void; }
export function CarpetaDetail({ carpetaId, onBack, readonly = false, carpetasList, hideImportes = false, initialTab = 'general', onUpdateCarpeta, role = 'operator', onSelectSubcarpeta }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [draftCarpeta, setDraftCarpeta] = useState<Carpeta | null>(null);
  const isMobile = useIsMobile();

  const sourceCarpeta = (carpetasList ?? CARPETAS).find(c => c.id === carpetaId);
  if (!sourceCarpeta) return <div style={{ padding: 64, textAlign: 'center', color: MUTED }}>Carpeta no encontrada.</div>;

  const carpeta = normalizeCarpetaState(draftCarpeta ?? sourceCarpeta);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, carpetaId]);

  useEffect(() => {
    setDraftCarpeta(normalizeCarpetaState(sourceCarpeta));
  }, [sourceCarpeta, carpetaId]);

  const commitCarpeta = (updater: (current: Carpeta) => Carpeta) => {
    setDraftCarpeta(previous => {
      const base = normalizeCarpetaState(previous ?? sourceCarpeta);
      const next = normalizeCarpetaState(updater(base));
      onUpdateCarpeta?.(next);
      return next;
    });
  };

  const subs = carpeta.subcarpetas;
  const proveedor = getProveedor(carpeta.proveedorId);
  const hasShipments = subs.length > 0;
  const isClosed = hasShipments && subs.every(sub => sub.estado === 'En Stock');
  const permissions = ROLE_PERMISSIONS[role];
  const canEditOriginalOc = !readonly && permissions.canEditOriginalOc && !hasShipments && !isClosed;
  const canEditProduccion = !readonly && permissions.canEditProduccion;
  const canEditAduana = !readonly && permissions.canEditAduana;
  const canEditCosteo = !readonly && permissions.canEditCosteo;
  const canEditPagos = !readonly && permissions.canEditPagos;
  const effectiveHideImportes = hideImportes || !permissions.canViewImportes;
  const ocLockReason = readonly
    ? 'Perfil en solo lectura.'
    : !permissions.canEditOriginalOc
      ? 'Solo Importaciones puede editar la OC original.'
      : isClosed
        ? 'La carpeta ya fue recibida en depósito.'
        : hasShipments
          ? 'La OC original se bloquea al crear el primer embarque.'
          : null;

  const usedLetters = subs.map(s => s.numero.split('-').pop() as SubLetter);
  const nextLetter = SUB_LETTERS.find(l => !usedLetters.includes(l)) ?? null;
  const allTabs: { id: Tab; label: string }[] = [
    { id: 'general',     label: 'General'                    },
    { id: 'articulos',   label: `Artículos (${carpeta.articulos.length})` },
    { id: 'produccion',  label: 'Proveedor'                  },
    { id: 'subcarpetas', label: `Embarques (${subs.length})` },
    { id: 'aduana',      label: 'Aduana'                     },
    { id: 'costeo',      label: 'Costeo'                     },
    { id: 'documentos',  label: 'Anexos'                     },
    { id: 'pagos',       label: 'Pagos'                      },
  ];
  const tabs = allTabs.filter(t => {
    if (t.id === 'produccion' && !permissions.canViewProduccion) return false;
    if (t.id === 'costeo' && !permissions.canViewCosteo) return false;
    if (t.id === 'pagos' && !permissions.canViewPagos) return false;
    return true;
  });
  const activeTab = tabs.some(item => item.id === tab) ? tab : tabs[0]?.id ?? 'general';

  return (
    <div style={pageShell}>

      {/* ── Back button ──────────────────────────────────────── */}
      <AppButton variant="tertiary" size="sm" onClick={onBack} icon={<ArrowLeft size={14} />} style={{ padding: '5px 0', marginBottom: 16, fontWeight: 400 }}>
        Volver al Dashboard
      </AppButton>

      {/* ── Welcome Banner header ─────────────────────────── */}
      <WelcomeBanner
        title={carpeta.numero}
        subtitle={`${proveedor?.nombre || '—'}${!effectiveHideImportes ? ` · ${formatMoney(carpeta.montoTotal, carpeta.moneda)}` : ''} · ${carpeta.incoterm} · OC ${carpeta.fechaOC}`}
        actions={
          <>
            {!readonly && <AppButton variant="secondary" icon={<Download size={13} />}>Exportar SAP</AppButton>}
          </>
        }
      />

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden', background: CANVAS }}>
      {isMobile ? (
        <div style={{ padding: 12, borderBottom: `1px solid ${HAIRLINE}`, background: '#f4f8f5' }}>
          <Select value={activeTab} onValueChange={value => setTab(value as Tab)}>
            <SelectTrigger aria-label="Sección de la carpeta" style={{ width: '100%', height: 40, borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: CANVAS, color: INK, boxShadow: 'none' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={value => setTab(value as Tab)}>
          <TabsList aria-label="Secciones de la carpeta" style={{ display: 'flex', gap: 0, width: '100%', minHeight: 48, height: 48, justifyContent: 'flex-start', padding: '0 10px', borderBottom: `1px solid ${HAIRLINE}`, borderRadius: 0, background: '#fafbfd', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden' }}>
            {tabs.map(t => {
              const active = activeTab === t.id;
              return (
                <TabsTrigger key={t.id} value={t.id} style={{
                  flex: 'none', padding: '0 14px', fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? GREEN : MUTED,
                  background: 'transparent', border: 'none', borderRadius: 0,
                  borderBottom: active ? `2px solid ${GREEN}` : '2px solid transparent',
                  boxShadow: 'none', height: 48, cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: active ? 1 : 0.92,
                  transition: 'color 0.15s ease, opacity 0.15s ease',
                  outline: 'none',
                }}>{t.label}</TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {(() => {
        return (
          <div style={{ background: CANVAS }}>
            {activeTab === 'general'     && <GeneralTab     carpeta={carpeta} subs={subs} proveedor={proveedor} hideImportes={effectiveHideImportes} canEditGeneral={canEditOriginalOc} ocLockReason={ocLockReason} onUpdateGeneral={(patch: Partial<Carpeta>) => commitCarpeta(current => ({ ...current, ...patch }))} />}
            {activeTab === 'articulos'   && <ArticulosTab   carpeta={carpeta} hideImportes={effectiveHideImportes} readonly={readonly} canEditOriginalOc={canEditOriginalOc} onUpdateArticulos={(articulos: Carpeta['articulos']) => commitCarpeta(current => ({ ...current, articulos }))} />}
            {activeTab === 'subcarpetas' && <SubcarpetasTab carpeta={carpeta} subs={subs} nextLetter={nextLetter} activeSub={activeSub} setActiveSub={setActiveSub} readonly={readonly} hideImportes={effectiveHideImportes} onCreateSubcarpeta={(subcarpeta: Subcarpeta) => commitCarpeta(current => ({ ...current, subcarpetas: [...current.subcarpetas, subcarpeta] }))} onSelectSubcarpeta={onSelectSubcarpeta} />}
            {activeTab === 'produccion'  && <ProduccionTab  carpeta={carpeta} proveedor={proveedor} editable={canEditProduccion} onUpdateProduccion={(patch: Partial<Carpeta>) => commitCarpeta(current => ({ ...current, ...patch }))} />}
            {activeTab === 'aduana'      && <AduanaTab      carpeta={carpeta} subs={subs} editable={canEditAduana} hideImportes={effectiveHideImportes} onUpdateSubcarpeta={(subId: string, patch: Partial<Subcarpeta>) => commitCarpeta(current => ({ ...current, subcarpetas: current.subcarpetas.map(sub => sub.id === subId ? { ...sub, ...patch } : sub) }))} />}
            {activeTab === 'costeo'      && <CosteoTab      carpeta={carpeta} editable={canEditCosteo} onUpdateCosteo={(patch: Partial<Carpeta>) => commitCarpeta(current => ({ ...current, ...patch }))} />}
            {activeTab === 'documentos'  && <DocumentosTabV2  carpeta={carpeta} subs={subs} readonly={readonly} onAddDocumento={(doc: Documento, subId: string | 'madre') => commitCarpeta(current => subId === 'madre' ? ({ ...current, documentos: [...(current.documentos ?? []), doc] }) : ({ ...current, subcarpetas: current.subcarpetas.map(sub => sub.id === subId ? ({ ...sub, documentos: [...sub.documentos, doc] }) : sub) }))} />}
            {activeTab === 'pagos'       && <PagosTab       carpeta={carpeta} editable={canEditPagos} />}
          </div>
        );
      })()}
      </div>
    </div>
  );
}

/* ── Shared primitives ─────────────────────────────────────────────── */

function Input({ label, defaultValue, type = 'text', placeholder, color }: { label: string; defaultValue?: string | number; type?: string; placeholder?: string; color?: string }) {
  return (
    <FormField label={label}>
      <AppInput
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', fontSize: 17, fontWeight: 400, color: color || INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, outline: 'none' }}
      />
    </FormField>
  );
}

function TabEditModal({ title, children, onClose, onSave, saveLabel = 'Guardar cambios' }: { title: string; children: ReactNode; onClose: () => void; onSave: () => void; saveLabel?: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(15, 23, 42, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 'min(640px, 100%)', maxHeight: '90vh', background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 16, boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>{title}</h2>
          <AppButton type="button" aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={onClose} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 14, overflowY: 'auto' }}>
          {children}
        </div>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#fff' }}>
          <AppButton type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </AppButton>
          <AppButton type="button" size="sm" onClick={onSave}>
            {saveLabel}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

/* ── Tab components ───────────────────────────────────────────────── */

function GeneralTab({ carpeta, subs, proveedor, hideImportes, canEditGeneral, ocLockReason, onUpdateGeneral }: any) {
  const isMobile = useIsMobile();
  const [showGeneralEditModal, setShowGeneralEditModal] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    pedidoSAP45: carpeta.pedidoSAP45 || '',
    referenciaProveedor: carpeta.referenciaProveedor || '',
    fechaEmbarqueEst: carpeta.fechaEmbarqueEst || '',
    observaciones: carpeta.observaciones || '',
  });

  useEffect(() => {
    setGeneralForm({
      pedidoSAP45: carpeta.pedidoSAP45 || '',
      referenciaProveedor: carpeta.referenciaProveedor || '',
      fechaEmbarqueEst: carpeta.fechaEmbarqueEst || '',
      observaciones: carpeta.observaciones || '',
    });
  }, [carpeta.id, carpeta.pedidoSAP45, carpeta.referenciaProveedor, carpeta.fechaEmbarqueEst, carpeta.observaciones]);

  const setGeneralField = (field: 'pedidoSAP45' | 'referenciaProveedor' | 'fechaEmbarqueEst' | 'observaciones') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setGeneralForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSaveGeneral = () => {
    if (!canEditGeneral) return;
    onUpdateGeneral({
      pedidoSAP45: generalForm.pedidoSAP45.trim(),
      referenciaProveedor: generalForm.referenciaProveedor.trim(),
      fechaEmbarqueEst: generalForm.fechaEmbarqueEst,
      observaciones: generalForm.observaciones.trim(),
    });
    setShowGeneralEditModal(false);
  };

  return (
    <div style={{ display: 'grid', gap: 16, padding: 16 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Datos de cabecera</span>
          {canEditGeneral && (
            <AppButton
              type="button"
              size="sm"
              icon={<Pencil size={13} />}
              onClick={() => setShowGeneralEditModal(true)}
            >
              Editar sección
            </AppButton>
          )}
        </div>
        {!canEditGeneral && ocLockReason && (
          <div style={{ marginBottom: 12, fontSize: 12, color: MUTED }}>
            {ocLockReason}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', columnGap: 24, rowGap: 18, alignItems: 'start' }}>
          <Field label="N° Carpeta" value={carpeta.numero} />
          <Field label="Fecha O/C" value={carpeta.fechaOC} />
          <Field label="Proveedor" value={proveedor?.nombre || '—'} />
          <Field label="País Origen" value={proveedor?.pais || '—'} />
          <Field label="Pedido SAP Tx.45" value={carpeta.pedidoSAP45 || '—'} />
          <Field label="Incoterm" value={carpeta.incoterm} />
          <Field label="Condición de Pago" value={carpeta.condPago} />
          <Field label="Moneda" value={carpeta.moneda} />
        </div>
          {carpeta.observaciones && (
            <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(180,83,9,0.05)', borderLeft: '3px solid #b45309' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 7, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Observaciones / reclamos</div>
              <div style={{ fontSize: 14, color: '#b45309', lineHeight: 1.47, display: 'flex', gap: 8 }}><AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />{carpeta.observaciones}</div>
            </div>
          )}
      </div>

      <div style={{ display: 'grid', gap: 14, paddingTop: 14, borderTop: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{hideImportes ? 'Referencia' : 'Montos y referencia'}</span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', columnGap: 24, rowGap: 18, alignItems: 'start' }}>
          <Field label="Fecha Embarque Est." value={carpeta.fechaEmbarqueEst || '—'} />
          <Field label="Ref. Proveedor" value={carpeta.referenciaProveedor || '—'} />
          <Field label="Despachante Habitual" value={getDespachante(proveedor?.despachante || '')?.nombre || '—'} />
          {!hideImportes && (
            <div style={{ justifySelf: 'stretch' }}>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Monto Total OC</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{carpeta.moneda} {carpeta.montoTotal.toLocaleString('en-US')}</div>
            </div>
          )}
        </div>
        {!hideImportes && subs.length > 0 && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${HAIRLINE}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Coeficiente de costo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: 16, maxWidth: 360 }}>
              <Field label="Estimado" value={carpeta.coeficienteEst.toFixed(2)} />
              <Field label="Real" value={carpeta.coeficienteReal?.toFixed(2) || '—'} />
            </div>
          </div>
        )}
      </div>

      {subs.length > 0 && (
        <section style={{ gridColumn: '1 / -1', border: `1px solid ${GREEN_HAIRLINE}`, borderRadius: radius.lg, background: CANVAS, overflow: 'hidden' }} aria-labelledby="general-header-shipments">
          <div id="general-header-shipments" style={{ padding: '14px 16px 12px', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>Embarques</div>
          <div style={{ display: 'grid', gridTemplateColumns: subs.length === 1 ? '1fr' : isMobile ? '1fr' : `repeat(${Math.min(subs.length, 3)}, minmax(0, 1fr))`, gap: 0, padding: '4px 0', background: '#fafefd' }}>
            {subs.map((s: Subcarpeta, index: number) => (
              <SubcarpetaTableLine
                key={s.id}
                sub={s}
                mobileStacked={isMobile}
                fullWidth={subs.length === 1}
                showDivider={!isMobile && index > 0}
                showMobileDivider={isMobile && index > 0}
                onClick={() => undefined}
              />
            ))}
          </div>
        </section>
      )}

      {showGeneralEditModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(15, 23, 42, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 'min(560px, 100%)', maxHeight: '90vh', background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 16, boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>Editar sección General</h2>
              <AppButton type="button" aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={() => setShowGeneralEditModal(false)} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
            </div>

            <div style={{ padding: 16, display: 'grid', gap: 12, overflowY: 'auto' }}>
              <FormField label="Pedido SAP Tx.45">
                <input value={generalForm.pedidoSAP45} onChange={setGeneralField('pedidoSAP45')} placeholder="Ej. 4500012345" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
              </FormField>
              <FormField label="Referencia proveedor">
                <input value={generalForm.referenciaProveedor} onChange={setGeneralField('referenciaProveedor')} placeholder="Referencia interna" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
              </FormField>
              <FormField label="Fecha embarque estimada">
                <input type="date" value={generalForm.fechaEmbarqueEst} onChange={setGeneralField('fechaEmbarqueEst')} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
              </FormField>
              <FormField label="Observaciones">
                <textarea value={generalForm.observaciones} onChange={setGeneralField('observaciones')} rows={4} style={{ width: '100%', padding: '10px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
              </FormField>
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#fff' }}>
              <AppButton type="button" variant="secondary" size="sm" onClick={() => setShowGeneralEditModal(false)}>
                Cancelar
              </AppButton>
              <AppButton type="button" size="sm" onClick={handleSaveGeneral}>
                Guardar cambios
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_ART_FORM = { codigoSAP: '', descripcion: '', linea: 'LCA', cantidadSolicitada: '', um: 'Kg', precioUnitario: '' };

function ArticulosTab({ carpeta, readonly, hideImportes, canEditOriginalOc, onUpdateArticulos }: any) {
  const isMobile = useIsMobile();
  const [articulos, setArticulos] = useState<any[]>(carpeta.articulos);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_ART_FORM);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todos' | 'saldo' | 'error'>('todos');
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const hasExtendedFields = articulos.some((art: any) => art.ume || art.equivalencia || art.origenCarga || art.estadoValidacion);

  useEffect(() => {
    setArticulos(carpeta.articulos);
  }, [carpeta.articulos]);

  useEffect(() => {
    setVisibleCount(12);
  }, [query, filter]);

  const filteredArticulos = articulos.filter((articulo: any) => {
    const searchText = normalizeSearchTerm(`${articulo.codigoSAP} ${articulo.descripcion}`);
    const matchesQuery = searchText.includes(normalizeSearchTerm(query));
    const saldo = articulo.cantidadSolicitada - articulo.cantidadAsignada;
    const hasError = articulo.estadoValidacion === 'Con error' || articulo.estadoValidacion === 'Duplicado';
    return matchesQuery && (filter === 'todos' || (filter === 'saldo' && saldo !== 0) || (filter === 'error' && hasError));
  });
  const displayedArticulos = filteredArticulos.slice(0, visibleCount);

  const cols = [
    'Cód. SAP',
    'Descripción',
    'Línea',
    'Cant. Solicitada',
    'U.M.',
    ...(hasExtendedFields ? ['UME', 'Equiv.'] : []),
    ...(hideImportes ? [] : ['Precio Unit.', 'Importe']),
    'Asignado',
    'Saldo Pendiente',
    ...(hasExtendedFields ? ['Origen', 'Validación'] : []),
    ...(canEditOriginalOc ? [''] : []),
  ];

  const canSave = form.codigoSAP.trim() && form.descripcion.trim() && Number(form.cantidadSolicitada) > 0;

  const resetForm = () => {
    setForm(EMPTY_ART_FORM);
    setEditingArticleId(null);
    setShowModal(false);
  };

  const handleSaveArticle = () => {
    const articlePayload = {
      id: editingArticleId ?? `art_${Date.now()}`,
      codigoSAP: form.codigoSAP.trim(),
      descripcion: form.descripcion.trim(),
      linea: form.linea,
      cantidadSolicitada: Number(form.cantidadSolicitada),
      um: form.um,
      precioUnitario: Number(form.precioUnitario) || 0,
      cantidadAsignada: 0,
    };

    const nextArticulos = editingArticleId
      ? articulos.map((articulo: any) => articulo.id === editingArticleId ? { ...articulo, ...articlePayload } : articulo)
      : [...articulos, articlePayload];

    setArticulos(nextArticulos);
    onUpdateArticulos(nextArticulos);
    resetForm();
  };

  const handleEditArticle = (articulo: any) => {
    setEditingArticleId(articulo.id);
    setForm({
      codigoSAP: articulo.codigoSAP,
      descripcion: articulo.descripcion,
      linea: articulo.linea,
      cantidadSolicitada: String(articulo.cantidadSolicitada),
      um: articulo.um,
      precioUnitario: String(articulo.precioUnitario ?? ''),
    });
    setShowModal(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    const nextArticulos = articulos.filter((articulo: any) => articulo.id !== articleId);
    setArticulos(nextArticulos);
    onUpdateArticulos(nextArticulos);
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ background: CANVAS }}>
      {/* Empty state */}
      {articulos.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: CANVAS }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 6 }}>Sin artículos cargados</div>
          <div style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>Esta carpeta aún no tiene artículos asociados.</div>
          {canEditOriginalOc && (
            <AppButton onClick={() => { setForm(EMPTY_ART_FORM); setEditingArticleId(null); setShowModal(true); }} icon={<Plus aria-hidden="true" />}>
              Agregar primer ítem
            </AppButton>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflow: 'hidden', background: CANVAS }}>
            {canEditOriginalOc && (
              <div style={{ minHeight: 52, padding: '8px 12px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: CANVAS, borderBottom: `1px solid ${HAIRLINE}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Artículos de la orden</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{articulos.length} {articulos.length === 1 ? 'ítem' : 'ítems'}</div>
                </div>
                <AppButton size="sm" onClick={() => { setForm(EMPTY_ART_FORM); setEditingArticleId(null); setShowModal(true); }} icon={<Plus aria-hidden="true" />}>
                  Agregar ítem
                </AppButton>
              </div>
            )}
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
              <FilterToolbar search={query} onSearchChange={setQuery} searchPlaceholder="Buscar por código o descripción" searchAriaLabel="Buscar artículos" options={[{ value: 'todos', label: 'Todos' }, { value: 'saldo', label: 'Con saldo' }, { value: 'error', label: 'Con error' }]} value={filter} onValueChange={setFilter} />
            </div>

            {filteredArticulos.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: MUTED, fontSize: 14 }}>No hay artículos que coincidan con la búsqueda.</div>
            ) : isMobile ? (
              <div>
                {displayedArticulos.map((a: any, i: number) => {
                  const saldo = a.cantidadSolicitada - a.cantidadAsignada;
                  const pct = a.cantidadSolicitada > 0 ? Math.min(100, (a.cantidadAsignada / a.cantidadSolicitada) * 100) : 0;
                  const expanded = expandedArticleId === a.id;
                  return (
                    <article key={a.id} style={{ borderBottom: i < displayedArticulos.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                      <button onClick={() => setExpandedArticleId(expanded ? null : a.id)} aria-expanded={expanded} style={{ width: '100%', minHeight: 48, padding: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, textAlign: 'left', background: CANVAS, border: 'none', cursor: 'pointer' }}>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: INK }}>{a.codigoSAP}</span>
                          <span style={{ display: 'block', marginTop: 2, fontSize: 14, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descripcion}</span>
                          <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                            <span><span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: MUTED }}>SOLICITADO</span><span style={{ display: 'block', marginTop: 2, fontSize: 13, color: INK }}>{a.cantidadSolicitada.toLocaleString()} {a.um}</span></span>
                            <span><span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: MUTED }}>PENDIENTE</span><span style={{ display: 'block', marginTop: 2, fontSize: 13, fontWeight: 700, color: saldo === 0 ? '#1a7a4a' : '#b45309' }}>{saldo.toLocaleString()} {a.um}</span></span>
                          </span>
                          <span style={{ display: 'block', height: 4, marginTop: 12, borderRadius: 9999, background: HAIRLINE, overflow: 'hidden' }}><span style={{ display: 'block', width: `${pct}%`, height: '100%', background: pct === 100 ? '#1a7a4a' : '#b45309' }} /></span>
                        </span>
                        <ChevronDown aria-hidden="true" size={18} style={{ color: MUTED, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                      </button>
                      {expanded && (
                        <div style={{ padding: '0 16px 16px', background: '#fafbfd' }}>
                          <div style={{ paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, borderTop: `1px solid ${HAIRLINE}` }}>
                            <Field label="Línea" value={a.linea || '—'} /><Field label="Asignado" value={`${a.cantidadAsignada.toLocaleString()} ${a.um}`} />
                            {a.ume && <Field label="UME" value={a.ume} />}{a.equivalencia && <Field label="Equivalencia" value={a.equivalencia} />}
                            {!hideImportes && <><Field label="Precio unitario" value={a.precioUnitario.toFixed(2)} /><Field label="Importe" value={(a.cantidadSolicitada * a.precioUnitario).toLocaleString()} /></>}
                            {a.origenCarga && <Field label="Origen" value={a.origenCarga} />}{a.estadoValidacion && <Field label="Validación" value={a.estadoValidacion} />}
                          </div>
                          {a.observacionesImportacion && <div style={{ marginTop: 12, fontSize: 13, color: '#b45309' }}>{a.observacionesImportacion}</div>}
                          {canEditOriginalOc && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                              <AppButton variant="secondary" size="xs" onClick={() => handleEditArticle(a)} icon={<Pencil aria-hidden="true" size={12} />}>
                                Editar
                              </AppButton>
                              <AppButton variant="danger-soft" size="xs" onClick={() => handleDeleteArticle(a.id)} icon={<Trash2 aria-hidden="true" size={12} />}>
                                Eliminar
                              </AppButton>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div style={tableScrollArea}>
                <table style={getResponsiveTableStyle(760)}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr style={tableHeadRow}>{['Artículo', 'Solicitado', 'Asignado', 'Saldo', 'Validación', ''].map(col => <th key={col} style={{ ...tableHeadCell, textAlign: ['Solicitado', 'Asignado', 'Saldo'].includes(col) ? 'right' : 'left' }}>{col}</th>)}</tr></thead>
                  <tbody>{displayedArticulos.map((a: any, i: number) => {
                    const saldo = a.cantidadSolicitada - a.cantidadAsignada;
                    const pct = a.cantidadSolicitada > 0 ? Math.min(100, (a.cantidadAsignada / a.cantidadSolicitada) * 100) : 0;
                    return <tr key={a.id} style={{ borderBottom: i < displayedArticulos.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                      <td style={{ padding: '11px 16px' }}><div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{a.codigoSAP}</div><div style={{ marginTop: 2, maxWidth: 360, fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descripcion}</div></td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', fontSize: 13, color: INK, fontVariantNumeric: 'tabular-nums' }}>{a.cantidadSolicitada.toLocaleString()} {a.um}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', minWidth: 120 }}><div style={{ fontSize: 13, color: INK }}>{a.cantidadAsignada.toLocaleString()} {a.um}</div><div style={{ height: 3, marginTop: 5, background: HAIRLINE, borderRadius: 9999, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#1a7a4a' : '#b45309' }} /></div></td>
                      <td style={{ padding: '11px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: saldo === 0 ? '#1a7a4a' : saldo > 0 ? '#b45309' : '#c4001a' }}>{saldo.toLocaleString()} {a.um}</td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: a.estadoValidacion === 'Con error' ? '#c4001a' : MUTED }}>{a.estadoValidacion || '—'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        {canEditOriginalOc && (
                          <>
                            <AppButton type="button" size="xs" variant="secondary" icon={<Pencil aria-hidden="true" size={14} />} aria-label={`Editar ${a.codigoSAP}`} onClick={() => handleEditArticle(a)} />
                            <AppButton type="button" size="xs" variant="danger-soft" icon={<Trash2 aria-hidden="true" size={14} />} aria-label={`Eliminar ${a.codigoSAP}`} onClick={() => handleDeleteArticle(a.id)} style={{ marginLeft: 4 }} />
                          </>
                        )}
                      </td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ minHeight: 48, padding: '8px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 12, color: MUTED }}>
            <span>Mostrando {Math.min(visibleCount, filteredArticulos.length)} de {filteredArticulos.length} artículos</span>
            {visibleCount < filteredArticulos.length && <AppButton variant="secondary" size="xs" onClick={() => setVisibleCount(count => count + 12)}>Mostrar 12 más</AppButton>}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: CANVAS, borderRadius: 20, width: '100%', maxWidth: 500, margin: '0 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>{editingArticleId ? 'Editar artículo' : 'Nuevo artículo'}</h2>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={resetForm} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* SAP + Descripcion */}
              <div style={getAutoFitGridStyle(220, 14)}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>CÓD. SAP *</label>
                  <input value={form.codigoSAP} onChange={f('codigoSAP')} placeholder="1000XXX"
                    style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>DESCRIPCIÓN *</label>
                  <input value={form.descripcion} onChange={f('descripcion')} placeholder="Papel Offset 80g..."
                    style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                </div>
              </div>
              {/* Linea + UM + Cantidad + Precio */}
              <div style={getAutoFitGridStyle(hideImportes ? 130 : 120, 12)}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>LÍNEA</label>
                  <select value={form.linea} onChange={f('linea')} style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    <option>LCA</option><option>LDA</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>U.M.</label>
                  <select value={form.um} onChange={f('um')} style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    {['Kg', 'Mill.', 'Unid.', 'Resma', 'm²'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>CANTIDAD *</label>
                  <input type="number" value={form.cantidadSolicitada} onChange={f('cantidadSolicitada')} placeholder="0"
                    style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                </div>
                {!hideImportes && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>P. UNIT.</label>
                    <input type="number" value={form.precioUnitario} onChange={f('precioUnitario')} placeholder="0.00"
                      style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <AppButton onClick={resetForm} variant="secondary" size="sm" style={{ flex: 1 }}>Cancelar</AppButton>
                <AppButton onClick={handleSaveArticle} disabled={!canSave} size="sm" style={{ flex: 2 }}>
                  {editingArticleId ? 'Guardar cambios' : 'Agregar artículo'}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubcarpetasTab({ carpeta, subs, nextLetter, activeSub, setActiveSub, readonly, hideImportes, onCreateSubcarpeta, onSelectSubcarpeta }: any) {
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ facturaNum: '', fechaFactura: '', transporte: 'Marítimo', buqueForwarder: '', blCrtAwb: '', contenedores: '1', eta: '' });
  const [articleQuantities, setArticleQuantities] = useState<Record<string, string>>({});

  const usedLetters = subs.map((s: Subcarpeta) => s.numero.split('-').pop());
  const isFull = !nextLetter;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const availableArticulos = carpeta.articulos
    .map((articulo: any) => ({ ...articulo, saldoPendiente: articulo.cantidadSolicitada - articulo.cantidadAsignada }))
    .filter((articulo: any) => articulo.saldoPendiente > 0);
  const selectedTotal = availableArticulos.reduce((total: number, articulo: any) => total + (Number(articleQuantities[articulo.id] || 0) || 0), 0);
  const hasInvalidAssignment = availableArticulos.some((articulo: any) => {
    const quantity = Number(articleQuantities[articulo.id] || 0) || 0;
    return quantity < 0 || quantity > articulo.saldoPendiente;
  });
  const canCreate = form.facturaNum && form.fechaFactura && form.eta && form.buqueForwarder && form.blCrtAwb && selectedTotal > 0 && !hasInvalidAssignment;
  const activeSubcarpeta = subs.find((sub: Subcarpeta) => sub.id === activeSub) ?? null;

  const resetModal = () => {
    setShowModal(false);
    setForm({ facturaNum: '', fechaFactura: '', transporte: 'Marítimo', buqueForwarder: '', blCrtAwb: '', contenedores: '1', eta: '' });
    setArticleQuantities({});
  };

  const handleCreate = () => {
    if (!nextLetter) return;
    const articulosEmbarque = availableArticulos
      .map((articulo: any) => ({ articuloId: articulo.id, cantidad: Number(articleQuantities[articulo.id] || 0) || 0 }))
      .filter((articulo: any) => articulo.cantidad > 0);

    const newSub: Subcarpeta = {
      id: `s_${Date.now()}`,
      numero: `${carpeta.numero}-${nextLetter}`,
      facturaNum: form.facturaNum,
      fechaFactura: form.fechaFactura,
      importeTotal: 0,
      pesoNeto: 0, pesoBruto: 0, ume: 0, umeUnidad: 'Kg',
      transporte: form.transporte as any,
      buqueForwarder: form.buqueForwarder,
      blCrtAwb: form.blCrtAwb,
      contenedores: parseInt(form.contenedores) || 1,
      despachante: '',
      estado: 'En Tránsito',
      canalAduana: 'Pendiente',
      duaNum: '', eta: form.eta, fechaEmbarqueReal: '',
      pedidoSAP55: '', ingresoSAP18: '',
      documentos: [], articulosEmbarque, incidencias: [],
    };
    onCreateSubcarpeta(newSub);
    resetModal();
  };

  return (
    <>
      <div style={{ padding: isMobile ? 10 : 14, display: 'flex', flexDirection: 'column', gap: 10, background: CANVAS }}>
        {!readonly && (
          <div style={{ minHeight: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '10px 2px 10px 2px', background: CANVAS, borderBottom: `1px solid ${HAIRLINE}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Embarques parciales</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                {usedLetters.length} de 3 creados{usedLetters.length > 0 ? ` · ${usedLetters.join(', ')}` : ''}
              </div>
            </div>
            {!isFull && availableArticulos.length > 0 && (
              <AppButton onClick={() => setShowModal(true)} icon={<Plus aria-hidden="true" />}>
                Crear embarque
              </AppButton>
            )}
          </div>
        )}
        {!readonly && subs.length > 0 && (isFull || availableArticulos.length === 0) && (
          <div style={{ padding: '4px 16px' }}>
            <Alert className="border-slate-200 bg-slate-50 text-slate-700">
              <Info aria-hidden="true" />
              <AlertTitle>{isFull ? 'Límite de embarques alcanzado' : 'Sin saldo para un nuevo embarque'}</AlertTitle>
              <AlertDescription>
                {isFull ? 'Esta carpeta ya tiene los tres parciales permitidos: A, B y C.' : 'Todos los artículos de la orden ya están asignados a embarques.'}
              </AlertDescription>
            </Alert>
          </div>
        )}
        {subs.length === 0 && (
          <div style={{ padding: '4px 16px 16px' }}>
            <Alert className="border-slate-200 bg-white text-slate-700">
              <Info aria-hidden="true" />
              <AlertTitle>Sin embarques parciales</AlertTitle>
              <AlertDescription>
                {availableArticulos.length > 0 ? 'Creá el primer embarque para asignar cantidades de la orden.' : 'No hay saldo pendiente disponible para crear uno.'}
              </AlertDescription>
            </Alert>
          </div>
        )}
        {subs.length > 0 && (
          <div style={{ display: 'grid', gap: 0, padding: '0' }}>
            <div style={{ border: 'none', borderRadius: 0, overflow: 'visible', background: 'transparent' }}>
              <div style={{ display: 'grid', gridTemplateColumns: subs.length === 1 ? '1fr' : isMobile ? '1fr' : `repeat(${Math.min(subs.length, 3)}, minmax(0, 1fr))`, gap: 0, padding: '4px 0', background: '#fafefd', borderTop: `1px solid ${GREEN_HAIRLINE_SOFT}`, borderBottom: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>
                {subs.map((sub: Subcarpeta, index: number) => (
                  <SubcarpetaTableLine
                    key={sub.id}
                    sub={sub}
                    mobileStacked={isMobile}
                    fullWidth={subs.length === 1}
                    showDivider={!isMobile && index > 0}
                    showMobileDivider={isMobile && index > 0}
                    onClick={() => {
                      if (onSelectSubcarpeta) {
                        onSelectSubcarpeta(sub.id);
                        return;
                      }

                      setActiveSub(activeSub === sub.id ? null : sub.id);
                    }}
                  />
                ))}
              </div>
              {!onSelectSubcarpeta && activeSubcarpeta && (
                <SubcarpetaExpandedPanel sub={activeSubcarpeta} carpeta={carpeta} hideImportes={hideImportes} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Crear Subcarpeta ──────────────────────────── */}
      {showModal && nextLetter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: CANVAS, borderRadius: 20, width: '100%', maxWidth: 500, margin: '0 16px', boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>Nuevo Embarque Parcial</h2>
                  <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, background: 'rgba(26,92,56,0.10)', border: '1px solid rgba(26,92,56,0.25)', borderRadius: 9999, padding: '3px 12px' }}>
                    {carpeta.numero}-{nextLetter}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>Letra asignada automáticamente · Solo se permiten A, B y C</p>
              </div>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={resetModal} icon={<X size={15} style={{ color: MUTED }} />} style={{ borderRadius: 9999, flexShrink: 0 }} />
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={getAutoFitGridStyle(220, 14)}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>N° FACTURA *</label>
                  <input value={form.facturaNum} onChange={set('facturaNum')} placeholder="Ej. INV-2026-5001" style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>FECHA FACTURA *</label>
                  <input type="date" value={form.fechaFactura} onChange={set('fechaFactura')} style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
                </div>
              </div>

              <div style={getAutoFitGridStyle(220, 14)}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>TRANSPORTE</label>
                  <select value={form.transporte} onChange={set('transporte')} style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }}>
                    <option>Marítimo</option>
                    <option>Terrestre</option>
                    <option>Aéreo</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>CONTENEDORES</label>
                  <input type="number" min="1" value={form.contenedores} onChange={set('contenedores')} style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>BUQUE / FORWARDER *</label>
                <input value={form.buqueForwarder} onChange={set('buqueForwarder')} placeholder="Ej. MSC AURORA / Trans Andino Cargo" style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
              </div>

              <div style={getAutoFitGridStyle(220, 14)}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>BL / CRT / AWB *</label>
                  <input value={form.blCrtAwb} onChange={set('blCrtAwb')} placeholder="Ej. MSCUBU1234567" style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>ETA *</label>
                  <input type="date" value={form.eta} onChange={set('eta')} style={{ width: '100%', padding: '10px 14px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 11, outline: 'none' }} />
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>ARTÍCULOS DEL EMBARQUE</div>
                {availableArticulos.map((articulo: any) => {
                  const assigned = Number(articleQuantities[articulo.id] || 0) || 0;
                  const isInvalid = assigned > articulo.saldoPendiente;
                  return (
                    <div key={articulo.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12, alignItems: 'center', padding: '10px 12px', background: PARCHMENT, borderRadius: 12, border: `1px solid ${isInvalid ? 'rgba(196,0,26,0.25)' : HAIRLINE}` }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{articulo.codigoSAP} · {articulo.descripcion}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Saldo disponible: {articulo.saldoPendiente.toLocaleString()} {articulo.um}</div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={articulo.saldoPendiente}
                        value={articleQuantities[articulo.id] ?? ''}
                        onChange={event => setArticleQuantities(prev => ({ ...prev, [articulo.id]: event.target.value }))}
                        placeholder="0"
                        style={{ width: '100%', padding: '10px 12px', fontSize: 13, color: isInvalid ? '#c4001a' : INK, background: CANVAS, border: `1px solid ${isInvalid ? '#c4001a' : HAIRLINE}`, borderRadius: 10, outline: 'none' }}
                      />
                    </div>
                  );
                })}
                {hasInvalidAssignment ? (
                  <Alert variant="destructive" className="bg-red-50">
                    <AlertTriangle aria-hidden="true" />
                    <AlertTitle>Cantidades inválidas</AlertTitle>
                    <AlertDescription>Hay cantidades mayores al saldo pendiente.</AlertDescription>
                  </Alert>
                ) : (
                  <div style={{ fontSize: 12, color: MUTED }}>Total asignado a este embarque: {selectedTotal.toLocaleString()}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <AppButton onClick={resetModal} variant="secondary" size="sm" style={{ flex: 1 }}>
                  Cancelar
                </AppButton>
                <AppButton disabled={!canCreate} onClick={handleCreate} size="sm" style={{ flex: 2 }}>
                  Crear Embarque
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubcarpetaTableLine({ sub, onClick, showDivider = false, showMobileDivider = false, fullWidth = false, mobileStacked = false }: { sub: Subcarpeta; onClick: () => void; showDivider?: boolean; showMobileDivider?: boolean; fullWidth?: boolean; mobileStacked?: boolean }) {
  const desktopSingleWidth = fullWidth && !mobileStacked;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: mobileStacked ? 56 : 36,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto 20px',
        gridTemplateRows: mobileStacked ? 'auto auto' : undefined,
        alignItems: 'center',
        columnGap: mobileStacked ? 12 : 10,
        rowGap: mobileStacked ? 4 : 2,
        padding: mobileStacked ? '10px 16px 10px 12px' : (desktopSingleWidth ? '10px 16px' : '10px 16px 10px 12px'),
        position: 'relative',
        border: 'none',
        borderRadius: 0,
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        appearance: 'none',
        WebkitAppearance: 'none',
        boxShadow: 'none',
      }}
    >
      {showDivider && <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, background: HAIRLINE, borderRadius: 0 }} />}
      {showMobileDivider && <span aria-hidden="true" style={{ position: 'absolute', left: 12, right: 12, top: 0, height: 1, background: GREEN_HAIRLINE_SOFT }} />}
      <span style={{ minWidth: 0, display: 'grid', gap: mobileStacked ? 4 : 2, gridColumn: mobileStacked ? '1 / 2' : undefined, gridRow: mobileStacked ? '1 / 3' : undefined }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: INK, whiteSpace: mobileStacked ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: mobileStacked ? 'clip' : 'ellipsis', overflowWrap: 'anywhere', minWidth: 0 }}>{sub.numero}</span>
        <span style={{ fontSize: 11, color: MUTED, overflow: 'hidden', textOverflow: mobileStacked ? 'clip' : 'ellipsis', whiteSpace: mobileStacked ? 'normal' : 'nowrap', lineHeight: mobileStacked ? 1.35 : 1.2 }}>ETA {sub.eta || '-'} · {sub.contenedores || 0} cont.</span>
      </span>
      <span style={{ gridColumn: mobileStacked ? '2 / 3' : undefined, gridRow: mobileStacked ? '1 / 3' : undefined, alignSelf: 'center', justifySelf: 'end', display: 'inline-flex', alignItems: 'center' }}>
        <NeonBadge estado={sub.estado as any} size="xs" />
      </span>
      <span style={{ gridColumn: mobileStacked ? '3 / 4' : undefined, gridRow: mobileStacked ? '1 / 3' : undefined, width: 20, alignSelf: 'center', justifySelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight size={12} style={{ color: '#98a2b3', flexShrink: 0 }} />
      </span>
    </button>
  );
}

function SubcarpetaExpandedPanel({ sub, carpeta, hideImportes }: { sub: Subcarpeta; carpeta: Carpeta; hideImportes: boolean }) {
  const hasInc = sub.incidencias?.length > 0;

  return (
    <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${HAIRLINE}`, background: '#fafbfd' }}>
      <div style={{ paddingTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
        <Field label="Factura N°" value={sub.facturaNum} />
        <Field label="Fecha Factura" value={sub.fechaFactura} />
        {!hideImportes && <Field label="Importe Total" value={formatMoney(sub.importeTotal, carpeta.moneda)} />}
        <Field label="Contenedores" value={sub.contenedores} />
        <Field label="Peso Neto (Kg)" value={sub.pesoNeto.toLocaleString()} />
        <Field label="Peso Bruto (Kg)" value={sub.pesoBruto.toLocaleString()} />
        <Field label="UME" value={`${sub.ume.toLocaleString()} ${sub.umeUnidad}`} />
        <Field label="SAP Tx.55" value={sub.pedidoSAP55 || '—'} color={sub.pedidoSAP55 ? INK : MUTED} />
        <Field label="SAP Tx.18" value={sub.ingresoSAP18 || '—'} color={sub.ingresoSAP18 ? '#1a7a4a' : MUTED} />
        <Field label="DUA N°" value={sub.duaNum || '—'} color={sub.duaNum ? INK : MUTED} />
      </div>

      {sub.articulosEmbarque.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 8 }}>ARTÍCULOS EN ESTE EMBARQUE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sub.articulosEmbarque.map((ae: any) => {
              const art = carpeta.articulos.find((a: any) => a.id === ae.articuloId);
              if (!art) return null;
              const saldoPosterior = art.cantidadSolicitada - art.cantidadAsignada;
              return (
                <div key={ae.articuloId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: PARCHMENT, borderRadius: 11, fontSize: 14 }}>
                  <span style={{ fontWeight: 600, color: INK }}>{art.codigoSAP}</span>
                  <span style={{ color: INK, flex: 1 }}>{art.descripcion}</span>
                  <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{ae.cantidad.toLocaleString()} {art.um}</span>
                  <span style={{ fontSize: 12, color: saldoPosterior === 0 ? '#1a7a4a' : '#b45309' }}>Saldo: {saldoPosterior.toLocaleString()} {art.um}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasInc && (
        <Alert variant="destructive" className="mt-4 bg-red-50">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Incidencias del embarque</AlertTitle>
          <AlertDescription>
          {sub.incidencias.map((inc: any) => (
            <div key={inc.id}>
              <strong>{inc.tipo}</strong> — {inc.cantidadAfectada} unidades — {inc.comentario}
            </div>
          ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ProduccionTab({ carpeta, proveedor, editable, onUpdateProduccion }: any) {
  const isMobile = useIsMobile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    referenciaProveedor: carpeta.referenciaProveedor || '',
    fechaEmbarqueEst: carpeta.fechaEmbarqueEst || '',
    controlConforme: carpeta.controlConforme,
    observaciones: carpeta.observaciones || '',
  });
  const fechaCalc = proveedor && carpeta.fechaOC
    ? new Date(new Date(carpeta.fechaOC).getTime() + proveedor.diasProd * 86400000).toISOString().split('T')[0]
    : '—';

  useEffect(() => {
    setForm({
      referenciaProveedor: carpeta.referenciaProveedor || '',
      fechaEmbarqueEst: carpeta.fechaEmbarqueEst || '',
      controlConforme: carpeta.controlConforme,
      observaciones: carpeta.observaciones || '',
    });
  }, [carpeta.referenciaProveedor, carpeta.fechaEmbarqueEst, carpeta.controlConforme, carpeta.observaciones]);

  const saveProduccion = () => {
    onUpdateProduccion({
      referenciaProveedor: form.referenciaProveedor.trim(),
      fechaEmbarqueEst: form.fechaEmbarqueEst,
      controlConforme: form.controlConforme,
      observaciones: form.observaciones.trim(),
    });
    setShowEditModal(false);
  };

  return (
    <>
    <div style={{ display: 'grid', gap: 16, padding: 16 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Confirmación del proveedor</span>
          {editable && (
            <AppButton type="button" size="sm" icon={<Pencil size={13} />} onClick={() => setShowEditModal(true)}>
              Editar sección
            </AppButton>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', columnGap: 24, rowGap: 18, alignItems: 'start' }}>
          <Field label="Referencia Proveedor" value={carpeta.referenciaProveedor || '—'} />
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Control artículo por artículo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 22 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${carpeta.controlConforme ? '#1a7a4a' : HAIRLINE}`, background: carpeta.controlConforme ? '#1a7a4a' : CANVAS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {carpeta.controlConforme && <CheckCircle size={11} color="#fff" />}
              </div>
              <span style={{ fontSize: 15, color: carpeta.controlConforme ? '#1a7a4a' : MUTED }}>{carpeta.controlConforme ? 'Conforme' : 'Con diferencias'}</span>
            </div>
          </div>
          <Field label="Fecha Embarque Est." value={carpeta.fechaEmbarqueEst || '—'} />
        </div>
        {carpeta.observaciones && (
          <div style={{ marginTop: 4, padding: '12px 14px', background: 'rgba(180,83,9,0.05)', borderLeft: '3px solid #b45309' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 7, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Observaciones / reclamos</div>
            <div style={{ fontSize: 14, color: '#b45309', lineHeight: 1.47, display: 'flex', gap: 8 }}><AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />{carpeta.observaciones}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 14, paddingTop: 14, borderTop: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Seguimiento de producción en origen</span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', columnGap: 24, rowGap: 18, alignItems: 'start' }}>
          <Field label="Proveedor" value={proveedor?.nombre || '—'} />
          <Field label="País Origen" value={proveedor?.pais || '—'} />
          <Field label="Días de Producción (Maestro)" value={`${proveedor?.diasProd || '—'} días`} />
          <Field label="Fecha O/C" value={carpeta.fechaOC} />
        </div>
        <div style={{ padding: '16px', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 14, maxWidth: isMobile ? '100%' : 420 }}>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>FECHA EMBARQUE ESTIMADA (calculada)</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: INK, letterSpacing: '-0.374px' }}>{fechaCalc}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Fecha O/C + {proveedor?.diasProd} días de producción</div>
        </div>
        {carpeta.fechaEmbarqueEst !== fechaCalc && (
          <div style={{ padding: '10px 14px', background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.2)', borderRadius: 9999, fontSize: 14, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content', maxWidth: '100%' }}>
            <AlertTriangle size={14} /> Desvío detectado — Registrada: {carpeta.fechaEmbarqueEst}
          </div>
        )}
      </div>
    </div>
    {showEditModal && (
      <TabEditModal title="Editar producción y pre-embarque" onClose={() => setShowEditModal(false)} onSave={saveProduccion}>
        <FormField label="Referencia proveedor">
          <input value={form.referenciaProveedor} onChange={event => setForm(prev => ({ ...prev, referenciaProveedor: event.target.value }))} placeholder="Referencia interna" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
        </FormField>
        <FormField label="Fecha embarque estimada">
          <input type="date" value={form.fechaEmbarqueEst} onChange={event => setForm(prev => ({ ...prev, fechaEmbarqueEst: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
        </FormField>
        <FormField label="Control artículo por artículo">
          <div style={{ display: 'flex', gap: 8 }}>
            <AppButton type="button" size="sm" variant={form.controlConforme ? 'success-soft' : 'secondary'} onClick={() => setForm(prev => ({ ...prev, controlConforme: true }))}>Conforme</AppButton>
            <AppButton type="button" size="sm" variant={!form.controlConforme ? 'danger-soft' : 'secondary'} onClick={() => setForm(prev => ({ ...prev, controlConforme: false }))}>Con diferencias</AppButton>
          </div>
        </FormField>
        <FormField label="Observaciones / reclamos">
          <textarea value={form.observaciones} onChange={event => setForm(prev => ({ ...prev, observaciones: event.target.value }))} rows={4} style={{ width: '100%', padding: '10px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
        </FormField>
      </TabEditModal>
    )}
    </>
  );
}

function DocumentosTab({ carpeta, subs, readonly }: any) {
  const isMobile = useIsMobile();
  const allDocs = (subs as Subcarpeta[]).flatMap(s =>
    s.documentos.map((d: any) => ({ ...d, subcarpeta: s.numero }))
  );

  const tipoColors: Record<string, string> = {
    'Factura Comercial':       '#5b21b6',
    'Bill of Lading / CRT':    '#5e5ce6',
    'Packing List':             '#b45309',
    'Certificado de Origen':   '#0066cc',
  };

  return (
    <div style={{ padding: isMobile ? 10 : 14, display: 'flex', flexDirection: 'column', gap: 10, background: CANVAS }}>
      {!readonly && (
        <div style={{ padding: '2px 2px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: CANVAS }}>
          <div style={{ border: `1px dashed ${HAIRLINE}`, borderRadius: 12, padding: '28px 24px', textAlign: 'center', background: '#fafbfd', cursor: 'pointer' }}>
            <Upload size={22} style={{ color: MUTED, margin: '0 auto 8px' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 3 }}>Agregar documentos</div>
            <div style={{ fontSize: 12, color: MUTED }}>PDF hasta 20 MB · Factura · BL/CRT · Packing List · Certificado</div>
          </div>
        </div>
      )}
      {allDocs.length > 0 && (
        <div style={{ overflow: 'hidden', background: CANVAS }}>
          {isMobile ? (
            <div>
              {allDocs.map((doc: any, i: number) => {
                const color = tipoColors[doc.tipo] || MUTED;
                return (
                  <div key={doc.id} style={{ padding: '16px', borderBottom: i < allDocs.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{doc.nombre}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{doc.subcarpeta}</div>
                      </div>
                      <AppButton size="xs" variant="tertiary" style={{ flexShrink: 0 }}>Ver documento</AppButton>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 12, color, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 9999, padding: '3px 8px' }}>{doc.tipo}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>TAMAÑO</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{doc.tamano}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>FECHA</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{doc.fecha}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableHeadRow}>
                  {['Subcarpeta', 'Tipo', 'Archivo', 'Tamaño', 'Fecha', ''].map(col => (
                    <th key={col} style={tableHeadCell}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allDocs.map((doc: any, i: number) => {
                  const color = tipoColors[doc.tipo] || MUTED;
                  return (
                    <tr key={doc.id} style={{ borderBottom: i < allDocs.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: INK }}>{doc.subcarpeta}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 9999, padding: '3px 8px' }}>{doc.tipo}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: INK }}>{doc.nombre}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: MUTED }}>{doc.tamano}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: MUTED }}>{doc.fecha}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <AppButton size="xs" variant="tertiary">Ver documento</AppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      {allDocs.length === 0 && <div style={{ textAlign: 'center', color: MUTED, fontSize: 15, padding: '32px 0' }}>Sin documentos adjuntos.</div>}
    </div>
  );
}

function DocumentosTabV2({ carpeta, subs, readonly, onAddDocumento }: { carpeta: Carpeta; subs: Subcarpeta[]; readonly: boolean; onAddDocumento: (doc: Documento, subId: string | 'madre') => void }) {
  const isMobile = useIsMobile();
  const [referencia, setReferencia] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tipo, setTipo] = useState<Documento['tipo']>('Factura Comercial');
  const [target, setTarget] = useState<string | 'madre'>('madre');
  const subcarpetas = subs as Subcarpeta[];
  const allDocs = [
    ...((carpeta.documentos ?? []).map((d: Documento) => ({ ...d, origen: 'Carpeta madre' }))),
    ...subcarpetas.flatMap(s => s.documentos.map((d: Documento) => ({ ...d, origen: s.numero }))),
  ];
  const tipoColors: Record<string, string> = {
    'Factura Comercial': '#5b21b6',
    'Bill of Lading / CRT': '#5e5ce6',
    'Packing List': '#b45309',
    'Certificado de Origen': '#0066cc',
  };
  const canAttach = Boolean(selectedFile);
  const handleAttach = () => {
    if (!canAttach) return;
    onAddDocumento({
      id: `doc-${Date.now()}`,
      nombre: selectedFile!.name,
      referencia: referencia.trim() || undefined,
      tipo,
      tamano: `${Math.max(1, Math.round(selectedFile!.size / 1024))} KB`,
      fecha: new Date().toISOString().split('T')[0],
    }, target);
    setReferencia('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: isMobile ? 10 : 14, display: 'flex', flexDirection: 'column', gap: 12, background: CANVAS }}>
      {!readonly && (
        <div style={{ display: 'grid', gap: 12, padding: 12, border: `1px dashed ${HAIRLINE}`, borderRadius: 12, background: '#fafbfd' }}>
          <div
            onDragOver={event => { event.preventDefault(); setIsDragActive(true); }}
            onDragEnter={event => { event.preventDefault(); setIsDragActive(true); }}
            onDragLeave={event => {
              event.preventDefault();
              const nextTarget = event.relatedTarget as Node | null;
              if (!nextTarget || !event.currentTarget.contains(nextTarget)) setIsDragActive(false);
            }}
            onDrop={event => {
              event.preventDefault();
              setIsDragActive(false);
              const file = event.dataTransfer.files?.[0];
              if (file) setSelectedFile(file);
            }}
            style={{ border: `2px dashed ${isDragActive ? GREEN : HAIRLINE}`, borderRadius: 18, background: isDragActive ? 'rgba(26,92,56,0.06)' : PARCHMENT, padding: 14, transition: 'border-color 0.15s, background 0.15s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                {selectedFile ? (
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</div>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Sin archivo adjunto</div>
                )}
                {!selectedFile && <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Arrastrá un archivo o adjuntalo desde tu equipo.</div>}
              </div>
              {!selectedFile ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 38, padding: '8px 12px', borderRadius: 9999, border: `1px solid ${GREEN}`, background: CANVAS, color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Upload size={14} /> Adjuntar archivo
                </button>
              ) : (
                <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, borderRadius: 9999, border: 'none', background: 'rgba(196,0,26,0.06)', color: '#c4001a', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" onChange={event => setSelectedFile(event.target.files?.[0] ?? null)} style={{ display: 'none' }} />
          </div>
          {selectedFile && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(180px, 1fr) minmax(160px, 0.75fr) minmax(160px, 0.75fr) auto', gap: 10, alignItems: 'end', paddingTop: 2 }}>
              <FormField label="Referencia">
                <input value={referencia} onChange={event => setReferencia(event.target.value)} placeholder="Nombre de referencia" style={{ width: '100%', minHeight: 38, padding: '9px 12px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
              </FormField>
              <FormField label="Tipo de anexo">
                <select value={tipo} onChange={event => setTipo(event.target.value as Documento['tipo'])} style={{ width: '100%', minHeight: 38, padding: '9px 12px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                  {Object.keys(tipoColors).map(item => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Pertenece a">
                <select value={target} onChange={event => setTarget(event.target.value)} style={{ width: '100%', minHeight: 38, padding: '9px 12px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                  <option value="madre">Carpeta madre</option>
                  {subcarpetas.map(sub => <option key={sub.id} value={sub.id}>{sub.numero}</option>)}
                </select>
              </FormField>
              <AppButton type="button" size="sm" icon={<Upload size={13} />} disabled={!canAttach} onClick={handleAttach} style={{ minHeight: 38 }}>Adjuntar</AppButton>
            </div>
          )}
        </div>
      )}
      {allDocs.length > 0 ? (
        <div style={{ overflow: 'hidden', background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 12 }}>
          {isMobile ? (
            <div>
              {allDocs.map((doc: any, i: number) => {
                const color = tipoColors[doc.tipo] || MUTED;
                return (
                  <div key={doc.id} style={{ padding: '14px 16px', borderBottom: i < allDocs.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{doc.nombre}</div>
                    {doc.referencia && <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Ref. {doc.referencia}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 9999, padding: '3px 8px' }}>{doc.tipo}</span>
                      <span style={{ fontSize: 11, color: GREEN, background: 'rgba(26,92,56,0.08)', border: '1px solid rgba(26,92,56,0.18)', borderRadius: 9999, padding: '3px 8px' }}>{doc.origen}</span>
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{doc.tamano} · {doc.fecha}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={tableHeadRow}>{['Origen', 'Tipo', 'Archivo', 'Tamaño', 'Fecha', ''].map(col => <th key={col} style={tableHeadCell}>{col}</th>)}</tr></thead>
              <tbody>
                {allDocs.map((doc: any, i: number) => {
                  const color = tipoColors[doc.tipo] || MUTED;
                  return (
                    <tr key={doc.id} style={{ borderBottom: i < allDocs.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                      <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: 'rgba(26,92,56,0.08)', border: '1px solid rgba(26,92,56,0.18)', borderRadius: 9999, padding: '3px 8px' }}>{doc.origen}</span></td>
                      <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, color, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 9999, padding: '3px 8px' }}>{doc.tipo}</span></td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: INK }}>
                        <div>{doc.nombre}</div>
                        {doc.referencia && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Ref. {doc.referencia}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: MUTED }}>{doc.tamano}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: MUTED }}>{doc.fecha}</td>
                      <td style={{ padding: '12px 16px' }}><AppButton size="xs" variant="tertiary">Ver</AppButton></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: MUTED, fontSize: 15, padding: '32px 0' }}>Sin anexos adjuntos.</div>
      )}
    </div>
  );
}

function AduanaTab({ carpeta, subs, editable, hideImportes, onUpdateSubcarpeta }: any) {
  const isMobile = useIsMobile();
  const subcarpetas = subs as Subcarpeta[];
  const [selectedSubId, setSelectedSubId] = useState<string>(subcarpetas[0]?.id ?? '');
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ despachante: '', duaNum: '', canalAduana: 'Pendiente', despachoTipo: '', gastosARS: '', vepUSD: '', fechaOficializacion: '', fechaSalidaPuerto: '', pedidoSAP55: '' });

  useEffect(() => {
    if (subcarpetas.length > 0 && !subcarpetas.some(item => item.id === selectedSubId)) setSelectedSubId(subcarpetas[0].id);
  }, [subcarpetas, selectedSubId]);

  const sub = subcarpetas.find(item => item.id === selectedSubId) ?? subcarpetas[0];
  if (!sub) return <div style={{ textAlign: 'center', padding: '64px', color: MUTED }}>Sin subcarpetas para gestionar aduana.</div>;

  useEffect(() => {
    setForm({
      despachante: sub.despachante || '',
      duaNum: sub.duaNum || '',
      canalAduana: sub.canalAduana || 'Pendiente',
      despachoTipo: sub.despachoTipo || '',
      gastosARS: sub.gastosARS ? String(sub.gastosARS) : '',
      vepUSD: sub.vepUSD ? String(sub.vepUSD) : '',
      fechaOficializacion: sub.fechaOficializacion || '',
      fechaSalidaPuerto: sub.fechaSalidaPuerto || '',
      pedidoSAP55: sub.pedidoSAP55 || '',
    });
  }, [sub.id, sub.despachante, sub.duaNum, sub.canalAduana, sub.despachoTipo, sub.gastosARS, sub.vepUSD, sub.fechaOficializacion, sub.fechaSalidaPuerto, sub.pedidoSAP55]);

  const saveAduana = () => {
    onUpdateSubcarpeta(sub.id, {
      despachante: form.despachante,
      duaNum: form.duaNum.trim(),
      canalAduana: form.canalAduana,
      despachoTipo: form.despachoTipo || undefined,
      gastosARS: form.gastosARS ? Number(form.gastosARS) : undefined,
      vepUSD: form.vepUSD ? Number(form.vepUSD) : undefined,
      fechaOficializacion: form.fechaOficializacion,
      fechaSalidaPuerto: form.fechaSalidaPuerto,
      pedidoSAP55: form.pedidoSAP55.trim(),
    });
    setShowEditModal(false);
  };

  return (
    <div>
      <div style={{ minHeight: 64, padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: `1px solid ${HAIRLINE}`, background: '#fafbfd' }}>
        <div><div style={{ fontSize: 12, color: MUTED }}>Gestionando embarque</div><div style={{ marginTop: 2, fontSize: 14, fontWeight: 700, color: INK }}>{sub.numero} · {sub.estado}</div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {subcarpetas.length > 1 && (
            <Select value={selectedSubId} onValueChange={setSelectedSubId}>
              <SelectTrigger aria-label="Seleccionar embarque" style={{ width: isMobile ? '100%' : 240, minHeight: 42, borderRadius: 12, background: CANVAS }}><SelectValue /></SelectTrigger>
              <SelectContent>{subcarpetas.map(item => <SelectItem key={item.id} value={item.id}>{item.numero} · {item.estado}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {editable && <AppButton type="button" size="sm" icon={<Pencil size={13} />} onClick={() => setShowEditModal(true)}>Editar sección</AppButton>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 12, alignItems: 'stretch' }}>
      <Card title="Estado Aduanero AFIP">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Despachante Aduanero" value={getDespachante(sub.despachante)?.nombre || '—'} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid #1a7a4a`, background: '#1a7a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={11} color="#fff" />
            </div>
            <span style={{ fontSize: 15, color: '#1a7a4a' }}>OK Documental Despachante</span>
          </div>

          <Field label="N° Declaración Detallada (DUA)" value={sub.duaNum || '—'} color={sub.duaNum ? INK : MUTED} />

          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Canal Aduanero</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <AppButton variant={sub.canalAduana === 'Verde' ? 'success-soft' : 'secondary'} style={{ flex: 1, minHeight: 44 }}>
                Canal Verde
              </AppButton>
              <AppButton variant={sub.canalAduana === 'Rojo' ? 'danger-soft' : 'secondary'} style={{ flex: 1, minHeight: 44 }}>
                Canal Rojo
              </AppButton>
            </div>
          </div>
        </div>
      </Card>

      {!hideImportes && (
        <Card title="Costos e Impuestos">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Gastos de Terminal Portuaria (AR$)" value={`$ ${carpeta.gastosTerminal.toLocaleString()}`} />
            <Field label="Honorarios Despachante (AR$)" value={`$ ${carpeta.honorariosDespachante.toLocaleString()}`} />
            <div style={{ paddingTop: 14, borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: MUTED }}>Total costos locales</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: INK }}>$ {(carpeta.gastosTerminal + carpeta.honorariosDespachante).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {!hideImportes && (
        <Card title="Hay Fondos — Gestión de Despachantes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DESPACHANTES.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: PARCHMENT, borderRadius: 11 }}>
                <span style={{ fontSize: 15, color: INK }}>{d.nombre}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: d.saldoFavor > 0 ? '#1a7a4a' : MUTED }}>$ {d.saldoFavor.toLocaleString()}</div>
                  {d.saldoFavor > 0 && <AppButton size="xs" variant="tertiary" style={{ marginTop: 2 }}>Aplicar saldo</AppButton>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Referencias Cruzadas SAP">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Tx.45 — N° Pedido OC" value={carpeta.pedidoSAP45 || '—'} color={carpeta.pedidoSAP45 ? INK : MUTED} />
          <Field label="Tx.55 — En Tránsito" value={sub.pedidoSAP55 || '—'} color={sub.pedidoSAP55 ? INK : MUTED} />
          <Field label="Tx.18 — Ingreso Mercadería" value={sub.ingresoSAP18 || '—'} color={sub.ingresoSAP18 ? '#1a7a4a' : MUTED} />
          <AppButton variant="secondary" icon={<Download size={14} />} style={{ marginTop: 4 }}>
            Exportar estructura para SAP (.CSV)
          </AppButton>
        </div>
      </Card>
      </div>
      {showEditModal && (
        <TabEditModal title={`Editar aduana · ${sub.numero}`} onClose={() => setShowEditModal(false)} onSave={saveAduana}>
          <FormField label="Despachante aduanero">
            <select value={form.despachante} onChange={event => setForm(prev => ({ ...prev, despachante: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
              <option value="">Seleccionar despachante...</option>
              {DESPACHANTES.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="N° Declaración Detallada (DUA)">
            <input value={form.duaNum} onChange={event => setForm(prev => ({ ...prev, duaNum: event.target.value }))} placeholder="26001-CUSBA-2026-XXXXXX" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
          </FormField>
          <FormField label="Canal aduanero">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['Pendiente', 'Verde', 'Rojo'] as const).map(option => (
                <AppButton key={option} type="button" size="sm" variant={form.canalAduana === option ? (option === 'Rojo' ? 'danger-soft' : option === 'Verde' ? 'success-soft' : 'secondary') : 'secondary'} onClick={() => setForm(prev => ({ ...prev, canalAduana: option }))}>
                  {option}
                </AppButton>
              ))}
            </div>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Despacho / ZFI / ZFE">
              <select value={form.despachoTipo} onChange={event => setForm(prev => ({ ...prev, despachoTipo: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                <option value="">Seleccionar...</option>
                {DESPACHO_TIPO_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
            <FormField label="Tx.55 — En tránsito">
              <input value={form.pedidoSAP55} onChange={event => setForm(prev => ({ ...prev, pedidoSAP55: event.target.value }))} placeholder="5500009321" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Monto gastos AR$">
              <input type="number" value={form.gastosARS} onChange={event => setForm(prev => ({ ...prev, gastosARS: event.target.value }))} placeholder="0" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
            </FormField>
            <FormField label="Monto VEP USD">
              <input type="number" value={form.vepUSD} onChange={event => setForm(prev => ({ ...prev, vepUSD: event.target.value }))} placeholder="0" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Fecha oficialización">
              <input type="date" value={form.fechaOficializacion} onChange={event => setForm(prev => ({ ...prev, fechaOficializacion: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
            </FormField>
            <FormField label="Fecha salida puerto / frontera">
              <input type="date" value={form.fechaSalidaPuerto} onChange={event => setForm(prev => ({ ...prev, fechaSalidaPuerto: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
            </FormField>
          </div>
        </TabEditModal>
      )}
    </div>
  );
}

function CosteoTab({ carpeta, editable, onUpdateCosteo }: any) {
  const isMobile = useIsMobile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    coeficienteReal: carpeta.coeficienteReal?.toString() || '',
    observaciones: carpeta.observaciones || '',
  });
  const desv = carpeta.coeficienteReal ? carpeta.coeficienteReal - carpeta.coeficienteEst : null;
  const desvPct = desv ? (desv / carpeta.coeficienteEst) * 100 : null;
  const alertColor = desvPct !== null && Math.abs(desvPct) > 5 ? '#b84800' : '#1a7a4a';

  useEffect(() => {
    setForm({
      coeficienteReal: carpeta.coeficienteReal?.toString() || '',
      observaciones: carpeta.observaciones || '',
    });
  }, [carpeta.coeficienteReal, carpeta.observaciones]);

  const saveCosteo = () => {
    onUpdateCosteo({
      coeficienteReal: form.coeficienteReal ? Number(form.coeficienteReal) : null,
      observaciones: form.observaciones.trim(),
    });
    setShowEditModal(false);
  };

  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 16px 12px' }}>
      {editable && (
        <AppButton type="button" size="sm" icon={<Pencil size={13} />} onClick={() => setShowEditModal(true)}>
          Editar sección
        </AppButton>
      )}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 12, alignItems: 'stretch' }}>
      <Card title="Coeficiente de Costo">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: '20px', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>ESTIMADO</div>
            <div style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px' }}>{carpeta.coeficienteEst.toFixed(2)}</div>
          </div>
          <div style={{ padding: '20px', background: carpeta.coeficienteReal ? `${alertColor}0d` : PARCHMENT, border: `1px solid ${carpeta.coeficienteReal ? alertColor + '33' : HAIRLINE}`, borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>REAL</div>
            <div style={{ fontSize: 34, fontWeight: 600, color: carpeta.coeficienteReal ? alertColor : MUTED, letterSpacing: '-0.374px' }}>{carpeta.coeficienteReal?.toFixed(2) || '—'}</div>
          </div>
        </div>
        {desvPct !== null && (
          <div style={{ marginTop: 12, padding: '14px', background: `${alertColor}0d`, border: `1px solid ${alertColor}33`, borderRadius: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
            {Math.abs(desvPct) > 5 && <AlertTriangle size={15} style={{ color: alertColor }} />}
            <span style={{ fontSize: 17, fontWeight: 600, color: alertColor }}>
              {desv! > 0 ? '+' : ''}{desv!.toFixed(2)} ({desvPct.toFixed(1)}% variación)
            </span>
          </div>
        )}
      </Card>

      <Card title="Desglose de Costos Locales">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Gastos de Terminal', value: carpeta.gastosTerminal },
            { label: 'Honorarios Despachante', value: carpeta.honorariosDespachante },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${HAIRLINE}` }}>
              <span style={{ fontSize: 15, color: MUTED }}>{item.label}</span>
              <span style={{ fontSize: 15, fontWeight: 400, color: INK, fontVariantNumeric: 'tabular-nums' }}>$ {item.value.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: INK }}>Total</span>
            <span style={{ fontSize: 17, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>
              $ {(carpeta.gastosTerminal + carpeta.honorariosDespachante).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      <Card title="Observaciones de Costeo">
        <div>
          <div style={{ fontSize: 15, color: carpeta.observaciones ? INK : MUTED, lineHeight: 1.6 }}>
            {carpeta.observaciones || 'Sin observaciones.'}
          </div>
        </div>
      </Card>
    </div>
    {showEditModal && (
      <TabEditModal title="Editar costeo" onClose={() => setShowEditModal(false)} onSave={saveCosteo}>
        <FormField label="Coeficiente real">
          <input type="number" step="0.01" value={form.coeficienteReal} onChange={event => setForm(prev => ({ ...prev, coeficienteReal: event.target.value }))} placeholder="0.00" style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
        </FormField>
        <FormField label="Observaciones de costeo">
          <textarea value={form.observaciones} onChange={event => setForm(prev => ({ ...prev, observaciones: event.target.value }))} rows={5} placeholder="Notas sobre el costeo, desvíos o warnings" style={{ width: '100%', padding: '10px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
        </FormField>
      </TabEditModal>
    )}
    </>
  );
}

/* ── Pagos Tab ─────────────────────────────────────────────────────── */

function PagosTab({ carpeta, editable }: { carpeta: Carpeta; editable: boolean }) {
  const isMobile = useIsMobile();
  const [fondosDisponibles] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPagoId, setSelectedPagoId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ fechaPago: '', montoPago: '' });

  const initialPagos = [
    { id: '1', concepto: 'Factura Proveedor Exterior', monto: carpeta.montoTotal * 0.5, moneda: carpeta.moneda, vencimiento: '2026-04-10', estado: 'Pagado' },
    { id: '2', concepto: 'Factura Proveedor Exterior (saldo)', monto: carpeta.montoTotal * 0.5, moneda: carpeta.moneda, vencimiento: '2026-05-10', estado: 'Pendiente' },
    { id: '3', concepto: 'Flete Internacional', monto: 3200, moneda: 'USD', vencimiento: '2026-04-25', estado: 'Pagado' },
    { id: '4', concepto: 'Impuestos AFIP / VEP', monto: carpeta.vep, moneda: 'ARS', vencimiento: '2026-05-28', estado: 'Pendiente' },
    { id: '5', concepto: 'Gastos Terminal', monto: carpeta.gastosTerminal, moneda: 'ARS', vencimiento: '2026-06-01', estado: 'Pendiente' },
  ];
  const [pagos, setPagos] = useState(initialPagos);

  useEffect(() => {
    setPagos(initialPagos);
    setShowPaymentModal(false);
    setSelectedPagoId(null);
    setPaymentForm({ fechaPago: '', montoPago: '' });
  }, [carpeta.id, carpeta.montoTotal, carpeta.moneda, carpeta.vep, carpeta.gastosTerminal]);

  const selectedPago = pagos.find(pago => pago.id === selectedPagoId) ?? null;
  const openPaymentModal = (pagoId: string) => {
    const pago = pagos.find(item => item.id === pagoId);
    if (!pago) return;
    setSelectedPagoId(pago.id);
    setPaymentForm({ fechaPago: pago.vencimiento, montoPago: String(pago.monto) });
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedPago) return;
    setPagos(current => current.map(pago => pago.id === selectedPago.id ? ({ ...pago, estado: 'Pagado', fechaPago: paymentForm.fechaPago, montoPago: Number(paymentForm.montoPago || pago.monto) }) : pago));
    setShowPaymentModal(false);
    setSelectedPagoId(null);
  };

  const totalPendiente = pagos.filter(p => p.estado === 'Pendiente').reduce((acc, p) => acc + p.monto, 0);
  const totalPagado = pagos.filter(p => p.estado === 'Pagado').reduce((acc, p) => acc + p.monto, 0);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Fondos disponibles alert */}
      <Card title="Estado de Fondos">
        <div style={{
          padding: '14px 16px',
          background: fondosDisponibles ? 'rgba(26,122,74,0.06)' : 'rgba(180,35,24,0.06)',
          border: `1px solid ${fondosDisponibles ? 'rgba(26,122,74,0.2)' : 'rgba(180,35,24,0.2)'}`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: fondosDisponibles ? 'rgba(26,122,74,0.12)' : 'rgba(180,35,24,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {fondosDisponibles
              ? <CheckCircle size={18} color="#1a7a4a" />
              : <AlertTriangle size={18} color="#b42318" />
            }
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: fondosDisponibles ? '#1a7a4a' : '#b42318' }}>
              {fondosDisponibles ? 'Hay fondos disponibles' : 'Sin fondos suficientes'}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              {fondosDisponibles
                ? 'Los pagos pendientes están cubiertos por la proyección actual.'
                : 'Se requiere gestión de Tesorería para cubrir los pagos próximos.'}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card title="Resumen de pagos">
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 16, background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Pagado</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a7a4a', marginTop: 6 }}>
              {carpeta.moneda} {totalPagado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ padding: 16, background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Pendiente</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#b45309', marginTop: 6 }}>
              {carpeta.moneda} {totalPendiente.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ padding: 16, background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Condición de Pago</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginTop: 6 }}>{carpeta.condPago}</div>
          </div>
        </div>
      </Card>

      {/* Pagos table */}
      <Card title="Detalle de Pagos">
        {isMobile ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {pagos.map(pago => (
              <div key={pago.id} style={{ padding: '12px 14px', background: PARCHMENT, borderRadius: 10, border: `1px solid ${HAIRLINE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{pago.concepto}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                    background: pago.estado === 'Pagado' ? 'rgba(26,122,74,0.1)' : 'rgba(180,83,9,0.1)',
                    color: pago.estado === 'Pagado' ? '#1a7a4a' : '#b45309',
                  }}>{pago.estado}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: MUTED }}>
                  <span>Venc: {pago.vencimiento}</span>
                  <span style={{ fontWeight: 600, color: INK }}>{pago.moneda} {pago.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                </div>
                {editable && pago.estado === 'Pendiente' && (
                  <div style={{ marginTop: 10 }}>
                    <AppButton type="button" size="xs" onClick={() => openPaymentModal(pago.id)}>
                      Confirmar pago
                    </AppButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfd', borderBottom: `1px solid ${HAIRLINE}` }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Concepto</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vencimiento</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monto</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</th>
                  {editable && <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {pagos.map(pago => (
                  <tr key={pago.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: INK }}>{pago.concepto}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: MUTED }}>{pago.vencimiento}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: INK, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{pago.moneda} {pago.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999,
                        background: pago.estado === 'Pagado' ? 'rgba(26,122,74,0.1)' : 'rgba(180,83,9,0.1)',
                        color: pago.estado === 'Pagado' ? '#1a7a4a' : '#b45309',
                      }}>{pago.estado}</span>
                    </td>
                    {editable && (
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {pago.estado === 'Pendiente' && (
                          <AppButton type="button" size="xs" onClick={() => openPaymentModal(pago.id)}>
                            Confirmar pago
                          </AppButton>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {showPaymentModal && selectedPago && (
        <TabEditModal title={`Confirmar pago · ${selectedPago.concepto}`} onClose={() => setShowPaymentModal(false)} onSave={confirmPayment} saveLabel="Registrar pago">
          <FormField label="Fecha de pago real">
            <input type="date" value={paymentForm.fechaPago} onChange={event => setPaymentForm(prev => ({ ...prev, fechaPago: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
          </FormField>
          <FormField label="Monto pagado">
            <input type="number" value={paymentForm.montoPago} onChange={event => setPaymentForm(prev => ({ ...prev, montoPago: event.target.value }))} style={{ width: '100%', minHeight: 40, padding: '9px 12px', fontSize: 14, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
          </FormField>
        </TabEditModal>
      )}
    </div>
  );
}
