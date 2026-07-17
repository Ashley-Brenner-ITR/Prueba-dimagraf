import { useEffect, useState } from 'react';
import { Bell, FolderOpen, Ship, BarChart3, DollarSign, Boxes, Activity, Users, Shield, Package, LogOut, Menu, X, ChevronDown, Settings2, PanelLeftClose, PanelLeftOpen, CalendarDays } from 'lucide-react';
import type { AppUser, Role } from './mockData';
import { useIsMobile } from './ui/use-mobile';
import { color } from './theme';
import dimagrafLogo from '../../imports/imagen__3_.png';

const GREEN  = '#1a5c38';
const VIOLET = '#5b21b6';
const INK    = '#1d1d1f';
const MUTED  = '#667085';
const DANGER = '#b42318';
const HAIRLINE = '#eaecf0';
const PARCHMENT = '#f8fafc';
const CANVAS = '#ffffff';
const MINT_WASH = color.mintWash;
const BORDER_TINT = color.borderTint;
const BORDER_TINT_SOFT = color.borderTintSoft;
const SIDEBAR_BG = 'rgba(255,255,255,0.72)';
const SIDEBAR_HOVER = 'rgba(26,92,56,0.06)';
const SIDEBAR_ACTIVE = 'rgba(26,92,56,0.10)';
const SIDEBAR_TEXT = '#344054';
const SIDEBAR_MUTED = '#667085';
const SIDEBAR_WIDTH_OPEN = 240;
const SIDEBAR_WIDTH_CLOSED = 60;

const ROLES = [
  { id: 'operator'   as Role, label: 'Importaciones',        short: 'Importaciones'  },
  { id: 'director'   as Role, label: 'Dirección',            short: 'Dirección'      },
  { id: 'commercial' as Role, label: 'Área Comercial',       short: 'Comercial'      },
  { id: 'treasury'   as Role, label: 'Tesorería',            short: 'Tesorería'      },
  { id: 'warehouse'  as Role, label: 'Depósito',             short: 'Depósito'       },
  { id: 'dispatcher' as Role, label: 'Despachante',          short: 'Despachante'    },
  { id: 'admin'      as Role, label: 'Administrador General', short: 'Administración' },
];

export type AccessRole = Role | 'design-system';

export interface NotificationAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface NavItem { id: string; label: string; mobileLabel?: string; icon: React.ReactNode; }

function getNavItems(role: AccessRole): NavItem[] {
  if (role === 'operator') return [
    { id: 'carpetas',      label: 'Carpetas',           mobileLabel: 'Carpetas',       icon: <FolderOpen size={18} /> },
    { id: 'arrivals',      label: 'Arrivals',           mobileLabel: 'Arrivals',       icon: <Ship size={18} /> },
    { id: 'vencimientos',  label: 'Vencimientos',       mobileLabel: 'Vencimientos',   icon: <CalendarDays size={18} /> },
  ];
  if (role === 'director') return [
    { id: 'dashboard',     label: 'Control gerencial', mobileLabel: 'Control',      icon: <Activity size={18} /> },
    { id: 'audit',         label: 'Auditoría de costos', mobileLabel: 'Auditoría',  icon: <BarChart3 size={18} /> },
    { id: 'carpetas',      label: 'Carpetas',          mobileLabel: 'Carpetas',     icon: <FolderOpen size={18} /> },
    { id: 'vencimientos',  label: 'Vencimientos',      mobileLabel: 'Vencimientos', icon: <CalendarDays size={18} /> },
  ];
  if (role === 'commercial') return [
    { id: 'carpetas', label: 'Carpetas',            mobileLabel: 'Carpetas', icon: <FolderOpen size={18} /> },
    { id: 'arrivals', label: 'Arrivals',            mobileLabel: 'Arrivals', icon: <Ship size={18} /> },
  ];
  if (role === 'treasury') return [
    { id: 'cashflow',      label: 'Flujo de caja',  mobileLabel: 'Flujo',          icon: <DollarSign size={18} /> },
    { id: 'vencimientos',  label: 'Vencimientos',   mobileLabel: 'Vencimientos',   icon: <CalendarDays size={18} /> },
  ];
  if (role === 'warehouse') return [
    { id: 'reception', label: 'Recepciones', mobileLabel: 'Recepción', icon: <Boxes size={18} /> },
  ];
  if (role === 'dispatcher') return [
    { id: 'carpetas', label: 'Carpetas', mobileLabel: 'Carpetas', icon: <FolderOpen size={18} /> },
  ];
  if (role === 'admin') return [
    { id: 'admin-users',     label: 'Usuarios',    mobileLabel: 'Usuarios',    icon: <Users size={18} /> },
    { id: 'admin-audit',     label: 'Auditoría',   mobileLabel: 'Auditoría',   icon: <Shield size={18} /> },
    { id: 'admin-articles',  label: 'Artículos',   mobileLabel: 'Artículos',   icon: <Package size={18} /> },
    { id: 'admin-providers', label: 'Proveedores', mobileLabel: 'Proveedores', icon: <Ship size={18} /> },
  ];
  if (role === 'design-system') return [
    { id: 'admin-design-system', label: 'Design System', mobileLabel: 'Sistema', icon: <Package size={18} /> },
  ];
  return [];
}

