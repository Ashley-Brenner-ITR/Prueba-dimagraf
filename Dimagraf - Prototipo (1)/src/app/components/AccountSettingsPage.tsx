import { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck, LogOut, UserCircle } from 'lucide-react';
import type { AppUser, Role } from './mockData';
import { pageShell } from './chromeStyles';
import { useIsMobile } from './ui/use-mobile';
import { AppButton } from './AppButton';
import { color } from './theme';
import { WelcomeBanner } from './WelcomeBanner';

const { ink: INK, muted: MUTED, hairline: HAIRLINE, parchment: PARCHMENT, surface: CANVAS, brand: GREEN } = color;

export type MailFrequency = 'Diario' | 'Semanal' | 'Mensual';
export type MailReportKey = 'arrivals' | 'vencimientos' | 'cashflow' | 'auditoria';

export interface MailReportConfig {
  enabled: boolean;
  recipients: string;
  frequency: MailFrequency;
  sendTime: string;
  selectedReports: MailReportKey[];
}

interface Props {
  activeRole: Role;
  currentUser: AppUser;
  mailConfig: MailReportConfig;
  onChangeMailConfig: (next: MailReportConfig) => void;
  onSave: (updates: { password?: string; mailConfig: MailReportConfig }) => void;
  onBack: () => void;
  availableRoles?: Role[];
  onChangeRole?: (role: Role) => void;
  onLogout?: () => void;
}

const REPORT_OPTIONS: Array<{ key: MailReportKey; label: string; description: string }> = [
  { key: 'arrivals', label: 'Matriz de Arrivals', description: 'Cargas en viaje y ETA.' },
  { key: 'vencimientos', label: 'Reporte de Vencimientos', description: 'Próximos y vencidos.' },
  { key: 'cashflow', label: 'Flujo de Caja', description: 'Pagos y emisión.' },
  { key: 'auditoria', label: 'Auditoría de Costos', description: 'Variaciones y desvíos.' },
];

const SHIPMENT_PREVIEW = [
  { numero: '2026/437-A', proveedor: 'Bohui Paper', transporte: 'Maritimo', eta: '2026-07-18', estado: 'En transito' },
  { numero: '2026/437-B', proveedor: 'Andino Insumos S.A.', transporte: 'Terrestre', eta: '2026-07-12', estado: 'Vencido' },
  { numero: '2026/437-C', proveedor: 'Nordic Pulp', transporte: 'Aereo', eta: '2026-07-27', estado: 'Proximo' },
];

const REPORTS_BY_ROLE: Record<Role, MailReportKey[]> = {
  operator: ['arrivals', 'vencimientos'],
  director: ['arrivals', 'vencimientos', 'cashflow', 'auditoria'],
  commercial: ['arrivals', 'vencimientos'],
  treasury: ['vencimientos', 'cashflow'],
  warehouse: ['vencimientos'],
  dispatcher: ['vencimientos'],
  admin: ['arrivals', 'vencimientos', 'cashflow', 'auditoria'],
};

const ROLE_LABELS: Record<Role, string> = {
  operator: 'Importaciones',
  director: 'Dirección',
  commercial: 'Área Comercial',
  treasury: 'Tesorería',
  warehouse: 'Depósito',
  dispatcher: 'Despachante',
  admin: 'Administración',
};

