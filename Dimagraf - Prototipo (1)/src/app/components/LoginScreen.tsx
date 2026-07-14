import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import fondoBackground from '../../styles/fondo.svg';
import dimagrafLogo from '../../imports/imagen__3_.png';
import { AppButton } from './AppButton';
import { color } from './theme';

const { ink: INK, muted: MUTED, hairline: HAIRLINE, surface: CANVAS, brand: GREEN } = color;

interface LoginScreenProps {
  error?: string;
  onLogin: (username: string, password: string) => void;
}

const QUICK_ACCESS = [
  'importaciones',
  'direccion',
  'comercial',
  'tesoreria',
  'deposito',
  'despachante',
  'admin',
  'testing',
  'design-system',
];

export function LoginScreen({ error, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const openRecovery = () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('recovery', '1');
    if (username.trim()) nextUrl.searchParams.set('username', username.trim());
    window.open(nextUrl.toString(), '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#fbfaf5',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '96px 24px 24px',
      fontFamily: 'var(--font-ui)',
    }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${fondoBackground})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '760px auto',
          backgroundPosition: 'left top',
          opacity: 0.62,
          filter: 'contrast(1.12) brightness(0.92) saturate(1.02)',
          pointerEvents: 'none',
        }}
      />
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'rgba(255,255,255,0.96)',
          borderBottom: `1px solid ${HAIRLINE}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          zIndex: 2,
          backdropFilter: 'blur(18px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={dimagrafLogo} alt="Dimagraf" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
            Comex/Importaciones
          </span>
        </div>
      </header>
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 380,
        background: 'rgba(255,255,255,0.96)',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(16,24,40,0.08)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ padding: '34px 30px', background: CANVAS }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, color: INK, fontSize: 28, letterSpacing: '-0.04em' }}>Ingresar</h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                USUARIO
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ingresá tu usuario"
                autoFocus
                style={{ width: '100%', padding: '13px 15px', borderRadius: 14, border: `1px solid ${HAIRLINE}`, background: CANVAS, color: INK, fontSize: 14, outline: 'none', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresá tu contraseña"
                  style={{ width: '100%', padding: '13px 46px 13px 15px', borderRadius: 14, border: `1px solid ${HAIRLINE}`, background: CANVAS, color: INK, fontSize: 14, outline: 'none', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(currentValue => !currentValue)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 12,
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    border: 'none',
                    background: 'transparent',
                    color: MUTED,
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={openRecovery}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: GREEN,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={13} />
                  Olvidé mi contraseña
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(196,0,26,0.2)', background: 'rgba(196,0,26,0.05)', color: '#9f1239', fontSize: 13 }}>
                {error}
              </div>
            )}

            <AppButton type="submit" style={{ width: '100%', marginTop: 4, padding: '14px 18px', borderRadius: 14, fontSize: 14, fontWeight: 700, boxShadow: '0 8px 20px rgba(26,92,56,0.16)' }}>
              Ingresar
            </AppButton>
          </form>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${HAIRLINE}` }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUICK_ACCESS.map(access => (
                <button
                  key={access}
                  type="button"
                  onClick={() => onLogin(access, '')}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 9999,
                    border: `1px solid ${HAIRLINE}`,
                    background: CANVAS,
                    color: INK,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {access}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
