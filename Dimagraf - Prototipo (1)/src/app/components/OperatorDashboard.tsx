import { useEffect, useRef, useState } from 'react';
import { Plus, ChevronRight, CheckCircle, X, Upload, FileText, AlertTriangle, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { fieldLabel, formInput, formTextarea, getAutoFitGridStyle, getModalPrimaryButtonStyle, getModalSecondaryButtonStyle, getResponsiveTableStyle, getModalShellStyle, modalCloseButton, modalFooter, modalHeader, modalOverlay, pageActions, pageHeader, pageShell, tableHeadCell, tableHeadRow, tableScrollArea, tableShell } from './chromeStyles';
import { read, utils, writeFileXLSX } from 'xlsx';
import { PROVEEDORES, getEstadoColor, type EstadoCarpeta, type Carpeta } from './mockData';
import { NeonBadge } from './NeonBadge';
import { useIsMobile } from './ui/use-mobile';
import { AppButton } from './AppButton';
import { normalizeSearchTerm, SearchField } from './SearchField';
import { FilterToolbar } from './FilterToolbar';

const INK       = '#1d1d1f';
const MUTED     = '#6e6e73';
const PARCHMENT = '#f8fafc';
const HAIRLINE  = '#d2d2d7';
const GREEN     = '#1a5c38';
const CANVAS    = '#ffffff';
const SELECT_CHEVRON_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const ESTADO_FILTERS: Array<{ value: EstadoCarpeta | 'Todos'; label: string }> = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Activa', label: 'Pendiente de embarque' },
  { value: 'En Tránsito', label: 'En Tránsito' },
  { value: 'En Aduana', label: 'En Aduana' },
  { value: 'Oficializado', label: 'Oficializado' },
  { value: 'Cerrada', label: 'Cerrada' },
  { value: 'Con Incidencia', label: 'Con incidencia' },
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

const FALLBACK_VIEWPORT_HEIGHT = 900;

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
  onCreateCarpeta: (carpeta: Carpeta) => void;
  hideImportes?: boolean;
}

