import { useState, type ReactNode } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Users, Shield, Package, Ship, ChevronDown } from 'lucide-react';
import { fieldLabel, formInput, getModalDestructiveButtonStyle, getModalPrimaryButtonStyle, getModalSecondaryButtonStyle, getModalShellStyle, getResponsiveTableStyle, modalBody, modalCloseButton, modalFooter, modalHeader, modalOverlay, pageActions, pageHeader, pageShell, tableScrollArea, tableShell } from './chromeStyles';
import {
  AUDIT_LOG, ARTICULOS_CATALOGO, PROVEEDORES,
  ROLE_LABELS,
  type AppUser, type AuditEntry, type ArticuloCatalogo, type Proveedor, type Role,
} from './mockData';
import { useIsMobile } from './ui/use-mobile';
import { SearchField, normalizeSearchTerm } from './SearchField';
import { color } from './theme';
import { AppButton } from './AppButton';
import { FilterToolbar } from './FilterToolbar';

const { ink: INK, muted: MUTED, parchment: PARCHMENT, hairline: HAIRLINE, brand: GREEN, violet: VIOLET, canvas: CANVAS, surface: STICKY_ACTION_BACKGROUND } = color;

const ALL_ROLES: Role[] = ['operator', 'director', 'commercial', 'treasury', 'warehouse', 'dispatcher', 'admin'];

const ROLE_COLORS: Record<Role, string> = {
  operator:   '#1a5c38',
  director:   '#5b21b6',
  commercial: '#0066cc',
  treasury:   '#b45309',
  warehouse:  '#6e6e73',
  dispatcher: '#0f766e',
  admin:      '#c4001a',
};

