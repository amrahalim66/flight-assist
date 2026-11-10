import { useEffect, useRef, useState } from 'react';

// Non-component helpers for the charts, kept out of Charts.jsx so that file
// exports only components and React Fast Refresh keeps working for it.

/** Width of the ref'd element, kept current via ResizeObserver. */
export function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

/** Round axis ticks: 1/2/5 × 10ⁿ steps covering [lo, hi]. */
export function niceTicks(lo, hi, count = 4) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
  if (hi <= lo) hi = lo + 1;
  const rough = (hi - lo) / count;
  let step = 1;
  if (rough > 1) {
    const mag = 10 ** Math.floor(Math.log10(rough));
    const norm = rough / mag;
    step = (norm >= 5 ? 10 : norm >= 2 ? 5 : 2) * mag;
  }
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Column with 4px rounded cap and a square baseline. */
export function barPath(x, top, w, h, r = 4) {
  if (h <= 0) return '';
  const rr = Math.min(r, h, w / 2);
  const bottom = top + h;
  return [
    `M${x},${bottom}`,
    `L${x},${top + rr}`,
    `Q${x},${top} ${x + rr},${top}`,
    `L${x + w - rr},${top}`,
    `Q${x + w},${top} ${x + w},${top + rr}`,
    `L${x + w},${bottom}`,
    'Z',
  ].join(' ');
}
