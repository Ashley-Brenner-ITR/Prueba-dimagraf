import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Download, Eye, Home, Plus, RefreshCw, SearchX, Ship, Trash2, XCircle } from 'lucide-react';
import { AppButton } from './AppButton';
import { AppDialog } from './AppDialog';
import { AppPagination } from './AppPagination';
import { DataTable, type DataColumn } from './DataTable';
import { ErrorStatePage } from './ErrorStatePage';
import { FilterToolbar } from './FilterToolbar';
import { AppInput, FormField } from './FormField';
import { AppLoaderSkeleton } from './LoadingState';
import { CanalBadge, NeonBadge } from './NeonBadge';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { ShipmentCard } from './ShipmentCard';
import { StatusBadge } from './StatusBadge';
import { SurfaceCard } from './SurfaceCard';
import { color, radius, shadow } from './theme';

const sections = [
  ['overview', 'Overview'],
  ['foundations', 'Fundaciones'],
  ['actions', 'Acciones'],
  ['forms', 'Formularios'],
  ['feedback', 'Feedback'],
  ['domain', 'Dominio Comex'],
  ['data', 'Datos'],
  ['mapping', 'Mapa de Modulos'],
  ['inventory', 'Inventario Total'],
] as const;

const swatches = [
  ['brand', color.brand],
  ['violet', color.violet],
  ['ink', color.ink],
  ['muted', color.muted],
  ['mintWash', color.mintWash],
  ['surface', color.surface],
  ['hairline', color.hairline],
  ['borderTint', color.borderTint],
  ['borderTintSoft', color.borderTintSoft],
  ['success', color.success],
  ['warning', color.warning],
  ['danger', color.danger],
  ['info', color.info],
] as const;

const moduleMap = [
  {
    title: 'Base UI Reutilizable',
    items: ['AppButton', 'AppDialog', 'AppPagination', 'DataTable', 'FormField', 'SearchField', 'SurfaceCard', 'StatusBadge', 'FilterToolbar'],
  },
  {
    title: 'Feedback y Estado Global',
    items: ['LoadingState', 'ErrorStatePage', 'NotificationPanel'],
  },
  {
    title: 'Dominio Importaciones',
    items: ['ShipmentCard', 'NeonBadge', 'CanalBadge', 'MetricCardGrid', 'TransportModeIcon', 'InfoField', 'SectionCard'],
  },
  {
    title: 'Pantallas de Aplicacion',
    items: ['Layout', 'LoginScreen', 'PasswordRecoveryPage', 'AccountSettingsPage', 'OperatorDashboard', 'CarpetaDetail', 'CommercialArrivals', 'DirectorDashboard', 'DispatcherDashboard', 'WarehouseReception', 'TreasuryCashFlow', 'AdminDashboard'],
  },
] as const;

const allComponents = [
  'AccountSettingsPage',
  'AdminDashboard',
  'AppButton',
  'AppDialog',
  'AppPagination',
  'CarpetaDetail',
  'CommercialArrivals',
  'DataTable',
  'DesignSystemPage',
  'DirectorDashboard',
  'DispatcherDashboard',
  'ErrorStatePage',
  'FilterToolbar',
  'FormField',
  'InfoField',
  'Layout',
  'LoadingState',
  'LoginScreen',
  'MetricCardGrid',
  'NeonBadge',
  'NotificationPanel',
  'OperatorDashboard',
  'PasswordRecoveryPage',
  'SearchField',
  'SectionCard',
  'ShipmentCard',
  'StatusBadge',
  'SurfaceCard',
  'TransportModeIcon',
  'TreasuryCashFlow',
  'WarehouseReception',
] as const;

type DemoRow = {
  id: string;
  carpeta: string;
  proveedor: string;
  estado: 'Pendiente de embarque' | 'En Tránsito' | 'Arribado Aduana';
};