function nextNumero(carpetasList: Carpeta[]): string {
  const year = new Date().getFullYear();
  const seqs = carpetasList
    .map(c => { const [, s] = c.numero.split('/'); return parseInt(s) || 0; })
    .filter(n => !isNaN(n));
  const next = seqs.length > 0 ? Math.max(...seqs) + 1 : 100;
  return `${year}/${next}`;
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

export function OperatorDashboard({ carpetasList, onSelectCarpeta, onCreateCarpeta, hideImportes = false }: Props) {
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
    counts[carpeta.estado] = (counts[carpeta.estado] ?? 0) + 1;
    return counts;
  }, {});

  const estadoFilterOptions = ESTADO_FILTERS.map(option => ({
    ...option,
    count: option.value === 'Todos' ? carpetasList.length : (estadoCounts[option.value] ?? 0),
  }));

  const filtered = carpetasList.filter(c => {
    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
    const normalizedSearch = normalizeSearchTerm(search);
    const matchSearch = !normalizedSearch || [
      c.numero,
      prov?.nombre,
      ...c.articulos.flatMap(a => [a.codigoSAP, a.descripcion]),
    ].some(value => normalizeSearchTerm(value).includes(normalizedSearch));
    const matchEstado = estadoFilter === 'Todos' || c.estado === estadoFilter;
    return matchSearch && matchEstado;
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
  const tableToolbarHeight = useCompactTableLayout ? 78 : 68;
  const tableHeaderHeight = useCompactTableLayout ? 0 : 44;
  const rowHeight = useCompactTableLayout ? 56 : 46;
  const availableScrollAreaHeight = Math.max(260, tableViewportHeight - paginationFooterHeight - tableToolbarHeight);
  const itemsPerPage = Math.max(4, Math.floor((availableScrollAreaHeight - tableHeaderHeight) / rowHeight));
  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * itemsPerPage;
  const paginatedRows = sortedFiltered.slice(pageStart, pageStart + itemsPerPage);
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(pageNumber => {
    if (totalPages <= 5) return true;
    if (pageNumber === 1 || pageNumber === totalPages) return true;
    return Math.abs(pageNumber - currentPageSafe) <= 1;
  });

  const toggleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }

      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const sortableColumns: Array<{ key: SortKey; label: string }> = [
    { key: 'numero', label: 'CARPETA' },
    { key: 'proveedor', label: 'PROVEEDOR' },
    { key: 'pedidoSAP45', label: 'SAP 45' },
    ...(hideImportes ? [] : [{ key: 'montoTotal' as SortKey, label: 'MONTO TOTAL OC' }]),
    { key: 'ultimoHito', label: 'ÚLTIMO HITO' },
    { key: 'lastUpdate', label: 'ACTUALIZ.' },
  ];
  const visibleSortableColumns = sortableColumns.filter(({ key }) => showUpdateColumn || key !== 'lastUpdate');
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
      estado: 'Activa',
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
      estado: 'Activa',
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
    <div style={pageShell}>

      <div style={{ ...pageHeader, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>Carpetas Activas</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>Control operativo de importaciones</p>
        </div>
        <div style={pageActions}>
          <AppButton variant="secondary">
            Exportar
          </AppButton>
          {!hideImportes && (
            <AppButton
              onClick={handleOpenWizard}
              icon={<Plus size={14} />}
            >
              Nueva Carpeta
            </AppButton>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div ref={tableShellRef} style={tableShell}>
          <div style={{ padding: isNarrowViewport ? '10px 12px' : '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
            <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por Carpeta, Proveedor o Código SAP" searchAriaLabel="Buscar carpetas" options={estadoFilterOptions} value={estadoFilter} onValueChange={setEstadoFilter} expanded={showMobileFilters} onExpandedChange={setShowMobileFilters} getOptionCount={value => value === 'Todos' ? carpetasList.length : (estadoCounts[value] ?? 0)} />
          </div>
          <div style={{ ...tableScrollArea, maxHeight: useCompactTableLayout ? 'none' : availableScrollAreaHeight, overflowY: useCompactTableLayout ? 'visible' : 'auto' }}>
            {useCompactTableLayout ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {paginatedRows.map((c, i) => {
                  const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                  const isCritical = c.estado === 'Con Incidencia' || c.subcarpetas.some(s => s.canalAduana === 'Rojo');
                  const rowStatusColor = getEstadoColor(c.estado);

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCarpeta(c.id)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectCarpeta(c.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir carpeta ${c.numero}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) 16px',
                        columnGap: 8,
                        width: '100%',
                        padding: '6px 12px',
                        border: 'none',
                        borderBottom: i < paginatedRows.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                        background: isCritical ? 'rgba(196,0,26,0.03)' : CANVAS,
                        borderLeft: isCritical ? '3px solid #c4001a' : '3px solid transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 0,
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: hideImportes ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-0.2px', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.numero}</div>
                            <div style={{ fontSize: 11, color: MUTED, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {`SAP ${c.pedidoSAP45 || '—'}`}
                            </div>
                          </div>
                          {!hideImportes && (
                            <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                              {`${getCurrencySymbol(c.moneda)} ${c.montoTotal.toLocaleString()}`}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: hideImportes ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto', alignItems: 'center', gap: 8 }}>
                          <div style={{ minWidth: 0, fontSize: 12, color: INK, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prov?.nombre || '—'} <span style={{ color: rowStatusColor }}>· {c.estado === 'Activa' ? 'Pendiente de embarque' : c.estado}</span></div>
                          {!hideImportes && <div style={{ fontSize: 11, color: MUTED, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'right' }}>{`Modif. ${c.lastUpdate.slice(5)}`}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <ChevronRight size={14} style={{ color: HAIRLINE, flexShrink: 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ ...getResponsiveTableStyle(hideImportes ? 780 : 920), tableLayout: 'auto' }}>
                <thead>
                  <tr style={tableHeadRow}>
                    {visibleSortableColumns.map(({ key, label }) => {
                      const isActive = sortConfig?.key === key;
                      const ariaSort = isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none';

                      return (
                        <th key={key} style={{ ...tableHeadCell, position: 'sticky', top: 0, zIndex: 12, background: '#fafbfd', boxShadow: 'inset 0 -1px 0 #eaecf0' }} aria-sort={ariaSort}>
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
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
                            <span>{label}</span>
                            {isActive ? (
                              sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                            ) : (
                              <ArrowUpDown size={13} style={{ opacity: 0.7 }} />
                            )}
                          </button>
                        </th>
                      );
                    })}
                    {showRowAction && <th style={{ ...tableHeadCell, width: 40, padding: '10px 8px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 12, background: '#fafbfd', boxShadow: 'inset 0 -1px 0 #eaecf0' }} />}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((c, i) => {
                    const prov = PROVEEDORES.find(p => p.id === c.proveedorId);
                    const isCritical = c.estado === 'Con Incidencia' || c.subcarpetas.some(s => s.canalAduana === 'Rojo');
                    const rowStatusColor = getEstadoColor(c.estado);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => onSelectCarpeta(c.id)}
                        style={{ borderBottom: i < paginatedRows.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: isCritical ? 'rgba(196,0,26,0.03)' : CANVAS, cursor: 'pointer', transition: 'background 0.1s', borderLeft: isCritical ? '3px solid #c4001a' : '3px solid transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                        onMouseLeave={e => (e.currentTarget.style.background = isCritical ? 'rgba(196,0,26,0.03)' : CANVAS)}
                      >
                        <td style={{ padding: '8px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.numero}</div></div>
                          <div style={{ marginTop: 2, fontSize: 10, color: rowStatusColor, whiteSpace: 'nowrap' }}>{c.estado === 'Activa' ? 'Pendiente de embarque' : c.estado}</div>
                        </td>
                        <td style={{ padding: '8px 14px' }}>
                          <div style={{ fontSize: 13, color: INK, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prov?.nombre || '—'}</div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 1, lineHeight: 1.2 }}>{prov?.pais || ''}</div>
                        </td>
                        <td style={{ padding: '8px 14px' }}>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pedidoSAP45 || '—'}</div>
                        </td>
                        {!hideImportes && (
                          <td style={{ padding: '8px 14px' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{`${c.moneda} ${c.montoTotal.toLocaleString()}`}</span>
                          </td>
                        )}
                        <td style={{ padding: '8px 14px', maxWidth: 240 }}>
                          <div style={{ fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ultimoHito}</div>
                        </td>
                        {showUpdateColumn && (
                          <td style={{ padding: '8px 14px' }}>
                            <span style={{ fontSize: 11, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{c.lastUpdate.slice(5)}</span>
                          </td>
                        )}
                        {showRowAction && (
                          <td style={{ width: 40, padding: '8px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <ChevronRight size={15} style={{ color: HAIRLINE }} />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {sortedFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 32px', color: MUTED, fontSize: 17 }}>No se encontraron carpetas.</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isNarrowViewport ? '1fr' : 'minmax(180px, 1fr) auto', alignItems: 'center', gap: isNarrowViewport ? 8 : 12, padding: isNarrowViewport ? '8px 12px 10px' : '10px 14px 12px', borderTop: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
            <div style={{ fontSize: 12, color: MUTED }}>
              {sortedFiltered.length} resultado(s) · mostrando {sortedFiltered.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + paginatedRows.length, sortedFiltered.length)}
            </div>
            {sortedFiltered.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isNarrowViewport ? 4 : 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPageSafe === 1}
                  aria-label="Página anterior"
                  style={{
                    minWidth: isNarrowViewport ? 34 : 72,
                    height: isNarrowViewport ? 30 : 34,
                    padding: isNarrowViewport ? '0 10px' : '0 12px',
                    borderRadius: 6,
                    border: `1px solid ${HAIRLINE}`,
                    background: currentPageSafe === 1 ? '#f8fafc' : CANVAS,
                    color: currentPageSafe === 1 ? '#98a2b3' : INK,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: currentPageSafe === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPageSafe === 1 ? 0.55 : 1,
                  }}
                >
                  {isNarrowViewport ? 'Ant.' : 'Anterior'}
                </button>
                {visiblePageNumbers.map((pageNumber, index) => {
                  const previous = visiblePageNumbers[index - 1];
                  const showGap = previous && pageNumber - previous > 1;

                  return (
                    <span key={pageNumber} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {showGap && <span style={{ fontSize: 12, color: MUTED }}>...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        style={{
                          minWidth: isNarrowViewport ? 30 : 34,
                          height: isNarrowViewport ? 30 : 34,
                          padding: isNarrowViewport ? '0 8px' : '0 10px',
                          borderRadius: 6,
                          border: `1px solid ${currentPageSafe === pageNumber ? '#cfd4dc' : HAIRLINE}`,
                          background: currentPageSafe === pageNumber ? '#f8fafc' : CANVAS,
                          color: currentPageSafe === pageNumber ? INK : MUTED,
                          fontSize: 12,
                          fontWeight: currentPageSafe === pageNumber ? 700 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPageSafe === totalPages}
                  aria-label="Página siguiente"
                  style={{
                    minWidth: isNarrowViewport ? 34 : 72,
                    height: isNarrowViewport ? 30 : 34,
                    padding: isNarrowViewport ? '0 10px' : '0 12px',
                    borderRadius: 6,
                    border: `1px solid ${HAIRLINE}`,
                    background: currentPageSafe === totalPages ? '#f8fafc' : CANVAS,
                    color: currentPageSafe === totalPages ? '#98a2b3' : INK,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: currentPageSafe === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPageSafe === totalPages ? 0.55 : 1,
                  }}
                >
                  {isNarrowViewport ? 'Sig.' : 'Siguiente'}
                </button>
              </div>
            )}
          </div>
      </div>

      {/* ── Nueva Carpeta Modal ───────────────────────────────── */}
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

            {/* Step 1 — form */}
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
                  {creationMode === 'massive' ? (
                    <button onClick={() => setStep(3)} style={getModalPrimaryButtonStyle(true)}>
                      Continuar
                    </button>
                  ) : (
                    <button onClick={() => setStep(3)} style={getModalPrimaryButtonStyle(true)}>
                      Continuar
                    </button>
                  )}
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
                      <button onClick={handleCreateManualAndOpen} style={{ flex: 1, padding: '12px', background: CANVAS, color: GREEN, border: `1px solid ${GREEN}`, borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Crear y completar después
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

            {/* Step 4 — success */}
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
                    { label: 'Estado', value: created.estado },
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
