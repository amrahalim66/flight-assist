// Formatting helpers shared by the admin console. Everything is locale-fixed
// (en-US money, en-GB dates) so the mock data reads the same on every machine.

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const moneyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const moneyTick = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat('en-US');

/** `$38,061` by default; `compact` → `$38.1K`; `tick` → `$40K` (axis labels). */
export function fmtMoney(n, mode) {
  if (mode === 'compact') return moneyCompact.format(n);
  if (mode === 'tick') return moneyTick.format(n);
  return money.format(n);
}

export function fmtNumber(n) {
  return plain.format(n);
}

/** Parse `YYYY-MM-DD` as a local date (not UTC, which shifts the day). */
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso, n) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function fmtDate(iso) {
  if (!iso) return '—';
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateShort(iso) {
  if (!iso) return '—';
  return parseISODate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** Whole days from today to `iso` — negative when it is in the past. */
export function daysUntil(iso) {
  return Math.round((parseISODate(iso) - startOfToday()) / 86400000);
}

export function relativeDays(iso) {
  if (!iso) return '';
  const d = daysUntil(iso);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return 'yesterday';
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}

/** "just now", "12m ago", "3h ago", "2d ago", then a short date. */
export function timeAgo(isoDateTime) {
  const diff = Date.now() - new Date(isoDateTime).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return fmtDateShort(isoDateTime.slice(0, 10));
}

/** `14:05` (24-hour, local). */
export function fmtTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function pct(n, digits = 1) {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
