import { useEffect, useState } from 'react';
import { Bell, FolderOpen, Ship, BarChart3, DollarSign, Boxes, Activity, Users, Shield, Package, LogOut, Menu, X, ChevronDown, Settings2 } from 'lucide-react';
import type { AppUser, Role } from './mockData';
import { useIsMobile } from './ui/use-mobile';

const GREEN  = '#1a5c38';
const VIOLET = '#5b21b6';
const INK    = '#1d1d1f';
const MUTED  = '#667085';
const DANGER = '#b42318';
const HAIRLINE = '#eaecf0';
const PARCHMENT = '#f8fafc';
const CANVAS = '#ffffff';

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
    { id: 'carpetas',  label: 'Carpetas (OCs)',     mobileLabel: 'Carpetas',   icon: <FolderOpen size={15} /> },
    { id: 'arrivals',  label: 'Matriz de Arrivals', mobileLabel: 'Arrivals',   icon: <Ship size={15} /> },
  ];
  if (role === 'director') return [
    { id: 'dashboard', label: 'Control Gerencial', mobileLabel: 'Control',    icon: <Activity size={15} /> },
    { id: 'audit',     label: 'Auditoría Costos',  mobileLabel: 'Auditoría',  icon: <BarChart3 size={15} /> },
    { id: 'carpetas',  label: 'Carpetas',          mobileLabel: 'Carpetas',   icon: <FolderOpen size={15} /> },
  ];
  if (role === 'commercial') return [
    { id: 'carpetas', label: 'Carpetas',            mobileLabel: 'Carpetas', icon: <FolderOpen size={15} /> },
    { id: 'arrivals', label: 'Matriz de Arrivals',  mobileLabel: 'Arrivals', icon: <Ship size={15} /> },
  ];
  if (role === 'treasury') return [
    { id: 'cashflow', label: 'Flujo de Caja', mobileLabel: 'Flujo', icon: <DollarSign size={15} /> },
  ];
  if (role === 'warehouse') return [
    { id: 'reception', label: 'Recepciones', mobileLabel: 'Recepción', icon: <Boxes size={15} /> },
  ];
  if (role === 'dispatcher') return [
    { id: 'carpetas', label: 'Carpetas', mobileLabel: 'Carpetas', icon: <FolderOpen size={15} /> },
  ];
  if (role === 'admin') return [
    { id: 'admin-users',     label: 'Usuarios',    mobileLabel: 'Usuarios',    icon: <Users size={15} /> },
    { id: 'admin-audit',     label: 'Auditoría',   mobileLabel: 'Auditoría',   icon: <Shield size={15} /> },
    { id: 'admin-articles',  label: 'Artículos',   mobileLabel: 'Artículos',   icon: <Package size={15} /> },
    { id: 'admin-providers', label: 'Proveedores', mobileLabel: 'Proveedores', icon: <Ship size={15} /> },
  ];
  if (role === 'design-system') return [
    { id: 'admin-design-system', label: 'Design System', mobileLabel: 'Sistema', icon: <Package size={15} /> },
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
    if (!roleMenuOpen && !navMenuOpen) {
      setProfileSwitchExpanded(false);
    }
  }, [navMenuOpen, roleMenuOpen]);

  const profileRoles = currentUser?.roles.map(currentAssignedRole => getRoleMeta(currentAssignedRole).short) ?? [];

  return (
    <>
    <div className="size-full flex flex-col" style={{ fontFamily: 'var(--font-ui)' }}>

      {/* ── Global Nav ─────────────────────────────────────────── */}
      <header style={{
        height: 64,
        background: 'rgba(255,255,255,0.96)',
        borderBottom: `1px solid ${HAIRLINE}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 28px',
        flexShrink: 0,
        zIndex: 100,
        backdropFilter: 'blur(18px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/src/imports/imagen__3_.png" alt="Dimagraf" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
            Comex/Importaciones
          </span>
        </div>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 8, flexShrink: 0 }}>
          {/* User menu */}
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
                padding: isMobile ? '6px' : '6px 12px 6px 6px',
                background: isMobile ? 'transparent' : CANVAS,
                border: isMobile ? 'none' : `1px solid ${HAIRLINE}`,
                borderRadius: 9999,
                color: INK,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                maxWidth: isMobile ? 40 : 150,
                boxShadow: isMobile ? 'none' : '0 1px 2px rgba(16,24,40,0.04)',
              }}
              aria-label="Abrir menú de usuario"
            >
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(26,92,56,0.12)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {userInitials}
              </span>
              {!isMobile && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: MUTED }}>
                  {currentRole.short}
                </span>
              )}
            </button>

            {roleMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: CANVAS,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 16,
                boxShadow: '0 18px 48px rgba(16,24,40,0.10)',
                width: isMobile ? 'min(260px, calc(100vw - 24px))' : 260,
                overflow: 'hidden',
                zIndex: 200,
              }}>
                <div style={{ borderBottom: `1px solid ${HAIRLINE}`, background: CANVAS }}>
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
                                <div style={{ display: 'grid', gap: 2, marginTop: -2, paddingLeft: 12, borderLeft: `1px solid ${HAIRLINE}` }}>
                                  {availableRoles.map((availableRole) => {
                                    const roleOption = getRoleMeta(availableRole);
                                    const isActiveRole = availableRole === role;

                                    return (
                                      <button
                                        key={roleOption.id}
                                        onClick={() => handleSelectRole(availableRole)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          width: '100%',
                                          padding: '4px 0',
                                          border: 'none',
                                          background: 'transparent',
                                          color: isActiveRole ? GREEN : INK,
                                          fontSize: 12,
                                          fontWeight: isActiveRole ? 700 : 500,
                                          cursor: 'pointer',
                                          textAlign: 'left',
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
                            onClick={() => {
                              setRoleMenuOpen(false);
                              setNavMenuOpen(false);
                              onRequestCloseNotifications?.();
                              onOpenSettings?.();
                            }}
                            aria-label="Abrir configuración de cuenta"
                            style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${HAIRLINE}`, background: CANVAS, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
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
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(180,35,24,0.05)',
                      border: 'none',
                      color: DANGER,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
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
              position: 'relative',
              width: 36,
              height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: 9999,
            }}
            aria-label={unreadCount > 0 ? `Abrir notificaciones: ${unreadCount} sin leer` : 'Abrir notificaciones'}
          >
            <Bell size={16} color={unreadCount > 0 ? '#c4001a' : MUTED} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 2,
                minWidth: 16,
                height: 16,
                background: '#c4001a',
                borderRadius: 9999,
                border: `1.5px solid ${CANVAS}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#ffffff',
                padding: '0 4px',
                lineHeight: 1,
                pointerEvents: 'none',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isMobile && (
            <button
              onClick={() => {
                setRoleMenuOpen(false);
                onRequestCloseNotifications?.();
                setNavMenuOpen(open => !open);
              }}
              style={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                background: 'transparent',
                border: 'none',
                color: INK,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label={navMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            >
              {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </header>

      {isMobile && navMenuOpen && (
        <>
          <div
            onClick={() => setNavMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(29,29,31,0.28)',
              backdropFilter: 'blur(2px)',
              zIndex: 109,
            }}
          />
          <div style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            background: CANVAS,
            borderBottom: `1px solid ${HAIRLINE}`,
            boxShadow: '0 18px 48px rgba(16,24,40,0.10)',
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            zIndex: 110,
            animation: 'fadeIn 0.18s ease',
            overflow: 'hidden',
          }}>
            <div style={{ borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfb' }}>
              {currentUser && (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,92,56,0.12)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
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
                            <div style={{ display: 'grid', gap: 2, marginTop: -2, paddingLeft: 12, borderLeft: `1px solid ${HAIRLINE}` }}>
                              {availableRoles.map((availableRole) => {
                                const roleOption = getRoleMeta(availableRole);
                                const isActiveRole = availableRole === role;

                                return (
                                  <button
                                    key={roleOption.id}
                                    onClick={() => handleSelectMobileRole(availableRole)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      width: '100%',
                                      padding: '4px 0',
                                      border: 'none',
                                      background: 'transparent',
                                      color: isActiveRole ? GREEN : INK,
                                      fontSize: 12,
                                      fontWeight: isActiveRole ? 700 : 500,
                                      cursor: 'pointer',
                                      textAlign: 'left',
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
                        onClick={() => {
                          setRoleMenuOpen(false);
                          setNavMenuOpen(false);
                          onRequestCloseNotifications?.();
                          onOpenSettings?.();
                        }}
                        aria-label="Abrir configuración de cuenta"
                        style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${HAIRLINE}`, background: '#fcfcfb', color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                      >
                        <Settings2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '10px 0 0' }}>
              {!hideSectionNav && (
                <>
                  <div style={{ padding: '0 16px 8px', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>
                    SECCIONES
                  </div>
                  {navItems.map((item, index) => {
                    const active = activeNavView === item.id;

                    return (
                      <button
                        key={item.id}
                        data-nav-button="true"
                        onClick={() => handleSelectView(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: '13px 16px',
                          background: active ? 'rgba(26,92,56,0.04)' : CANVAS,
                          border: 'none',
                          borderBottom: index === navItems.length - 1 ? 'none' : `1px solid ${HAIRLINE}`,
                          borderLeft: active ? `2px solid ${GREEN}` : '2px solid transparent',
                          color: active ? GREEN : INK,
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? GREEN : MUTED, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              <div style={{ padding: '10px 16px 16px', borderTop: `1px solid ${HAIRLINE}`, marginTop: 8, background: '#fcfcfb' }}>
                <button
                  onClick={() => {
                    setNavMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'rgba(180,35,24,0.08)',
                    color: DANGER,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Sub-nav ───────────────────────────────────────────── */}
      {!isMobile && !hideSectionNav && (
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          borderBottom: `1px solid ${HAIRLINE}`,
          padding: '0 28px',
          flexShrink: 0,
          zIndex: 90,
          backdropFilter: 'blur(18px)',
        }}>
          <div style={{ display: 'grid', gap: breadcrumb ? 8 : 0 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                overflowX: 'visible',
                flexWrap: 'wrap',
                minHeight: 50,
              }}>
                {navItems.map(item => {
                  const active = activeNavView === item.id;

                  return (
                    <button
                      key={item.id}
                      data-nav-button="true"
                      onClick={() => handleSelectView(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        color: active ? GREEN : MUTED,
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 0,
                        cursor: 'pointer',
                        transition: 'color 0.15s ease, opacity 0.15s ease',
                        whiteSpace: 'nowrap',
                        height: 50,
                        minWidth: 0,
                        borderBottom: active ? `2px solid ${GREEN}` : '2px solid transparent',
                        opacity: active ? 1 : 0.92,
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: 18,
                        height: 18,
                        color: active ? GREEN : MUTED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {breadcrumb && (
              <div style={{
                padding: '0 4px 10px',
                fontSize: 12,
                fontWeight: 500,
                color: MUTED,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {breadcrumb}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
        {children}
      </main>
    </div>


    </>
  );
}
