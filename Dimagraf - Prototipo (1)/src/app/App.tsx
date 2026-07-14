import { useEffect, useMemo, useState } from 'react';
import { Layout, type AccessRole, type NotificationAnchorRect } from './components/Layout';
import { OperatorDashboard } from './components/OperatorDashboard';
import { CarpetaDetail } from './components/CarpetaDetail';
import { DirectorDashboard } from './components/DirectorDashboard';
import { CommercialArrivals } from './components/CommercialArrivals';
import { TreasuryCashFlow } from './components/TreasuryCashFlow';
import { WarehouseReception } from './components/WarehouseReception';
import { AdminDashboard } from './components/AdminDashboard';
import { DesignSystemPage } from './components/DesignSystemPage';
import { DispatcherDashboard } from './components/DispatcherDashboard';
import { NotificationPanel } from './components/NotificationPanel';
import { LoginScreen } from './components/LoginScreen';
import { PasswordRecoveryPage } from './components/PasswordRecoveryPage';
import { AccountSettingsPage, type MailReportConfig } from './components/AccountSettingsPage';
import { CARPETAS, INITIAL_NOTIFICATIONS, USERS, type Carpeta, type AppNotification, type AuditEntry, type AppUser } from './components/mockData';
import type { Role } from './components/mockData';

type View = 'carpetas' | 'carpeta-detail' | 'arrivals' | 'cashflow' | 'reception' | 'audit' | 'dashboard'
          | 'admin-users' | 'admin-audit' | 'admin-articles' | 'admin-providers' | 'admin-design-system' | 'settings';
type DetailTabTarget = 'general' | 'articulos';

type SessionState =
  | { kind: 'abm'; userId: string; activeRole: Role }
  | { kind: 'design-system'; activeRole: 'design-system' }
  | null;

const DESIGN_SYSTEM_ACCESS = {
  username: 'design-system',
  label: 'Design System · Usuario de prueba',
} as const;

const TESTING_PREVIEW_USERNAME = 'testing';

const INITIAL_VIEWS: Record<Role, View> = {
  operator:   'carpetas',
  director:   'dashboard',
  commercial: 'carpetas',
  treasury:   'cashflow',
  warehouse:  'reception',
  dispatcher: 'carpetas',
  admin:      'admin-users',
};

const DEFAULT_MAIL_CONFIG: MailReportConfig = {
  enabled: false,
  recipients: '',
  frequency: 'Semanal',
  sendTime: '08:00',
  selectedReports: ['arrivals', 'vencimientos'],
};