const rows: DemoRow[] = [
  { id: '1', carpeta: 'DIM-2026-041', proveedor: 'Europacel Iberica', estado: 'Pendiente de embarque' },
  { id: '2', carpeta: 'DIM-2026-038', proveedor: 'UPM Sales', estado: 'En Tránsito' },
  { id: '3', carpeta: 'DIM-2026-029', proveedor: 'Lecta Paper', estado: 'Arribado Aduana' },
];

const columns: DataColumn<DemoRow>[] = [
  { key: 'carpeta', header: 'Carpeta', cell: row => <strong>{row.carpeta}</strong> },
  { key: 'proveedor', header: 'Proveedor', cell: row => row.proveedor },
  {
    key: 'estado',
    header: 'Estado',
    cell: row => (
      <StatusBadge tone={row.estado === 'Pendiente de embarque' ? 'warning' : row.estado === 'En Tránsito' ? 'violet' : 'info'} dot>
        {row.estado}
      </StatusBadge>
    ),
  },
  { key: 'action', header: '', align: 'right', cell: () => <AppButton size="xs" variant="ghost">Ver</AppButton> },
];

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 24, marginBottom: 52 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 6px', color: color.ink, fontSize: 24, letterSpacing: '-.02em' }}>{title}</h2>
        <p style={{ margin: 0, maxWidth: 780, color: color.muted, fontSize: 13, lineHeight: 1.55 }}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SurfaceCard style={{ padding: 18 }}>
      <h3 style={{ margin: '0 0 14px', color: color.ink, fontSize: 13 }}>{title}</h3>
      {children}
    </SurfaceCard>
  );
}

