import { X, CheckCheck, Bell, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { AppNotification } from './mockData';
import { ROLE_LABELS } from './mockData';
import { useIsMobile } from './ui/use-mobile';
import type { NotificationAnchorRect } from './Layout';

const INK      = '#1d1d1f';
const MUTED    = '#6e6e73';
const HAIRLINE = '#d2d2d7';
const PARCHMENT= '#f5f5f7';
const CANVAS   = '#ffffff';
const GREEN    = '#1a5c38';

const TYPE_CONFIG = {
  success: { color: '#1a7a4a', bg: 'rgba(26,122,74,0.08)', icon: <CheckCircle size={14} /> },
  info:    { color: '#0066cc', bg: 'rgba(0,102,204,0.08)', icon: <Info size={14} /> },
  warning: { color: '#b45309', bg: 'rgba(180,83,9,0.08)',  icon: <AlertTriangle size={14} /> },
  error:   { color: '#c4001a', bg: 'rgba(196,0,26,0.08)',  icon: <XCircle size={14} /> },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'ahora';
  if (mins < 60)   return `hace ${mins}m`;
  if (hours < 24)  return `hace ${hours}h`;
  return `hace ${days}d`;
}

interface Props {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  anchorRect?: NotificationAnchorRect | null;
}

export function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose, anchorRect }: Props) {
  const isMobile = useIsMobile();
  const unread = notifications.filter(n => !n.read).length;
  const sorted = [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const desktopTop = anchorRect ? Math.max(63, Math.round(anchorRect.bottom - 2)) : 64;
  const desktopRight = anchorRect && typeof window !== 'undefined'
    ? Math.max(16, Math.round(window.innerWidth - anchorRect.right - 2))
    : 20;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: isMobile ? 64 : 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 400,
          background: isMobile ? 'rgba(0,0,0,0.18)' : 'transparent',
          backdropFilter: isMobile ? 'blur(2px)' : 'none',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: isMobile ? 64 : desktopTop,
        right: isMobile ? 0 : desktopRight,
        bottom: isMobile ? 0 : 'auto',
        zIndex: 401,
        width: isMobile ? 'min(400px, 100vw)' : 386,
        maxWidth: isMobile ? '100vw' : 'calc(100vw - 32px)',
        maxHeight: isMobile ? 'none' : `min(720px, calc(100vh - ${desktopTop + 18}px))`,
        background: CANVAS,
        border: isMobile ? 'none' : `1px solid ${HAIRLINE}`,
        borderLeft: isMobile ? `1px solid ${HAIRLINE}` : undefined,
        borderRadius: isMobile ? 0 : 20,
        boxShadow: isMobile ? '-8px 0 32px rgba(16,24,40,0.10)' : '0 18px 42px rgba(16,24,40,0.12)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {!isMobile && anchorRect && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -9,
              right: 18,
              width: 18,
              height: 18,
              background: CANVAS,
              borderTop: `1px solid ${HAIRLINE}`,
              borderLeft: `1px solid ${HAIRLINE}`,
              transform: 'rotate(45deg)',
            }}
          />
        )}

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${HAIRLINE}`, flexShrink: 0, background: '#fcfcfb', position: 'relative' }}>
          {/* Row 1: Title + Close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.2px' }}>Notificaciones</span>
            <button
              onClick={onClose}
              style={{
                background: '#f2f2f1',
                border: 'none',
                borderRadius: '50%',
                width: isMobile ? 36 : 30,
                height: isMobile ? 36 : 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={14} color={MUTED} />
            </button>
          </div>
          {/* Row 2: Mark all */}
          {unread > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={onMarkAllRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: GREEN,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isMobile ? '8px 0' : 0,
                  whiteSpace: 'nowrap',
                  minHeight: isMobile ? 36 : undefined,
                }}
              >
                <CheckCheck size={13} strokeWidth={1.8} /> Marcar todas
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0', background: '#fbfbfa' }}>
          {sorted.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: MUTED, fontSize: 15 }}>
              Sin notificaciones
            </div>
          ) : (
            sorted.map(n => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: `1px solid ${HAIRLINE}`,
                    background: n.read ? '#f9f9f8' : CANVAS,
                    opacity: n.read ? 0.55 : 1,
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = '#f7f7f5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? '#f9f9f8' : CANVAS; }}
                >
                  {/* Unread dot */}
                  <div style={{ flexShrink: 0, paddingTop: 4 }}>
                    {!n.read
                      ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, marginTop: 2 }} />
                      : <div style={{ width: 8, height: 8 }} />
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Type icon + title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: INK }}>{n.title}</span>
                    </div>

                    {/* Message */}
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4, marginBottom: 6 }}>{n.message}</div>

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: MUTED }}>{timeAgo(n.timestamp)}</span>
                      {n.role && (
                        <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, borderRadius: 9999, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                          {ROLE_LABELS[n.role]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${HAIRLINE}`, flexShrink: 0, background: '#fcfcfb' }}>
          <p style={{ margin: 0, fontSize: 11, color: MUTED, textAlign: 'center' }}>
            {notifications.length} notificacion(es) · {unread} sin leer
          </p>
        </div>
      </div>
    </>
  );
}
