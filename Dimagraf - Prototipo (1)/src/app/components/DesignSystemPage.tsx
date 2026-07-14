import { useState } from 'react';
import { Check, Download, Plus, Trash2 } from 'lucide-react';
import { AppButton } from './AppButton';
import { AppPagination } from './AppPagination';
import { DataTable, type DataColumn } from './DataTable';
import { AppInput, FormField } from './FormField';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { StatusBadge } from './StatusBadge';
import { SurfaceCard } from './SurfaceCard';
import { color, radius, shadow } from './theme';

const sections = [
  ['foundations', 'Fundamentos'],
  ['buttons', 'Botones'],
  ['status', 'Estados'],
  ['forms', 'Campos'],
  ['surfaces', 'Superficies'],
  ['data', 'Datos'],
] as const;

const swatches = [
  ['Brand', color.brand], ['Violet', color.violet], ['Ink', color.ink],
  ['Muted', color.muted], ['Surface', color.surface], ['Hairline', color.hairline],
  ['Success', color.success], ['Warning', color.warning], ['Danger', color.danger], ['Info', color.info],
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return <section id={id} style={{ scrollMarginTop: 24, marginBottom: 56 }}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ color: color.brand, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Componente productivo</div>
      <h2 style={{ margin: '5px 0 5px', color: color.ink, fontSize: 25, letterSpacing: '-.03em' }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: 680, color: color.muted, fontSize: 13, lineHeight: 1.55 }}>{description}</p>
    </div>
    {children}
  </section>;
}

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return <SurfaceCard style={{ padding: 20 }}>
    <h3 style={{ margin: '0 0 16px', color: color.ink, fontSize: 13 }}>{title}</h3>
    {children}
  </SurfaceCard>;
}

type DemoRow = { id: string; carpeta: string; proveedor: string; estado: 'Activa' | 'En tránsito' | 'Observada' };
const rows: DemoRow[] = [
  { id: '1', carpeta: 'DIM-2026-041', proveedor: 'Europacel Ibérica', estado: 'Activa' },
  { id: '2', carpeta: 'DIM-2026-038', proveedor: 'UPM Sales', estado: 'En tránsito' },
  { id: '3', carpeta: 'DIM-2026-029', proveedor: 'Lecta Paper', estado: 'Observada' },
];
const columns: DataColumn<DemoRow>[] = [
  { key: 'carpeta', header: 'Carpeta', cell: row => <strong>{row.carpeta}</strong> },
  { key: 'proveedor', header: 'Proveedor', cell: row => row.proveedor },
  { key: 'estado', header: 'Estado', cell: row => <StatusBadge tone={row.estado === 'Activa' ? 'success' : row.estado === 'En tránsito' ? 'violet' : 'warning'} dot>{row.estado}</StatusBadge> },
  { key: 'action', header: '', align: 'right', cell: () => <AppButton size="xs" variant="ghost">Ver detalle</AppButton> },
];