export function AccountSettingsPage({ activeRole, currentUser, mailConfig, onChangeMailConfig, onSave, onBack, availableRoles = [], onChangeRole, onLogout }: Props) {
  const isMobile = useIsMobile();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const allowedReports = REPORT_OPTIONS.filter(option => REPORTS_BY_ROLE[activeRole].includes(option.key));

  const passwordMismatch = password !== confirmPassword;
  const hasPasswordDraft = password.trim().length > 0 || confirmPassword.trim().length > 0;
  const canSavePassword = !hasPasswordDraft || (!!password.trim() && !!confirmPassword.trim() && !passwordMismatch);
  const canSave = canSavePassword;

  const toggleReport = (key: MailReportKey) => {
    const selected = mailConfig.selectedReports.includes(key)
      ? mailConfig.selectedReports.filter(item => item !== key)
      : [...mailConfig.selectedReports, key];
    onChangeMailConfig({ ...mailConfig, selectedReports: selected });
  };

  return (
    <div style={pageShell}>
      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <button
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 0', background: 'none', border: 'none', color: MUTED, fontSize: 14, cursor: 'pointer', width: 'fit-content', fontWeight: 400 }}
        >
          <ArrowLeft size={14} /> Volver
        </button>
      </div>

      <WelcomeBanner
        title="Configuración de cuenta"
        subtitle={currentUser.email}
      />

      <div style={{ display: 'grid', gap: 14, width: '100%' }}>
        {/* Profile & Roles section */}
        <section style={{ display: 'grid', gap: 12, padding: isMobile ? 14 : 18, borderRadius: 16, border: `1px solid ${HAIRLINE}`, background: '#fcfcfb' }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>
              <UserCircle size={12} /> PERFIL Y ROLES
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}` }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Nombre</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{currentUser.nombre}</div>
            </div>
            <div style={{ padding: '12px 14px', background: PARCHMENT, borderRadius: 12, border: `1px solid ${HAIRLINE}` }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Rol activo</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{ROLE_LABELS[activeRole] || activeRole}</div>
            </div>
          </div>
          {availableRoles.length > 1 && onChangeRole && (
            <div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Cambiar rol:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => onChangeRole(role)}
                    style={{
                      padding: '8px 14px', borderRadius: 9999,
                      border: role === activeRole ? `2px solid ${GREEN}` : `1px solid ${HAIRLINE}`,
                      background: role === activeRole ? 'rgba(26,92,56,0.06)' : CANVAS,
                      color: role === activeRole ? GREEN : INK,
                      fontSize: 12, fontWeight: role === activeRole ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {ROLE_LABELS[role] || role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
        <section style={{ display: 'grid', gap: 12, padding: isMobile ? 14 : 18, borderRadius: 16, border: `1px solid ${HAIRLINE}`, background: '#fcfcfb' }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>
              <ShieldCheck size={12} /> CAMBIAR CONTRASEÑA
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>Completá ambos campos solo si querés actualizarla.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>NUEVA CONTRASEÑA</label>
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: PARCHMENT, color: INK, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>CONFIRMAR CONTRASEÑA</label>
              <input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${passwordMismatch ? '#d93025' : HAIRLINE}`, background: PARCHMENT, color: INK, fontSize: 13, outline: 'none' }} />
            </div>
          </div>
          {passwordMismatch && <div style={{ fontSize: 12, color: '#d93025', fontWeight: 600 }}>Las contraseñas no coinciden.</div>}
        </section>

        <section style={{ display: 'grid', gap: 12, padding: isMobile ? 14 : 18, borderRadius: 16, border: `1px solid ${HAIRLINE}`, background: '#fcfcfb' }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>
              <Mail size={12} /> REPORTES AUTOMÁTICOS POR CORREO
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>Seleccioná reportes, destinatarios y frecuencia.</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: CANVAS, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>Enviar reportes automáticos</span>
            <input
              type="checkbox"
              checked={mailConfig.enabled}
              onChange={event => onChangeMailConfig({ ...mailConfig, enabled: event.target.checked })}
            />
          </label>

          {mailConfig.enabled ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>DESTINATARIOS (separados por coma)</label>
                  <input
                    type="text"
                    value={mailConfig.recipients}
                    onChange={event => onChangeMailConfig({ ...mailConfig, recipients: event.target.value })}
                    placeholder="tesoreria@dimagraf.com, direccion@dimagraf.com"
                    style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: PARCHMENT, color: INK, fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>FRECUENCIA</label>
                  <select
                    value={mailConfig.frequency}
                    onChange={event => onChangeMailConfig({ ...mailConfig, frequency: event.target.value as MailFrequency })}
                    style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: PARCHMENT, color: INK, fontSize: 13, outline: 'none' }}
                  >
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em', marginBottom: 6 }}>HORA</label>
                  <input
                    type="time"
                    value={mailConfig.sendTime}
                    onChange={event => onChangeMailConfig({ ...mailConfig, sendTime: event.target.value })}
                    style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: PARCHMENT, color: INK, fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 0, border: `1px solid ${HAIRLINE}`, borderRadius: 12, overflow: 'hidden', background: CANVAS }}>
                {allowedReports.map((option, index) => {
                  const checked = mailConfig.selectedReports.includes(option.key);
                  return (
                    <label key={option.key} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '11px 12px', borderBottom: index < allowedReports.length - 1 ? `1px solid ${HAIRLINE}` : 'none', background: checked ? 'rgba(26,92,56,0.06)' : CANVAS, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReport(option.key)}
                        style={{ marginTop: 0 }}
                      />
                      <span style={{ display: 'grid', gap: 1 }}>
                        <span style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{option.label}</span>
                        <span style={{ fontSize: 12, color: MUTED }}>{option.description}</span>
                      </span>
                    </label>
                  );
                })}
                {allowedReports.length === 0 && (
                  <div style={{ fontSize: 12, color: MUTED, padding: '11px 12px' }}>Este rol no tiene reportes automáticos habilitados.</div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: MUTED }}>Activá el envío para configurar destinatarios y reportes.</div>
          )}
        </section>

        <section style={{ display: 'grid', gap: 10, padding: isMobile ? 14 : 18, borderRadius: 16, border: `1px solid ${HAIRLINE}`, background: '#fcfcfb' }}>
          <div style={{ display: 'grid', gap: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>VISTA PREVIA</div>
            <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>Embarques (3 registros)</div>
          </div>

          <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 12, overflowX: 'auto', background: CANVAS }}>
            <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfd', borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Subcarpeta', 'Proveedor', 'Transporte', 'ETA', 'Estado'].map(col => (
                    <th key={col} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIPMENT_PREVIEW.map((row, index) => {
                  const statusColor = row.estado === 'Vencido' ? '#c4001a' : row.estado === 'Proximo' ? '#b45309' : '#1a5c38';
                  return (
                    <tr key={row.numero} style={{ borderBottom: index < SHIPMENT_PREVIEW.length - 1 ? `1px solid ${HAIRLINE}` : 'none' }}>
                      <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: INK }}>{row.numero}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: MUTED }}>{row.proveedor}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: MUTED }}>{row.transporte}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: MUTED }}>{row.eta}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: statusColor, fontWeight: 600 }}>{row.estado}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton
            onClick={() => onSave({
              password: password.trim() || undefined,
              mailConfig: {
                ...mailConfig,
                selectedReports: mailConfig.selectedReports.filter(key => REPORTS_BY_ROLE[activeRole].includes(key)),
              },
            })}
            disabled={!canSave}
            style={{ minWidth: 180, padding: '11px 16px', borderRadius: 9999, border: 'none', background: canSave ? GREEN : HAIRLINE, color: canSave ? '#fff' : MUTED, fontSize: 13, fontWeight: 700, cursor: canSave ? 'pointer' : 'default' }}
          >
            Guardar configuración
          </AppButton>
        </div>

        {/* Logout */}
        {onLogout && (
          <section style={{ padding: isMobile ? 14 : 18, borderRadius: 16, border: '1px solid rgba(180,35,24,0.15)', background: 'rgba(180,35,24,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#b42318' }}>Cerrar sesión</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Se cerrará tu sesión activa en este dispositivo.</div>
              </div>
              <AppButton
                onClick={onLogout}
                variant="secondary"
                icon={<LogOut size={14} />}
                style={{ borderColor: 'rgba(180,35,24,0.3)', color: '#b42318', background: 'rgba(180,35,24,0.06)' }}
              >
                Cerrar sesión
              </AppButton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
