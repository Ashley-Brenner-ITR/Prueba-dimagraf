import { useMemo, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import type { AppUser } from './mockData';
import { AppButton } from './AppButton';
import { normalizeSearchTerm } from './SearchField';
import { color } from './theme';

const { ink: INK, muted: MUTED, hairline: HAIRLINE, surface: CANVAS, brand: GREEN, danger: RED } = color;

interface PasswordRecoveryPageProps {
  users: AppUser[];
}

export function PasswordRecoveryPage({ users }: PasswordRecoveryPageProps) {
  const params = new URLSearchParams(window.location.search);
  const initialUsername = params.get('username') ?? '';

  const [username, setUsername] = useState(initialUsername);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  const matchedUser = useMemo(
    () => users.find(user => normalizeSearchTerm(user.username) === normalizeSearchTerm(username)),
    [users, username],
  );

  const handleRecoverySend = () => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      setMessageTone('error');
      setMessage('Ingresá un usuario para enviar la recuperación.');
      return;
    }

    if (matchedUser) {
      setMessageTone('success');
      setMessage(`Se envió un mail de recuperación a ${matchedUser.email}.`);
      return;
    }

    setMessageTone('success');
    setMessage(`Se envió un mail de recuperación a ${normalizedUsername}@dimagraf.com.`);
  };

  const handleBack = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = window.location.pathname;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top left, rgba(26,92,56,0.06), transparent 22%), radial-gradient(circle at top right, rgba(91,33,182,0.05), transparent 20%), #ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'var(--font-ui)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'rgba(255,255,255,0.96)',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(16,24,40,0.08)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${HAIRLINE}`, background: CANVAS }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: MUTED,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 14,
            }}
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(26,92,56,0.10)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={19} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, color: INK, letterSpacing: '-0.03em' }}>Recuperar contraseña</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: MUTED, lineHeight: 1.5 }}>Simulación de envío por mail.</p>
            </div>
          </div>
        </div>

        <form onSubmit={event => { event.preventDefault(); handleRecoverySend(); }} style={{ padding: 28, background: CANVAS }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
              USUARIO
            </label>
            <input
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                if (message) setMessage(null);
              }}
              placeholder="Ingresá tu usuario"
              autoFocus
              style={{ width: '100%', padding: '13px 15px', borderRadius: 14, border: `1px solid ${HAIRLINE}`, background: CANVAS, color: INK, fontSize: 14, outline: 'none', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
            />
          </div>

          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: CANVAS, border: `1px solid ${HAIRLINE}`, fontSize: 12, color: MUTED, lineHeight: 1.6, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            Se generará una simulación de envío al mail asociado al usuario para restablecer la contraseña.
          </div>

          {message && (
            <div style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 14,
              border: messageTone === 'success' ? '1px solid rgba(26,92,56,0.24)' : '1px solid rgba(159,18,57,0.20)',
              background: messageTone === 'success' ? 'rgba(26,92,56,0.06)' : 'rgba(159,18,57,0.05)',
              color: messageTone === 'success' ? GREEN : RED,
              fontSize: 13,
              lineHeight: 1.6,
            }}>
              {message}
            </div>
          )}

          <AppButton
            type="submit"
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px 16px',
              borderRadius: 14,
              border: 'none',
              background: GREEN,
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(26,92,56,0.16)',
            }}
          >
            Enviar mail
          </AppButton>
        </form>
      </div>
    </div>
  );
}