export function DesignSystemPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filteredRows = rows.filter(row => normalizeSearchTerm(`${row.carpeta} ${row.proveedor} ${row.estado}`).includes(normalizeSearchTerm(search)));

  return <div style={{ minHeight: '100%', background: '#f8fafc', color: color.ink }}>
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 28px 80px' }}>
      <header style={{ marginBottom: 34 }}>
        <StatusBadge tone="brand" size="sm">Fuente única de verdad</StatusBadge>
        <h1 style={{ margin: '12px 0 8px', fontSize: 36, letterSpacing: '-.04em' }}>Sistema de diseño</h1>
        <p style={{ margin: 0, maxWidth: 720, color: color.muted, lineHeight: 1.55 }}>Catálogo ejecutable de los mismos componentes que usan las pantallas. Las variantes se prueban acá sin recrear sus estilos.</p>
      </header>

      <nav aria-label="Secciones del sistema de diseño" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 48 }}>
        {sections.map(([id, label]) => <a key={id} href={`#${id}`} style={{ padding: '7px 11px', color: color.muted, background: color.surface, border: `1px solid ${color.hairline}`, borderRadius: radius.pill, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>{label}</a>)}
      </nav>

      <Section id="foundations" title="Fundamentos" description="Tokens compartidos para color, radios y elevación; las pantallas no deben redefinirlos localmente.">
        <Demo title="Paleta semántica">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 14 }}>
            {swatches.map(([name, value]) => <div key={name}>
              <div aria-label={`${name}: ${value}`} style={{ height: 62, borderRadius: radius.md, background: value, border: `1px solid ${color.hairline}`, boxShadow: shadow.soft }} />
              <div style={{ marginTop: 7, fontSize: 12, fontWeight: 600 }}>{name}</div>
              <code style={{ color: color.muted, fontSize: 10 }}>{value}</code>
            </div>)}
          </div>
        </Demo>
      </Section>

      <Section id="buttons" title="AppButton" description="Acciones consistentes por jerarquía, intención y tamaño. Admite icono, estado disabled y todos los atributos nativos.">
        <div style={{ display: 'grid', gap: 16 }}>
          <Demo title="Variantes">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <AppButton icon={<Plus size={14} />}>Primario</AppButton>
              <AppButton variant="secondary" icon={<Download size={14} />}>Secundario</AppButton>
              <AppButton variant="ghost">Ghost</AppButton>
              <AppButton variant="danger" icon={<Trash2 size={14} />}>Eliminar</AppButton>
              <AppButton variant="danger-soft">Alerta suave</AppButton>
              <AppButton variant="success-soft" icon={<Check size={14} />}>Aprobado</AppButton>
              <AppButton disabled>Deshabilitado</AppButton>
            </div>
          </Demo>
          <Demo title="Tamaños">
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <AppButton size="xs">Extra chico</AppButton><AppButton size="sm">Chico</AppButton><AppButton size="md">Mediano</AppButton>
            </div>
          </Demo>
        </div>
      </Section>

      <Section id="status" title="StatusBadge" description="Estados expresados con texto y color semántico; puede incluir indicador, icono y dos tamaños.">
        <Demo title="Tonos">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <StatusBadge tone="neutral" dot>Neutral</StatusBadge><StatusBadge tone="brand" dot>Brand</StatusBadge>
            <StatusBadge tone="success" dot>Success</StatusBadge><StatusBadge tone="warning" dot>Warning</StatusBadge>
            <StatusBadge tone="danger" dot>Danger</StatusBadge><StatusBadge tone="info" dot>Info</StatusBadge>
            <StatusBadge tone="violet" dot>Violet</StatusBadge><StatusBadge tone="success" size="sm" icon={<Check size={12} />}>Compacto</StatusBadge>
          </div>
        </Demo>
      </Section>

      <Section id="forms" title="Búsqueda y formularios" description="SearchField centraliza búsqueda; FormField compone etiqueta, ayuda y error alrededor de controles como AppInput.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <Demo title="SearchField"><SearchField value={search} onChange={setSearch} placeholder="Buscar carpeta o proveedor…" /></Demo>
          <Demo title="FormField + AppInput">
            <div style={{ display: 'grid', gap: 16 }}>
              <FormField id="demo-sap" label="Código SAP" help="Identificador del artículo en SAP"><AppInput id="demo-sap" placeholder="Ej. PAP-001" /></FormField>
              <FormField id="demo-error" label="Proveedor" error="Este dato es obligatorio"><AppInput id="demo-error" aria-invalid="true" defaultValue="" /></FormField>
            </div>
          </Demo>
        </div>
      </Section>

      <Section id="surfaces" title="SurfaceCard" description="Contenedor base para paneles y agrupaciones; concentra superficie, borde, radio, sombra y overflow.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <SurfaceCard style={{ padding: 20 }}><StatusBadge tone="success">Operativa</StatusBadge><h3 style={{ margin: '12px 0 5px' }}>Carpeta activa</h3><p style={{ margin: 0, color: color.muted, fontSize: 13 }}>Una superficie común, sin estilos de card duplicados.</p></SurfaceCard>
          <SurfaceCard as="article" style={{ padding: 20, borderColor: color.violet }}><StatusBadge tone="violet">En tránsito</StatusBadge><h3 style={{ margin: '12px 0 5px' }}>Embarque marítimo</h3><p style={{ margin: 0, color: color.muted, fontSize: 13 }}>La variante se expresa sobre el mismo componente.</p></SurfaceCard>
        </div>
      </Section>

      <Section id="data" title="DataTable y AppPagination" description="Tabla genérica tipada con densidades y estado vacío; paginación común con límites y navegación accesible.">
        <div style={{ display: 'grid', gap: 18 }}>
          <DataTable rows={filteredRows} columns={columns} getRowKey={row => row.id} minWidth={620} empty="No hay carpetas que coincidan con la búsqueda." />
          <AppPagination page={page} pageCount={4} onChange={setPage} />
          <Demo title="Densidad compacta y estado vacío"><DataTable rows={[]} columns={columns} getRowKey={row => row.id} density="compact" minWidth={620} /></Demo>
        </div>
      </Section>
    </div>
  </div>;
}
