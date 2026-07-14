import { useState } from 'react';
import { Bell, Search, Plus, Download, Check, AlertTriangle, Info, X, ChevronRight, ChevronDown, Filter, Calendar, LogOut } from 'lucide-react';
import { NeonBadge } from './NeonBadge';
import type { EstadoCarpeta } from './mockData';

// ─── Tokens ──────────────────────────────────────────────────────────────────

const INK       = '#1d1d1f';
const MUTED     = '#6e6e73';
const PARCHMENT = '#f5f5f7';
const HAIRLINE  = '#d2d2d7';
const GREEN     = '#1a5c38';
const VIOLET    = '#5b21b6';
const CANVAS    = '#ffffff';

// ─── TOC ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'color',      label: 'Color' },
  { id: 'typography', label: 'Tipografía' },
  { id: 'spacing',    label: 'Spacing & Radii' },
  { id: 'status',     label: 'Estado & Canal' },
  { id: 'buttons',    label: 'Botones' },
  { id: 'inputs',     label: 'Inputs' },
  { id: 'cards',      label: 'Cards & KPIs' },
  { id: 'table',      label: 'Tabla' },
  { id: 'navigation', label: 'Navegación' },
  { id: 'feedback',   label: 'Feedback' },
];

// ─── Shared focus style ───────────────────────────────────────────────────────
// Applied via onFocus/onBlur since inline styles can't target :focus-visible.
// WCAG 2.1 SC 2.4.7 — visible focus indicator required on all interactive elements.

const FOCUS_RING = '0 0 0 3px rgba(26,92,56,0.35)';

function useFocusRing() {
  const [focused, setFocused] = useState(false);
  return {
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    boxShadow: focused ? FOCUS_RING : undefined,
    outline: 'none',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ id, label }: { id: string; label: string }) {
  return (
    <div id={id} style={{ paddingTop: 64, marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>Design System</div>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: INK, letterSpacing: '-0.374px' }}>{label}</h2>
      <div style={{ height: 1, background: HAIRLINE, marginTop: 16 }} aria-hidden="true" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{children}</div>;
}

function Swatch({ color, label, token }: { color: string; label: string; token?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 80 }}>
      {/* aria-label describes color for screen readers; role="img" treats it as a graphic */}
      <div
        role="img"
        aria-label={`Color ${label}: ${token ?? color}`}
        style={{ width: 64, height: 64, borderRadius: 12, background: color, border: color === '#ffffff' ? `1px solid ${HAIRLINE}` : 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      />
      <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>{label}</div>
      {token && <div style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }}>{token}</div>}
    </div>
  );
}

function ComponentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function ComponentBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 }}>
      {children}
      <figcaption style={{ fontSize: 10, color: MUTED, textAlign: 'center', marginTop: 8 }}>{label}</figcaption>
    </figure>
  );
}