export default function App() {
  const isRecoveryMode = new URLSearchParams(window.location.search).get('recovery') === '1';
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [session, setSession] = useState<SessionState>(null);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [view, setView] = useState<View>('carpetas');
  const [selectedCarpetaId, setSelectedCarpetaId] = useState<string | null>(null);
  const [selectedDetailTab, setSelectedDetailTab] = useState<DetailTabTarget>('general');
  const [carpetasList, setCarpetasList] = useState<Carpeta[]>([...CARPETAS]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifAnchorRect, setNotifAnchorRect] = useState<NotificationAnchorRect | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [mailConfigByUser, setMailConfigByUser] = useState<Record<string, MailReportConfig>>({});
  const [lastContentView, setLastContentView] = useState<View>('carpetas');

  const currentUser = useMemo(
    () => session?.kind === 'abm' ? users.find(user => user.id === session.userId) ?? null : null,
    [session, users],
  );
  const role = session?.activeRole ?? 'operator';
  const canUseDesignSystemPreview = currentUser?.username.trim().toLowerCase() === TESTING_PREVIEW_USERNAME;
  const availableRoles: AccessRole[] = session?.kind === 'abm'
    ? [
        ...(currentUser?.roles ?? []),
        ...(canUseDesignSystemPreview ? ['design-system' as const] : []),
      ]
    : session?.kind === 'design-system'
      ? ['design-system']
      : [];

  useEffect(() => {
    if (!session || session.kind !== 'abm') return;
    if (!currentUser || currentUser.estado !== 'Activo') {
      setSession(null);
      setLoginError('Tu acceso fue deshabilitado. Ingresá nuevamente con un usuario activo.');
      setNotifOpen(false);
      return;
    }

    if (!availableRoles.includes(session.activeRole)) {
      const fallbackRole = currentUser.roles[0];
      if (!fallbackRole) {
        setSession(null);
        setLoginError('El usuario no tiene roles asignados en el ABM.');
        return;
      }
      setSession({ kind: 'abm', userId: currentUser.id, activeRole: fallbackRole });
      setView(INITIAL_VIEWS[fallbackRole]);
      setSelectedCarpetaId(null);
    }
  }, [availableRoles, currentUser, session]);

  useEffect(() => {
    setNotifOpen(false);
  }, [role, view, selectedCarpetaId]);

  const visibleNotifications = session?.kind === 'abm'
    ? notifications.filter(notification => !notification.role || notification.role === role)
    : [];

  const unreadCount = visibleNotifications.filter(notification => !notification.read).length;

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const entry: AppNotification = {
      ...n,
      id: `n_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [entry, ...prev]);
  };

  const addAuditEntry = (e: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const entry: AuditEntry = { ...e, id: `al_${Date.now()}`, timestamp: new Date().toISOString() };
    setAuditEntries(prev => [entry, ...prev]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    const visibleIds = new Set(visibleNotifications.map(notification => notification.id));
    setNotifications(prev => prev.map(notification => visibleIds.has(notification.id) ? { ...notification, read: true } : notification));
  };

  const handleSetRole = (nextRole: AccessRole) => {
    if (nextRole === 'design-system') {
      setSession({ kind: 'design-system', activeRole: 'design-system' });
      setView('admin-design-system');
      setSelectedCarpetaId(null);
      setSelectedDetailTab('general');
      return;
    }
    if (!currentUser) return;
    setSession({ kind: 'abm', userId: currentUser.id, activeRole: nextRole });
    setView(INITIAL_VIEWS[nextRole]);
    setSelectedCarpetaId(null);
    setSelectedDetailTab('general');
  };

  const handleLogout = () => {
    setSession(null);
    setLoginError(undefined);
    setNotifOpen(false);
    setView('carpetas');
    setSelectedCarpetaId(null);
    setSelectedDetailTab('general');
  };

  const handleUpdateCurrentUser = (updates: { nombre: string; apellido: string; email: string; password?: string }) => {
    if (!currentUser) return;

    const nextUser = {
      ...currentUser,
      nombre: updates.nombre,
      apellido: updates.apellido,
      email: updates.email,
      ...(updates.password ? { password: updates.password } : {}),
    };

    setUsers(prevUsers => prevUsers.map(user => user.id === currentUser.id ? nextUser : user));

    addAuditEntry({
      userId: currentUser.id,
      userName: `${updates.nombre} ${updates.apellido}`.trim(),
      userRole: role === 'design-system' ? 'admin' : role,
      action: 'Editó su perfil',
      entity: 'Usuario',
      entityId: currentUser.username,
      detail: updates.password ? `${updates.email} · actualizó contraseña` : updates.email,
    });
  };

  const handleLogin = (username: string, _password: string) => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      setLoginError('Ingresá un usuario válido para continuar.');
      return;
    }

    if (normalizedUsername === DESIGN_SYSTEM_ACCESS.username) {
      setSession({ kind: 'design-system', activeRole: 'design-system' });
      setView('admin-design-system');
      setSelectedCarpetaId(null);
      setSelectedDetailTab('general');
      setLoginError(undefined);
      return;
    }

    const matchedUser = users.find(user => user.username.trim().toLowerCase() === normalizedUsername);
    if (!matchedUser) {
      setLoginError('Ese usuario no existe en el ABM ni corresponde al acceso de Design System.');
      return;
    }
    if (matchedUser.estado !== 'Activo') {
      setLoginError('El usuario está inactivo y no puede ingresar.');
      return;
    }
    if (matchedUser.password && matchedUser.password !== _password) {
      setLoginError('La contraseña ingresada no coincide con ese usuario.');
      return;
    }
    if (matchedUser.roles.length === 0) {
      setLoginError('El usuario no tiene roles asignados en el ABM.');
      return;
    }

    const initialRole = matchedUser.roles[0];
    setSession({ kind: 'abm', userId: matchedUser.id, activeRole: initialRole });
    setView(INITIAL_VIEWS[initialRole]);
    setSelectedCarpetaId(null);
    setSelectedDetailTab('general');
    setLoginError(undefined);
  };

  const handleSelectCarpeta = (id: string, detailTab: DetailTabTarget = 'general') => {
    setSelectedCarpetaId(id);
    setSelectedDetailTab(detailTab);
    setView('carpeta-detail');
  };

  const handleBack = () => {
    setSelectedCarpetaId(null);
    setSelectedDetailTab('general');
    setView(role === 'director' ? 'dashboard' : role === 'design-system' ? 'admin-design-system' : 'carpetas');
  };

  const handleSetView = (v: string) => {
    const nextView = v as View;
    if (nextView !== 'settings') {
      setLastContentView(nextView);
    }
    setView(nextView);
    if (nextView !== 'carpeta-detail') {
      setSelectedCarpetaId(null);
      setSelectedDetailTab('general');
    }
  };

  const handleOpenSettings = () => {
    setLastContentView(view === 'settings' ? lastContentView : view);
    setView('settings');
  };

  const handleCloseSettings = () => {
    setView(lastContentView);
  };

  const currentMailConfig = currentUser
    ? mailConfigByUser[currentUser.id] ?? DEFAULT_MAIL_CONFIG
    : DEFAULT_MAIL_CONFIG;

  const handleSaveSettings = (updates: { password?: string; mailConfig: MailReportConfig }) => {
    if (!currentUser) return;
    if (updates.password) {
      handleUpdateCurrentUser({
        nombre: currentUser.nombre,
        apellido: currentUser.apellido,
        email: currentUser.email,
        password: updates.password,
      });
    }

    setMailConfigByUser(prev => ({
      ...prev,
      [currentUser.id]: updates.mailConfig,
    }));

    addAuditEntry({
      userId: currentUser.id,
      userName: `${currentUser.nombre} ${currentUser.apellido}`.trim(),
      userRole: role === 'design-system' ? 'admin' : role,
      action: 'Actualizó configuración de reportes por correo',
      entity: 'Configuración',
      entityId: currentUser.username,
      detail: `${updates.mailConfig.selectedReports.length} reporte(s) · ${updates.mailConfig.frequency} ${updates.mailConfig.sendTime}`,
    });

    setView(lastContentView);
  };

  const handleCreateCarpeta = (carpeta: Carpeta) => {
    setCarpetasList(prev => [carpeta, ...prev]);
    addNotification({
      type: 'success',
      title: 'Carpeta creada',
      message: `Carpeta ${carpeta.numero} abierta · ${carpeta.moneda} ${carpeta.montoTotal.toLocaleString()}`,
      role: 'operator',
      entityId: carpeta.id,
    });
    addAuditEntry({
      userId: 'u2', userName: 'Marcos Delgado', userRole: 'operator',
      action: 'Creó carpeta',
      entity: 'Carpeta', entityId: carpeta.numero,
      detail: `${carpeta.moneda} ${carpeta.montoTotal.toLocaleString()}`,
    });
  };

  const handleUpdateCarpeta = (updatedCarpeta: Carpeta) => {
    setCarpetasList(prev => prev.map(carpeta => carpeta.id === updatedCarpeta.id ? updatedCarpeta : carpeta));
  };

  const selectedCarpeta = selectedCarpetaId ? carpetasList.find(c => c.id === selectedCarpetaId) : null;
  const breadcrumb = view === 'carpeta-detail' && selectedCarpeta ? selectedCarpeta.numero : undefined;

  const renderContent = () => {
    if (role === 'design-system') return <DesignSystemPage />;
    if (view === 'settings' && currentUser) {
      return (
        <AccountSettingsPage
          activeRole={role}
          currentUser={currentUser}
          mailConfig={currentMailConfig}
          onChangeMailConfig={(next) => {
            setMailConfigByUser(prev => ({ ...prev, [currentUser.id]: next }));
          }}
          onSave={handleSaveSettings}
          onBack={handleCloseSettings}
        />
      );
    }
    if (role === 'operator') {
      if (view === 'carpeta-detail' && selectedCarpetaId)
        return <CarpetaDetail carpetaId={selectedCarpetaId} carpetasList={carpetasList} onBack={handleBack} onUpdateCarpeta={handleUpdateCarpeta} initialTab={selectedDetailTab} />;
      if (view === 'arrivals') return <CommercialArrivals />;
      return <OperatorDashboard carpetasList={carpetasList} onSelectCarpeta={handleSelectCarpeta} onCreateCarpeta={handleCreateCarpeta} />;
    }
    if (role === 'director') {
      if (view === 'carpeta-detail' && selectedCarpetaId)
        return <CarpetaDetail carpetaId={selectedCarpetaId} carpetasList={carpetasList} onBack={handleBack} onUpdateCarpeta={handleUpdateCarpeta} readonly initialTab={selectedDetailTab} />;
      if (view === 'carpetas')
        return <OperatorDashboard carpetasList={carpetasList} onSelectCarpeta={handleSelectCarpeta} onCreateCarpeta={handleCreateCarpeta} />;
      return (
        <DirectorDashboard
          onViewCarpeta={handleSelectCarpeta}
          carpetasList={carpetasList}
          section={view === 'audit' ? 'audit' : 'kpi'}
          onSectionChange={(nextSection) => setView(nextSection === 'audit' ? 'audit' : 'dashboard')}
        />
      );
    }
    if (role === 'commercial') {
      if (view === 'carpeta-detail' && selectedCarpetaId)
        return <CarpetaDetail carpetaId={selectedCarpetaId} carpetasList={carpetasList} onBack={handleBack} onUpdateCarpeta={handleUpdateCarpeta} readonly hideImportes initialTab={selectedDetailTab} />;
      if (view === 'carpetas')
        return <OperatorDashboard carpetasList={carpetasList} onSelectCarpeta={handleSelectCarpeta} onCreateCarpeta={handleCreateCarpeta} hideImportes />;
      return <CommercialArrivals />;
    }
    if (role === 'treasury')    return <TreasuryCashFlow />;
    if (role === 'warehouse')   return <WarehouseReception />;
    if (role === 'dispatcher')  return <DispatcherDashboard carpetasList={carpetasList} />;
    if (role === 'admin') {
      return <AdminDashboard users={users} onUsersChange={setUsers} extraAuditEntries={auditEntries} activeTab={view} />;
    }
    return null;
  };

  if (isRecoveryMode) {
    return <PasswordRecoveryPage users={users} />;
  }

  if (!session) {
    return <LoginScreen error={loginError} onLogin={handleLogin} />;
  }

  const currentUserLabel = session.kind === 'design-system'
    ? DESIGN_SYSTEM_ACCESS.label
    : `${currentUser?.nombre ?? ''} ${currentUser?.apellido ?? ''}`.trim() || currentUser?.username || 'Usuario';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d2d2d7; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #b0b0b7; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder, textarea::placeholder { color: #b0b0b7; }
        button { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        select { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        select option { background: #ffffff; color: #1d1d1f; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>

      <Layout
        role={role}
        availableRoles={availableRoles}
        setRole={handleSetRole}
        view={view}
        setView={handleSetView}
        breadcrumb={breadcrumb}
        unreadCount={unreadCount}
        onRequestCloseNotifications={() => setNotifOpen(false)}
        onBellClick={(anchorRect) => {
          setNotifAnchorRect(anchorRect);
          setNotifOpen(open => !open);
        }}
        currentUser={currentUser}
        currentUserLabel={currentUserLabel}
        onOpenSettings={session.kind === 'abm' ? handleOpenSettings : undefined}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>

      {notifOpen && (
        <NotificationPanel
          notifications={visibleNotifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setNotifOpen(false)}
          anchorRect={notifAnchorRect}
        />
      )}
    </>
  );
}
