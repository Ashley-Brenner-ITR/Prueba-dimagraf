import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Plus, ChevronRight, ChevronLeft, CheckCircle, X, Upload, FileText, AlertTriangle, Trash2, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal } from 'lucide-react';
import { fieldLabel, formInput, formTextarea, getAutoFitGridStyle, getModalPrimaryButtonStyle, getModalSecondaryButtonStyle, getResponsiveTableStyle, getModalShellStyle, modalCloseButton, modalFooter, modalHeader, modalOverlay, pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableScrollArea, tableShell } from './chromeStyles';
import { read, utils, writeFileXLSX } from 'xlsx';
import { PROVEEDORES, getEstadoColor, type EstadoCarpeta, type Carpeta, type Subcarpeta } from './mockData';
import { NeonBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { AppButton } from './AppButton';
import { normalizeSearchTerm, SearchField } from './SearchField';
import { FilterToolbar } from './FilterToolbar';
import { WelcomeBanner } from './WelcomeBanner';
import { SurfaceCard } from './SurfaceCard';
import { color, radius } from './theme';

const INK       = '#1d1d1f';
const MUTED     = '#6e6e73';
const PARCHMENT = '#f8fafc';
const HAIRLINE  = '#d2d2d7';
const GREEN     = '#1a5c38';
const CANVAS    = '#ffffff';
const MINT_WASH = color.mintWash;
const GREEN_HAIRLINE = color.borderTint;
const GREEN_HAIRLINE_SOFT = color.borderTintSoft;
const SELECT_CHEVRON_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const ESTADO_FILTERS: Array<{ value: EstadoCarpeta | 'Todos'; label: string; color?: string }> = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Pendiente de embarque', label: 'Pendiente de embarque', color: getEstadoColor('Pendiente de embarque') },
  { value: 'En Tránsito', label: 'En tránsito', color: getEstadoColor('En Tránsito') },
  { value: 'Arribado Aduana', label: 'Arribado aduana', color: getEstadoColor('Arribado Aduana') },
  { value: 'Oficializado', label: 'Oficializado', color: getEstadoColor('Oficializado') },
  { value: 'En Stock', label: 'En stock', color: getEstadoColor('En Stock') },
];

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'FCA', 'DAP', 'DDP', 'CFR'];
const CONDICIONES_PAGO = ['30 días neto', '60 días neto', '90 días neto', 'Contado', '50% anticipo / 50% entrega', 'Carta de crédito'];
const MASSIVE_TEMPLATE = [
  'codigoSAP\tdescripcion\tcantidad\tum\tume\tequivalencia\tlinea\tprecioUnitario\tobservaciones',
  '1000234\tPapel Estucado Brillante 115g/m2\t50000\tKg\tKg\t1\tLCA\t1.42\tOC completa',
  '1000235\tPapel Estucado Mate 130g/m2\t30000\tKg\tKg\t1\tLCA\t1.58\tEntrega parcial permitida',
  '2000118\tVinilo Transparente Gloss 100µm\t8000\tM2\tBobina\t125\tLCA\t4.10\tRevisar equivalencia logística',
].join('\n');

const EMPTY_MANUAL_ARTICLE_FORM = { codigoSAP: '', descripcion: '', linea: 'LCA', cantidadSolicitada: '', um: 'Kg', precioUnitario: '' };

type CreationMode = 'manual' | 'massive';
type WizardStep = 1 | 2 | 3 | 4 | 5;
type ValidationStatus = 'Válido' | 'Con advertencia' | 'Con error' | 'Duplicado';
type SortDirection = 'asc' | 'desc';
type SortKey = 'numero' | 'proveedor' | 'pedidoSAP45' | 'montoTotal' | 'ultimoHito' | 'lastUpdate';
type ColumnKey = SortKey | 'fechaOC' | 'referenciaProveedor' | 'incoterm' | 'condPago' | 'fechaEmbarqueEst' | 'embarques';

const FALLBACK_VIEWPORT_HEIGHT = 900;
const DEFAULT_HIDDEN_COLUMNS: ColumnKey[] = ['fechaOC', 'referenciaProveedor', 'incoterm', 'condPago', 'fechaEmbarqueEst', 'embarques'];

const WIZARD_STEPS: Record<CreationMode, Array<{ id: WizardStep; label: string }>> = {
  manual: [
    { id: 1, label: 'Datos generales' },
    { id: 2, label: 'Modo de carga' },
    { id: 3, label: 'Carga' },
    { id: 4, label: 'Validación' },
  ],
  massive: [
    { id: 1, label: 'Datos generales' },
    { id: 2, label: 'Modo de carga' },
    { id: 3, label: 'Carga' },
    { id: 4, label: 'Validación' },
  ],
};

interface ImportedRow {
  id: string;
  codigoSAP: string;
  descripcion: string;
  cantidadSolicitada: number;
  um: string;
  ume: string;
  equivalencia: number;
  linea: string;
  precioUnitario: number;
  observaciones: string;
  status: ValidationStatus;
  detail: string;
}

interface ManualArticleFormState {
  codigoSAP: string;
  descripcion: string;
  linea: string;
  cantidadSolicitada: string;
  um: string;
  precioUnitario: string;
}

interface Props {
  carpetasList: Carpeta[];
  onSelectCarpeta: (id: string, detailTab?: 'general' | 'articulos') => void;
  onSelectSubcarpeta?: (carpetaId: string, subcarpetaId: string) => void;
  onCreateCarpeta: (carpeta: Carpeta) => void;
  hideImportes?: boolean;
}

