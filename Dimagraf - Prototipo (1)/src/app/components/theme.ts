export const theme = {
  color: {
    ink: '#1d1d1f', muted: '#667085', hairline: '#eaecf0', parchment: '#f8fafc',
    surface: '#fdfefe', canvas: '#ffffff', mintWash: '#eef8f4', borderTint: 'rgba(26, 92, 56, 0.20)', borderTintSoft: 'rgba(26, 92, 56, 0.12)', brand: '#1a5c38', success: '#1a7a4a',
    warning: '#b45309', danger: '#c4001a', info: '#0066cc', violet: '#5b21b6',
  },
  radius: { xs: 4, sm: 6, md: 10, lg: 16, modal: 20, pill: 9999 },
  shadow: { soft: '0 4px 14px rgba(16,24,40,0.04)', modal: '0 18px 40px rgba(15,23,42,0.10)', glass: '0 8px 32px rgba(16,24,40,0.08)' },
  breakpoint: { mobile: 768 },
} as const;

export const { color, radius, shadow, breakpoint } = theme;