function RoleBadge({ role }: { role: Role }) {
  const color = ROLE_COLORS[role];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}14`, border: `1px solid ${color}33`, borderRadius: 9999, padding: '2px 9px' }}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function DetailToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <AppButton type="button" variant="tertiary" size="xs" onClick={onClick} style={{ padding: 0 }}>
      <span>{expanded ? 'Ver menos' : 'Ver más'}</span>
      <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }} />
    </AppButton>
  );
}

function RowActionIconButton({ onClick, icon, danger = false }: { onClick: () => void; icon: ReactNode; danger?: boolean }) {
  return (
    <AppButton
      type="button"
      size="xs"
      variant={danger ? 'danger-soft' : 'secondary'}
      onClick={onClick}
      icon={icon}
      style={{ borderRadius: 8 }}
    >
    </AppButton>
  );
}

function EmptyTableState({ message }: { message: string }) {
  return <div style={{ textAlign: 'center', padding: 48, color: MUTED, fontSize: 14 }}>{message}</div>;
}

// --- Users Tab ----------------------------------------------------------------

interface UserFormState {
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Role[];
  estado: 'Activo' | 'Inactivo';
}
const EMPTY_USER: UserFormState = { username: '', nombre: '', apellido: '', email: '', roles: ['operator'], estado: 'Activo' };

function UsersTab({ users, onUsersChange }: { users: AppUser[]; onUsersChange: (users: AppUser[]) => void }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | { mode: 'create' | 'edit'; user?: AppUser }>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filtered = users.filter(u => {
    const q = normalizeSearchTerm(search);
    return !q
      || normalizeSearchTerm(`${u.nombre} ${u.apellido}`).includes(q)
      || normalizeSearchTerm(u.username).includes(q)
      || normalizeSearchTerm(u.email).includes(q)
      || u.roles.some(role => normalizeSearchTerm(ROLE_LABELS[role]).includes(q));
  });

  const openCreate = () => { setForm(EMPTY_USER); setModal({ mode: 'create' }); };
  const openEdit   = (u: AppUser) => {
    setForm({ username: u.username, nombre: u.nombre, apellido: u.apellido, email: u.email, roles: [...u.roles], estado: u.estado });
    setModal({ mode: 'edit', user: u });
  };
  const closeModal = () => setModal(null);

  const handleSave = () => {
    if (modal?.mode === 'create') {
      const nu: AppUser = { id: `u${Date.now()}`, ...form, designSystemAccess: false, lastLogin: '—', createdAt: new Date().toISOString().split('T')[0] };
      onUsersChange([nu, ...users]);
    } else if (modal?.mode === 'edit' && modal.user) {
      onUsersChange(users.map(u => u.id === modal.user!.id ? { ...u, ...form, designSystemAccess: u.designSystemAccess } : u));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    onUsersChange(users.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const f = (field: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const toggleRole = (role: Role) => {
    setForm(prev => {
      const hasRole = prev.roles.includes(role);
      if (hasRole && prev.roles.length === 1) return prev;
      return {
        ...prev,
        roles: hasRole ? prev.roles.filter(currentRole => currentRole !== role) : [...prev.roles, role],
      };
    });
  };

  const canSave = Boolean(form.username.trim() && form.nombre.trim() && form.apellido.trim() && form.email.trim() && form.roles.length > 0);
  const getRolesLabel = (roles: Role[]) => roles.map(role => ROLE_LABELS[role]).join(', ');
  const toggleExpandedUser = (id: string) => setExpandedUserId(current => current === id ? null : id);

  return (
    <div>
      <div style={{ ...pageActions, justifyContent: 'flex-end', marginBottom: 12 }}>
        <AppButton onClick={openCreate} size="sm">
          <Plus size={13} /> Nuevo Usuario
        </AppButton>
      </div>

      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <div style={{ width: '100%', maxWidth: 380 }}><SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre, email o rol..." /></div>
        </div>
        {isMobile ? (
        <div>
          {filtered.map((u, i) => (
            <div key={u.id} style={{ padding: '12px 14px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 10, alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ROLE_COLORS[u.roles[0]]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ROLE_COLORS[u.roles[0]], flexShrink: 0 }}>
                  {u.nombre[0]}{u.apellido[0]}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{u.nombre} {u.apellido}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.35 }}>{getRolesLabel(u.roles)}</div>
                </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: u.estado === 'Activo' ? '#1a7a4a' : MUTED, background: u.estado === 'Activo' ? 'rgba(26,122,74,0.08)' : 'rgba(110,110,115,0.08)', borderRadius: 9999, padding: '2px 8px' }}>
                  {u.estado}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10, paddingLeft: 42 }}>
                <DetailToggleButton expanded={expandedUserId === u.id} onClick={() => toggleExpandedUser(u.id)} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <RowActionIconButton onClick={() => openEdit(u)} icon={<Edit2 size={12} />} />
                  <RowActionIconButton onClick={() => setDeleteConfirm(u.id)} icon={<Trash2 size={12} />} danger />
                </div>
              </div>
              {expandedUserId === u.id && (
                <div style={{ display: 'grid', gap: 10, marginTop: 10, marginLeft: 42, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>USUARIO</div>
                    <div style={{ fontSize: 12, color: VIOLET, fontWeight: 600, marginTop: 2 }}>{u.username}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>EMAIL</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{u.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>CREADO</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{u.createdAt}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        ) : (
        <div style={tableScrollArea}>
        <table style={getResponsiveTableStyle(760)}>
          <thead>
            <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
              {['USUARIO', 'PERFIL', 'ACCIONES'].map(c => (
                <th key={c} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{c}</th>
              ))}
              <th style={{ position: 'sticky', right: 0, zIndex: 2, background: PARCHMENT, padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <>
                <tr key={u.id} style={{ borderBottom: expandedUserId === u.id ? 'none' : i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                  onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                  onMouseLeave={e => (e.currentTarget.style.background = CANVAS)}>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ROLE_COLORS[u.roles[0]]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ROLE_COLORS[u.roles[0]], flexShrink: 0 }}>
                        {u.nombre[0]}{u.apellido[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{u.nombre} {u.apellido}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: MUTED, lineHeight: 1.35 }}>{getRolesLabel(u.roles)}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <DetailToggleButton expanded={expandedUserId === u.id} onClick={() => toggleExpandedUser(u.id)} />
                      <div style={{ display: 'flex', gap: 4 }}>
                      <RowActionIconButton onClick={() => openEdit(u)} icon={<Edit2 size={12} />} />
                      <RowActionIconButton onClick={() => setDeleteConfirm(u.id)} icon={<Trash2 size={12} />} danger />
                      </div>
                    </div>
                  </td>
                  <td style={{ position: 'sticky', right: 0, zIndex: 1, background: STICKY_ACTION_BACKGROUND, padding: '11px 16px', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: u.estado === 'Activo' ? '#1a7a4a' : MUTED, background: u.estado === 'Activo' ? 'rgba(26,122,74,0.08)' : 'rgba(110,110,115,0.08)', borderRadius: 9999, padding: '2px 9px' }}>
                      {u.estado}
                    </span>
                  </td>
                </tr>
                {expandedUserId === u.id && (
                  <tr key={`${u.id}-expanded`} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: '#fafaf9' }}>
                    <td colSpan={4} style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>USUARIO</div>
                          <div style={{ fontSize: 12, color: VIOLET, fontWeight: 600, marginTop: 4 }}>{u.username}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>EMAIL</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>{u.email}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>CREADO</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{u.createdAt}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        </div>
        )}
        {filtered.length === 0 && <EmptyTableState message="Sin usuarios encontrados." />}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div style={{ ...modalOverlay, zIndex: 500 }}>
          <div style={getModalShellStyle(480)}>
            <div style={modalHeader}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>{modal.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
              <button onClick={closeModal} style={modalCloseButton}>
                <X size={14} color={MUTED} />
              </button>
            </div>
            <div style={modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['nombre', 'NOMBRE *', 'Juan'], ['apellido', 'APELLIDO *', 'García']].map(([field, label, ph]) => (
                  <div key={field}>
                    <label style={fieldLabel}>{label}</label>
                    <input value={(form as any)[field]} onChange={f(field as keyof UserFormState)} placeholder={ph}
                      style={{ ...formInput, fontSize: 13 }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={fieldLabel}>USUARIO *</label>
                <input value={form.username} onChange={f('username')} placeholder="importaciones"
                  style={{ ...formInput, fontSize: 13 }} />
              </div>
              <div>
                <label style={fieldLabel}>EMAIL *</label>
                <input value={form.email} onChange={f('email')} type="email" placeholder="usuario@dimagraf.com"
                  style={{ ...formInput, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>ROLES ASIGNADOS</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_ROLES.map(role => {
                      const selected = form.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 9999,
                            border: selected ? `1px solid ${ROLE_COLORS[role]}44` : `1px solid ${HAIRLINE}`,
                            background: selected ? `${ROLE_COLORS[role]}12` : PARCHMENT,
                            color: selected ? ROLE_COLORS[role] : INK,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={fieldLabel}>ESTADO</label>
                  <select value={form.estado} onChange={f('estado')} style={formInput}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div style={modalFooter}>
                <button onClick={closeModal} style={{ ...getModalSecondaryButtonStyle(), fontSize: 13 }}>Cancelar</button>
                <button onClick={handleSave} disabled={!canSave} style={{ ...getModalPrimaryButtonStyle(!!canSave), fontSize: 13 }}>
                  {modal.mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ ...modalOverlay, zIndex: 500 }}>
          <div style={{ ...getModalShellStyle(380), padding: '32px 28px', textAlign: 'center' }}>
            <AlertTriangle size={28} color="#c4001a" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: '0 0 8px' }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize: 14, color: MUTED, margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ ...getModalSecondaryButtonStyle(), fontSize: 13 }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...getModalDestructiveButtonStyle(), fontSize: 13 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Audit Tab ----------------------------------------------------------------

function AuditTab({ extraEntries }: { extraEntries: AuditEntry[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'Todos'>('Todos');
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const allEntries = [...extraEntries, ...AUDIT_LOG].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filtered = allEntries.filter(e => {
    const q = normalizeSearchTerm(search);
    const matchSearch = !q || normalizeSearchTerm(e.userName).includes(q) || normalizeSearchTerm(e.action).includes(q) || normalizeSearchTerm(e.entityId).includes(q) || normalizeSearchTerm(e.detail).includes(q);
    const matchRole   = roleFilter === 'Todos' || e.userRole === roleFilter;
    return matchSearch && matchRole;
  });

  const formatTs = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };
  const toggleExpandedAudit = (id: string) => setExpandedAuditId(current => current === id ? null : id);

  return (
    <div>
      <div style={tableShell}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd' }}>
          <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por usuario, acción, entidad..." searchAriaLabel="Buscar auditoría" options={(['Todos', ...ALL_ROLES] as (Role | 'Todos')[]).map(role => ({ value: role, label: role === 'Todos' ? 'Todos' : ROLE_LABELS[role] }))} value={roleFilter} onValueChange={setRoleFilter} />
        </div>
        {isMobile ? (
        <div>
          {filtered.map((e, i) => (
            <div key={e.id} style={{ padding: '16px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{formatTs(e.timestamp)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{e.userName}</div>
                  <div style={{ fontSize: 12, color: INK, marginTop: 4 }}>{e.action}</div>
                </div>
                  <RoleBadge role={e.userRole} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                <DetailToggleButton expanded={expandedAuditId === e.id} onClick={() => toggleExpandedAudit(e.id)} />
              </div>
              {expandedAuditId === e.id && (
                <div style={{ display: 'grid', gap: 10, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ENTIDAD</div>
                    <div style={{ fontSize: 12, color: INK, marginTop: 2 }}>{e.entity}{e.entityId ? ` · ${e.entityId}` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DETALLE</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{e.detail}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
              {['FECHA / HORA', 'USUARIO', 'ROL', 'ACCIÓN', 'VER'].map(c => (
                <th key={c} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <>
                <tr key={e.id} style={{ borderBottom: expandedAuditId === e.id ? 'none' : i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = PARCHMENT)}
                  onMouseLeave={ev => (ev.currentTarget.style.background = CANVAS)}>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: MUTED, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatTs(e.timestamp)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: INK }}>{e.userName}</td>
                  <td style={{ padding: '12px 14px' }}><RoleBadge role={e.userRole} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: INK }}>{e.action}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <DetailToggleButton expanded={expandedAuditId === e.id} onClick={() => toggleExpandedAudit(e.id)} />
                  </td>
                </tr>
                {expandedAuditId === e.id && (
                  <tr key={`${e.id}-expanded`} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: '#fafaf9' }}>
                    <td colSpan={5} style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ENTIDAD</div>
                          <div style={{ fontSize: 12, color: INK, marginTop: 4 }}>{e.entity}</div>
                          {e.entityId && <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 2 }}>{e.entityId}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DETALLE</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>{e.detail}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        )}
        {filtered.length === 0 && <EmptyTableState message="Sin registros de auditoría." />}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>{filtered.length} registro(s)</div>
    </div>
  );
}

// --- Articles Tab -------------------------------------------------------------

interface ArtForm { codigoSAP: string; descripcion: string; linea: string; um: string; precioRef: string; estado: 'Activo' | 'Inactivo'; }
const EMPTY_ART: ArtForm = { codigoSAP: '', descripcion: '', linea: 'LCA', um: 'Kg', precioRef: '', estado: 'Activo' };

function ArticlesTab() {
  const [arts, setArts] = useState<ArticuloCatalogo[]>(ARTICULOS_CATALOGO);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | { mode: 'create' | 'edit'; art?: ArticuloCatalogo }>(null);
  const [form, setForm] = useState<ArtForm>(EMPTY_ART);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filtered = arts.filter(a => {
    const q = normalizeSearchTerm(search);
    return !q || normalizeSearchTerm(a.codigoSAP).includes(q) || normalizeSearchTerm(a.descripcion).includes(q) || normalizeSearchTerm(a.linea).includes(q);
  });

  const f = (field: keyof ArtForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    if (modal?.mode === 'create') {
      const na: ArticuloCatalogo = { id: `ac${Date.now()}`, ...form, precioRef: Number(form.precioRef) };
      setArts(prev => [na, ...prev]);
    } else if (modal?.mode === 'edit' && modal.art) {
      setArts(prev => prev.map(a => a.id === modal.art!.id ? { ...a, ...form, precioRef: Number(form.precioRef) } : a));
    }
    setModal(null);
  };

  const canSave = Boolean(form.codigoSAP.trim() && form.descripcion.trim() && Number(form.precioRef) > 0);
  const toggleExpandedArticle = (id: string) => setExpandedArticleId(current => current === id ? null : id);

  return (
    <div>
      <div style={tableShell}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}><SearchField value={search} onChange={setSearch} placeholder="Buscar por cód. SAP, descripción, línea..." /></div>
          <AppButton onClick={() => { setForm(EMPTY_ART); setModal({ mode: 'create' }); }} size="sm">
            <Plus size={13} /> Nuevo Artículo
          </AppButton>
        </div>
        {isMobile ? (
        <div>
          {filtered.map((a, i) => (
            <div key={a.id} style={{ padding: '16px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{a.codigoSAP}</div>
                  <div style={{ fontSize: 13, color: INK, marginTop: 4, lineHeight: 1.45 }}>{a.descripcion}</div>
                </div>
                <RowActionIconButton
                  onClick={() => { setForm({ codigoSAP: a.codigoSAP, descripcion: a.descripcion, linea: a.linea, um: a.um, precioRef: String(a.precioRef), estado: a.estado }); setModal({ mode: 'edit', art: a }); }}
                  icon={<Edit2 size={12} />}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>LÍNEA</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{a.linea}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>U.M.</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{a.um}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PRECIO REF.</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 2 }}>${a.precioRef.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>ESTADO</div>
                  <div style={{ fontSize: 12, color: a.estado === 'Activo' ? '#1a7a4a' : MUTED, marginTop: 2 }}>{a.estado}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                <DetailToggleButton expanded={expandedArticleId === a.id} onClick={() => toggleExpandedArticle(a.id)} />
              </div>
              {expandedArticleId === a.id && (
                <div style={{ display: 'grid', gap: 10, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DESCRIPCIÓN COMPLETA</div>
                    <div style={{ fontSize: 12, color: INK, marginTop: 2, lineHeight: 1.45 }}>{a.descripcion}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>CÓDIGO SAP</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{a.codigoSAP}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        ) : (
        <div style={tableScrollArea}>
        <table style={getResponsiveTableStyle(720)}>
          <thead>
            <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
              {['ARTÍCULO', 'PRECIO REF.', 'ACCIONES'].map(c => (
                <th key={c} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{c}</th>
              ))}
              <th style={{ position: 'sticky', right: 0, zIndex: 2, background: PARCHMENT, padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <>
                <tr key={a.id} style={{ borderBottom: expandedArticleId === a.id ? 'none' : i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                  onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                  onMouseLeave={e => (e.currentTarget.style.background = CANVAS)}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{a.codigoSAP}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.35 }}>{a.linea} · {a.um}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>${a.precioRef.toFixed(2)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <DetailToggleButton expanded={expandedArticleId === a.id} onClick={() => toggleExpandedArticle(a.id)} />
                      <RowActionIconButton
                        onClick={() => { setForm({ codigoSAP: a.codigoSAP, descripcion: a.descripcion, linea: a.linea, um: a.um, precioRef: String(a.precioRef), estado: a.estado }); setModal({ mode: 'edit', art: a }); }}
                        icon={<Edit2 size={12} />}
                      />
                    </div>
                  </td>
                  <td style={{ position: 'sticky', right: 0, zIndex: 1, background: STICKY_ACTION_BACKGROUND, padding: '13px 16px', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: a.estado === 'Activo' ? '#1a7a4a' : MUTED, background: a.estado === 'Activo' ? 'rgba(26,122,74,0.08)' : 'rgba(110,110,115,0.08)', borderRadius: 9999, padding: '2px 9px' }}>
                      {a.estado}
                    </span>
                  </td>
                </tr>
                {expandedArticleId === a.id && (
                  <tr key={`${a.id}-expanded`} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: '#fafaf9' }}>
                    <td colSpan={4} style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DESCRIPCIÓN</div>
                          <div style={{ fontSize: 12, color: INK, marginTop: 4, lineHeight: 1.45 }}>{a.descripcion}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DETALLE</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>Línea {a.linea} · Unidad {a.um}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        </div>
        )}
        {filtered.length === 0 && <EmptyTableState message="Sin artículos." />}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: CANVAS, borderRadius: 20, width: '100%', maxWidth: 480, margin: '0 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>{modal.mode === 'create' ? 'Nuevo Artículo' : 'Editar Artículo'}</h2>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={() => setModal(null)} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['codigoSAP', 'CÓD. SAP *', '1000XXX'], ['descripcion', 'DESCRIPCIÓN *', 'Papel Offset 80g...']].map(([field, label, ph]) => (
                <div key={field}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>{label}</label>
                  <input value={(form as any)[field]} onChange={f(field as keyof ArtForm)} placeholder={ph}
                    style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>LÍNEA</label>
                  <select value={form.linea} onChange={f('linea')} style={{ width: '100%', padding: '10px 12px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    <option>LCA</option><option>LDA</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>U.M.</label>
                  <select value={form.um} onChange={f('um')} style={{ width: '100%', padding: '10px 12px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    {['Kg', 'Mill.', 'Unid.', 'Resma', 'm²'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>PRECIO REF. $</label>
                  <input type="number" value={form.precioRef} onChange={f('precioRef')} placeholder="0.00"
                    style={{ width: '100%', padding: '10px 12px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>ESTADO</label>
                <select value={form.estado} onChange={f('estado')} style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                  <option>Activo</option><option>Inactivo</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <AppButton onClick={() => setModal(null)} variant="secondary" size="sm" style={{ flex: 1 }}>Cancelar</AppButton>
                <AppButton onClick={handleSave} disabled={!canSave} size="sm" style={{ flex: 2 }}>
                  {modal.mode === 'create' ? 'Crear Artículo' : 'Guardar'}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Providers Tab ------------------------------------------------------------

interface ProvForm { nombre: string; pais: string; incoterm: string; condPago: string; diasProd: string; diasTransito: string; moneda: 'USD' | 'EUR'; }
const EMPTY_PROV: ProvForm = { nombre: '', pais: '', incoterm: 'FOB', condPago: '60 días desde BL', diasProd: '', diasTransito: '', moneda: 'EUR' };

function ProvidersTab() {
  const [provs, setProvs] = useState<Proveedor[]>(PROVEEDORES);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | { mode: 'create' | 'edit'; prov?: Proveedor }>(null);
  const [form, setForm] = useState<ProvForm>(EMPTY_PROV);
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filtered = provs.filter(p => {
    const q = normalizeSearchTerm(search);
    return !q || normalizeSearchTerm(p.nombre).includes(q) || normalizeSearchTerm(p.pais).includes(q);
  });

  const f = (field: keyof ProvForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    if (modal?.mode === 'create') {
      const np: Proveedor = { id: `p${Date.now()}`, ...form, diasProd: Number(form.diasProd), diasTransito: Number(form.diasTransito), diasTransitoTerrestre: 0, despachante: 'd1' };
      setProvs(prev => [np, ...prev]);
    } else if (modal?.mode === 'edit' && modal.prov) {
      setProvs(prev => prev.map(p => p.id === modal.prov!.id ? { ...p, ...form, diasProd: Number(form.diasProd), diasTransito: Number(form.diasTransito) } : p));
    }
    setModal(null);
  };

  const canSave = Boolean(form.nombre.trim() && form.pais.trim());
  const toggleExpandedProvider = (id: string) => setExpandedProviderId(current => current === id ? null : id);

  return (
    <div>
      <div style={tableShell}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${HAIRLINE}`, background: '#fcfcfd', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}><SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre o país..." /></div>
          <AppButton onClick={() => { setForm(EMPTY_PROV); setModal({ mode: 'create' }); }} size="sm">
            <Plus size={13} /> Nuevo Proveedor
          </AppButton>
        </div>
        {isMobile ? (
        <div>
          {filtered.map((p, i) => (
            <div key={p.id} style={{ padding: '16px', borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.pais}</div>
                </div>
                <RowActionIconButton
                  onClick={() => { setForm({ nombre: p.nombre, pais: p.pais, incoterm: p.incoterm, condPago: p.condPago, diasProd: String(p.diasProd), diasTransito: String(p.diasTransito || p.diasTransitoTerrestre), moneda: p.moneda }); setModal({ mode: 'edit', prov: p }); }}
                  icon={<Edit2 size={12} />}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>INCOTERM</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.incoterm}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>MONEDA</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.moneda}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DÍAS PROD.</div>
                  <div style={{ fontSize: 12, color: INK, marginTop: 2 }}>{p.diasProd}d</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>DÍAS TRÁNSITO</div>
                  <div style={{ fontSize: 12, color: INK, marginTop: 2 }}>{p.diasTransito || p.diasTransitoTerrestre}d</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>COND. PAGO</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{p.condPago}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                <DetailToggleButton expanded={expandedProviderId === p.id} onClick={() => toggleExpandedProvider(p.id)} />
              </div>
              {expandedProviderId === p.id && (
                <div style={{ display: 'grid', gap: 10, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PROVEEDOR</div>
                    <div style={{ fontSize: 12, color: INK, marginTop: 2 }}>{p.nombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PAÍS</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.pais}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        ) : (
        <div style={tableScrollArea}>
        <table style={getResponsiveTableStyle(760)}>
          <thead>
            <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
              {['PROVEEDOR', 'TRÁNSITO', 'ACCIONES'].map(c => (
                <th key={c} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{c}</th>
              ))}
              <th style={{ position: 'sticky', right: 0, zIndex: 2, background: PARCHMENT, padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.04em', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>RESUMEN</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <>
                <tr key={p.id} style={{ borderBottom: expandedProviderId === p.id ? 'none' : i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: CANVAS }}
                  onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
                  onMouseLeave={e => (e.currentTarget.style.background = CANVAS)}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.nombre}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{p.pais}</div>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: 13, color: INK, fontVariantNumeric: 'tabular-nums' }}>{p.diasTransito || p.diasTransitoTerrestre}d</td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <DetailToggleButton expanded={expandedProviderId === p.id} onClick={() => toggleExpandedProvider(p.id)} />
                      <RowActionIconButton
                        onClick={() => { setForm({ nombre: p.nombre, pais: p.pais, incoterm: p.incoterm, condPago: p.condPago, diasProd: String(p.diasProd), diasTransito: String(p.diasTransito || p.diasTransitoTerrestre), moneda: p.moneda }); setModal({ mode: 'edit', prov: p }); }}
                        icon={<Edit2 size={12} />}
                      />
                    </div>
                  </td>
                  <td style={{ position: 'sticky', right: 0, zIndex: 1, background: STICKY_ACTION_BACKGROUND, padding: '13px 14px', boxShadow: '-8px 0 16px rgba(15,23,42,0.05)' }}>
                    <span style={{ fontSize: 12, color: MUTED }}>{p.incoterm} · {p.moneda}</span>
                  </td>
                </tr>
                {expandedProviderId === p.id && (
                  <tr key={`${p.id}-expanded`} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: '#fafaf9' }}>
                    <td colSpan={4} style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>INCOTERM</div>
                          <div style={{ fontSize: 12, color: INK, marginTop: 4 }}>{p.incoterm}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>COND. PAGO</div>
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>{p.condPago}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>PRODUCCIÓN</div>
                          <div style={{ fontSize: 12, color: INK, marginTop: 4 }}>{p.diasProd}d · {p.moneda}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        </div>
        )}
        {filtered.length === 0 && <EmptyTableState message="Sin proveedores." />}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: CANVAS, borderRadius: 20, width: '100%', maxWidth: 500, margin: '0 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: INK }}>{modal.mode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}</h2>
              <AppButton aria-label="Cerrar" title="Cerrar" variant="ghost" size="xs" onClick={() => setModal(null)} icon={<X size={14} color={MUTED} />} style={{ borderRadius: 9999 }} />
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['nombre', 'PROVEEDOR *', 'Empresa S.A.'], ['pais', 'PAÍS *', 'Alemania']].map(([field, label, ph]) => (
                  <div key={field}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>{label}</label>
                    <input value={(form as any)[field]} onChange={f(field as keyof ProvForm)} placeholder={ph}
                      style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>INCOTERM</label>
                  <select value={form.incoterm} onChange={f('incoterm')} style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    {['FOB', 'CIF', 'EXW', 'FCA', 'DAP', 'DDP', 'CFR'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>MONEDA</label>
                  <select value={form.moneda} onChange={f('moneda')} style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }}>
                    <option value="EUR">EUR</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>CONDICIÓN DE PAGO</label>
                <input value={form.condPago} onChange={f('condPago')} placeholder="60 días desde BL"
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['diasProd', 'DÍAS PRODUCCIÓN'], ['diasTransito', 'DÍAS TRÁNSITO']].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5, letterSpacing: '0.04em' }}>{label}</label>
                    <input type="number" value={(form as any)[field]} onChange={f(field as keyof ProvForm)} placeholder="0"
                      style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: INK, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: 10, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <AppButton onClick={() => setModal(null)} variant="secondary" size="sm" style={{ flex: 1 }}>Cancelar</AppButton>
                <AppButton onClick={handleSave} disabled={!canSave} size="sm" style={{ flex: 2 }}>
                  {modal.mode === 'create' ? 'Crear Proveedor' : 'Guardar'}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main AdminDashboard ------------------------------------------------------

type AdminTab = 'users' | 'audit' | 'articles' | 'providers';

interface Props {
  users: AppUser[];
  onUsersChange: (users: AppUser[]) => void;
  extraAuditEntries?: AuditEntry[];
  activeTab?: string;
}

export function AdminDashboard({ users, onUsersChange, extraAuditEntries = [], activeTab }: Props) {
  const derivedTab: AdminTab = (() => {
    if (activeTab === 'admin-audit')     return 'audit';
    if (activeTab === 'admin-articles')  return 'articles';
    if (activeTab === 'admin-providers') return 'providers';
    return 'users';
  })();
  const headerContent = (() => {
    if (derivedTab === 'audit') return { title: 'Auditoría', subtitle: 'Trazabilidad de acciones y seguimiento operativo.' };
    if (derivedTab === 'articles') return { title: 'Artículos', subtitle: 'Catálogo maestro y configuración de artículos.' };
    if (derivedTab === 'providers') return { title: 'Proveedores', subtitle: 'Base de proveedores y parámetros asociados.' };
    return { title: 'Usuarios', subtitle: 'Administración general de usuarios, roles y accesos.' };
  })();
  return (
    <div style={pageShell}>

      {/* Header */}
      <div style={pageHeader}>
        <div>
          <h1 style={{ margin: 0, color: INK }}>{headerContent.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: MUTED, fontWeight: 400 }}>{headerContent.subtitle}</p>
        </div>
      </div>

      {/* Tab content - driven by Layout sub-nav via activeTab prop */}
      {derivedTab === 'users'     && <UsersTab users={users} onUsersChange={onUsersChange} />}
      {derivedTab === 'audit'     && <AuditTab extraEntries={extraAuditEntries} />}
      {derivedTab === 'articles'  && <ArticlesTab />}
      {derivedTab === 'providers' && <ProvidersTab />}
    </div>
  );
}