function SubcarpetaMiniCard({ sub, onClick, width }: { sub: Subcarpeta; onClick: () => void; width: number; children?: ReactNode }) {
  return (
    <SurfaceCard
      as="article"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 8,
        flex: `0 0 ${width}px`,
        minWidth: width,
        padding: '7px 9px',
        cursor: 'pointer',
        borderRadius: 8,
      }}
    >
      <div style={{ minWidth: 0, display: 'grid', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{sub.numero}</span>
          <NeonBadge estado={sub.estado as any} size="xs" />
        </div>
        <span style={{ fontSize: 10.5, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ETA {sub.eta || '-'} · {sub.contenedores || 0} cont.
        </span>
      </div>
      <ChevronRight size={12} style={{ color: '#98a2b3', flexShrink: 0 }} />
    </SurfaceCard>
  );
}

function SubcarpetaLine({ sub, onClick, showDivider = false, showMobileDivider = false, compact = false, fullWidth = false, mobileStacked = false }: { sub: Subcarpeta; onClick: () => void; showDivider?: boolean; showMobileDivider?: boolean; compact?: boolean; fullWidth?: boolean; mobileStacked?: boolean; children?: ReactNode }) {
  const desktopSingleWidth = fullWidth && !mobileStacked;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: compact ? 56 : 36,
        display: 'grid',
        gridTemplateColumns: mobileStacked ? 'minmax(0, 1fr) auto 20px' : 'minmax(0, 1fr) auto 20px',
        gridTemplateRows: mobileStacked ? 'auto auto' : undefined,
        alignItems: 'center',
        columnGap: mobileStacked ? 12 : compact ? 12 : 10,
        rowGap: compact ? 4 : 2,
        padding: mobileStacked ? '10px 16px 10px 12px' : (compact || desktopSingleWidth ? '10px 16px' : '10px 16px 10px 12px'),
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
      <span style={{ minWidth: 0, display: 'grid', gap: compact ? 4 : 2, gridColumn: mobileStacked ? '1 / 2' : undefined, gridRow: mobileStacked ? '1 / 3' : undefined }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: INK, whiteSpace: compact ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: compact ? 'clip' : 'ellipsis', overflowWrap: 'anywhere', minWidth: 0 }}>{sub.numero}</span>
        <span style={{ fontSize: 11, color: MUTED, overflow: 'hidden', textOverflow: compact ? 'clip' : 'ellipsis', whiteSpace: compact ? 'normal' : 'nowrap', lineHeight: compact ? 1.35 : 1.2 }}>ETA {sub.eta || '-'} · {sub.contenedores || 0} cont.</span>
      </span>
      {mobileStacked && (
        <>
          <span style={{ gridColumn: '2 / 3', gridRow: '1 / 3', alignSelf: 'center', justifySelf: 'end', display: 'inline-flex', alignItems: 'center' }}>
            <NeonBadge estado={sub.estado as any} size="xs" />
          </span>
          <span style={{ gridColumn: '3 / 4', gridRow: '1 / 3', width: 20, alignSelf: 'center', justifySelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={12} style={{ color: '#98a2b3', flexShrink: 0 }} />
          </span>
        </>
      )}
      <span style={{ display: mobileStacked ? 'none' : 'inline-flex', alignItems: compact ? 'flex-start' : 'center', justifyContent: 'flex-end', gap: compact ? 12 : 10, alignSelf: compact ? 'start' : 'center', justifySelf: 'end' }}>
        <NeonBadge estado={sub.estado as any} size="xs" />
        <span style={{ width: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={12} style={{ color: '#98a2b3' }} />
        </span>
      </span>
    </button>
  );
}
function nextNumero(carpetasList: Carpeta[]): string {
  const year = new Date().getFullYear();
  const seqs = carpetasList
    .map(c => { const [, s] = c.numero.split('/'); return parseInt(s) || 0; })
    .filter(n => !isNaN(n));
  const next = seqs.length > 0 ? Math.max(...seqs) + 1 : 100;
  return `${year}/${next}`;
}

function CountryFlag({ country }: { country: string }) {
  const flagBackgrounds: Record<string, string> = {
    Alemania: 'linear-gradient(to bottom, #000 0 33.33%, #dd0000 33.33% 66.66%, #ffce00 66.66% 100%)',
    Bélgica: 'linear-gradient(to right, #000 0 33.33%, #fae042 33.33% 66.66%, #ed2939 66.66% 100%)',
    Belgica: 'linear-gradient(to right, #000 0 33.33%, #fae042 33.33% 66.66%, #ed2939 66.66% 100%)',
    Chile: 'linear-gradient(to bottom, #ffffff 0 50%, #d52b1e 50% 100%)',
    Finlandia: 'linear-gradient(to right, transparent 0 30%, #002f6c 30% 45%, transparent 45% 100%), linear-gradient(to bottom, transparent 0 38%, #002f6c 38% 58%, transparent 58% 100%), #ffffff',
    Italia: 'linear-gradient(to right, #009246 0 33.33%, #ffffff 33.33% 66.66%, #ce2b37 66.66% 100%)',
  };

  return (
    <span
      aria-hidden="true"
      title={country}
      style={{
        width: 16,
        height: 11,
        display: 'inline-block',
        flexShrink: 0,
        borderRadius: 2,
        background: flagBackgrounds[country] ?? '#eef2f6',
        border: '1px solid rgba(16,24,40,0.14)',
        boxShadow: '0 1px 1px rgba(16,24,40,0.05)',
      }}
    />
  );
}

function hasOriginCertificate(carpeta: Carpeta) {
  return carpeta.subcarpetas.some(sub => sub.documentos.some(doc => doc.tipo === 'Certificado de Origen'));
}

interface FormState {
  proveedorId: string;
  fechaOC: string;
  pedidoSAP45: string;
  incoterm: string;
  moneda: 'USD' | 'EUR';
  montoTotal: string;
  condPago: string;
  observaciones: string;
}

const EMPTY_FORM: FormState = {
  proveedorId: '',
  fechaOC: new Date().toISOString().split('T')[0],
  pedidoSAP45: '',
  incoterm: 'FOB',
  moneda: 'USD',
  montoTotal: '',
  condPago: '60 días neto',
  observaciones: '',
};

const LOAD_MODE_OPTIONS: Array<{ value: CreationMode; label: string; hint: string }> = [
  {
    value: 'manual',
    label: 'Carga manual',
    hint: 'Alta desde Artículos',
  },
  {
    value: 'massive',
    label: 'Carga masiva',
    hint: 'Archivo Excel o CSV',
  },
];

export function OperatorDashboard({ carpetasList, onSelectCarpeta, onSelectSubcarpeta, onCreateCarpeta, hideImportes = false }: Props) {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCarpeta | 'Todos'>('Todos');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableViewportHeight, setTableViewportHeight] = useState(FALLBACK_VIEWPORT_HEIGHT);
  const [tableShellWidth, setTableShellWidth] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState<WizardStep>(1);
  const [created, setCreated] = useState<Carpeta | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  const [massiveText, setMassiveText] = useState('');
  const [importedRows, setImportedRows] = useState<ImportedRow[]>([]);
  const [acceptedRows, setAcceptedRows] = useState<ImportedRow[]>([]);
  const [importBatchLabel, setImportBatchLabel] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [manualArticles, setManualArticles] = useState<ImportedRow[]>([]);
  const [manualArticleForm, setManualArticleForm] = useState<ManualArticleFormState>(EMPTY_MANUAL_ARTICLE_FORM);
  const [columnsDrawerOpen, setColumnsDrawerOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnKey>>(() => new Set(DEFAULT_HIDDEN_COLUMNS));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tableShellRef = useRef<HTMLDivElement | null>(null);
  const isNarrowViewport = useIsMobile();
  const useCompactTableLayout = isNarrowViewport || tableShellWidth < (hideImportes ? 820 : 960);
  const modalHorizontalPadding = isNarrowViewport ? 18 : 28;
  const modalSectionPadding = `${isNarrowViewport ? 20 : 24}px ${modalHorizontalPadding}px`;
  const wizardSteps = WIZARD_STEPS[creationMode];
  const showUpdateColumn = !useCompactTableLayout;
  const showRowAction = !useCompactTableLayout;
  const currentStepLabel = wizardSteps.find(item => item.id === step)?.label ?? 'Resultado';
  const stepLabel = `Paso ${step} · ${currentStepLabel}`;
  const importableRows = importedRows.filter(row => row.status !== 'Con error');
  const hasValidationIssues = importedRows.some(row => row.status !== 'Válido');
  const hasBlockingErrors = importedRows.some(row => row.status === 'Con error');
  const modalSelectStyle = {
    width: '100%',
    color: INK,
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: SELECT_CHEVRON_SVG,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '12px 12px',
  };
  const modalPrimarySelectStyle = {
    ...modalSelectStyle,
    padding: '11px 40px 11px 14px',
    fontSize: 14,
    backgroundColor: CANVAS,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 12,
    minHeight: 44,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  };
  const modalSecondarySelectStyle = {
    ...modalSelectStyle,
    padding: '10px 36px 10px 10px',
    fontSize: 13,
    backgroundColor: CANVAS,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 12,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  };

  useEffect(() => {
    const measureTableViewport = () => {
      const shellRect = tableShellRef.current?.getBoundingClientRect();
      const viewportHeight = window.innerHeight || FALLBACK_VIEWPORT_HEIGHT;

      if (!shellRect) {
        setTableViewportHeight(viewportHeight);
        setTableShellWidth(window.innerWidth || 0);
        return;
      }

      const nextHeight = Math.max(320, viewportHeight - shellRect.top - 24);
      setTableViewportHeight(nextHeight);
      setTableShellWidth(shellRect.width);
    };

    measureTableViewport();
    window.addEventListener('resize', measureTableViewport);

    return () => window.removeEventListener('resize', measureTableViewport);
  }, [isNarrowViewport]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, estadoFilter, sortConfig]);

  const estadoCounts = carpetasList.reduce<Partial<Record<EstadoCarpeta, number>>>((counts, carpeta) => {
    ESTADO_FILTERS.forEach(option => {
      if (option.value === 'Todos') return;
      if (carpeta.subcarpetas.some(sub => sub.estado === option.value)) {
        counts[option.value] = (counts[option.value] ?? 0) + 1;
      }
    });
    return counts;
  }, {});

  const estadoFilterOptions = ESTADO_FILTERS.map(option => ({
    ...option,
    count: option.value === 'Todos' ? carpetasList.length : (estadoCounts[option.value] ?? 0),
  }));

  const filtered = carpetasList.flatMap(c => {
    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
    const normalizedSearch = normalizeSearchTerm(search);
    const matchSearch = !normalizedSearch || [
      c.numero,
      prov?.nombre,
      ...c.articulos.flatMap(a => [a.codigoSAP, a.descripcion]),
    ].some(value => normalizeSearchTerm(value).includes(normalizedSearch));
    const visibleSubcarpetas = estadoFilter === 'Todos'
      ? c.subcarpetas
      : c.subcarpetas.filter(sub => sub.estado === estadoFilter);
    const matchEstado = estadoFilter === 'Todos' || visibleSubcarpetas.length > 0;

    if (!matchSearch || !matchEstado) {
      return [];
    }

    return [{ ...c, subcarpetas: visibleSubcarpetas }];
  });

  const getProveedorNombre = (proveedorId: string) => PROVEEDORES.find(p => p.id === proveedorId)?.nombre ?? '';

  const sortedFiltered = [...filtered].sort((left, right) => {
    if (!sortConfig) return 0;

    const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;

    const compareText = (leftValue: string, rightValue: string) =>
      leftValue.localeCompare(rightValue, 'es', { numeric: true, sensitivity: 'base' }) * directionMultiplier;

    switch (sortConfig.key) {
      case 'numero':
        return compareText(left.numero, right.numero);
      case 'proveedor':
        return compareText(getProveedorNombre(left.proveedorId), getProveedorNombre(right.proveedorId));
      case 'pedidoSAP45':
        return compareText(left.pedidoSAP45, right.pedidoSAP45);
      case 'montoTotal':
        return (left.montoTotal - right.montoTotal) * directionMultiplier;
      case 'ultimoHito':
        return compareText(left.ultimoHito, right.ultimoHito);
      case 'lastUpdate':
        return compareText(left.lastUpdate, right.lastUpdate);
      default:
        return 0;
    }
  });

  const paginationFooterHeight = useCompactTableLayout ? 68 : 56;
  const tableToolbarHeight = 68;
  const availableScrollAreaHeight = Math.max(260, tableViewportHeight - paginationFooterHeight - tableToolbarHeight);
  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sortedFiltered.length);
  const paginatedRows = sortedFiltered.slice(pageStart, pageEnd);
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(pageNumber => {
    if (totalPages <= 5) return true;
    if (pageNumber === 1 || pageNumber === totalPages) return true;
    return Math.abs(pageNumber - currentPageSafe) <= 1;
  });
  const activeSearchTerm = search.trim();
  const activeContextChips = [
    activeSearchTerm ? `Búsqueda: ${activeSearchTerm}` : null,
  ].filter(Boolean) as string[];

  const toggleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }

      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const formatCompactDate = (value: string) => {
    if (!value) return '—';

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const primaryTableTextStyle = {
    fontSize: 13,
    color: INK,
    lineHeight: 1.2,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  };

  const primaryTableNumericTextStyle = {
    ...primaryTableTextStyle,
    fontVariantNumeric: 'tabular-nums' as const,
  };

  const allConfigurableColumns: Array<{
    key: ColumnKey;
    label: string;
    hint: string;
    sortKey?: SortKey;
    required?: boolean;
    render: (carpeta: Carpeta, proveedorNombre: string, proveedorPais: string) => ReactNode;
  }> = [
    {
      key: 'numero',
      label: 'CARPETA',
      hint: 'Identificador principal',
      sortKey: 'numero',
      required: true,
      render: carpeta => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>{carpeta.numero}</div>
            {carpeta.subcarpetas.length > 0 && <div style={{ marginTop: 2, fontSize: 10, color: MUTED, whiteSpace: 'nowrap' }}>{carpeta.subcarpetas.length} embarque{carpeta.subcarpetas.length > 1 ? 's' : ''}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'proveedor',
      label: 'PROVEEDOR',
      hint: 'Nombre y país',
      sortKey: 'proveedor',
      render: (carpeta, proveedorNombre, proveedorPais) => {
        return (
          <div style={{ ...primaryTableTextStyle, display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proveedorNombre || '—'}</span>
            {proveedorPais && <CountryFlag country={proveedorPais} />}
          </div>
        );
      },
    },
    {
      key: 'pedidoSAP45',
      label: 'SAP 45',
      hint: 'Pedido de la OC',
      sortKey: 'pedidoSAP45',
      render: carpeta => <div style={primaryTableNumericTextStyle}>{carpeta.pedidoSAP45 || '—'}</div>,
    },
    ...(hideImportes
      ? []
      : [{
          key: 'montoTotal' as ColumnKey,
          label: 'MONTO OC',
          hint: 'Importe y moneda',
          sortKey: 'montoTotal' as SortKey,
          render: (carpeta: Carpeta) => <span style={primaryTableNumericTextStyle}>{`${carpeta.moneda} ${carpeta.montoTotal.toLocaleString()}`}</span>,
        }]),
    {
      key: 'ultimoHito',
      label: 'ÚLTIMO HITO',
      hint: 'Seguimiento vigente',
      sortKey: 'ultimoHito',
      render: carpeta => <div style={primaryTableTextStyle}>{carpeta.ultimoHito}</div>,
    },
    {
      key: 'lastUpdate',
      label: 'ACTUALIZ.',
      hint: 'Último cambio',
      sortKey: 'lastUpdate',
      render: carpeta => <span style={primaryTableNumericTextStyle}>{formatCompactDate(carpeta.lastUpdate)}</span>,
    },
    {
      key: 'fechaOC',
      label: 'FECHA OC',
      hint: 'Alta de la orden',
      render: carpeta => <span style={primaryTableNumericTextStyle}>{formatCompactDate(carpeta.fechaOC)}</span>,
    },
    {
      key: 'referenciaProveedor',
      label: 'REF. PROV.',
      hint: 'Confirmación del proveedor',
      render: carpeta => <div style={primaryTableTextStyle}>{carpeta.referenciaProveedor || '—'}</div>,
    },
    {
      key: 'incoterm',
      label: 'INCOTERM',
      hint: 'Condición logística',
      render: carpeta => <span style={primaryTableTextStyle}>{carpeta.incoterm || '—'}</span>,
    },
    {
      key: 'condPago',
      label: 'PAGO',
      hint: 'Condición acordada',
      render: carpeta => <div style={primaryTableTextStyle}>{carpeta.condPago || '—'}</div>,
    },
    {
      key: 'fechaEmbarqueEst',
      label: 'EMB. EST.',
      hint: 'Embarque estimado',
      render: carpeta => <span style={primaryTableNumericTextStyle}>{formatCompactDate(carpeta.fechaEmbarqueEst)}</span>,
    },
    {
      key: 'embarques',
      label: 'EMBARQUES',
      hint: 'Aperturas activas',
      render: carpeta => <span style={primaryTableTextStyle}>{carpeta.subcarpetas.length || '—'}</span>,
    },
  ];
  const sortableColumns = allConfigurableColumns.filter((column): column is typeof column & { sortKey: SortKey } => Boolean(column.sortKey));
  // Max columns based on available width (never hide "CARPETA" — it's required)
  const maxColumns = tableShellWidth > 1100 ? 6 : tableShellWidth > 900 ? 5 : tableShellWidth > 700 ? 4 : 3;
  const visibleColumns = allConfigurableColumns
    .filter(({ key }) => !hiddenColumns.has(key))
    .slice(0, maxColumns);
  const mobileColumnLabels: Partial<Record<SortKey, string>> = {
    numero: 'CARP.',
    proveedor: 'PROV.',
    pedidoSAP45: 'SAP',
    montoTotal: 'MONTO',
    ultimoHito: 'HITO',
    lastUpdate: 'ACT.',
  };
  const getCurrencySymbol = (currency: Carpeta['moneda']) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return currency;
    }
  };

  const activeColumnCount = allConfigurableColumns.filter(({ key }) => !hiddenColumns.has(key)).length;
  const toggleColumnVisibility = (columnKey: ColumnKey) => {
    if (columnKey === 'numero') return;

    setHiddenColumns(current => {
      const next = new Set(current);

      if (next.has(columnKey)) {
        const orderedVisibleKeys = allConfigurableColumns.filter(({ key }) => !next.has(key)).map(({ key }) => key);
        if (orderedVisibleKeys.length >= maxColumns) {
          const removableKey = [...orderedVisibleKeys].reverse().find(key => key !== 'numero');
          if (removableKey) next.add(removableKey);
        }
        next.delete(columnKey);
        return next;
      }

      next.add(columnKey);
      return next;
    });
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setManualField = (field: keyof ManualArticleFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setManualArticleForm(prev => ({ ...prev, [field]: e.target.value }));

  const canSubmitStep1 = form.proveedorId && form.fechaOC && form.montoTotal && Number(form.montoTotal) > 0;
  const canAddManualArticle = manualArticleForm.codigoSAP.trim() && manualArticleForm.descripcion.trim() && Number(manualArticleForm.cantidadSolicitada) > 0;

  const validateRows = (text: string): ImportedRow[] => {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length <= 1) return [];

    const body = lines[0].toLowerCase().includes('codigosap') || lines[0].toLowerCase().includes('codigo')
      ? lines.slice(1)
      : lines;
    const seenCodes = new Set<string>();

    return body.map((line, index) => {
      const cells = line.split(/\t|;/).map(cell => cell.trim());
      const [codigoSAP = '', descripcion = '', cantidad = '', um = '', ume = '', equivalencia = '', linea = '', precioUnitario = '', observaciones = ''] = cells;
      const cantidadValue = Number(cantidad);
      const equivalenciaValue = Number(equivalencia);
      const precioValue = Number(precioUnitario);

      let status: ValidationStatus = 'Válido';
      let detail = 'Fila lista para importar.';

      if (!codigoSAP || !descripcion || !um || !ume || !Number.isFinite(cantidadValue) || cantidadValue <= 0) {
        status = 'Con error';
        detail = 'Faltan datos obligatorios o la cantidad es inválida.';
      } else if (seenCodes.has(codigoSAP)) {
        status = 'Duplicado';
        detail = 'Código repetido dentro del mismo lote.';
      } else if (!Number.isFinite(equivalenciaValue) || equivalenciaValue <= 0) {
        status = 'Con error';
        detail = 'Equivalencia faltante o inválida.';
      } else if (um !== ume) {
        status = 'Con advertencia';
        detail = 'UM y UME difieren. Requiere revisión logística.';
      } else if (!Number.isFinite(precioValue) || precioValue <= 0) {
        status = 'Con advertencia';
        detail = 'No se recibió precio unitario. Se cargará en 0.';
      }

      seenCodes.add(codigoSAP);

      return {
        id: `import_${index}_${codigoSAP || Date.now()}`,
        codigoSAP,
        descripcion,
        cantidadSolicitada: Number.isFinite(cantidadValue) ? cantidadValue : 0,
        um: um || 'Kg',
        ume: ume || um || 'Kg',
        equivalencia: Number.isFinite(equivalenciaValue) ? equivalenciaValue : 0,
        linea: linea || 'LCA',
        precioUnitario: Number.isFinite(precioValue) ? precioValue : 0,
        observaciones,
        status,
        detail,
      };
    });
  };

  const createCarpeta = (rows: ImportedRow[], options?: { openArticles?: boolean }) => {
    const prov = PROVEEDORES.find(p => p.id === form.proveedorId)!;
    const isMassiveCreation = creationMode === 'massive';
    const loteImportacion = isMassiveCreation && rows.length > 0 ? `IMP-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}` : undefined;
    const newCarpeta: Carpeta = {
      id: `c_${Date.now()}`,
      numero: nextNumero(carpetasList),
      fechaOC: form.fechaOC,
      proveedorId: form.proveedorId,
      pedidoSAP45: form.pedidoSAP45,
      montoTotal: Number(form.montoTotal),
      moneda: form.moneda,
      estado: 'Pendiente de embarque',
      incoterm: form.incoterm,
      condPago: form.condPago,
      referenciaProveedor: '',
      controlConforme: false,
      observaciones: form.observaciones,
      fechaEmbarqueEst: '',
      coeficienteEst: 1.50,
      coeficienteReal: null,
      vep: 0,
      gastosTerminal: 0,
      honorariosDespachante: 0,
      articulos: rows.map(row => ({
        id: `art_${row.id}`,
        codigoSAP: row.codigoSAP,
        descripcion: row.descripcion,
        linea: row.linea,
        cantidadSolicitada: row.cantidadSolicitada,
        um: row.um,
        ume: isMassiveCreation ? row.ume : undefined,
        equivalencia: isMassiveCreation ? row.equivalencia : undefined,
        precioUnitario: row.precioUnitario,
        cantidadAsignada: 0,
        origenCarga: isMassiveCreation ? 'Carga masiva' : 'Manual',
        estadoValidacion: isMassiveCreation ? row.status : undefined,
        observacionesImportacion: isMassiveCreation ? row.detail : undefined,
        loteImportacion,
      })),
      subcarpetas: [],
      ultimoHito: isMassiveCreation && rows.length > 0
        ? `Importación masiva validada · ${rows.length} artículo(s) listos para seguimiento`
        : rows.length > 0
        ? `Carpeta creada · ${rows.length} artículo(s) cargados manualmente`
        : `Carpeta creada · Proveedor: ${prov.nombre}`,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    onCreateCarpeta(newCarpeta);

    if (options?.openArticles) {
      handleClose();
      onSelectCarpeta(newCarpeta.id, 'articulos');
      return;
    }

    setCreated(newCarpeta);
    setAcceptedRows(rows);
    setImportBatchLabel(loteImportacion ?? 'Carga manual');
    setStep((creationMode === 'massive' ? 5 : 4) as WizardStep);
  };

  const handleProcessImport = () => {
    const rows = validateRows(massiveText);
    setImportedRows(rows);
  };

  const handleReviewImportInArticles = () => {
    createCarpeta(importableRows, { openArticles: true });
  };

  const handleDownloadTemplate = () => {
    const worksheet = utils.aoa_to_sheet([
      ['codigoSAP', 'descripcion', 'cantidad', 'um', 'ume', 'equivalencia', 'linea', 'precioUnitario', 'observaciones'],
      ['1000234', 'Papel Estucado Brillante 115g/m2', 50000, 'Kg', 'Kg', 1, 'LCA', 1.42, 'OC completa'],
      ['1000235', 'Papel Estucado Mate 130g/m2', 30000, 'Kg', 'Kg', 1, 'LCA', 1.58, 'Entrega parcial permitida'],
      ['2000118', 'Vinilo Transparente Gloss 100µm', 8000, 'M2', 'Bobina', 125, 'LCA', 4.10, 'Revisar equivalencia logística'],
    ]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Carga masiva');
    writeFileXLSX(workbook, 'plantilla-carga-masiva-articulos.xlsx');
  };

  const processSelectedFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<(string | number)[]>(firstSheet, { header: 1, defval: '' });
    const text = rows.map(row => row.map(cell => String(cell ?? '')).join('\t')).join('\n');
    setMassiveText(text);
    setUploadedFile(file);
    setUploadedFileName(file.name);
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await processSelectedFile(file);
    } catch {
      alert('No se pudo leer el archivo seleccionado.');
    } finally {
      event.target.value = '';
    }
  };

  const handleDropFile = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    try {
      await processSelectedFile(file);
    } catch {
      alert('No se pudo leer el archivo seleccionado.');
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileName('');
    setMassiveText('');
  };

  const handleDownloadUploadedFile = () => {
    if (!uploadedFile) return;
    const url = URL.createObjectURL(uploadedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = uploadedFile.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleCreateManualAndOpen = () => {
    const prov = PROVEEDORES.find(p => p.id === form.proveedorId)!;
    const newCarpeta: Carpeta = {
      id: `c_${Date.now()}`,
      numero: nextNumero(carpetasList),
      fechaOC: form.fechaOC,
      proveedorId: form.proveedorId,
      pedidoSAP45: form.pedidoSAP45,
      montoTotal: Number(form.montoTotal),
      moneda: form.moneda,
      estado: 'Pendiente de embarque',
      incoterm: form.incoterm,
      condPago: form.condPago,
      referenciaProveedor: '',
      controlConforme: false,
      observaciones: form.observaciones,
      fechaEmbarqueEst: '',
      coeficienteEst: 1.50,
      coeficienteReal: null,
      vep: 0,
      gastosTerminal: 0,
      honorariosDespachante: 0,
      articulos: [],
      subcarpetas: [],
      ultimoHito: `Carpeta creada · Lista para carga manual de artículos · ${prov.nombre}`,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    onCreateCarpeta(newCarpeta);
    handleClose();
    onSelectCarpeta(newCarpeta.id);
  };

  const handleAddManualArticle = () => {
    if (!canAddManualArticle) return;

    const newArticle: ImportedRow = {
      id: `manual_${Date.now()}`,
      codigoSAP: manualArticleForm.codigoSAP.trim(),
      descripcion: manualArticleForm.descripcion.trim(),
      cantidadSolicitada: Number(manualArticleForm.cantidadSolicitada),
      um: manualArticleForm.um,
      ume: manualArticleForm.um,
      equivalencia: 1,
      linea: manualArticleForm.linea,
      precioUnitario: Number(manualArticleForm.precioUnitario) || 0,
      observaciones: '',
      status: 'Válido',
      detail: 'Carga manual inicial.',
    };

    setManualArticles(prev => [...prev, newArticle]);
    setManualArticleForm(EMPTY_MANUAL_ARTICLE_FORM);
  };

  const handleCreateManualWithArticles = () => {
    createCarpeta(manualArticles);
  };

  const handleSkipArticles = () => {
    createCarpeta([]);
  };

  const handleOpenWizard = () => {
    setCreationMode('manual');
    setMassiveText('');
    setUploadedFileName('');
    setUploadedFile(null);
    setIsDragActive(false);
    setManualArticles([]);
    setManualArticleForm(EMPTY_MANUAL_ARTICLE_FORM);
    setShowModal(true);
    setStep(1);
  };

  const handleClose = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setStep(1);
    setCreated(null);
    setCreationMode('manual');
    setMassiveText('');
    setImportedRows([]);
    setAcceptedRows([]);
    setImportBatchLabel('');
    setUploadedFileName('');
    setUploadedFile(null);
    setIsDragActive(false);
    setManualArticles([]);
    setManualArticleForm(EMPTY_MANUAL_ARTICLE_FORM);
  };

  const handleOpenDetail = () => {
    if (created) {
      handleClose();
      onSelectCarpeta(created.id);
    }
  };

  return (
    <div style={{ ...pageShell, background: MINT_WASH, borderRadius: 24 }}>

      <WelcomeBanner
        title="Carpetas"
        subtitle="Operaciones activas"
        actions={
          <>
            <AppButton variant="secondary">Exportar</AppButton>
            {!hideImportes && (
              <AppButton onClick={handleOpenWizard} icon={<Plus size={14} />}>Nueva Carpeta</AppButton>
            )}
          </>
        }
      />

      {/* Table */}
        <div ref={tableShellRef} style={{ ...tableShell, border: 'none', background: 'transparent', boxShadow: 'none', borderRadius: 0, overflow: 'visible' }}>
          <div style={{ padding: isNarrowViewport ? '10px 12px' : '12px 14px', background: 'transparent', display: 'grid', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {activeContextChips.map(chip => (
                    <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 24, padding: '4px 10px', borderRadius: 9999, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, fontSize: 11, color: MUTED, fontWeight: 600 }}>
                      {chip}
                    </span>
                  ))}
                </div>
                {activeContextChips.length > 0 && (
                  <span style={{ fontSize: 11, color: MUTED }}>
                    Ajustá la búsqueda o los filtros para ampliar el listado.
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'start', gap: 8 }}>
              <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por Carpeta, Proveedor o Código SAP" searchAriaLabel="Buscar carpetas" options={estadoFilterOptions} value={estadoFilter} onValueChange={setEstadoFilter} expanded={showMobileFilters} onExpandedChange={setShowMobileFilters} getOptionCount={value => value === 'Todos' ? carpetasList.length : (estadoCounts[value] ?? 0)} />
              {useCompactTableLayout ? (
                <AppButton aria-label="Campos" title="Campos" variant="secondary" size="sm" icon={<SlidersHorizontal size={14} />} onClick={() => setColumnsDrawerOpen(true)} style={{ flexShrink: 0, justifySelf: 'end' }} />
              ) : (
                <AppButton aria-label="Campos" title="Campos" variant="secondary" size="sm" icon={<SlidersHorizontal size={14} />} onClick={() => setColumnsDrawerOpen(true)} style={{ flexShrink: 0, justifySelf: 'end' }}>
                  Campos
                </AppButton>
              )}
            </div>
          </div>
          <div style={{ ...tableScrollArea, maxHeight: availableScrollAreaHeight, overflowY: 'hidden' }}>
            {useCompactTableLayout ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {paginatedRows.map((c, i) => {
                  const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                  const isCritical = c.subcarpetas.some(s => s.canalAduana === 'Rojo' || s.incidencias.length > 0);
                  const rowStatusColor = getEstadoColor(c.estado);
                  const hasSubs = c.subcarpetas.length > 0;

                  return (
                    <SurfaceCard key={c.id} as="article" style={{ margin: '6px 10px', borderColor: GREEN_HAIRLINE, boxShadow: 'none', borderRadius: 10 }}>
                      {/* Parent row */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isNarrowViewport ? 'minmax(0, 1fr) 20px' : 'minmax(0, 1fr) auto',
                          alignItems: 'start',
                          gap: 10,
                          width: '100%',
                          padding: isNarrowViewport ? '10px 16px 10px 12px' : '10px 12px',
                          background: CANVAS,
                        }}
                      >
                        <div onClick={() => onSelectCarpeta(c.id)} style={{ minWidth: 0, cursor: 'pointer', display: 'grid', gap: 6 }}>
                          <div style={{ display: 'grid', gap: 3 }}>
                            <span style={{ fontSize: 9.5, lineHeight: 1, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase' }}>
                              Carpeta
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{c.numero}</span>
                              {hasSubs && <span style={{ fontSize: 11, color: MUTED }}>{c.subcarpetas.length} embarque{c.subcarpetas.length > 1 ? 's' : ''}</span>}
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: hideImportes ? '1fr' : (isNarrowViewport ? 'minmax(0, 1fr) max-content' : 'repeat(2, minmax(0, 1fr))'), alignItems: 'start', columnGap: isNarrowViewport ? 12 : 8, rowGap: 8 }}>
                            <div style={{ display: 'grid', gap: 3, minWidth: 0 }}>
                              <span style={{ fontSize: 9.5, lineHeight: 1, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase' }}>
                                Proveedor
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, fontSize: 12, color: INK, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{prov?.nombre || '—'}</span>
                                {prov?.pais && <CountryFlag country={prov.pais} />}
                              </span>
                            </div>
                            {!hideImportes && (
                              <div style={{ display: 'grid', gap: 3, minWidth: 0, justifyItems: isNarrowViewport ? 'end' : 'start', textAlign: isNarrowViewport ? 'right' : 'left' }}>
                                <span style={{ fontSize: 9.5, lineHeight: 1, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase' }}>
                                  Monto OC
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 500, color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>{getCurrencySymbol(c.moneda)} {c.montoTotal.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span onClick={() => onSelectCarpeta(c.id)} style={{ width: isNarrowViewport ? 20 : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', alignSelf: 'center' }}>
                          <ChevronRight size={14} style={{ color: '#98a2b3', flexShrink: 0 }} />
                        </span>
                      </div>
                      {/* Sub-carpetas */}
                      {hasSubs && (
                        <div style={{ display: 'grid', gridTemplateColumns: c.subcarpetas.length === 1 ? '1fr' : c.subcarpetas.length === 2 ? (isNarrowViewport ? '1fr' : 'repeat(2, minmax(0, 1fr))') : isNarrowViewport ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 0, padding: '4px 0', background: '#fafefd', borderTop: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>
                          {c.subcarpetas.map((sub, subIndex) => (
                            <Fragment key={sub.id}>
                            <SubcarpetaLine
                              sub={sub}
                              onClick={() => onSelectSubcarpeta ? onSelectSubcarpeta(c.id, sub.id) : onSelectCarpeta(c.id, 'general')}
                              compact={isNarrowViewport}
                              mobileStacked={isNarrowViewport}
                              fullWidth={c.subcarpetas.length === 1}
                              showDivider={!isNarrowViewport && subIndex % (c.subcarpetas.length === 2 ? 2 : 3) !== 0}
                              showMobileDivider={isNarrowViewport && subIndex > 0}
                            />
                            {false && (
                            <SubcarpetaMiniCard
                              sub={sub}
                              onClick={() => onSelectSubcarpeta ? onSelectSubcarpeta(c.id, sub.id) : onSelectCarpeta(c.id, 'general')}
                              width={166}
                            >
                              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{sub.numero}</span>
                              <NeonBadge estado={sub.estado as any} size="xs" />
                              <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED }}>ETA {sub.eta || '—'}</span>
                              <ChevronRight size={12} style={{ color: '#98a2b3' }} />
                            </SubcarpetaMiniCard>
                            )}
                            </Fragment>
                          ))}
                        </div>
                      )}
                    </SurfaceCard>
                  );
                })}
              </div>
            ) : (
              <table style={{ ...getResponsiveTableStyle(hideImportes ? 780 : 920), tableLayout: 'auto', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead style={{ display: 'none' }}>
                  <tr style={tableHeadRow}>
                    {visibleColumns.map(column => {
                      const isActive = column.sortKey ? sortConfig?.key === column.sortKey : false;
                      const ariaSort = isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none';

                      return (
                        <th key={column.key} style={{ ...tableHeadCell, position: 'sticky', top: 0, zIndex: 12, background: '#fafbfd', boxShadow: 'inset 0 -1px 0 #eaecf0' }} aria-sort={ariaSort}>
                          {column.sortKey ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(column.sortKey!)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'start',
                                gap: 6,
                                padding: 0,
                                border: 'none',
                                background: 'transparent',
                                color: isActive ? GREEN : MUTED,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <span>{column.label}</span>
                              {isActive ? (
                                sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                              ) : (
                                <ArrowUpDown size={13} style={{ opacity: 0.7 }} />
                              )}
                            </button>
                          ) : (
                            <span style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>{column.label}</span>
                          )}
                        </th>
                      );
                    })}
                    {showRowAction && <th style={{ ...tableHeadCell, width: 40, padding: '10px 8px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 12, background: '#fafbfd', boxShadow: 'inset 0 -1px 0 #eaecf0' }} />}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((c) => {
                    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                    const desktopColumnCount = visibleColumns.length + (showRowAction ? 1 : 0);
                    const hasSubs = c.subcarpetas.length > 0;
                    const inlineColumns = visibleColumns.filter(column => column.key !== 'ultimoHito');
                    const hitoColumn = visibleColumns.find(column => column.key === 'ultimoHito');
                    const inlineGridColumns = `${inlineColumns.map(column => {
                      if (column.key === 'numero') return 'minmax(150px, 0.9fr)';
                      if (column.key === 'proveedor') return 'minmax(230px, 1.35fr)';
                      if (column.key === 'lastUpdate') return 'minmax(110px, 0.8fr)';
                      return 'minmax(130px, 1fr)';
                    }).join(' ')}${showRowAction ? ' 20px' : ''}`;

                    return (
                      <tr key={c.id}>
                        <td colSpan={desktopColumnCount} style={{ padding: '5px 10px' }}>
                          <div style={{ border: `1px solid ${GREEN_HAIRLINE}`, borderRadius: radius.lg, background: CANVAS, overflow: 'hidden' }}>
                            <div
                              onClick={() => onSelectCarpeta(c.id)}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: inlineGridColumns,
                                alignItems: 'start',
                                columnGap: 22,
                                rowGap: 10,
                                padding: '14px 16px 12px',
                                background: 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              {inlineColumns.map(column => (
                                <div key={column.key} style={{ minWidth: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', gap: 4, alignContent: 'start', justifyItems: 'start', textAlign: 'left' }}>
                                  <span style={{ fontSize: 9.5, lineHeight: 1, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase', width: '100%' }}>
                                    {column.label}
                                  </span>
                                  <div style={{ minWidth: 0, width: '100%' }}>
                                    {column.render(c, prov?.nombre || '', prov?.pais || '')}
                                  </div>
                                </div>
                              ))}
                              {showRowAction && (
                                <span style={{ width: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center', alignSelf: 'center' }}>
                                  <ChevronRight size={15} style={{ color: '#98a2b3' }} />
                                </span>
                              )}
                            </div>
                            {hitoColumn && (
                              <div onClick={() => onSelectCarpeta(c.id)} style={{ padding: '0 16px 14px', cursor: 'pointer' }}>
                                <div style={{ display: 'grid', gap: 4, padding: '10px 12px', background: 'rgba(29, 29, 31, 0.04)', borderRadius: 8 }}>
                                  <span style={{ fontSize: 9.5, lineHeight: 1, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase' }}>{hitoColumn.label}</span>
                                  <div style={{ fontSize: 12, lineHeight: 1.35, color: INK }}>{c.ultimoHito}</div>
                                </div>
                              </div>
                            )}
                            {hasSubs && (
                              <div style={{ display: 'grid', gridTemplateColumns: c.subcarpetas.length === 1 ? '1fr' : c.subcarpetas.length === 2 ? 'repeat(2, minmax(0, 1fr))' : tableShellWidth < 880 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 0, padding: '4px 0', background: '#fafefd', borderTop: `1px solid ${GREEN_HAIRLINE_SOFT}` }}>
                                {c.subcarpetas.map((sub, subIndex) => (
                                  <SubcarpetaLine key={sub.id} sub={sub} onClick={() => onSelectSubcarpeta ? onSelectSubcarpeta(c.id, sub.id) : onSelectCarpeta(c.id, 'general')} compact={tableShellWidth < 880} fullWidth={c.subcarpetas.length === 1} mobileStacked={false} showDivider={c.subcarpetas.length > 1 && ((c.subcarpetas.length === 2 || tableShellWidth < 880) ? subIndex % 2 !== 0 : subIndex % 3 !== 0)} />
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {false && paginatedRows.map((c, i) => {
                    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                    const isCritical = c.subcarpetas.some(s => s.canalAduana === 'Rojo' || s.incidencias.length > 0);
                    const rowStatusColor = getEstadoColor(c.estado);
                    const desktopColumnCount = visibleColumns.length + (showRowAction ? 1 : 0);
                    const hasSubs = c.subcarpetas.length > 0;
                    return (
                      <Fragment key={c.id}>
                      <tr
                        onClick={() => onSelectCarpeta(c.id)}
                        style={{ background: isCritical ? 'rgba(196,0,26,0.03)' : CANVAS, cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                        onMouseLeave={e => (e.currentTarget.style.background = isCritical ? 'rgba(196,0,26,0.03)' : CANVAS)}
                      >
                        {visibleColumns.map((column, columnIndex) => (
                          <td key={column.key} style={{ padding: '8px 14px', maxWidth: column.key === 'ultimoHito' ? 240 : undefined, borderTop: `1px solid ${HAIRLINE}`, borderBottom: hasSubs ? 'none' : `1px solid ${HAIRLINE}`, borderLeft: columnIndex === 0 ? `1px solid ${isCritical ? 'rgba(196,0,26,0.32)' : HAIRLINE}` : 'none', borderRight: !showRowAction && columnIndex === visibleColumns.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                            {column.render(c, prov?.nombre || '', prov?.pais || '')}
                          </td>
                        ))}
                        {showRowAction && (
                          <td style={{ width: 40, padding: '8px 8px', textAlign: 'center', verticalAlign: 'middle', borderTop: `1px solid ${HAIRLINE}`, borderBottom: hasSubs ? 'none' : `1px solid ${HAIRLINE}`, borderRight: `1px solid ${HAIRLINE}` }}>
                            <ChevronRight size={15} style={{ color: '#98a2b3' }} />
                          </td>
                        )}
                      </tr>
                      {hasSubs && (
                        <tr
                          key={`${c.id}-subcards`}
                          style={{
                            background: '#fafbfd',
                            borderBottom: i < paginatedRows.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                          }}
                        >
                          <td colSpan={desktopColumnCount} style={{ padding: 0, borderLeft: `1px solid ${isCritical ? 'rgba(196,0,26,0.32)' : HAIRLINE}`, borderRight: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0, padding: '6px 0', background: '#fafbfd', borderTop: `1px solid ${HAIRLINE}` }}>
                              {c.subcarpetas.map((sub, subIndex) => (
                                <SubcarpetaLine
                                  key={sub.id}
                                  sub={sub}
                                  onClick={() => onSelectCarpeta(c.id, 'general')}
                                  showDivider={subIndex % 3 !== 0}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{sub.numero}</span>
                                    <ChevronRight size={13} style={{ color: '#98a2b3', flexShrink: 0 }} />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
                                    <NeonBadge estado={sub.estado as any} size="xs" />
                                  </div>
                                  <div style={{ display: 'grid', gap: 4, alignSelf: 'end' }}>
                                    <span style={{ fontSize: 11, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {sub.transporte || 'Embarque'} · {sub.contenedores || 0} cont.
                                    </span>
                                    <span style={{ fontSize: 11, color: MUTED, whiteSpace: 'nowrap' }}>ETA {sub.eta || '—'}</span>
                                  </div>
                                </SubcarpetaLine>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                      {false && hasSubs && c.subcarpetas.map((sub, subIndex) => (
                        <tr
                          key={sub.id}
                          onClick={() => onSelectCarpeta(c.id, 'general')}
                          style={{
                            background: '#fafbfd',
                            borderBottom: subIndex === c.subcarpetas.length - 1 && i < paginatedRows.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f3f6f4')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#fafbfd')}
                        >
                          <td colSpan={desktopColumnCount} style={{ padding: '5px 14px 5px 48px', position: 'relative' }}>
                            {/* Vertical tree line */}
                            <div style={{ position: 'absolute', left: 28, top: 0, bottom: subIndex === c.subcarpetas.length - 1 ? '50%' : 0, width: 1, background: HAIRLINE }} />
                            {/* Horizontal tree connector */}
                            <div style={{ position: 'absolute', left: 28, top: '50%', width: 12, height: 1, background: HAIRLINE }} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 0.8fr) minmax(150px, 1fr) minmax(110px, 0.7fr) auto', alignItems: 'center', gap: 16, padding: '10px 12px', background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 12, boxShadow: '0 2px 7px rgba(16,24,40,0.05)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{sub.numero}</span>
                                <NeonBadge estado={sub.estado as any} size="xs" />
                              </div>
                              <span style={{ fontSize: 11, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sub.transporte || 'Embarque'} · {sub.contenedores || 0} cont.
                              </span>
                              <span style={{ fontSize: 11, color: MUTED, whiteSpace: 'nowrap' }}>ETA {sub.eta || '—'}</span>
                              <ChevronRight size={13} style={{ color: '#98a2b3', justifySelf: 'end' }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {sortedFiltered.length === 0 && (
            <SurfaceCard style={{ margin: '8px 10px 2px', padding: '32px 24px', boxShadow: 'none', borderColor: GREEN_HAIRLINE, background: '#fcfdfd' }}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 9999, background: 'rgba(29, 29, 31, 0.05)', color: MUTED }}>
                  <AlertTriangle size={20} />
                </span>
                <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>No se encontraron carpetas</div>
                <div style={{ maxWidth: 420, fontSize: 12, lineHeight: 1.45, color: MUTED }}>
                  Probá cambiando la búsqueda o ajustando los filtros para ampliar el resultado.
                </div>
              </div>
            </SurfaceCard>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isNarrowViewport ? '1fr' : 'minmax(180px, 1fr) auto', alignItems: 'center', gap: isNarrowViewport ? 8 : 12, padding: isNarrowViewport ? '8px 12px 10px' : '10px 14px 12px', background: 'transparent' }}>
            <div style={{ fontSize: 12, color: MUTED }}>
              {sortedFiltered.length} activas · {paginatedRows.length} visibles · mostrando {sortedFiltered.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + paginatedRows.length, sortedFiltered.length)}
            </div>
            {sortedFiltered.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isNarrowViewport ? 4 : 6, flexWrap: 'wrap' }}>
                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPageSafe === 1}
                  aria-label="Página anterior"
                  icon={!isNarrowViewport ? <ChevronLeft size={14} /> : undefined}
                  style={{
                    minWidth: isNarrowViewport ? 34 : 92,
                    minHeight: isNarrowViewport ? 30 : 34,
                    padding: isNarrowViewport ? '0 10px' : '0 12px',
                    borderRadius: 8,
                    color: currentPageSafe === 1 ? '#98a2b3' : INK,
                  }}
                >
                  {isNarrowViewport ? 'Ant.' : 'Anterior'}
                </AppButton>
                {visiblePageNumbers.map((pageNumber, index) => {
                  const previous = visiblePageNumbers[index - 1];
                  const showGap = previous && pageNumber - previous > 1;

                  return (
                    <span key={pageNumber} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {showGap && <span style={{ fontSize: 12, color: MUTED }}>...</span>}
                      <AppButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        style={{
                          minWidth: isNarrowViewport ? 30 : 34,
                          minHeight: isNarrowViewport ? 30 : 34,
                          padding: isNarrowViewport ? '0 8px' : '0 10px',
                          borderRadius: 8,
                          background: currentPageSafe === pageNumber ? '#eef2f1' : CANVAS,
                          borderColor: currentPageSafe === pageNumber ? GREEN_HAIRLINE : color.borderTint,
                          color: currentPageSafe === pageNumber ? INK : MUTED,
                          fontWeight: currentPageSafe === pageNumber ? 700 : 600,
                        }}
                      >
                        {pageNumber}
                      </AppButton>
                    </span>
                  );
                })}
                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPageSafe === totalPages}
                  aria-label="Página siguiente"
                  icon={!isNarrowViewport ? <ChevronRight size={14} /> : undefined}
                  style={{
                    minWidth: isNarrowViewport ? 34 : 92,
                    minHeight: isNarrowViewport ? 30 : 34,
                    padding: isNarrowViewport ? '0 10px' : '0 12px',
                    borderRadius: 8,
                    color: currentPageSafe === totalPages ? '#98a2b3' : INK,
                  }}
                >
                  {isNarrowViewport ? 'Sig.' : 'Siguiente'}
                </AppButton>
              </div>
            )}
          </div>
      </div>

      {/* Columns Drawer */}
      {columnsDrawerOpen && (
        <>
          <div onClick={() => setColumnsDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 280 }} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="columns-drawer-title"
            style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(320px, 85vw)',
            background: '#fbfbfc', boxShadow: '-8px 0 32px rgba(16,24,40,0.10)',
            zIndex: 281, display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.2s cubic-bezier(0.4,0,0.2,1)',
          }}
          >
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 id="columns-drawer-title" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: INK }}>Campos</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: MUTED }}>Elegí los datos visibles en la card. Hasta {maxColumns} por ancho.</p>
              </div>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="secondary" size="xs" onClick={() => setColumnsDrawerOpen(false)} icon={<X size={14} />} />
            </div>
            <div style={{ padding: '14px 20px 0', fontSize: 12, color: MUTED }}>
              {activeColumnCount} activa{activeColumnCount === 1 ? '' : 's'}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
              <div style={{ display: 'grid' }}>
                {allConfigurableColumns.map(column => {
                  const isHidden = hiddenColumns.has(column.key);
                  const isRequired = column.required;
                  const isVisible = !isHidden;

                  return (
                    <label
                      key={column.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '14px 20px',
                        cursor: isRequired ? 'default' : 'pointer',
                        background: isVisible ? CANVAS : '#fbfbfc',
                        borderBottom: `1px solid ${HAIRLINE}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        disabled={isRequired}
                        onChange={() => toggleColumnVisibility(column.key)}
                        aria-label={`Mostrar campo ${column.label}`}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: GREEN, cursor: isRequired ? 'default' : 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{column.label}</div>
                          <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>
                            {isRequired ? 'Fija' : isVisible ? 'Visible' : 'Oculta'}
                          </span>
                        </div>
                        <div style={{ marginTop: 3, fontSize: 11, color: MUTED }}>{column.hint}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <AppButton variant="secondary" size="sm" onClick={() => setHiddenColumns(new Set(DEFAULT_HIDDEN_COLUMNS))} style={{ flex: 1 }}>
                Restablecer
              </AppButton>
              <AppButton size="sm" onClick={() => setColumnsDrawerOpen(false)} style={{ flex: 1 }}>
                Listo
              </AppButton>
            </div>
          </aside>
        </>
      )}

      {/* Nueva Carpeta Modal */}
      {showModal && (
        <div style={{ ...modalOverlay, zIndex: 300 }}>
          <div style={{ ...getModalShellStyle(720), borderRadius: isNarrowViewport ? 16 : 24, height: 'min(760px, calc(100vh - 16px))', margin: isNarrowViewport ? '0 8px' : '0 16px', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ ...modalHeader, padding: `${isNarrowViewport ? 18 : 22}px ${modalHorizontalPadding}px ${isNarrowViewport ? 14 : 18}px` }}>
              <div>
                <h2 style={{ fontSize: isNarrowViewport ? 18 : 20, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                  {step === 1 && 'Nueva Carpeta de Importación'}
                  {step === 2 && (creationMode === 'massive' ? 'Carga masiva de artículos' : 'Carga manual de artículos')}
                  {step === 3 && 'Carga de artículos'}
                  {step === 4 && (creationMode === 'massive' ? 'Validación previa' : `Carpeta ${created?.numero}`)}
                  {step === 5 && `Carpeta ${created?.numero}`}
                </h2>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                  {stepLabel}
                </div>
              </div>
              <button onClick={handleClose} style={modalCloseButton}>
                <X size={15} style={{ color: MUTED }} />
              </button>
            </div>

            {step < (creationMode === 'manual' ? 4 : 5) && (
              <div style={{ padding: `${isNarrowViewport ? 14 : 18}px ${modalHorizontalPadding}px 0`, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: isNarrowViewport ? 4 : 6, width: '100%' }}>
                  {wizardSteps.map(item => {
                    const active = item.id === step;
                    const completed = item.id < step;
                    return (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: isNarrowViewport ? 5 : 6, flex: item.id < wizardSteps.length ? 1 : '0 0 auto', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: isNarrowViewport ? 4 : 6, minWidth: 0 }}>
                          <div style={{ width: isNarrowViewport ? 20 : 22, height: isNarrowViewport ? 20 : 22, borderRadius: '50%', background: completed || active ? GREEN : PARCHMENT, color: completed || active ? '#fff' : MUTED, border: completed || active ? 'none' : `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isNarrowViewport ? 9 : 10, fontWeight: 700, flexShrink: 0 }}>
                            {item.id}
                          </div>
                          {item.id < wizardSteps.length && <div style={{ flex: 1, minWidth: isNarrowViewport ? 4 : 8, height: 2, background: completed ? GREEN : HAIRLINE }} />}
                        </div>
                        <div style={{ fontSize: isNarrowViewport ? 9 : 10, lineHeight: 1.2, fontWeight: active ? 700 : 500, color: active || completed ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1 - form */}
            {step === 1 && (
              <div style={{ padding: modalSectionPadding, display: 'flex', flexDirection: 'column', gap: isNarrowViewport ? 14 : 18, flex: '1 1 auto', minHeight: 0, justifyContent: 'space-between', overflowY: 'auto' }}>

                {/* Proveedor */}
                <div>
                  <label style={fieldLabel}>PROVEEDOR *</label>
                  <select
                    value={form.proveedorId}
                    onChange={set('proveedorId')}
                    style={{ ...modalPrimarySelectStyle, color: form.proveedorId ? INK : MUTED, padding: '11px 40px 11px 16px' }}
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {PROVEEDORES.map(p => <option key={p.id} value={p.id}>{p.nombre} · {p.pais}</option>)}
                  </select>
                </div>

                {/* Fecha OC */}
                <div>
                  <label style={fieldLabel}>FECHA O/C *</label>
                  <input
                    type="date"
                    value={form.fechaOC}
                    onChange={set('fechaOC')}
                    style={{ ...formInput, minHeight: 44 }}
                  />
                </div>

                {/* Incoterm + Moneda */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabel}>INCOTERM</label>
                    <select value={form.incoterm} onChange={set('incoterm')} style={modalPrimarySelectStyle}>
                      {INCOTERMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>MONEDA</label>
                    <select value={form.moneda} onChange={set('moneda')} style={modalPrimarySelectStyle}>
                      <option value="USD">USD — Dólar</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </div>
                </div>

                {/* Monto + Condición de pago */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabel}>MONTO TOTAL O/C *</label>
                    <input
                      type="number"
                      value={form.montoTotal}
                      onChange={set('montoTotal')}
                      placeholder="0"
                      style={{ ...formInput, minHeight: 44 }}
                    />
                  </div>
                  <div>
                    <label style={fieldLabel}>CONDICIÓN DE PAGO</label>
                    <select value={form.condPago} onChange={set('condPago')} style={modalPrimarySelectStyle}>
                      {CONDICIONES_PAGO.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label style={fieldLabel}>OBSERVACIONES INICIALES</label>
                  <textarea
                    value={form.observaciones}
                    onChange={set('observaciones')}
                    rows={2}
                    placeholder="Notas de apertura, condiciones especiales..."
                    style={formTextarea}
                  />
                </div>

                {/* Actions */}
                <div style={modalFooter}>
                  <button onClick={handleClose} style={getModalSecondaryButtonStyle()}>
                    Cancelar
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canSubmitStep1}
                    style={getModalPrimaryButtonStyle(canSubmitStep1)}
                  >
                    Guardar y continuar
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ padding: modalSectionPadding, display: 'flex', flexDirection: 'column', gap: isNarrowViewport ? 14 : 18, flex: '1 1 auto', minHeight: 0, justifyContent: 'space-between', overflowY: 'auto' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Decisión de carga</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 14 }}>Elegí el modo de carga de artículos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {LOAD_MODE_OPTIONS.map(option => {
                      const selected = creationMode === option.value;
                      return (
                        <label
                          key={option.value}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '10px 0',
                            color: INK,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="creation-mode"
                            checked={selected}
                            onChange={() => setCreationMode(option.value)}
                            style={{ marginTop: 2, accentColor: GREEN, flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 2 }}>{option.label}</div>
                            <div style={{ fontSize: 12, color: MUTED }}>{option.hint}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ ...modalFooter, flexWrap: 'wrap' }}>
                  <button onClick={() => setStep(1)} style={getModalSecondaryButtonStyle()}>
                    Volver
                  </button>
                  <button
                    onClick={handleSkipArticles}
                    style={{ ...getModalSecondaryButtonStyle(), color: GREEN, borderColor: GREEN }}
                  >
                    Omitir artículos por ahora
                  </button>
                  <button onClick={() => setStep(3)} style={getModalPrimaryButtonStyle(true)}>
                    Continuar con {creationMode === 'massive' ? 'carga masiva' : 'carga manual'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ padding: modalSectionPadding, display: 'flex', flexDirection: 'column', gap: isNarrowViewport ? 14 : 18, flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
                {creationMode === 'manual' ? (
                  <>
                    <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, background: PARCHMENT, padding: '18px 18px 16px', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 14 }}>Agregar artículos ahora</div>

                      <div style={{ ...getAutoFitGridStyle(220, 14), marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>CÓD. SAP *</label>
                          <input value={manualArticleForm.codigoSAP} onChange={setManualField('codigoSAP')} placeholder="1000XXX"
                            style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>DESCRIPCIÓN *</label>
                          <input value={manualArticleForm.descripcion} onChange={setManualField('descripcion')} placeholder="Descripción del artículo"
                            style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: hideImportes ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>LÍNEA</label>
                          <select value={manualArticleForm.linea} onChange={setManualField('linea')} style={modalSecondarySelectStyle}>
                            <option>LCA</option><option>LDA</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>U.M.</label>
                          <select value={manualArticleForm.um} onChange={setManualField('um')} style={modalSecondarySelectStyle}>
                            {['Kg', 'Mill.', 'Unid.', 'Resma', 'm²'].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>CANTIDAD *</label>
                          <input type="number" value={manualArticleForm.cantidadSolicitada} onChange={setManualField('cantidadSolicitada')} placeholder="0"
                            style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                        </div>
                        {!hideImportes && (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>P. UNIT.</label>
                            <input type="number" value={manualArticleForm.precioUnitario} onChange={setManualField('precioUnitario')} placeholder="0.00"
                              style={{ width: '100%', padding: '10px 10px', fontSize: 13, color: INK, background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                        <button onClick={handleAddManualArticle} disabled={!canAddManualArticle} style={{ padding: '11px 18px', background: canAddManualArticle ? GREEN : HAIRLINE, color: canAddManualArticle ? '#fff' : MUTED, border: 'none', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: canAddManualArticle ? 'pointer' : 'default' }}>
                          Agregar artículo
                        </button>
                      </div>
                    </div>

                    <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, overflow: 'hidden', flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '14px 18px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`, fontSize: 14, fontWeight: 600, color: INK }}>
                        Artículos a crear {manualArticles.length > 0 ? `(${manualArticles.length})` : ''}
                      </div>
                      {manualArticles.length === 0 ? (
                        <div style={{ padding: '22px 18px', fontSize: 13, color: MUTED, flex: '1 1 auto' }}>
                          Todavía no agregaste artículos. Podés crear la carpeta igual y completarlos después desde Artículos.
                        </div>
                      ) : (
                        <div style={{ ...tableScrollArea, overflowY: 'auto', minHeight: 0, flex: '1 1 auto' }}>
                          <table style={getResponsiveTableStyle(hideImportes ? 620 : 760)}>
                            <thead>
                              <tr style={{ background: CANVAS, borderBottom: `1px solid ${HAIRLINE}` }}>
                                {['Cód. SAP', 'Descripción', 'Línea', 'Cant.', 'U.M.'].concat(hideImportes ? [] : ['P. Unit.']).map(col => (
                                  <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED }}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {manualArticles.map((row, index) => (
                                <tr key={row.id} style={{ borderBottom: index < manualArticles.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: INK }}>{row.codigoSAP}</td>
                                  <td style={{ padding: '12px 14px', fontSize: 13, color: INK }}>{row.descripcion}</td>
                                  <td style={{ padding: '12px 14px', fontSize: 13, color: MUTED }}>{row.linea}</td>
                                  <td style={{ padding: '12px 14px', fontSize: 13, color: INK }}>{row.cantidadSolicitada.toLocaleString()}</td>
                                  <td style={{ padding: '12px 14px', fontSize: 13, color: MUTED }}>{row.um}</td>
                                  {!hideImportes && <td style={{ padding: '12px 14px', fontSize: 13, color: INK }}>{row.precioUnitario.toFixed(2)}</td>}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap', flexShrink: 0, marginTop: 'auto' }}>
                      <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', background: PARCHMENT, color: MUTED, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 14, cursor: 'pointer' }}>
                        Volver
                      </button>
                      <button onClick={handleSkipArticles} style={{ flex: 1, padding: '12px', background: CANVAS, color: GREEN, border: `1px solid ${GREEN}`, borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Omitir por ahora
                      </button>
                      <button onClick={handleCreateManualWithArticles} style={{ flex: 1.4, padding: '12px', background: GREEN, color: '#ffffff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Crear con artículos
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>Adjuntar archivo</div>
                      <button onClick={handleDownloadTemplate} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 0, borderRadius: 0, border: 'none', background: 'transparent', color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <FileText size={13} /> Descargar plantilla Excel
                      </button>
                    </div>

                    <div
                      onDragOver={event => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragEnter={event => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={event => {
                        event.preventDefault();
                        const nextTarget = event.relatedTarget as Node | null;
                        if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                          setIsDragActive(false);
                        }
                      }}
                      onDrop={handleDropFile}
                      style={{
                        border: `2px dashed ${isDragActive ? GREEN : HAIRLINE}`,
                        borderRadius: 18,
                        background: isDragActive ? 'rgba(26,92,56,0.06)' : PARCHMENT,
                        padding: '18px',
                        transition: 'border-color 0.15s, background 0.15s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                        <div>
                          {uploadedFileName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                              <button onClick={handleDownloadUploadedFile} style={{ padding: 0, background: 'transparent', border: 'none', fontSize: 13, fontWeight: 600, color: '#0066cc', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}>
                                {uploadedFileName}
                              </button>
                              <button onClick={handleRemoveUploadedFile} aria-label="Eliminar archivo" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, padding: 0, borderRadius: 9999, border: 'none', background: 'rgba(196,0,26,0.06)', color: '#c4001a', cursor: 'pointer' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 4 }}>Sin archivo adjunto</div>
                          )}
                          {!uploadedFileName && <div style={{ fontSize: 11, color: MUTED }}>Arrastrá un archivo .xlsx, .xls o .csv o adjuntalo desde tu equipo.</div>}
                        </div>
                        {!uploadedFileName && (
                          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 38, padding: '8px 12px', borderRadius: 9999, border: `1px solid ${GREEN}`, background: CANVAS, color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Upload size={14} /> Adjuntar archivo
                          </button>
                        )}
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelected} style={{ display: 'none' }} />

                    <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap', marginTop: 'auto', flexShrink: 0 }}>
                      <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', background: PARCHMENT, color: MUTED, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 14, cursor: 'pointer' }}>
                        Volver
                      </button>
                      <button onClick={handleSkipArticles} style={{ flex: 1.2, padding: '12px', background: CANVAS, color: GREEN, border: `1px solid ${GREEN}`, borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Omitir por ahora
                      </button>
                      <button
                        onClick={() => {
                          handleProcessImport();
                          setStep(4);
                        }}
                        disabled={massiveText.trim().length === 0 || !uploadedFileName}
                        style={{ flex: 2, padding: '12px', background: massiveText.trim().length > 0 && uploadedFileName ? GREEN : HAIRLINE, color: massiveText.trim().length > 0 && uploadedFileName ? '#ffffff' : MUTED, border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: massiveText.trim().length > 0 && uploadedFileName ? 'pointer' : 'default' }}
                      >
                        Validar artículos
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && creationMode === 'massive' && (
              <div style={{ padding: modalSectionPadding, display: 'flex', flexDirection: 'column', gap: isNarrowViewport ? 14 : 18, flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
                <div style={{ border: `1px solid ${importableRows.length === 0 ? 'rgba(196,0,26,0.28)' : hasBlockingErrors ? 'rgba(180,83,9,0.24)' : 'rgba(26,92,56,0.18)'}`, borderRadius: 18, background: importableRows.length === 0 ? 'rgba(196,0,26,0.05)' : hasBlockingErrors ? 'rgba(180,83,9,0.06)' : 'rgba(26,92,56,0.04)', padding: '24px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14, flex: '1 1 auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: importableRows.length === 0 ? 'rgba(196,0,26,0.14)' : hasBlockingErrors ? 'rgba(180,83,9,0.14)' : 'rgba(26,92,56,0.10)', color: importableRows.length === 0 ? '#c4001a' : hasBlockingErrors ? '#b45309' : GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {importableRows.length === 0 ? <X size={28} strokeWidth={2.4} /> : hasBlockingErrors ? <AlertTriangle size={28} strokeWidth={2.4} /> : <CheckCircle size={28} strokeWidth={2.4} />}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: importableRows.length === 0 ? '#8f0015' : hasBlockingErrors ? '#8a4b08' : GREEN, letterSpacing: '-0.02em' }}>
                    {importableRows.length === 0
                      ? 'El archivo tiene errores'
                      : hasBlockingErrors
                        ? 'Leímos el archivo, con algunos errores'
                        : hasValidationIssues
                          ? 'Archivo listo para continuar'
                          : 'Leímos correctamente el archivo'}
                  </div>
                  <div style={{ fontSize: 13, color: INK, lineHeight: 1.45, maxWidth: 420 }}>
                    {importableRows.length === 0
                      ? 'No se puede crear la carpeta con este archivo.'
                      : hasBlockingErrors
                        ? 'Los artículos con error no se van a cargar.'
                        : hasValidationIssues
                          ? 'La carga quedó bien. Las observaciones se revisan después en Artículos.'
                          : 'Podés crear la carpeta y seguir en Artículos.'}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                    {importableRows.length === 0
                      ? 'Corregí el archivo y validalo de nuevo.'
                      : 'El detalle va a quedar visible dentro de la carpeta.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap', flexShrink: 0 }}>
                  <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', background: PARCHMENT, color: MUTED, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 14, cursor: 'pointer' }}>
                    Volver
                  </button>
                  <button onClick={handleReviewImportInArticles} disabled={importableRows.length === 0} style={{ flex: 1.6, padding: '12px', background: importableRows.length > 0 ? GREEN : HAIRLINE, color: importableRows.length > 0 ? '#ffffff' : MUTED, border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: importableRows.length > 0 ? 'pointer' : 'default' }}>
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 - success */}
            {((creationMode === 'manual' && step === 4) || (creationMode === 'massive' && step === 5)) && created && (
              <div style={{ padding: `${isNarrowViewport ? 24 : 32}px ${modalHorizontalPadding}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isNarrowViewport ? 16 : 20, textAlign: 'center', flex: '1 1 auto', minHeight: 0, justifyContent: 'center', overflowY: 'auto' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,92,56,0.10)', border: `2px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: '-0.374px', marginBottom: 6 }}>{created.numero}</div>
                  <div style={{ fontSize: 15, color: INK, fontWeight: 400, marginBottom: 4 }}>Carpeta creada exitosamente</div>
                  <div style={{ fontSize: 13, color: MUTED }}>
                    {PROVEEDORES.find(p => p.id === created.proveedorId)?.nombre} · {created.moneda} {created.montoTotal.toLocaleString()} · {created.incoterm}
                  </div>
                </div>

                {/* Summary pill row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { label: 'Fecha O/C', value: created.fechaOC },
                    { label: 'Cond. pago', value: created.condPago },
                    { label: 'Artículos', value: String(created.articulos.length) },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '6px 14px', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 12 }}>
                      <span style={{ color: MUTED }}>{item.label}: </span>
                      <span style={{ color: INK, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {created.articulos.length > 0 && (
                  <div style={{ width: '100%', border: `1px solid ${HAIRLINE}`, borderRadius: 18, padding: '18px 20px', background: PARCHMENT, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 10 }}>Resultado de importación</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Lote</div>
                        <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{importBatchLabel}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Filas cargadas</div>
                        <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{acceptedRows.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Con advertencia</div>
                        <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{acceptedRows.filter(row => row.status !== 'Válido').length}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, width: '100%', paddingTop: 4, flexWrap: 'wrap' }}>
                  <button onClick={handleClose} style={{ flex: 1, padding: '12px', background: PARCHMENT, color: MUTED, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 14, cursor: 'pointer' }}>
                    Cerrar
                  </button>
                  <button onClick={handleOpenDetail} style={{ flex: 2, padding: '12px', background: GREEN, color: '#ffffff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Abrir Carpeta →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

