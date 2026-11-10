// Generated operational and monitoring data for the demo.
//
// Flights are produced from each company's fleet with a seeded RNG, so the
// schedule is stable for a given day but statuses (scheduled → boarding →
// airborne → landed) move with the real clock. Monitoring figures are fixed
// mock values shaped to tell a coherent story (one degraded upstream, one
// resolved latency spike).

import { AIRCRAFT_TYPES } from './mockData';

/** Small stable string hash (FNV-1a). */
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) — same seed, same sequence. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// ─── Operations ───

const NETWORK = {
  co_nordwind: { prefix: 'NWC', dests: ['TOS', 'BOO', 'KRS', 'AES', 'AGP', 'PMI', 'LPA', 'CHQ', 'AYT', 'ALC'] },
  co_skybridge: { prefix: 'SKB', dests: ['BHD', 'CWL', 'NCL', 'ABZ', 'JER', 'GLA', 'DUB', 'AMS', 'CDG', 'SOU'] },
};

/** Today's flights for a company, with statuses relative to `now`. */
export function buildSchedule(companyId, fleet, now = new Date()) {
  const net = NETWORK[companyId];
  if (!net) return [];
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const r = rng(hashString(`${companyId}:${dayKey(day)}`));
  const flights = [];
  let num = 100 + Math.floor(r() * 40);

  fleet.forEach((ac) => {
    if (ac.status !== 'in_service') return;
    const jet = AIRCRAFT_TYPES[ac.type]?.jet;
    let t = 6 * 60 + Math.floor(r() * 120); // minutes after midnight
    const legs = 2 + Math.floor(r() * 3);
    const dest = net.dests[Math.floor(r() * net.dests.length)];
    let from = ac.base;

    for (let leg = 0; leg < legs && t < 22 * 60; leg += 1) {
      const to = leg % 2 === 0 ? dest : ac.base;
      const dur = jet ? 95 + Math.floor(r() * 130) : 50 + Math.floor(r() * 60);
      const cancelled = r() < 0.025;
      const delay = !cancelled && r() < 0.2 ? 10 + Math.floor(r() * 50) : 0;
      const std = new Date(day.getTime() + t * 60000);
      const etd = new Date(std.getTime() + delay * 60000);
      const sta = new Date(std.getTime() + dur * 60000);
      const eta = new Date(etd.getTime() + dur * 60000);

      let status;
      if (cancelled) status = 'cancelled';
      else if (now >= eta) status = 'landed';
      else if (now >= etd) status = 'airborne';
      else if (delay > 0) status = 'delayed';
      else if (std - now <= 40 * 60000) status = 'boarding';
      else status = 'scheduled';

      flights.push({
        id: `${ac.id}_${leg}`,
        flight: `${net.prefix}${num}`,
        from,
        to,
        reg: ac.reg,
        type: ac.type,
        std,
        etd,
        sta,
        eta,
        delay,
        status,
      });
      num += 1;
      from = to;
      t += dur + 40 + Math.floor(r() * 35) + delay;
    }
  });

  return flights.sort((a, b) => a.std - b.std);
}

/** Completed days only: the 14 days ending yesterday. */
export function dailyHistory(companyId, activeAircraft) {
  const r = rng(hashString(`${companyId}:history`));
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 14; i >= 1; i -= 1) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const flights = Math.max(0, Math.round(activeAircraft * 2.9 + (r() - 0.5) * 6));
    const delayed = Math.round(flights * (0.07 + r() * 0.14));
    out.push({
      key: dayKey(d),
      label: String(d.getDate()),
      sublabel: d.toLocaleDateString('en-GB', { month: 'short' }),
      values: { ontime: flights - delayed, delayed },
    });
  }
  return out;
}

// ─── Platform monitoring ───

export const SERVICES = [
  { key: 'api', name: 'Public API (GraphQL)', status: 'operational', uptime: 99.99, p95: 184 },
  { key: 'ops', name: 'Operations Control · live tracking', status: 'operational', uptime: 99.98, p95: 212 },
  { key: 'crew', name: 'Crew FTL engine', status: 'operational', uptime: 99.97, p95: 640 },
  { key: 'commercial', name: 'Commercial quoting', status: 'operational', uptime: 99.95, p95: 298 },
  { key: 'arinc', name: 'ARINC / ACARS message feed', status: 'operational', uptime: 99.91, p95: 410 },
  { key: 'eurocontrol', name: 'EUROCONTROL NM B2B', status: 'degraded', uptime: 99.62, p95: 2380 },
  { key: 'payments', name: 'Payment processing', status: 'operational', uptime: 100, p95: 520 },
  { key: 'email', name: 'Email & push notifications', status: 'operational', uptime: 99.99, p95: 150 },
];

const hoursBack = (n) => new Date(Date.now() - n * 3600000).toISOString();

export const INCIDENTS = [
  {
    id: 'INC-2611',
    title: 'Slow flight-plan filing via EUROCONTROL NM B2B',
    status: 'monitoring',
    service: 'EUROCONTROL NM B2B',
    started: hoursBack(5),
    update: 'Upstream NM latency is elevated. Filings succeed with automatic retries; no action needed from operators.',
  },
  {
    id: 'INC-2609',
    title: 'API latency spike in eu-west',
    status: 'resolved',
    service: 'Public API (GraphQL)',
    started: hoursBack(4),
    resolved: hoursBack(3),
    update: 'A database failover raised p95 latency for 52 minutes. Resolved; no data loss.',
  },
  {
    id: 'INC-2588',
    title: 'Delayed ACARS messages for ATR fleets',
    status: 'resolved',
    service: 'ARINC / ACARS message feed',
    started: hoursBack(6 * 24),
    resolved: hoursBack(6 * 24 - 2),
    update: 'A provider queue backlog delayed OOOI messages by up to 9 minutes.',
  },
];

/** API p95 latency for the last 24 hours, hourly, with the INC-2609 spike. */
export function latencySeries() {
  const r = rng(hashString('latency'));
  const out = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  for (let h = 23; h >= 0; h -= 1) {
    const t = new Date(now.getTime() - h * 3600000);
    let v = 172 + Math.round(Math.sin((t.getHours() / 24) * Math.PI * 2 - 1.2) * 18 + r() * 22);
    if (h === 4) v = 438;
    if (h === 3) v = 312;
    out.push({
      key: t.toISOString(),
      label: `${String(t.getHours()).padStart(2, '0')}:00`,
      sublabel: '',
      value: v,
    });
  }
  return out;
}
