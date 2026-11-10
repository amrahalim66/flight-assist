import { useState } from 'react';
import { MOCK_USERS, ROLES } from '../data/mockData';
import { login } from '../lib/auth';
import { useTheme } from '../lib/useTheme';
import { Icon } from '../components/dashboard/icons';

const POINTS = [
  'Airlines manage employees, aircraft, operations and billing',
  'Simple pricing per aircraft — unlimited users on every plan',
  'FlightAssist controls companies, revenue, modules and platform health',
];

export default function Login({ onNavigate, onSignedIn, notice }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    setError('');
    // A short delay so the button state is visible — stands in for the round trip.
    setTimeout(() => {
      const result = login(username, password, remember);
      setBusy(false);
      if (result.ok) onSignedIn(result.user);
      else setError(result.error);
    }, 650);
  };

  const fill = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  };

  return (
    <main id="main" className="auth" tabIndex={-1}>
      <aside className="auth-brand">
        <a
          href="#home"
          className="auth-logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
        >
          <img src="./assets/logo.png" alt="" width="40" height="40" />
          <span>FlightAssist</span>
        </a>

        <div className="auth-brand-copy">
          <span className="eyebrow">Admin console</span>
          <h1 className="auth-title">
            Your airline, <span>one workspace.</span>
          </h1>
          <p className="auth-lead">
            Sign in to manage your fleet, team and subscription — or, for FlightAssist staff, every operator on the platform.
          </p>
          <ul className="auth-points">
            {POINTS.map((p) => (
              <li key={p}>
                <span className="auth-point-icon">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-foot">&copy; {new Date().getFullYear()} FlightAssist · ISO 27001 certified</p>
      </aside>

      <section className="auth-panel">
        <button
          type="button"
          className="db-icon-btn auth-theme"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>

        <div className="auth-card">
          <h2 className="auth-card-title">Sign in</h2>
          <p className="auth-card-sub">Use your administrator credentials to open the dashboard.</p>

          {notice && (
            <p className="auth-notice" role="status">
              <Icon name="lock" size={14} /> {notice}
            </p>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="db-field">
              <span>Username</span>
              <input
                className="db-input"
                type="text"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. superadmin"
              />
            </label>

            <label className="db-field">
              <span>Password</span>
              <span className="db-input-wrap">
                <input
                  className="db-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  className="db-input-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={17} />
                </button>
              </span>
            </label>

            <div className="auth-row">
              <label className="db-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Keep me signed in</span>
              </label>
              <button
                type="button"
                className="db-link"
                onClick={() => setError('Password resets go through your identity provider — not part of this demo.')}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                <Icon name="alert-circle" size={15} /> {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
          </form>

          <details className="auth-demo">
            <summary>
              <Icon name="users" size={15} /> Demo accounts
              <Icon name="chevron-down" size={14} className="auth-demo-caret" />
            </summary>
            <p className="auth-demo-hint">Super Admin: platform ownership and control. Company Admin: one airline’s workspace.</p>
            <ul>
              {MOCK_USERS.map((u) => (
                <li key={u.id}>
                  <div>
                    <strong>
                      {ROLES[u.role].label}
                      {u.role === 'company_admin' ? ` · ${u.companyName}` : ''}
                    </strong>
                    <code>
                      {u.username} / {u.password}
                    </code>
                  </div>
                  <button type="button" className="db-btn db-btn--sm" onClick={() => fill(u)}>
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </details>

          <p className="auth-back">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
            >
              <Icon name="arrow-right" size={14} className="is-flipped" /> Back to website
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