export function DesignSystemPage() {
  const [search, setSearch] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendientes' | 'transito' | 'aduana'>('todos');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = normalizeSearchTerm(search);
    return rows.filter(row => {
      const statusOk = statusFilter === 'todos'
        || (statusFilter === 'pendientes' && row.estado === 'Pendiente de embarque')
        || (statusFilter === 'transito' && row.estado === 'En Tránsito')
        || (statusFilter === 'aduana' && row.estado === 'Arribado Aduana');
      const textOk = normalizeSearchTerm(`${row.carpeta} ${row.proveedor} ${row.estado}`).includes(q);
      return statusOk && textOk;
    });
  }, [search, statusFilter]);

  return (
    <div style={{ minHeight: '100%', background: color.mintWash, color: color.ink }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 28px 80px' }}>
        <header style={{ marginBottom: 30 }}>
          <StatusBadge tone="brand" size="sm">Design System Visual</StatusBadge>
          <h1 style={{ margin: '12px 0 8px', fontSize: 36, letterSpacing: '-.04em' }}>Sistema de Diseno Dimagraf</h1>
          <p style={{ margin: 0, maxWidth: 760, color: color.muted, lineHeight: 1.55 }}>
            Documentacion visual ejecutable de todos los componentes reutilizables y del mapa completo de modulos/pantallas.
          </p>
        </header>

        <nav aria-label="Secciones" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 42 }}>
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                padding: '7px 11px',
                color: color.muted,
                background: color.surface,
                border: `1px solid ${color.hairline}`,
                borderRadius: radius.pill,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <Section id="overview" title="Overview" description="Resumen del sistema con objetivos de uso para consistencia, accesibilidad y mantenibilidad.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <SurfaceCard style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: color.muted, fontWeight: 700, letterSpacing: '.05em' }}>COMPONENTES</div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700 }}>{allComponents.length}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: color.muted }}>Catalogados visualmente</div>
            </SurfaceCard>
            <SurfaceCard style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: color.muted, fontWeight: 700, letterSpacing: '.05em' }}>MODULOS</div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700 }}>{moduleMap.length}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: color.muted }}>Con mapeo de dependencia</div>
            </SurfaceCard>
            <SurfaceCard style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: color.muted, fontWeight: 700, letterSpacing: '.05em' }}>ESTADO</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusBadge tone="success" dot>Estandarizando</StatusBadge>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: color.muted }}>Base unica de componentes</div>
            </SurfaceCard>
          </div>
        </Section>

        <Section id="foundations" title="Fundaciones" description="Tokens compartidos de color, radios, elevacion y el nuevo tratamiento de fondo menta con bordes verdes suaves.">
          <Demo title="Paleta semantica">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              {swatches.map(([name, value]) => (
                <div key={name}>
                  <div style={{ height: 64, borderRadius: radius.md, background: value, border: `1px solid ${color.hairline}`, boxShadow: shadow.soft }} />
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>{name}</div>
                  <code style={{ fontSize: 10, color: color.muted }}>{value}</code>
                </div>
              ))}
            </div>
          </Demo>
        </Section>

        <Section id="actions" title="Acciones" description="Jerarquia de botones reutilizables y patron de modal estandar.">
          <div style={{ display: 'grid', gap: 14 }}>
            <Demo title="AppButton variantes + tamanos">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <AppButton icon={<Plus size={14} />}>Primario</AppButton>
                <AppButton variant="secondary" icon={<Download size={14} />}>Secundario</AppButton>
                <AppButton variant="ghost">Ghost</AppButton>
                <AppButton variant="tertiary">Terciario</AppButton>
                <AppButton variant="danger" icon={<Trash2 size={14} />}>Eliminar</AppButton>
                <AppButton variant="danger-soft" icon={<AlertTriangle size={14} />}>Riesgo</AppButton>
                <AppButton variant="success-soft" icon={<Check size={14} />}>Aprobado</AppButton>
                <AppButton size="xs">XS</AppButton>
                <AppButton size="sm">SM</AppButton>
                <AppButton size="md">MD</AppButton>
              </div>
            </Demo>

            <Demo title="AppDialog">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <AppButton icon={<Eye size={14} />} onClick={() => setDialogOpen(true)}>Abrir modal base</AppButton>
                <StatusBadge tone="info" dot>Usar para formularios y confirmaciones</StatusBadge>
              </div>
              <AppDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Confirmar accion"
                description="Componente de modal reutilizable con cierre consistente."
                footer={<><AppButton variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</AppButton><AppButton onClick={() => setDialogOpen(false)}>Confirmar</AppButton></>}
              >
                <p style={{ margin: 0, color: color.muted, fontSize: 13 }}>Este dialog se documenta como patron oficial para evitar modales inline duplicados.</p>
              </AppDialog>
            </Demo>
          </div>
        </Section>

        <Section id="forms" title="Formularios" description="Busqueda, filtros y campos normalizados para entrada de datos.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14 }}>
            <Demo title="SearchField">
              <SearchField value={search} onChange={setSearch} placeholder="Buscar carpeta o proveedor..." />
            </Demo>

            <Demo title="FilterToolbar">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar en tabla..."
                options={[
                  { value: 'todos', label: 'Todos', count: rows.length },
                  { value: 'pendientes', label: 'Pendiente de embarque', count: rows.filter(row => row.estado === 'Pendiente de embarque').length },
                  { value: 'transito', label: 'En tránsito', count: rows.filter(row => row.estado === 'En Tránsito').length },
                  { value: 'aduana', label: 'Arribado aduana', count: rows.filter(row => row.estado === 'Arribado Aduana').length },
                ] as const}
                value={statusFilter}
                onValueChange={setStatusFilter}
                expanded={filterExpanded}
                onExpandedChange={setFilterExpanded}
              />
            </Demo>

            <Demo title="FormField + AppInput">
              <div style={{ display: 'grid', gap: 12 }}>
                <FormField id="sap" label="Codigo SAP" help="Identificador unico del articulo">
                  <AppInput id="sap" placeholder="Ej. PAP-001" />
                </FormField>
                <FormField id="proveedor" label="Proveedor" error="Campo obligatorio">
                  <AppInput id="proveedor" aria-invalid="true" />
                </FormField>
              </div>
            </Demo>
          </div>
        </Section>

        <Section id="feedback" title="Feedback" description="Estados, errores y loaders compartidos para experiencia consistente.">
          <div style={{ display: 'grid', gap: 14 }}>
            <Demo title="StatusBadge y alias de dominio">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <StatusBadge tone="neutral" dot>Neutral</StatusBadge>
                <StatusBadge tone="brand" dot>Brand</StatusBadge>
                <StatusBadge tone="success" dot>Success</StatusBadge>
                <StatusBadge tone="warning" dot>Warning</StatusBadge>
                <StatusBadge tone="danger" dot>Danger</StatusBadge>
                <StatusBadge tone="info" dot>Info</StatusBadge>
                <StatusBadge tone="violet" dot>Violet</StatusBadge>
                <NeonBadge estado="Pendiente de embarque" />
                <NeonBadge estado="En Tránsito" />
                <NeonBadge estado="Arribado Aduana" />
                <CanalBadge canal="Rojo" />
              </div>
            </Demo>

            <Demo title="AppLoaderSkeleton (preview)">
              <div style={{ border: `1px solid ${color.hairline}`, borderRadius: 14, overflow: 'hidden' }}>
                <AppLoaderSkeleton title="Cargando tablero de ejemplo..." />
              </div>
            </Demo>

            <Demo title="ErrorStatePage (preview)">
              <div style={{ border: `1px solid ${color.hairline}`, borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <ErrorStatePage variant="500" onRetry={() => undefined} onGoHome={() => undefined} />
              </div>
            </Demo>
          </div>
        </Section>

        <Section id="domain" title="Dominio Comex" description="Componentes visuales de negocio para embarques, aduana y estados logisticos.">
          <div style={{ display: 'grid', gap: 14 }}>
            <Demo title="ShipmentCard colapsable">
              <ShipmentCard
                numero="2026/437-A"
                estado="En Tránsito"
                transporte="Maritimo"
                eta="2026-08-12"
                canalAduana="Pendiente"
                forwarder="MSC Andes"
                documento="BL-8834"
                incidentCount={1}
                expanded
              >
                <div style={{ padding: 14, borderTop: `1px solid ${color.hairline}`, fontSize: 12, color: color.muted }}>
                  Detalle de prueba: aqui se expanden campos de aduana/documentacion del embarque.
                </div>
              </ShipmentCard>
            </Demo>
          </div>
        </Section>

        <Section id="data" title="Datos" description="Tabla generica tipada + paginacion comun para listados de carpetas y maestros.">
          <div style={{ display: 'grid', gap: 16 }}>
            <DataTable rows={filteredRows} columns={columns} getRowKey={row => row.id} minWidth={620} empty="No hay filas para mostrar." />
            <AppPagination page={page} pageCount={4} onChange={setPage} />
          </div>
        </Section>

        <Section id="mapping" title="Mapa Visual de Modulos" description="Relacion entre componentes base, dominio y pantallas de aplicacion.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {moduleMap.map(group => (
              <SurfaceCard key={group.title} style={{ padding: 14 }}>
                <h3 style={{ margin: 0, fontSize: 13 }}>{group.title}</h3>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {group.items.map(item => (
                    <span key={item} style={{ fontSize: 11, fontWeight: 600, padding: '5px 8px', borderRadius: radius.pill, border: `1px solid ${color.hairline}`, background: color.surface, color: color.muted }}>
                      {item}
                    </span>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </div>
        </Section>

        <Section id="inventory" title="Inventario Total" description="Listado completo de componentes del proyecto para trazabilidad y governance de UI.">
          <SurfaceCard style={{ padding: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {allComponents.map(name => (
                <span key={name} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.01em', padding: '6px 9px', borderRadius: radius.pill, border: `1px solid ${color.hairline}`, background: '#ffffff' }}>
                  {name}
                </span>
              ))}
            </div>
          </SurfaceCard>
        </Section>
      </div>
    </div>
  );
}