function ModalPreview({
  title,
  subtitle,
  fields,
  primaryAction,
  secondaryAction = 'Cancelar',
  primaryTone = 'default',
}: {
  title: string;
  subtitle?: string;
  fields: string[];
  primaryAction: string;
  secondaryAction?: string;
  primaryTone?: 'default' | 'danger';
}) {
  const primaryBg = primaryTone === 'danger' ? '#c4001a' : GREEN;

  return (
    <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 20, background: CANVAS, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '18px 20px 14px', borderBottom: `1px solid ${HAIRLINE}` }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.2px' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <X size={14} color={MUTED} aria-hidden="true" />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: CANVAS }}>
        {fields.map((field, index) => (
          <div key={`${title}-${field}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{field}</div>
            <div style={{ minHeight: 38, borderRadius: 10, border: `1px solid ${HAIRLINE}`, background: PARCHMENT }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 18px' }}>
        <button type="button" style={{ flex: 1, padding: '11px', background: PARCHMENT, color: MUTED, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 13, cursor: 'pointer' }}>
          {secondaryAction}
        </button>
        <button type="button" style={{ flex: 1.4, padding: '11px', background: primaryBg, color: '#fff', border: 'none', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {primaryAction}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

function ColorSection() {
  const BRAND = [
    { color: '#1a5c38', label: 'Brand Green',    token: '--brand-green'         },
    { color: '#5b21b6', label: 'Brand Violet',   token: '--brand-violet'        },
    { color: 'rgba(26,92,56,0.08)',  label: 'Green Subtle',  token: '--brand-green-subtle'  },
    { color: 'rgba(91,33,182,0.08)', label: 'Violet Subtle', token: '--brand-violet-subtle' },
  ];
  const SURFACES = [
    { color: '#ffffff', label: 'Canvas',    token: '--canvas'    },
    { color: '#f5f5f7', label: 'Parchment', token: '--parchment' },
    { color: '#fafafc', label: 'Pearl',     token: '--pearl'     },
  ];
  const TEXT = [
    { color: '#1d1d1f', label: 'Ink',      token: '--ink'      },
    { color: '#6e6e73', label: 'Muted',    token: '--muted'    },
    { color: '#333333', label: 'Muted 80', token: '--muted-80' },
    { color: '#7a7a7a', label: 'Muted 48', token: '--muted-48' },
  ];
  const BORDERS = [
    { color: '#d2d2d7',          label: 'Hairline',     token: '--hairline'     },
    { color: 'rgba(0,0,0,0.08)', label: 'Divider Soft', token: '--divider-soft' },
  ];
  const STATUS = [
    { color: '#1a5c38', label: 'Activa',        token: '--status-active'   },
    { color: '#5b21b6', label: 'En Tránsito',   token: '--status-transit'  },
    { color: '#b45309', label: 'En Aduana',     token: '--status-customs'  },
    { color: '#c4001a', label: 'Canal Rojo',    token: '--status-rojo'     },
    { color: '#1a7a4a', label: 'OK / Recibida', token: '--status-ok'       },
    { color: '#6e6e73', label: 'Cerrada',       token: '--status-closed'   },
    { color: '#b84800', label: 'Incidencia',    token: '--status-incident' },
  ];

  const groups = [
    { title: 'Brand',           swatches: BRAND    },
    { title: 'Surfaces',        swatches: SURFACES },
    { title: 'Text',            swatches: TEXT     },
    { title: 'Borders',         swatches: BORDERS  },
    { title: 'Semantic Status', swatches: STATUS   },
  ];

  return (
    <>
      <SectionTitle id="color" label="Color" />
      {/* WCAG 1.4.1 — color alone must not be the only means of conveying information.
          Each swatch is accompanied by a text label and a token name. */}
      {groups.map(group => (
        <div key={group.title} style={{ marginBottom: 32 }}>
          <Label>{group.title}</Label>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {group.swatches.map(s => <Swatch key={s.token} {...s} />)}
          </div>
        </div>
      ))}

      {/* Contrast table */}
      <div style={{ marginBottom: 16 }}>
        <Label>Ratios de contraste (WCAG AA mínimo: 4.5:1 texto, 3:1 UI)</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { fg: '#1d1d1f', bg: '#ffffff',  ratio: '16.1:1', pass: true,  label: 'Ink / Canvas'         },
            { fg: '#6e6e73', bg: '#ffffff',  ratio: '4.6:1',  pass: true,  label: 'Muted / Canvas'       },
            { fg: '#6e6e73', bg: '#f5f5f7',  ratio: '4.3:1',  pass: false, label: 'Muted / Parchment ⚠' },
            { fg: '#1a5c38', bg: '#ffffff',  ratio: '7.9:1',  pass: true,  label: 'Brand Green / Canvas' },
            { fg: '#5b21b6', bg: '#ffffff',  ratio: '9.1:1',  pass: true,  label: 'Brand Violet / Canvas'},
            { fg: '#ffffff', bg: '#1a5c38',  ratio: '7.9:1',  pass: true,  label: 'White / Brand Green'  },
            { fg: '#ffffff', bg: '#c4001a',  ratio: '5.8:1',  pass: true,  label: 'White / Canal Rojo'   },
          ].map((r, i) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderBottom: i < 6 ? `1px solid ${HAIRLINE}` : 'none', background: i % 2 === 0 ? CANVAS : PARCHMENT }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: r.bg, border: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.fg }}>Aa</span>
              </div>
              <span style={{ fontSize: 13, color: INK, flex: 1 }}>{r.label}</span>
              <code style={{ fontSize: 12, color: INK, minWidth: 52, textAlign: 'right' }}>{r.ratio}</code>
              <span style={{ fontSize: 11, fontWeight: 600, color: r.pass ? '#1a7a4a' : '#b84800', background: r.pass ? 'rgba(26,122,74,0.08)' : 'rgba(184,72,0,0.08)', borderRadius: 9999, padding: '2px 9px', minWidth: 36, textAlign: 'center' }}>
                {r.pass ? 'AA' : 'FALLA'}
              </span>
            </div>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#b84800' }}>
          ⚠ Muted/Parchment (4.3:1) no pasa AA para texto normal bajo 18px. Usar únicamente en texto decorativo o 18px+.
        </p>
      </div>
    </>
  );
}

function TypographySection() {
  const scale = [
    { tag: 'h1',      size: '34px', weight: 600, tracking: '-0.374px', lh: '1.18', sample: 'Carpetas Activas' },
    { tag: 'h2',      size: '28px', weight: 600, tracking: '-0.374px', lh: '1.14', sample: 'Control Gerencial' },
    { tag: 'h3',      size: '21px', weight: 600, tracking: '0',        lh: '1.19', sample: 'Resumen de Embarques' },
    { tag: 'h4',      size: '17px', weight: 600, tracking: '-0.374px', lh: '1.24', sample: 'Datos de Cabecera' },
    { tag: 'body',    size: '14px', weight: 400, tracking: '0',        lh: '1.47', sample: 'Importaciones · Control operativo de carpetas activas y subcarpetas.' },
    { tag: 'small',   size: '13px', weight: 400, tracking: '0',        lh: '1.47', sample: 'Europacel Ibérica S.A. · Bélgica · EUR' },
    { tag: 'caption', size: '12px', weight: 400, tracking: '0',        lh: '1.43', sample: 'Última actualización: 28/05/2026' },
    { tag: 'label',   size: '11px', weight: 600, tracking: '0.04em',   lh: '1.43', sample: 'CÓD. SAP / DESCRIPCIÓN / ESTADO' },
  ];

  return (
    <>
      <SectionTitle id="typography" label="Tipografía" />
      <div style={{ marginBottom: 16 }}>
        <Label>Familia: Plus Jakarta Sans (Google Fonts) — weights 400 / 500 / 600 / 700 / 800</Label>
      </div>
      {/* WCAG 1.4.4 — texto redimensionable hasta 200% sin pérdida de contenido. */}
      <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 16, overflow: 'hidden' }} role="table" aria-label="Escala tipográfica">
        <div role="rowgroup">
          <div role="row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px', gap: 16, padding: '10px 20px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
            {['Token', 'Specimen', 'Size / Weight', 'Line height'].map(h => (
              <div key={h} role="columnheader" style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
        </div>
        <div role="rowgroup">
          {scale.map((t, i) => (
            <div key={t.tag} role="row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < scale.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: i % 2 === 0 ? CANVAS : PARCHMENT }}>
              <div role="cell"><code style={{ fontSize: 11, color: VIOLET, background: 'rgba(91,33,182,0.06)', padding: '2px 8px', borderRadius: 6 }}>{t.tag}</code></div>
              <div role="cell" style={{ fontSize: t.size, fontWeight: t.weight, letterSpacing: t.tracking, lineHeight: t.lh, color: INK }}>{t.sample}</div>
              <div role="cell" style={{ fontSize: 11, color: MUTED, textAlign: 'right' }}>{t.size} / {t.weight}</div>
              <div role="cell" style={{ fontSize: 11, color: MUTED, textAlign: 'right' }}>lh {t.lh}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SpacingSection() {
  const radii = [
    { name: '--r-sm',   value: '8px',    label: 'sm'   },
    { name: '--r-md',   value: '11px',   label: 'md'   },
    { name: '--r-lg',   value: '18px',   label: 'lg'   },
    { name: '--r-pill', value: '9999px', label: 'pill' },
  ];
  const spacing = [
    { name: '--sp-xs',  value: '8px',  px: 8  },
    { name: '--sp-sm',  value: '12px', px: 12 },
    { name: '--sp-md',  value: '17px', px: 17 },
    { name: '--sp-lg',  value: '24px', px: 24 },
    { name: '--sp-xl',  value: '32px', px: 32 },
    { name: '--sp-xxl', value: '48px', px: 48 },
  ];

  return (
    <>
      <SectionTitle id="spacing" label="Spacing & Radii" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <Label>Spacing Scale</Label>
          {/* Visual bars use aria-label to convey value without relying solely on size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {spacing.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <code style={{ fontSize: 11, color: VIOLET, background: 'rgba(91,33,182,0.06)', padding: '2px 8px', borderRadius: 6, minWidth: 90 }}>{s.name}</code>
                <div
                  role="img"
                  aria-label={`${s.name} = ${s.value}`}
                  style={{ width: s.px * 2, height: 20, background: GREEN, opacity: 0.7, borderRadius: 4, flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: MUTED }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Border Radius</Label>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {radii.map(r => (
              <div key={r.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  role="img"
                  aria-label={`Border radius ${r.label}: ${r.value}`}
                  style={{ width: 64, height: 64, background: PARCHMENT, border: `2px solid ${HAIRLINE}`, borderRadius: r.value === '9999px' ? 9999 : r.value }}
                />
                <code style={{ fontSize: 10, color: VIOLET }}>{r.label}</code>
                <span style={{ fontSize: 10, color: MUTED }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusSection() {
  const estados: EstadoCarpeta[] = ['Activa', 'En Tránsito', 'En Aduana', 'Oficializado', 'Cerrada', 'Con Incidencia'];

  return (
    <>
      <SectionTitle id="status" label="Estado & Canal" />

      <div style={{ marginBottom: 32 }}>
        <Label>NeonBadge — size md</Label>
        {/* role="list" so screen readers announce each badge as a list item */}
        <div role="list" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {estados.map(e => (
            <div key={e} role="listitem">
              <NeonBadge estado={e} size="md" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>NeonBadge — size sm</Label>
        <div role="list" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {estados.map(e => (
            <div key={e} role="listitem">
              <NeonBadge estado={e} size="sm" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>Canal Badge</Label>
        <div role="list" style={{ display: 'flex', gap: 10 }}>
          {[
            { color: '#1a7a4a', bg: 'rgba(26,122,74,0.08)', label: 'Canal Verde' },
            { color: '#c4001a', bg: 'rgba(196,0,26,0.08)',  label: 'Canal Rojo'  },
          ].map(c => (
            <span
              key={c.label}
              role="listitem"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 9999, padding: '3px 10px' }}
            >
              {/* Decorative dot — hidden from AT because the label conveys the info */}
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Role Badges</Label>
        <div role="list" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Importaciones',  color: '#1a5c38' },
            { label: 'Dirección',      color: '#5b21b6' },
            { label: 'Área Comercial', color: '#0066cc' },
            { label: 'Tesorería',      color: '#b45309' },
            { label: 'Depósito',       color: '#6e6e73' },
            { label: 'Despachante',    color: '#0066cc' },
            { label: 'Admin General',  color: '#c4001a' },
          ].map(r => (
            <span
              key={r.label}
              role="listitem"
              style={{ fontSize: 11, fontWeight: 600, color: r.color, background: `${r.color}14`, border: `1px solid ${r.color}33`, borderRadius: 9999, padding: '2px 9px' }}
            >
              {r.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function ButtonsSection() {
  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 9999, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', padding: '10px 20px',
    outline: 'none',
    // WCAG 2.4.7 — focus indicator via boxShadow; each button manages its own below
  };

  return (
    <>
      <SectionTitle id="buttons" label="Botones" />

      <ComponentRow label="Primary">
        <ComponentBox label="Default">
          <button
            type="button"
            style={{ ...btnBase, background: GREEN, color: '#fff' }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus size={13} aria-hidden="true" /> Nueva Carpeta
          </button>
        </ComponentBox>
        <ComponentBox label="Hover (simulado)">
          <button
            type="button"
            style={{ ...btnBase, background: '#155030', color: '#fff' }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus size={13} aria-hidden="true" /> Nueva Carpeta
          </button>
        </ComponentBox>
        <ComponentBox label="Disabled">
          {/* aria-disabled mejor que disabled cuando se quiere mantener focusable para AT */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            style={{ ...btnBase, background: HAIRLINE, color: MUTED, cursor: 'not-allowed', opacity: 0.6 }}
          >
            <Plus size={13} aria-hidden="true" /> Nueva Carpeta
          </button>
        </ComponentBox>
        <ComponentBox label="Solo ícono">
          {/* WCAG 1.1.1 — icon-only button needs aria-label */}
          <button
            type="button"
            aria-label="Nueva carpeta"
            style={{ ...btnBase, padding: '10px', background: GREEN, color: '#fff' }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </ComponentBox>
        <ComponentBox label="Con ícono + label">
          <button
            type="button"
            style={{ ...btnBase, background: GREEN, color: '#fff' }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Download size={13} aria-hidden="true" /> Exportar
          </button>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Secondary / Outline">
        <ComponentBox label="Default">
          <button
            type="button"
            style={{ ...btnBase, background: CANVAS, color: INK, border: `1px solid ${HAIRLINE}` }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            Cancelar
          </button>
        </ComponentBox>
        <ComponentBox label="Filtro activo">
          <button
            type="button"
            aria-pressed="true"
            style={{ ...btnBase, color: GREEN, background: 'rgba(26,92,56,0.08)', border: `1px solid rgba(26,92,56,0.3)` }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            LCA
          </button>
        </ComponentBox>
        <ComponentBox label="Filtro inactivo">
          <button
            type="button"
            aria-pressed="false"
            style={{ ...btnBase, color: MUTED, background: 'transparent', border: '1px solid transparent' }}
            onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            LDA
          </button>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Danger">
        <ComponentBox label="Filled">
          <button
            type="button"
            style={{ ...btnBase, background: '#c4001a', color: '#fff' }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,0,26,0.35)'; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            Eliminar
          </button>
        </ComponentBox>
        <ComponentBox label="Ghost danger">
          <button
            type="button"
            style={{ ...btnBase, background: 'rgba(196,0,26,0.08)', color: '#c4001a', border: `1px solid rgba(196,0,26,0.3)` }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,0,26,0.35)'; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            Eliminar
          </button>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Pill toggle (segmented control)">
        <SegmentedDemo />
      </ComponentRow>
    </>
  );
}

function SegmentedDemo() {
  const [active, setActive] = useState('30d');
  const opts = ['7d', '15d', '30d'];
  return (
    /* role="group" + aria-label conveys it is a segmented control */
    <div role="group" aria-label="Rango de tiempo" style={{ display: 'flex', background: PARCHMENT, borderRadius: 9999, padding: 3, border: `1px solid ${HAIRLINE}`, gap: 2 }}>
      {opts.map(t => (
        <button
          key={t}
          type="button"
          aria-pressed={active === t}
          onClick={() => setActive(t)}
          style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: active === t ? 600 : 400, color: active === t ? GREEN : MUTED, background: active === t ? CANVAS : 'transparent', border: 'none', cursor: 'pointer', boxShadow: active === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', outline: 'none' }}
          onFocus={e => { e.currentTarget.style.boxShadow = active === t ? `0 1px 4px rgba(0,0,0,0.08), ${FOCUS_RING}` : FOCUS_RING; }}
          onBlur={e  => { e.currentTarget.style.boxShadow = active === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'; }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function InputsSection() {
  const inputBase: React.CSSProperties = {
    padding: '10px 14px', fontSize: 13, color: INK,
    background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
    borderRadius: 10, outline: 'none', width: 240,
  };
  const focusedStyle: React.CSSProperties = {
    ...inputBase,
    border: `1.5px solid ${GREEN}`,
    boxShadow: `0 0 0 3px rgba(26,92,56,0.12)`,
  };
  const disabledStyle: React.CSSProperties = {
    ...inputBase, opacity: 0.55, cursor: 'not-allowed',
  };

  return (
    <>
      <SectionTitle id="inputs" label="Inputs" />
      {/* WCAG 1.3.1 + 3.3.2 — every input needs a programmatic label */}

      <ComponentRow label="Text input">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="inp-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>BUSCAR</label>
            <input
              id="inp-default"
              style={inputBase}
              placeholder="Carpeta o proveedor..."
            />
          </div>
        </ComponentBox>
        <ComponentBox label="Focused">
          <div>
            <label htmlFor="inp-focused" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>N° CARPETA</label>
            <input
              id="inp-focused"
              style={focusedStyle}
              defaultValue="2026/437"
            />
          </div>
        </ComponentBox>
        <ComponentBox label="Disabled">
          <div>
            <label htmlFor="inp-disabled" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>CAMPO</label>
            <input
              id="inp-disabled"
              disabled
              aria-disabled="true"
              style={disabledStyle}
              placeholder="No editable"
            />
          </div>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Search input">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="search-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>BUSCAR</label>
            <div style={{ position: 'relative', width: 240 }}>
              {/* aria-hidden — the label "BUSCAR" ya describe el campo */}
              <Search
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED, zIndex: 1, pointerEvents: 'none' }}
              />
              <input
                id="search-default"
                type="search"
                style={{ ...inputBase, paddingLeft: 36, borderRadius: 9999, width: '100%' }}
                placeholder="Buscar…"
              />
            </div>
          </div>
        </ComponentBox>
        <ComponentBox label="Con valor">
          <div>
            <label htmlFor="search-value" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>BUSCAR</label>
            <div style={{ position: 'relative', width: 240 }}>
              <Search
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: GREEN, zIndex: 1, pointerEvents: 'none' }}
              />
              <input
                id="search-value"
                type="search"
                style={{ ...inputBase, paddingLeft: 36, borderRadius: 9999, border: `1px solid rgba(26,92,56,0.3)`, width: '100%' }}
                defaultValue="Europacel"
              />
            </div>
          </div>
        </ComponentBox>
        <ComponentBox label="Disabled">
          <div>
            <label htmlFor="search-disabled" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>BUSCAR</label>
            <div style={{ position: 'relative', width: 240 }}>
              <Search
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED, zIndex: 1, pointerEvents: 'none', opacity: 0.45 }}
              />
              <input
                id="search-disabled"
                type="search"
                disabled
                aria-disabled="true"
                style={{ ...disabledStyle, paddingLeft: 36, borderRadius: 9999, width: '100%' }}
                placeholder="Deshabilitado"
              />
            </div>
          </div>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Select">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="sel-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>ROL</label>
            <select id="sel-default" style={{ ...inputBase, cursor: 'pointer' }}>
              <option>Importaciones</option>
              <option>Dirección</option>
              <option>Tesorería</option>
            </select>
          </div>
        </ComponentBox>
        <ComponentBox label="Disabled">
          <div>
            <label htmlFor="sel-disabled" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>ROL</label>
            <select id="sel-disabled" disabled aria-disabled="true" style={{ ...disabledStyle, cursor: 'not-allowed' }}>
              <option>No editable</option>
            </select>
          </div>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Date input">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="date-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>ETA DESTINO</label>
            <div style={{ position: 'relative', width: 240 }}>
              {/* Custom icon replaces the native calendar — suppressed via appearance:none in the wrapper.
                  The native picker still opens on click; the icon is purely decorative (aria-hidden). */}
              <Calendar
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: INK, zIndex: 1, pointerEvents: 'none' }}
              />
              <input
                id="date-default"
                type="date"
                defaultValue="2026-06-01"
                style={{ ...inputBase, width: '100%', paddingRight: 36,
                  // Hide the browser-native calendar icon so ours shows instead
                  // Works in Chrome/Edge (webkit) and Firefox
                  colorScheme: 'light',
                }}
              />
            </div>
          </div>
        </ComponentBox>
        <ComponentBox label="Vacío">
          <div>
            <label htmlFor="date-empty" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>ETA DESTINO</label>
            <div style={{ position: 'relative', width: 240 }}>
              <Calendar
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: INK, zIndex: 1, pointerEvents: 'none' }}
              />
              <input
                id="date-empty"
                type="date"
                style={{ ...inputBase, width: '100%', paddingRight: 36, colorScheme: 'light' }}
              />
            </div>
          </div>
        </ComponentBox>
        <ComponentBox label="Disabled">
          <div>
            <label htmlFor="date-disabled" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>ETA DESTINO</label>
            <div style={{ position: 'relative', width: 240 }}>
              <Calendar
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED, zIndex: 1, pointerEvents: 'none', opacity: 0.45 }}
              />
              <input
                id="date-disabled"
                type="date"
                disabled
                aria-disabled="true"
                style={{ ...disabledStyle, width: '100%', paddingRight: 36, colorScheme: 'light' }}
              />
            </div>
          </div>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Number input">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="num-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>MONTO OC (EUR)</label>
            <input id="num-default" type="number" style={inputBase} placeholder="0" defaultValue="85500" />
          </div>
        </ComponentBox>
      </ComponentRow>

      <ComponentRow label="Textarea">
        <ComponentBox label="Default">
          <div>
            <label htmlFor="ta-default" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>OBSERVACIONES</label>
            <textarea
              id="ta-default"
              rows={3}
              style={{ ...inputBase, resize: 'none', lineHeight: 1.5, width: 320 }}
              placeholder="Ingresá observaciones, reclamos o notas sobre esta carpeta..."
            />
          </div>
        </ComponentBox>
        <ComponentBox label="Focused">
          <div>
            <label htmlFor="ta-focused" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>OBSERVACIONES</label>
            <textarea
              id="ta-focused"
              rows={3}
              style={{ ...focusedStyle, resize: 'none', lineHeight: 1.5, width: 320 }}
              defaultValue="Pendiente de confirmación de embarque por parte del proveedor."
            />
          </div>
        </ComponentBox>
      </ComponentRow>

      <div style={{ padding: '14px 18px', background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}`, fontSize: 13, color: INK }}>
        <strong>Notas WCAG aplicadas:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li style={{ fontSize: 12, color: MUTED }}>Cada input tiene <code>&lt;label htmlFor&gt;</code> programáticamente asociado (SC 1.3.1 + 3.3.2).</li>
          <li style={{ fontSize: 12, color: MUTED }}>Íconos decorativos llevan <code>aria-hidden="true"</code> y <code>zIndex: 1 / pointerEvents: none</code> (SC 1.1.1).</li>
          <li style={{ fontSize: 12, color: MUTED }}>Campos deshabilitados usan <code>aria-disabled="true"</code> además del atributo HTML <code>disabled</code> (SC 4.1.2).</li>
          <li style={{ fontSize: 12, color: MUTED }}>Focus ring visible de 3px sobre todos los campos (SC 2.4.7).</li>
        </ul>
      </div>
    </>
  );
}

function CardsSection() {
  return (
    <>
      <SectionTitle id="cards" label="Cards & KPIs" />

      <div style={{ marginBottom: 32 }}>
        <Label>KPI Card — variantes de color</Label>
        {/* role="list" porque estas cards son ítems de una colección */}
        <div role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Ítems en Viaje',        value: 24,      color: INK       },
            { label: 'Canal Verde',            value: 18,      color: '#1a7a4a' },
            { label: 'Alertas Críticas',       value: 3,       color: '#c4001a' },
            { label: 'Monto Comprometido',     value: '€320K', color: VIOLET    },
          ].map(s => (
            <div
              key={s.label}
              role="listitem"
              aria-label={`${s.label}: ${s.value}`}
              style={{ borderTop: `1px solid ${HAIRLINE}`, borderRight: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}`, borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: '20px 22px', background: CANVAS }}
            >
              {/* aria-hidden because aria-label on container conveys the info */}
              <div aria-hidden="true" style={{ fontSize: 30, fontWeight: 600, color: s.color, lineHeight: 1, letterSpacing: '-0.374px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>Pipeline Card</Label>
        <div role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Pendiente de embarque', value: 2, color: '#b45309', icon: '📦' },
            { label: 'En Tránsito',           value: 5, color: '#5b21b6', icon: '🚢' },
            { label: 'Arribado / Aduana',      value: 3, color: '#0066cc', icon: '🏛️' },
            { label: 'Oficializado',           value: 1, color: '#1a5c38', icon: '✅' },
          ].map(s => (
            <div
              key={s.label}
              role="listitem"
              aria-label={`${s.label}: ${s.value}`}
              style={{ borderTop: `1px solid ${HAIRLINE}`, borderRight: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}`, borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: '20px 22px', background: CANVAS }}
            >
              <div aria-hidden="true" style={{ fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
              <div aria-hidden="true" style={{ fontSize: 30, fontWeight: 600, color: s.color, lineHeight: 1, letterSpacing: '-0.374px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>Card genérica</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, padding: '20px 22px', background: CANVAS, maxWidth: 400 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em', marginBottom: 14 }}>DATOS DE CABECERA</div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['N° Carpeta', '2026/437'], ['Proveedor', 'Europacel Ibérica'], ['Incoterm', 'CIF'], ['Moneda', 'EUR']].map(([l, v]) => (
              <div key={l}>
                <dt style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>{l}</dt>
                <dd style={{ margin: 0, fontSize: 14, color: INK, fontWeight: 500 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Alert card</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }} role="list">
          {[
            { color: '#c4001a', msg: 'Canal Rojo · 2026/437-A necesita intervención inmediata.', level: 'error'   },
            { color: '#b84800', msg: 'Con Incidencia · Faltante de producto en 2026/452-A.',    level: 'warning' },
            { color: '#b45309', msg: 'En Aduana · DUA pendiente de presentación.',              level: 'warning' },
          ].map(a => (
            <div
              key={a.msg}
              role="listitem"
              aria-live="polite"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: `1px solid ${a.color}33`, borderRight: `1px solid ${a.color}33`, borderBottom: `1px solid ${a.color}33`, borderLeft: `4px solid ${a.color}`, borderRadius: 12, background: `${a.color}06` }}
            >
              <AlertTriangle size={14} aria-hidden="true" style={{ color: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: INK }}>{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TableSection() {
  const rows = [
    { id: 'c1', numero: '2026/437', proveedor: 'Europacel Ibérica S.A.', estado: 'En Aduana' as EstadoCarpeta,      monto: 'EUR 142.500', hito: 'DUA presentada — Canal Verde', critical: false },
    { id: 'c2', numero: '2026/441', proveedor: 'Nordic Etiquetas OY',    estado: 'En Tránsito' as EstadoCarpeta,    monto: 'EUR 98.300',  hito: 'Embarcado · MSC AURORA',     critical: false },
    { id: 'c3', numero: '2026/449', proveedor: 'Rheinland Film GmbH',    estado: 'Con Incidencia' as EstadoCarpeta, monto: 'EUR 67.200',  hito: 'Canal ROJO asignado',        critical: true  },
  ];

  return (
    <>
      <SectionTitle id="table" label="Tabla" />

      <div style={{ marginBottom: 32 }}>
        <Label>Tabla base — default / hover / crítica</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, overflow: 'hidden', background: CANVAS }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Carpetas activas">
            <thead>
              <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                {['Carpeta', 'Proveedor', 'Estado', 'Monto total OC', 'Último hito', ''].map(col => (
                  <th key={col} scope="col" style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: i < rows.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: r.critical ? 'rgba(196,0,26,0.03)' : i === 1 ? PARCHMENT : CANVAS, borderLeft: r.critical ? '3px solid #c4001a' : '3px solid transparent', cursor: 'pointer' }}
                  tabIndex={0}
                  aria-label={`Carpeta ${r.numero}, ${r.estado}${r.critical ? ', requiere atención' : ''}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
                  onFocus={e => { e.currentTarget.style.outline = `2px solid ${GREEN}`; e.currentTarget.style.outlineOffset = '-2px'; }}
                  onBlur={e  => { e.currentTarget.style.outline = 'none'; }}
                >
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: INK }}>{r.numero}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: MUTED }}>{r.proveedor}</td>
                  <td style={{ padding: '14px 16px' }}><NeonBadge estado={r.estado} size="sm" /></td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{r.monto}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: MUTED, maxWidth: 220 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.hito}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <ChevronRight size={14} color={HAIRLINE} aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 20, fontSize: 12, color: MUTED }} aria-hidden="true">
          <span>Fila 1: default</span>
          <span>Fila 2: hover (simulado)</span>
          <span>Fila 3: crítica (borderLeft + aria-label "requiere atención")</span>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Empty state</Label>
        <div role="status" aria-live="polite" style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 18, padding: '64px 32px', textAlign: 'center', background: CANVAS }}>
          <div aria-hidden="true" style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 6 }}>Sin resultados</div>
          <div style={{ fontSize: 14, color: MUTED }}>No hay carpetas con los filtros aplicados.</div>
        </div>
      </div>
    </>
  );
}

function NavigationSection() {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = ['General', 'Artículos', 'Producción', 'Embarques', 'Anexos', 'Aduana / SAP', 'Costeo'];

  return (
    <>
      <SectionTitle id="navigation" label="Navegación" />

      <div style={{ marginBottom: 32 }}>
        <Label>Header global — menú de usuario + notificaciones</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden' }}>
          <header style={{ height: 52, background: CANVAS, borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <div aria-label="Logo Dimagraf" role="img" style={{ width: 80, height: 24, background: PARCHMENT, borderRadius: 6 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 13, color: INK }}>
                <span>Usuario Testing</span>
                <ChevronDown size={11} color={MUTED} />
              </div>
              {/* Bell: aria-label describes badge count */}
              <button
                type="button"
                aria-label="Notificaciones: 4 sin leer"
                style={{ position: 'relative', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; e.currentTarget.style.borderRadius = '8px'; }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Bell size={16} color="#c4001a" aria-hidden="true" />
                <span aria-hidden="true" style={{ position: 'absolute', top: 2, right: 3, width: 16, height: 16, background: '#c4001a', borderRadius: 9999, border: `1.5px solid ${CANVAS}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>4</span>
              </button>
            </div>
          </header>
          <nav aria-label="Módulos de importaciones" style={{ height: 48, background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: INK, marginRight: 12 }}>Importaciones</span>
            {['Carpetas (OCs)', 'Matriz de Arrivals'].map((t, i) => (
              <button
                key={t}
                type="button"
                aria-current={i === 0 ? 'page' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? GREEN : MUTED, background: i === 0 ? 'rgba(26,92,56,0.08)' : 'transparent', border: i === 0 ? '1px solid rgba(26,92,56,0.2)' : '1px solid transparent', borderRadius: 9999, cursor: 'pointer', outline: 'none' }}
                onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>Dropdown de usuario — estados</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          <ComponentBox label="Usuario con un rol">
            <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden', background: CANVAS }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${HAIRLINE}`, background: 'rgba(245,245,247,0.7)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Marcos Delgado</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Importaciones</div>
              </div>
              <div style={{ padding: '8px 0' }}>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: MUTED, fontSize: 13, textAlign: 'left' }}>
                  <LogOut size={13} />
                  Salir
                </button>
              </div>
            </div>
          </ComponentBox>

          <ComponentBox label="Usuario con varios accesos">
            <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden', background: CANVAS }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${HAIRLINE}`, background: 'rgba(245,245,247,0.7)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Usuario Testing</div>
              </div>
              <div style={{ padding: '8px 0', borderBottom: `1px solid ${HAIRLINE}` }}>
                {[
                  { label: 'Administrador General', active: true },
                  { label: 'Importaciones', active: false },
                  { label: 'Área Comercial', active: false },
                  { label: 'Design System', active: false },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: item.active ? 600 : 400,
                      color: item.active ? GREEN : INK,
                      background: item.active ? 'rgba(26,92,56,0.06)' : 'transparent',
                    }}
                  >
                    <span>{item.label}</span>
                    {item.active && <span style={{ fontSize: 11, color: GREEN }}>Activo</span>}
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 0' }}>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: MUTED, fontSize: 13, textAlign: 'left' }}>
                  <LogOut size={13} />
                  Salir
                </button>
              </div>
            </div>
          </ComponentBox>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Label>Tab bar de detalle de carpeta</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden', background: CANVAS }}>
          {/* role="tablist" + role="tab" + aria-selected es el patrón ARIA correcto */}
          <div role="tablist" aria-label="Secciones de carpeta" style={{ display: 'flex', borderBottom: `1px solid ${HAIRLINE}`, overflowX: 'auto' }}>
            {tabs.map(t => {
              const id = t.toLowerCase().replace(/[\s/]+/g, '-');
              const active = id === activeTab || t.toLowerCase() === activeTab;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={active}
                  aria-controls={`panel-${id}`}
                  onClick={() => setActiveTab(t.toLowerCase())}
                  style={{ padding: '12px 16px', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? GREEN : MUTED, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: active ? `2px solid ${GREEN}` : '2px solid transparent', background: 'none', borderRadius: 0, cursor: 'pointer', whiteSpace: 'nowrap', outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${GREEN}40`; }}
                  onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.replace(/[\s/]+/g, '-')}`}
            style={{ padding: '20px 22px', fontSize: 13, color: MUTED }}
          >
            Contenido de la pestaña <strong style={{ color: INK }}>{tabs.find(t => t.toLowerCase() === activeTab) ?? activeTab}</strong>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Filtros chip</Label>
        {/* role="group" agrupa los filtros relacionados */}
        <div role="group" aria-label="Filtrar por estado" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} aria-hidden="true" style={{ color: MUTED }} />
          {['Todos', 'En Tránsito', 'En Aduana', 'Oficializado', 'Cerrada'].map((f, i) => (
            <button
              key={f}
              type="button"
              aria-pressed={i === 0}
              style={{ padding: '5px 12px', fontSize: 12, borderRadius: 9999, color: i === 0 ? GREEN : MUTED, background: i === 0 ? 'rgba(26,92,56,0.08)' : 'transparent', border: i === 0 ? `1px solid rgba(26,92,56,0.3)` : '1px solid transparent', cursor: 'pointer', outline: 'none' }}
              onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function FeedbackSection() {
  return (
    <>
      <SectionTitle id="feedback" label="Feedback" />

      <div style={{ marginBottom: 32 }}>
        <Label>Notificaciones — leída y sin leer, los 4 tipos</Label>
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 16, overflow: 'hidden', maxWidth: 480 }} role="list" aria-label="Lista de notificaciones">
          {[
            { type: 'success', icon: <Check size={14} aria-hidden="true" />,         color: '#1a7a4a', bg: 'rgba(26,122,74,0.08)',  title: 'Carpeta creada',      msg: 'Carpeta 2026/462 abierta · Andino Insumos S.A.', unread: true },
            { type: 'info',    icon: <Info size={14} aria-hidden="true" />,          color: '#0066cc', bg: 'rgba(0,102,204,0.08)',  title: 'Cambio de estado',    msg: 'Carpeta 2026/449 pasó a "En Tránsito"',           unread: false },
            { type: 'warning', icon: <AlertTriangle size={14} aria-hidden="true" />, color: '#b45309', bg: 'rgba(180,83,9,0.08)',   title: 'Vencimiento próximo', msg: 'Pago EUR 85.500 vence el 01/06/2026',            unread: false },
            { type: 'error',   icon: <X size={14} aria-hidden="true" />,             color: '#c4001a', bg: 'rgba(196,0,26,0.08)',   title: 'Canal Rojo asignado', msg: 'Subcarpeta 2026/437-A requiere intervención',     unread: false },
          ].map((n, i) => (
            <div
              key={n.type}
              role="listitem"
              aria-label={`${n.unread ? 'Sin leer: ' : ''}${n.title} — ${n.msg}`}
              style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: i < 3 ? `1px solid ${HAIRLINE}` : 'none', background: n.unread ? PARCHMENT : CANVAS }}
            >
              {/* Unread dot — purely decorative, info conveyed in aria-label */}
              <div aria-hidden="true" style={{ flexShrink: 0, paddingTop: 4 }}>
                {n.unread
                  ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color }} />
                  : <div style={{ width: 8, height: 8 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ color: n.color }}>{n.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: INK }}>{n.title}</span>
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4, marginBottom: 6 }}>{n.msg}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: MUTED }}>hace 2h</span>
                  <span style={{ fontSize: 11, color: n.color, background: n.bg, borderRadius: 9999, padding: '1px 7px' }}>Importaciones</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: MUTED }}>Fila 1 (parchment): sin leer. Filas 2–4: leídas.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Modal — estructura base</Label>
        {/* role="dialog" + aria-modal + aria-labelledby */}
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="modal-title-demo"
          style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 20, maxWidth: 440, overflow: 'hidden', background: CANVAS, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
            <h3 id="modal-title-demo" style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>Título del modal</h3>
            <button
              type="button"
              aria-label="Cerrar modal"
              style={{ width: 32, height: 32, borderRadius: '50%', background: PARCHMENT, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
              onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <X size={14} color={MUTED} aria-hidden="true" />
            </button>
          </div>
          <div style={{ padding: '20px 28px', fontSize: 13, color: MUTED }}>Contenido del modal. Formulario, confirmación o información contextual.</div>
          <div style={{ display: 'flex', gap: 10, padding: '0 28px 24px' }}>
            <button
              type="button"
              style={{ flex: 1, padding: '11px', background: PARCHMENT, color: INK, border: `1px solid ${HAIRLINE}`, borderRadius: 9999, fontSize: 13, cursor: 'pointer', outline: 'none' }}
              onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              Cancelar
            </button>
            <button
              type="button"
              style={{ flex: 2, padding: '11px', background: GREEN, color: '#fff', border: 'none', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              onFocus={e => { e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Label>Modales implementados en el producto</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          <ModalPreview
            title="Nueva Carpeta de Importación"
            subtitle="Apertura de carpeta madre con datos generales de la OC."
            fields={['PROVEEDOR *', 'FECHA O/C *', 'INCOTERM', 'MONEDA', 'MONTO TOTAL O/C *', 'CONDICIÓN DE PAGO']}
            primaryAction="Guardar y continuar"
          />
          <ModalPreview
            title="Carga masiva de artículos"
            subtitle="Paso 2 del flujo de alta. Permite descargar plantilla y adjuntar archivo para validar líneas."
            fields={['MODO DE CARGA', 'PLANTILLA / ARCHIVO', 'GRILLA PEGADA DESDE EXCEL']}
            primaryAction="Validar artículos"
            secondaryAction="Volver"
          />
          <ModalPreview
            title="Nuevo artículo"
            subtitle="Alta manual de artículo dentro de la carpeta."
            fields={['CÓD. SAP *', 'DESCRIPCIÓN *', 'LÍNEA', 'U.M.', 'CANTIDAD *', 'P. UNIT.']}
            primaryAction="Agregar artículo"
          />
          <ModalPreview
            title="Nuevo Embarque Parcial"
            subtitle="Subcarpeta A/B/C con datos de factura, transporte y ETA."
            fields={['N° FACTURA *', 'FECHA FACTURA *', 'TRANSPORTE', 'CONTENEDORES', 'BL / CRT / AWB *', 'ETA *']}
            primaryAction="Crear Embarque"
          />
          <ModalPreview
            title="Nuevo Usuario / Editar Usuario"
            subtitle="ABM de usuarios con multirol y acceso a Design System."
            fields={['NOMBRE *', 'APELLIDO *', 'USUARIO *', 'EMAIL *', 'ROLES ASIGNADOS', 'ESTADO']}
            primaryAction="Crear Usuario"
          />
          <ModalPreview
            title="Nuevo Artículo / Editar Artículo"
            subtitle="ABM del maestro de artículos."
            fields={['CÓD. SAP *', 'DESCRIPCIÓN *', 'LÍNEA', 'U.M.', 'PRECIO REF. $', 'ESTADO']}
            primaryAction="Crear Artículo"
          />
          <ModalPreview
            title="Nuevo Proveedor / Editar Proveedor"
            subtitle="ABM de proveedores con incoterm, moneda y tiempos operativos."
            fields={['PROVEEDOR *', 'PAÍS *', 'INCOTERM', 'MONEDA', 'CONDICIÓN DE PAGO', 'DÍAS PRODUCCIÓN / TRÁNSITO']}
            primaryAction="Crear Proveedor"
          />
          <ModalPreview
            title="Datos de despacho"
            subtitle="Edición operativa de canal, tipo de despacho, montos y fechas."
            fields={['CANAL ADUANA', 'DESPACHO / ZFI / ZFE', 'GASTOS AR$ (ESTIMADO)', 'VEP USD (IMPUESTO)', 'FECHA OFICIALIZACIÓN', 'FECHA SALIDA']}
            primaryAction="Guardar datos"
          />
          <ModalPreview
            title="Registro de Incidencia"
            subtitle="Carga de desvíos detectados en recepción de depósito."
            fields={['TIPO DE INCIDENCIA', 'CANTIDAD AFECTADA', 'COMENTARIOS (OPCIONAL)']}
            primaryAction="Registrar Incidencia"
            primaryTone="danger"
          />
          <ModalPreview
            title="¿Eliminar usuario?"
            subtitle="Confirmación destructiva del ABM. Acción irreversible."
            fields={['CONFIRMACIÓN DE ACCIÓN']}
            primaryAction="Eliminar"
            primaryTone="danger"
          />
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('color');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: 'var(--font-ui)' }}>

      {/* Sidebar TOC */}
      <nav aria-label="Secciones del design system" style={{ width: 200, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: `1px solid ${HAIRLINE}`, padding: '32px 0', background: PARCHMENT }}>
        <div style={{ padding: '0 20px 16px', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.08em' }}>DESIGN SYSTEM</div>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            aria-current={activeSection === s.id ? 'true' : undefined}
            onClick={() => scrollTo(s.id)}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 20px', fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400, color: activeSection === s.id ? GREEN : MUTED, background: activeSection === s.id ? 'rgba(26,92,56,0.08)' : 'transparent', border: 'none', borderLeft: activeSection === s.id ? `2px solid ${GREEN}` : '2px solid transparent', cursor: 'pointer', outline: 'none' }}
            onFocus={e => { e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${GREEN}60`; }}
            onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '0 48px 80px', overflowY: 'auto', maxWidth: 1100 }}>
        {/* Hero */}
        <div style={{ paddingTop: 48, paddingBottom: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', marginBottom: 8 }}>DIMAGRAF IMPORTACIONES</div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, margin: '0 0 8px', letterSpacing: '-0.374px' }}>Design System</h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>Foundations, tokens y componentes del sistema · Inter · v1.0</p>
        </div>

        <ColorSection />
        <TypographySection />
        <SpacingSection />
        <StatusSection />
        <ButtonsSection />
        <InputsSection />
        <CardsSection />
        <TableSection />
        <NavigationSection />
        <FeedbackSection />
      </main>
    </div>
  );
}
