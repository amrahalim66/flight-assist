import { useId, useState } from 'react';
import { DataTable, SegControl } from './ui';
import { useMeasure, niceTicks, clamp, barPath } from './chartUtils';

// Hand-rolled SVG charts. Colours come from the --viz-* tokens in
// dashboard.css (validated for both themes); every chart has a hover/keyboard
// layer and a table twin via <ChartCard>.

function useArrowKeys(n, active, setActive) {
  return (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive(active == null ? n - 1 : clamp(active + 1, 0, n - 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive(active == null ? n - 1 : clamp(active - 1, 0, n - 1));
    } else if (e.key === 'Escape') {
      setActive(null);
    }
  };
}

// ─── Area / line chart (single series) ───
// data: [{ key, label, sublabel?, value }]

export function AreaChart({ data, formatValue, formatTick = formatValue, height = 260, label }) {
  const [ref, width] = useMeasure();
  const [active, setActive] = useState(null);
  const gradId = useId();

  const n = data.length;
  const pad = { top: 24, right: 76, bottom: 32, left: 56 };
  const w = Math.max(width || 0, 320);
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || hi * 0.1 || 1;
  const ticks = niceTicks(lo - span * 0.25, hi + span * 0.1, 4);
  const y0 = ticks[0];
  const y1 = ticks[ticks.length - 1];

  const xAt = (i) => pad.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const yAt = (v) => pad.top + innerH - ((v - y0) / (y1 - y0 || 1)) * innerH;
  const baseline = pad.top + innerH;
  const last = n - 1;

  const line = data
    .map((d, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(d.value).toFixed(1)}`)
    .join(' ');
  const area = `${line} L${xAt(last).toFixed(1)},${baseline} L${xAt(0).toFixed(1)},${baseline} Z`;

  const slot = innerW / Math.max(n - 1, 1);
  const every = Math.max(1, Math.ceil(44 / slot));

  const pick = (clientX, el) => {
    const rect = el.getBoundingClientRect();
    const mx = clientX - rect.left - pad.left;
    setActive(clamp(Math.round((mx / innerW) * (n - 1)), 0, n - 1));
  };
  const onKeyDown = useArrowKeys(n, active, setActive);

  const a = active != null ? data[active] : null;
  const tipX = a ? clamp(xAt(active), 80, w - 80) : 0;

  return (
    <div className="viz" ref={ref}>
      <svg
        className="viz-svg"
        width={w}
        height={height}
        role="img"
        aria-label={label}
        tabIndex={0}
        onMouseMove={(e) => pick(e.clientX, e.currentTarget)}
        onMouseLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="viz-area-stop-a" />
            <stop offset="100%" className="viz-area-stop-b" />
          </linearGradient>
        </defs>

        <g className="viz-grid">
          {ticks.map((t) => (
            <line key={t} x1={pad.left} x2={w - pad.right} y1={yAt(t)} y2={yAt(t)} />
          ))}
        </g>
        <g className="viz-ticks">
          {ticks.map((t) => (
            <text key={t} x={pad.left - 10} y={yAt(t)} dy="0.35em" textAnchor="end">
              {formatTick(t)}
            </text>
          ))}
        </g>
        <g className="viz-xlabels">
          {data.map(
            (d, i) =>
              ((i % every === 0 && last - i >= every) || i === last) && (
                <text key={d.key ?? i} x={xAt(i)} y={height - 8} textAnchor="middle">
                  {d.label}
                </text>
              ),
          )}
        </g>

        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} className="viz-line" />

        {a && <line className="viz-crosshair" x1={xAt(active)} x2={xAt(active)} y1={pad.top} y2={baseline} />}
        <circle className="viz-dot" cx={xAt(last)} cy={yAt(data[last].value)} r="5" />
        {a && active !== last && <circle className="viz-dot" cx={xAt(active)} cy={yAt(a.value)} r="5" />}
        <text className="viz-end-label" x={xAt(last) + 12} y={yAt(data[last].value)} dy="0.35em">
          {formatValue(data[last].value)}
        </text>
      </svg>

      {a && (
        <div className="viz-tip" style={{ left: tipX, top: yAt(a.value) }} role="status">
          <span className="viz-tip-label">
            {a.label}
            {a.sublabel ? ` ${a.sublabel}` : ''}
          </span>
          <strong>{formatValue(a.value)}</strong>
        </div>
      )}
    </div>
  );
}

// ─── Grouped columns (2–3 series) ───
// data: [{ key, label, sublabel?, values: { [seriesKey]: number } }]
// series: [{ key, name, color }]

export function GroupedBars({ data, series, height = 240, label, formatValue = String }) {
  const [ref, width] = useMeasure();
  const [active, setActive] = useState(null);

  const n = data.length;
  const k = series.length;
  const pad = { top: 24, right: 12, bottom: 32, left: 36 };
  const w = Math.max(width || 0, 320);
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxV = Math.max(1, ...data.flatMap((d) => series.map((s) => d.values[s.key] || 0)));
  const ticks = niceTicks(0, maxV, 3);
  const y1 = ticks[ticks.length - 1];
  const yAt = (v) => pad.top + innerH - (v / y1) * innerH;
  const baseline = pad.top + innerH;

  const slot = innerW / n;
  const gap = 2;
  const barW = Math.max(4, Math.min(20, (slot * 0.62 - gap * (k - 1)) / k));
  const groupW = barW * k + gap * (k - 1);
  const xAt = (i, j) => pad.left + i * slot + (slot - groupW) / 2 + j * (barW + gap);
  const every = Math.max(1, Math.ceil(40 / slot));
  const last = n - 1;

  const onKeyDown = useArrowKeys(n, active, setActive);
  const a = active != null ? data[active] : null;
  const tipX = a ? clamp(pad.left + active * slot + slot / 2, 80, w - 80) : 0;

  return (
    <div className="viz" ref={ref}>
      <Legend items={series} />
      <svg
        className="viz-svg"
        width={w}
        height={height}
        role="img"
        aria-label={label}
        tabIndex={0}
        onMouseLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <g className="viz-grid">
          {ticks.map((t) => (
            <line key={t} x1={pad.left} x2={w - pad.right} y1={yAt(t)} y2={yAt(t)} />
          ))}
        </g>
        <g className="viz-ticks">
          {ticks.map((t) => (
            <text key={t} x={pad.left - 10} y={yAt(t)} dy="0.35em" textAnchor="end">
              {formatValue(t)}
            </text>
          ))}
        </g>
        <g className="viz-xlabels">
          {data.map(
            (d, i) =>
              ((i % every === 0 && last - i >= every) || i === last) && (
                <text key={d.key ?? i} x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle">
                  {d.label}
                </text>
              ),
          )}
        </g>

        {data.map((d, i) => (
          <g key={d.key ?? i} className={active != null && active !== i ? 'is-dim' : ''}>
            {series.map((s, j) => {
              const v = d.values[s.key] || 0;
              return <path key={s.key} d={barPath(xAt(i, j), yAt(v), barW, baseline - yAt(v))} style={{ fill: s.color }} />;
            })}
            <rect
              className="viz-hit"
              x={pad.left + i * slot}
              y={pad.top}
              width={slot}
              height={innerH}
              onMouseEnter={() => setActive(i)}
            />
          </g>
        ))}

        {/* Direct labels on the latest group only; the axis and tooltip carry the rest. */}
        {series.map((s, j) => {
          const v = data[last].values[s.key] || 0;
          return (
            <text key={s.key} className="viz-value" x={xAt(last, j) + barW / 2} y={yAt(v) - 6} textAnchor="middle">
              {formatValue(v)}
            </text>
          );
        })}
      </svg>

      {a && (
        <div className="viz-tip" style={{ left: tipX, top: pad.top + 8 }} role="status">
          <span className="viz-tip-label">
            {a.label}
            {a.sublabel ? ` ${a.sublabel}` : ''}
          </span>
          {series.map((s) => (
            <span key={s.key} className="viz-tip-row">
              <i className="viz-swatch" style={{ background: s.color }} />
              {s.name}
              <strong>{formatValue(a.values[s.key] || 0)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tall segmented bar — one whole split into ordered parts ───
// parts: [{ key, name, value, color, ink }]

export function SegmentedBar({ parts, formatValue, label }) {
  const [ref, width] = useMeasure();
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const visible = parts.filter((p) => p.value > 0);
  const avail = Math.max(0, (width || 0) - 2 * (visible.length - 1));

  return (
    <div className="viz-segbar" ref={ref} role="img" aria-label={label}>
      {visible.map((p) => {
        const share = p.value / total;
        const px = avail * share;
        const text = `${Math.round(share * 100)}%`;
        return (
          <div
            key={p.key}
            className="viz-seg"
            style={{ flexGrow: share, background: p.color, color: p.ink }}
            title={`${p.name}: ${formatValue(p.value)} (${text})`}
            tabIndex={0}
            aria-label={`${p.name}: ${formatValue(p.value)}, ${text}`}
          >
            {px >= 44 && <span>{text}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <ul className="viz-legend">
      {items.map((s) => (
        <li key={s.key}>
          <i className="viz-swatch" style={{ background: s.color }} />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

// ─── Chart card with a chart / table toggle ───

const MODES = [
  { key: 'chart', label: 'Chart', icon: 'bar-chart' },
  { key: 'table', label: 'Table', icon: 'table' },
];

export function ChartCard({ title, subtitle, actions, table, children, className = '' }) {
  const [mode, setMode] = useState('chart');
  return (
    <section className={`db-card ${className}`}>
      <header className="db-card-head">
        <div>
          <h2 className="db-card-title">{title}</h2>
          {subtitle && <p className="db-card-sub">{subtitle}</p>}
        </div>
        <div className="db-card-actions">
          {actions}
          {table && <SegControl options={MODES} value={mode} onChange={setMode} label={`${title} view`} />}
        </div>
      </header>
      <div className={`db-card-body ${mode === 'table' ? 'db-card-body--flush' : ''}`}>
        {mode === 'chart' || !table ? children : <DataTable columns={table.columns} rows={table.rows} caption={title} compact />}
      </div>
    </section>
  );
}