function getRoleMeta(role: AccessRole) {
  if (role === 'design-system') return { id: 'design-system', label: 'Design System', short: 'Design System' };
  return ROLES.find(r => r.id === role)!;
}

function getInitials(label: string) {
  const parts = label
    .split(/[^A-Za-zÀ-ÿ0-9]+/)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

interface LayoutProps {
  role: AccessRole;
  availableRoles: AccessRole[];
  setRole: (r: AccessRole) => void;
  view: string;
  setView: (v: string) => void;
  children: React.ReactNode;
  breadcrumb?: string;
  unreadCount?: number;
  onBellClick?: (anchorRect: NotificationAnchorRect) => void;
  onRequestCloseNotifications?: () => void;
  currentUser?: AppUser | null;
  currentUserLabel: string;
  onOpenSettings?: () => void;
  hideSectionNav?: boolean;
  onLogout: () => void;
}

function getActiveNavView(view: string) {
  if (view === 'carpeta-detail') return 'carpetas';
  return view;
}

export function Layout({ role, availableRoles, setRole, view, setView, children, breadcrumb, unreadCount = 0, onBellClick, onRequestCloseNotifications, currentUser, currentUserLabel, onOpenSettings, hideSectionNav = false, onLogout }: LayoutProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [profileSwitchExpanded, setProfileSwitchExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const navItems = getNavItems(role);
  const currentRole = getRoleMeta(role);
  const userInitials = getInitials(currentUserLabel);
  const activeNavView = getActiveNavView(view);
  const canEditCurrentUser = !!currentUser && !!onOpenSettings;

  const handleSelectView = (nextView: string) => {
    setView(nextView);
    setNavMenuOpen(false);
    setRoleMenuOpen(false);
  };

  const handleSelectRole = (nextRole: AccessRole) => {
    setRole(nextRole);
    setView(getNavItems(nextRole)[0]?.id || 'dashboard');
    setRoleMenuOpen(false);
  };

  const handleSelectMobileRole = (nextRole: AccessRole) => {
    setRole(nextRole);
    setView(getNavItems(nextRole)[0]?.id || 'dashboard');
  };

  useEffect(() => {
    if (!isMobile) {
      setNavMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!roleMenuOpen && !navMenuOpen) {
      setProfileSwitchExpanded(false);
    }
  }, [navMenuOpen, roleMenuOpen]);

  return (
    <>
    <div className="size-full flex" style={{ fontFamily: 'var(--font-ui)' }}>

      {/* ── Sidebar (ChatGPT / Gemini style) ────────────────── */}
      {!isMobile && !hideSectionNav && (
        <aside style={{
          width: sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
          minWidth: sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
          height: '100vh',
          background: SIDEBAR_BG,
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderRight: '1px solid rgba(234,236,240,0.7)',
          boxShadow: '4px 0 24px rgba(16,24,40,0.04)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1), min-width 0.2s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 120,
        }}>
          {/* Sidebar header */}
          <div style={{
            minHeight: 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: sidebarOpen ? 'stretch' : 'center',
            padding: sidebarOpen ? '14px 16px' : '14px 8px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(234,236,240,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
                  <img src={dimagrafLogo} alt="Dimagraf" style={{ width: 118, height: 26, objectFit: 'contain', objectPosition: 'left center' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: SIDEBAR_MUTED }}>
                  Comex / Importaciones
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(open => !open)}
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: '1px solid rgba(234,236,240,0.6)', background: 'rgba(255,255,255,0.6)',
                color: SIDEBAR_MUTED, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                backdropFilter: 'blur(8px)',
              }}
              aria-label={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            </div>
          </div>

          {/* Navigation items */}
          <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {navItems.map(item => {
              const active = activeNavView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectView(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: sidebarOpen ? '10px 12px' : '10px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    background: active ? SIDEBAR_ACTIVE : 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    color: active ? GREEN : SIDEBAR_TEXT,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, color 0.15s ease',
                    textAlign: 'left',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = SIDEBAR_HOVER; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: active ? 1 : 0.8 }}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer — user info */}
          <div style={{
            padding: sidebarOpen ? '12px 12px' : '12px 8px',
            borderTop: '1px solid rgba(234,236,240,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(26,92,56,0.10)', color: GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {userInitials}
            </span>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: SIDEBAR_TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUserLabel}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentRole.short}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Right panel (header + content) ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', background: MINT_WASH }}>

        {/* ── Top Header ─────────────────────────────────────────── */}
        <header style={{
          height: 56,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          borderBottom: `1px solid ${BORDER_TINT_SOFT}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 14px' : '0 24px',
          flexShrink: 0,
          zIndex: 100,
        }}>
          {/* Left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setNavMenuOpen(open => !open)}
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'transparent', border: 'none', color: INK, cursor: 'pointer' }}
                aria-label={navMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
              >
                {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
            {breadcrumb && (
              <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 500 }}>{breadcrumb}</span>
            )}
          </div>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Role switcher */}
            {!isMobile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNavMenuOpen(false);
                  onRequestCloseNotifications?.();
                  setRoleMenuOpen(open => !open);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px 6px 6px',
                  background: CANVAS,
                  border: `1px solid ${BORDER_TINT}`,
                  borderRadius: 9999,
                  color: INK,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  maxWidth: 160,
                  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                }}
                aria-label="Abrir menú de usuario"
              >
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(26,92,56,0.12)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {userInitials}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: MUTED }}>
                  {currentRole.short}
                </span>
                <ChevronDown size={12} style={{ color: MUTED, flexShrink: 0 }} />
              </button>

              {roleMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: CANVAS,
                  border: `1px solid ${BORDER_TINT}`,
                  borderRadius: 16,
                  boxShadow: '0 18px 48px rgba(16,24,40,0.10)',
                  width: 260,
                  overflow: 'hidden',
                  zIndex: 200,
                }}>
                  <div style={{ borderBottom: `1px solid ${BORDER_TINT_SOFT}`, background: CANVAS }}>
                    {currentUser && (
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
                          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,92,56,0.12)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {userInitials}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUserLabel}</div>
                            {availableRoles.length > 1 ? (
                              <div style={{ display: 'grid', gap: 8, marginTop: 2 }}>
                                <button
                                  onClick={() => setProfileSwitchExpanded(open => !open)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, border: 'none', background: 'transparent', color: MUTED, fontSize: 12, cursor: 'pointer', width: 'fit-content' }}
                                >
                                  <span>{currentRole.label}</span>
                                  <ChevronDown size={13} style={{ transform: profileSwitchExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }} />
                                </button>

                                {profileSwitchExpanded && (
                                  <div style={{ display: 'grid', gap: 2, marginTop: -2, paddingLeft: 12, borderLeft: `1px solid ${BORDER_TINT_SOFT}` }}>
                                    {availableRoles.map((availableRole) => {
                                      const roleOption = getRoleMeta(availableRole);
                                      const isActiveRole = availableRole === role;
                                      return (
                                        <button
                                          key={roleOption.id}
                                          onClick={() => handleSelectRole(availableRole)}
                                          style={{
                                            display: 'flex', alignItems: 'center', width: '100%', padding: '4px 0',
                                            border: 'none', background: 'transparent',
                                            color: isActiveRole ? GREEN : INK, fontSize: 12, fontWeight: isActiveRole ? 700 : 500,
                                            cursor: 'pointer', textAlign: 'left',
                                          }}
                                        >
                                          {roleOption.short}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{currentRole.label}</div>
                            )}
                          </div>
                          {canEditCurrentUser && (
                            <button
                              onClick={() => { setRoleMenuOpen(false); setNavMenuOpen(false); onRequestCloseNotifications?.(); onOpenSettings?.(); }}
                              aria-label="Abrir configuración de cuenta"
                              style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${BORDER_TINT}`, background: CANVAS, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                            >
                              <Settings2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={() => { setRoleMenuOpen(false); onLogout(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '10px 16px', background: 'rgba(180,35,24,0.05)', border: 'none',
                        color: DANGER, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <LogOut size={13} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Notification bell */}
            <button
              onClick={(event) => {
                setRoleMenuOpen(false);
                setNavMenuOpen(false);
                onBellClick?.(event.currentTarget.getBoundingClientRect());
              }}
              style={{
                position: 'relative', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 9999,
              }}
              aria-label={unreadCount > 0 ? `Abrir notificaciones: ${unreadCount} sin leer` : 'Abrir notificaciones'}
            >
              <Bell size={16} color={unreadCount > 0 ? '#c4001a' : MUTED} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 2, minWidth: 16, height: 16,
                  background: '#c4001a', borderRadius: 9999, border: `1.5px solid ${CANVAS}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#ffffff', padding: '0 4px', lineHeight: 1, pointerEvents: 'none',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── Mobile sidebar overlay ────────────────────────────── */}
        {isMobile && navMenuOpen && (
          <>
            <div
              onClick={() => setNavMenuOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 109 }}
            />
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
              background: SIDEBAR_BG, zIndex: 110, display: 'flex', flexDirection: 'column',
              animation: 'slideInLeft 0.2s ease',
            }}>
              <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>D</span>
                </span>
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, color: SIDEBAR_TEXT }}>Dimagraf</span>
              </div>
              <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navItems.map(item => {
                  const active = activeNavView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { handleSelectView(item.id); setNavMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px',
                        background: active ? SIDEBAR_ACTIVE : 'transparent', border: 'none', borderRadius: 10,
                        color: active ? '#ffffff' : SIDEBAR_TEXT, fontSize: 13, fontWeight: active ? 600 : 400,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                      <span>{item.mobileLabel || item.label}</span>
                    </button>
                  );
                })}
              </nav>
              {/* Mobile role + logout */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px' }}>
                {availableRoles.length > 1 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: SIDEBAR_MUTED, letterSpacing: '0.06em', marginBottom: 6 }}>CAMBIAR ROL</div>
                    {availableRoles.map((availableRole) => {
                      const roleOption = getRoleMeta(availableRole);
                      const isActiveRole = availableRole === role;
                      return (
                        <button
                          key={roleOption.id}
                          onClick={() => { handleSelectMobileRole(availableRole); setNavMenuOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', width: '100%', padding: '6px 8px',
                            border: 'none', background: isActiveRole ? 'rgba(26,92,56,0.2)' : 'transparent', borderRadius: 6,
                            color: isActiveRole ? '#a7f3d0' : SIDEBAR_TEXT, fontSize: 12, fontWeight: isActiveRole ? 700 : 400,
                            cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                          }}
                        >
                          {roleOption.short}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => { setNavMenuOpen(false); onLogout(); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                    padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: 'rgba(180,35,24,0.15)', color: '#fca5a5', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Content ──────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
