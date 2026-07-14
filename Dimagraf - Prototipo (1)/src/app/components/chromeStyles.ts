import type { CSSProperties } from 'react';
import { color } from './theme';

const { ink: INK, muted: MUTED, hairline: HAIRLINE, parchment: PARCHMENT, surface: SURFACE, brand: GREEN, canvas: CANVAS } = color;

export const pageShell: CSSProperties = {
  maxWidth: 1380,
  margin: '0 auto',
  padding: 'clamp(20px, 4vw, 48px) clamp(14px, 3vw, 32px) clamp(28px, 5vw, 56px)',
};

export const pageHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 'clamp(10px, 2vw, 16px)',
  flexWrap: 'wrap',
  marginBottom: 'clamp(16px, 3vw, 32px)',
};

export const toolbarSurface: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  padding: 'clamp(6px, 1.6vw, 8px) clamp(8px, 2vw, 10px)',
  background: SURFACE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 9999,
  boxShadow: '0 2px 10px rgba(16,24,40,0.04)',
};

export const segmentedControl: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  background: PARCHMENT,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 9999,
};

export const searchWrap: CSSProperties = {
  position: 'relative',
  flex: 1,
  minWidth: 180,
};

export const pageActions: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
};

export const filterGroup: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'nowrap',
  minWidth: 0,
  maxWidth: '100%',
  padding: 3,
  background: CANVAS,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 12,
  overflowX: 'auto',
  overflowY: 'hidden',
};

export const searchInput: CSSProperties = {
  width: '100%',
  padding: '10px 12px 10px 36px',
  fontSize: 13,
  color: INK,
  background: SURFACE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 18,
  outline: 'none',
  boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
};

export const filtersSurface: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 'clamp(14px, 2.4vw, 20px)',
  padding: 'clamp(10px, 2vw, 12px) clamp(10px, 2.4vw, 14px)',
  background: SURFACE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 22,
  boxShadow: '0 3px 12px rgba(16,24,40,0.04)',
};

export const tableShell: CSSProperties = {
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 24,
  overflow: 'hidden',
  background: SURFACE,
  boxShadow: '0 4px 14px rgba(16,24,40,0.04)',
};

export const tableScrollArea: CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
};

export const tableHeadRow: CSSProperties = {
  background: '#fafbfd',
  borderBottom: `1px solid ${HAIRLINE}`,
};

export const tableHeadCell: CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: MUTED,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const modalOverlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(15, 23, 42, 0.28)',
  backdropFilter: 'blur(10px)',
};

export const modalHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '22px 28px 18px',
  borderBottom: `1px solid ${HAIRLINE}`,
};

export const modalBody: CSSProperties = {
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  background: CANVAS,
};

export const modalFooter: CSSProperties = {
  display: 'flex',
  gap: 10,
  paddingTop: 4,
};

export const fieldLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: MUTED,
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.04em',
};

export const formInput: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  color: INK,
  background: SURFACE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 18,
  outline: 'none',
  boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
};

export const formTextarea: CSSProperties = {
  ...formInput,
  resize: 'none',
};

export const modalCloseButton: CSSProperties = {
  background: PARCHMENT,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 9999,
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  boxShadow: 'none',
};

export function getModalShellStyle(maxWidth = 520): CSSProperties {
  return {
    background: CANVAS,
    borderRadius: 28,
    width: '100%',
    maxWidth,
    margin: '0 16px',
    boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
    overflow: 'hidden',
    border: `1px solid ${HAIRLINE}`,
  };
}

export function getAutoFitGridStyle(minColumnWidth = 280, gap = 16): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minColumnWidth}px), 1fr))`,
    gap,
  };
}

export function getSearchWrapStyle(maxWidth?: number): CSSProperties {
  return {
    ...searchWrap,
    ...(typeof maxWidth === 'number' ? { maxWidth } : {}),
  };
}

export function getResponsiveTableStyle(minWidth = 720): CSSProperties {
  return {
    width: '100%',
    minWidth,
    borderCollapse: 'collapse',
  };
}

export function getPrimaryButtonStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    background: GREEN,
    color: '#ffffff',
    border: 'none',
    borderRadius: 9999,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(26,92,56,0.10)',
  };
}

export function getSecondaryButtonStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 14px',
    background: SURFACE,
    color: MUTED,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 9999,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: 'none',
  };
}

export function getSegmentButtonStyle(active: boolean): CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 9999,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    color: active ? GREEN : MUTED,
    background: active ? CANVAS : 'transparent',
    border: 'none',
    cursor: 'pointer',
    boxShadow: active ? '0 1px 4px rgba(16,24,40,0.04)' : 'none',
  };
}

export function getFilterChipStyle(active: boolean, activeColor = GREEN): CSSProperties {
  return {
    minHeight: 34,
    padding: '7px 11px',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    borderRadius: 9,
    color: active ? activeColor : MUTED,
    background: active ? `${activeColor}12` : 'transparent',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };
}

export function getModalPrimaryButtonStyle(enabled = true): CSSProperties {
  return {
    flex: 2,
    padding: '12px 14px',
    background: enabled ? GREEN : HAIRLINE,
    color: enabled ? '#ffffff' : MUTED,
    border: 'none',
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 600,
    cursor: enabled ? 'pointer' : 'default',
    boxShadow: enabled ? '0 3px 10px rgba(26,92,56,0.10)' : 'none',
  };
}

export function getModalSecondaryButtonStyle(): CSSProperties {
  return {
    flex: 1,
    padding: '12px 14px',
    background: SURFACE,
    color: MUTED,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: 'none',
  };
}

export function getModalDestructiveButtonStyle(): CSSProperties {
  return {
    flex: 1,
    padding: '12px 14px',
    background: '#c4001a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(196,0,26,0.14)',
  };
}
