import { useEffect } from 'react';
import { PLANS, MODULES } from '../../data/mockData';
import { initials } from '../../lib/format';
import { Icon } from './icons';

// ─── Side drawer: Escape closes, body scroll locked while open ───

export function Drawer({ eyebrow, title, subtitle, onClose, footer, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <>
      <div className="db-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className={`db-drawer ${wide ? 'db-drawer--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
        <header className="db-drawer-head">
          <div>
            {eyebrow && <p className="db-drawer-eyebrow">{eyebrow}</p>}
            <h2 id="drawerTitle" className="db-drawer-title">
              {title}
            </h2>
            {subtitle && <p className="db-drawer-sub">{subtitle}</p>}
          </div>
          <button type="button" className="db-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </header>
        <div className="db-drawer-body">{children}</div>
        {footer && <footer className="db-drawer-foot">{footer}</footer>}
      </aside>
    </>
  );
}

// ─── Meter: fill carries severity, track is a lighter step of the same hue ───

export function Meter({ used, total, label }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const tone = pct >= 100 ? 'critical' : pct >= 90 ? 'warning' : 'ok';
  return (
    <div className={`db-meter db-meter--${tone}`} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} aria-label={label}>
      <span className="db-meter-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Sparkline: 12-point trend in the de-emphasis hue, current period accented ───

export function Sparkline({ values, width = 96, height = 32 }) {
  const n = values.length;
  if (n < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const x = (i) => 4 + (i / (n - 1)) * (width - 8);
  const y = (v) => 4 + (height - 8) - ((v - lo) / (hi - lo || 1)) * (height - 8);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg className="viz-spark" width={width} height={height} aria-hidden="true" focusable="false">
      <path d={d} />
      <circle cx={x(n - 1)} cy={y(values[n - 1])} r="3.5" />
    </svg>
  );
}

// ─── Status badge: icon + label, never colour alone ───

const STATUS_META = {
  active: { tone: 'good', icon: 'check', label: 'Active' },
  trialing: { tone: 'info', icon: 'clock', label: 'Trialing' },
  past_due: { tone: 'warning', icon: 'alert-triangle', label: 'Past due' },
  cancelled: { tone: 'muted', icon: 'x', label: 'Cancelled' },
  paid: { tone: 'good', icon: 'check', label: 'Paid' },
  open: { tone: 'info', icon: 'clock', label: 'Open' },
  overdue: { tone: 'critical', icon: 'alert-circle', label: 'Overdue' },
  refunded: { tone: 'muted', icon: 'refresh', label: 'Refunded' },
  invited: { tone: 'info', icon: 'mail', label: 'Invited' },
  // Aircraft
  in_service: { tone: 'good', icon: 'check', label: 'In service' },
  maintenance: { tone: 'warning', icon: 'settings', label: 'Maintenance' },
  aog: { tone: 'critical', icon: 'alert-circle', label: 'AOG' },
  // Flights
  scheduled: { tone: 'muted', icon: 'clock', label: 'Scheduled' },
  boarding: { tone: 'info', icon: 'users', label: 'Boarding' },
  airborne: { tone: 'info', icon: 'plane', label: 'Airborne' },
  delayed: { tone: 'warning', icon: 'clock', label: 'Delayed' },
  landed: { tone: 'good', icon: 'check', label: 'Landed' },
  // Services & incidents
  operational: { tone: 'good', icon: 'check', label: 'Operational' },
  degraded: { tone: 'warning', icon: 'alert-triangle', label: 'Degraded' },
  monitoring: { tone: 'info', icon: 'eye', label: 'Monitoring' },
  resolved: { tone: 'good', icon: 'check', label: 'Resolved' },
};

export function Badge({ status }) {
  const meta = STATUS_META[status] || { tone: 'muted', icon: 'minus', label: status };
  return (
    <span className={`db-badge db-badge--${meta.tone}`}>
      <Icon name={meta.icon} size={12} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}

export function PlanPill({ plan }) {
  const p = PLANS[plan];
  if (!p) return null;
  return (
    <span className={`db-plan db-plan--${p.key}`}>
      <i aria-hidden="true" />
      {p.name}
    </span>
  );
}

export function ModuleChips({ modules, max = 3 }) {
  const shown = modules.slice(0, max);
  const rest = modules.length - shown.length;
  return (
    <span className="db-chips">
      {shown.map((m) => (
        <span className="db-chip" key={m} title={MODULES[m]}>
          {MODULES[m]}
        </span>
      ))}
      {rest > 0 && <span className="db-chip db-chip--more">+{rest}</span>}
    </span>
  );
}

export function Avatar({ name, size = 36 }) {
  return (
    <span
      className="db-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

// ─── Stat tile ───
// delta: { text: '+2.3%', direction: 'up' | 'down' | 'flat', good: boolean }

export function StatTile({ label, value, delta, deltaLabel, trend, foot, hero }) {
  const dir = delta?.direction || 'flat';
  const iconName = dir === 'up' ? 'arrow-up-right' : dir === 'down' ? 'arrow-down-right' : 'minus';
  const tone = dir === 'flat' ? 'muted' : delta.good ? 'good' : 'critical';
  return (
    <div className={`db-tile ${hero ? 'db-tile--hero' : ''}`}>
      <div className="db-tile-main">
        <p className="db-tile-label">{label}</p>
        <p className="db-tile-value">{value}</p>
        {delta && (
          <p className="db-tile-delta">
            <span className={`db-delta db-delta--${tone}`}>
              <Icon name={iconName} size={13} strokeWidth={2.5} />
              {delta.text}
            </span>
            {deltaLabel && <span className="db-tile-delta-label">{deltaLabel}</span>}
          </p>
        )}
        {foot && <p className="db-tile-foot">{foot}</p>}
      </div>
      {trend && (
        <div className="db-tile-trend">
          <Sparkline values={trend} />
        </div>
      )}
    </div>
  );
}

// ─── Card ───

export function Card({ title, subtitle, actions, flush = false, className = '', children }) {
  return (
    <section className={`db-card ${className}`}>
      {(title || actions) && (
        <header className="db-card-head">
          <div>
            {title && <h2 className="db-card-title">{title}</h2>}
            {subtitle && <p className="db-card-sub">{subtitle}</p>}
          </div>
          {actions && <div className="db-card-actions">{actions}</div>}
        </header>
      )}
      <div className={`db-card-body ${flush ? 'db-card-body--flush' : ''}`}>{children}</div>
    </section>
  );
}

export function PageHead({ title, text, actions, children }) {
  return (
    <div className="db-page-head">
      <div>
        <h1 className="db-page-title">{title}</h1>
        {text && <p className="db-page-text">{text}</p>}
      </div>
      {(actions || children) && <div className="db-page-actions">{actions || children}</div>}
    </div>
  );
}

// ─── Generic table (used for chart table-views) ───
// columns: [{ key, label, align: 'left' | 'right', render?: (row) => node }]

export function DataTable({ columns, rows, caption, compact = false }) {
  return (
    <div className="db-table-wrap">
      <table className={`db-table ${compact ? 'db-table--compact' : ''}`}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align === 'right' ? 'num' : ''} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key ?? i}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === 'right' ? 'num' : ''}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ icon = 'search', title, text }) {
  return (
    <div className="db-empty">
      <span className="db-empty-icon">
        <Icon name={icon} size={22} />
      </span>
      <p className="db-empty-title">{title}</p>
      {text && <p className="db-empty-text">{text}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, description }) {
  return (
    <label className="db-switch-row">
      <span className="db-switch-text">
        <span className="db-switch-label">{label}</span>
        {description && <span className="db-switch-desc">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`db-switch ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="db-switch-knob" />
      </button>
    </label>
  );
}

// Segmented control: options [{ key, label }]
export function SegControl({ options, value, onChange, label }) {
  return (
    <div className="db-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`db-seg-btn ${value === o.key ? 'is-active' : ''}`}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
