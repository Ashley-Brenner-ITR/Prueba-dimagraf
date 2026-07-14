import type { ReactNode } from 'react';
import { useIsMobile } from './ui/use-mobile';

const MUTED = '#667085';
const CANVAS = '#ffffff';

export interface MetricCardItem {
  label: string;
  value: ReactNode;
  color: string;
  icon: ReactNode;
}

interface MetricCardGridProps {
  items: MetricCardItem[];
  marginBottom?: number;
  minCardWidth?: number;
}

export function MetricCardGrid({ items, marginBottom = 28, minCardWidth = 190 }: MetricCardGridProps) {
  const isMobile = useIsMobile();
  const isThreeCardMobile = isMobile && items.length === 3;
  const effectiveMinCardWidth = isMobile ? Math.min(minCardWidth, 156) : minCardWidth;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? `repeat(${isThreeCardMobile ? 3 : 2}, minmax(0, 1fr))`
          : `repeat(auto-fit, minmax(min(100%, ${effectiveMinCardWidth}px), 1fr))`,
        gap: isThreeCardMobile ? 6 : isMobile ? 10 : 12,
        marginBottom: isMobile ? Math.min(marginBottom, 20) : marginBottom,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            border: `1px solid ${item.color}33`,
            borderRadius: isThreeCardMobile ? 14 : isMobile ? 18 : 22,
            padding: isThreeCardMobile ? '10px 8px 9px' : isMobile ? '12px 12px 11px' : '18px 18px 17px',
            background: CANVAS,
            minWidth: 0,
            boxShadow: '0 4px 14px rgba(16,24,40,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isThreeCardMobile ? 4 : isMobile ? 8 : 12, marginBottom: isThreeCardMobile ? 5 : isMobile ? 6 : 8 }}>
            <div style={{ fontSize: isThreeCardMobile ? 20 : isMobile ? 24 : 30, fontWeight: 700, color: item.color, lineHeight: 1.05, letterSpacing: isMobile ? '-0.035em' : '-0.045em', overflowWrap: 'anywhere', minWidth: 0, flex: 1 }}>
              {item.value}
            </div>
            <span
              style={{
                width: isThreeCardMobile ? 24 : isMobile ? 28 : 34,
                height: isThreeCardMobile ? 24 : isMobile ? 28 : 34,
                borderRadius: 9999,
                background: `${item.color}12`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>
          </div>
          <div style={{ fontSize: isThreeCardMobile ? 10 : isMobile ? 11 : 12, fontWeight: 500, color: MUTED, lineHeight: isThreeCardMobile ? 1.2 : isMobile ? 1.3 : 1.4, minWidth: 0, textWrap: 'balance' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
