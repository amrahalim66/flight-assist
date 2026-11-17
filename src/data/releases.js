// ─── Software releases for the Downloads page ───
//
// Mock release catalogue for the FlightAssist desktop client. Like the rest of
// the demo data nothing here is served from a real file store: a "download"
// only logs activity and shows a toast. Dates are relative to the real today
// so the current release always reads as recent.

import { daysFromToday } from './mockData';

export const PLATFORMS = {
  win: { key: 'win', label: 'Windows', detail: '10 / 11, 64-bit', ext: 'msi' },
  mac: { key: 'mac', label: 'macOS', detail: '13 Ventura or later, Universal', ext: 'dmg' },
  linux: { key: 'linux', label: 'Linux', detail: 'Ubuntu 22.04+ / RHEL 9, x64', ext: 'AppImage' },
};

// Support status is derived from position: the newest is "current", the next
// two get fixes, anything older is end of life.
export const SUPPORT = {
  current: { key: 'current', label: 'Current', tone: 'good' },
  supported: { key: 'supported', label: 'Security fixes only', tone: 'info' },
  eol: { key: 'eol', label: 'End of life', tone: 'muted' },
};

function pkg(release, platform, sizeMb, sha) {
  return {
    platform,
    file: `FlightAssist-${release}-${platform === 'win' ? 'win-x64' : platform === 'mac' ? 'macos-universal' : 'linux-x64'}.${PLATFORMS[platform].ext}`,
    size: `${sizeMb} MB`,
    sha256: sha,
  };
}

// Newest first.
export const RELEASES = [
  {
    version: '2026.3',
    build: '26.3.1184',
    channel: 'Stable',
    released: daysFromToday(-18),
    packages: [
      pkg('2026.3', 'win', 186, '9f3b2e7c41a0d6f8b5c2e19a7d3f6b0e4c8a1d2f5e7b9c0a3d6f8e1b4c7a9d2e'),
      pkg('2026.3', 'mac', 204, '2c7e1a9d4f6b8e0c3a5d7f9b1e4c6a8d0f2b5e7c9a1d3f6b8e0c2a4d7f9b1e3c'),
      pkg('2026.3', 'linux', 192, '7a1d4f8b2e6c0a3d5f9b1e7c4a8d2f6b0e3c5a9d1f7b4e8c2a6d0f3b5e9c1a7d'),
    ],
    notes: [
      'Gantt crew roster now syncs with Operations Control in real time',
      'Per-aircraft licence usage shown inside the client',
      'Offline flight board cache for up to 72 hours',
      'Single sign-on with Microsoft Entra ID and Okta',
    ],
  },
  {
    version: '2026.2',
    build: '26.2.0962',
    channel: 'Stable',
    released: daysFromToday(-109),
    packages: [
      pkg('2026.2', 'win', 181, 'e4c8a1d2f5e7b9c0a3d6f8e1b4c7a9d2e9f3b2e7c41a0d6f8b5c2e19a7d3f6b0'),
      pkg('2026.2', 'mac', 199, '0f2b5e7c9a1d3f6b8e0c2a4d7f9b1e3c2c7e1a9d4f6b8e0c3a5d7f9b1e4c6a8d'),
      pkg('2026.2', 'linux', 188, '2f6b0e3c5a9d1f7b4e8c2a6d0f3b5e9c1a7d7a1d4f8b2e6c0a3d5f9b1e7c4a8d'),
    ],
    notes: ['Maintenance module: AOG workflow and parts requests', 'Faster start-up on large fleets', 'Dark theme for the dispatcher console'],
  },
  {
    version: '2026.1',
    build: '26.1.0710',
    channel: 'Stable',
    released: daysFromToday(-201),
    packages: [
      pkg('2026.1', 'win', 174, 'b5c2e19a7d3f6b0e4c8a1d2f5e7b9c0a3d6f8e1b4c7a9d2e9f3b2e7c41a0d6f8'),
      pkg('2026.1', 'mac', 191, 'a5d7f9b1e4c6a8d0f2b5e7c9a1d3f6b8e0c2a4d7f9b1e3c2c7e1a9d4f6b8e0c3'),
      pkg('2026.1', 'linux', 180, 'd5f9b1e7c4a8d2f6b0e3c5a9d1f7b4e8c2a6d0f3b5e9c1a7d7a1d4f8b2e6c0a3'),
    ],
    notes: ['Commercial planning: route profitability reports', 'Reporting exports to Excel and PDF'],
  },
  {
    version: '2025.4',
    build: '25.4.0533',
    channel: 'Stable',
    released: daysFromToday(-298),
    packages: [
      pkg('2025.4', 'win', 168, 'c41a0d6f8b5c2e19a7d3f6b0e4c8a1d2f5e7b9c0a3d6f8e1b4c7a9d2e9f3b2e7'),
      pkg('2025.4', 'mac', 185, 'f6b8e0c2a4d7f9b1e3c2c7e1a9d4f6b8e0c3a5d7f9b1e4c6a8d0f2b5e7c9a1d3'),
    ],
    notes: ['Initial per-aircraft licensing', 'Crew management module'],
  },
];

export const CURRENT_RELEASE = RELEASES[0];

export function supportFor(index) {
  if (index === 0) return SUPPORT.current;
  if (index <= 2) return SUPPORT.supported;
  return SUPPORT.eol;
}

export const SYSTEM_REQUIREMENTS = [
  { icon: 'monitor', label: 'Operating system', value: 'Windows 10/11 64-bit, macOS 13+, Ubuntu 22.04+' },
  { icon: 'cpu', label: 'Memory', value: '8 GB RAM · 16 GB for fleets over 20 aircraft' },
  { icon: 'hard-drive', label: 'Disk space', value: '2 GB free, plus 1 GB offline cache' },
  { icon: 'wifi', label: 'Network', value: 'Outbound HTTPS (443) to *.flightassist.com' },
  { icon: 'grid', label: 'Display', value: '1366 × 768 minimum, 1920 × 1080 recommended' },
];

// Versioned packages are an entitlement of a current subscription. A trial
// is entitled; a failed payment pauses it; a cancellation removes it.
export function entitlementFor(sub) {
  if (!sub) return { ok: false, reason: 'none' };
  if (sub.status === 'active' || sub.status === 'trialing') return { ok: true, reason: sub.status };
  if (sub.status === 'past_due') return { ok: false, reason: 'past_due' };
  return { ok: false, reason: 'cancelled' };
}

// ─── Per-company rollout state (platform console) ───
// Deterministic from the subscription id so the figures are stable between
// visits. Most entitled companies sit on the current release; a paused
// account tends to have fallen behind.

function hash01(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 1000) / 1000;
}

/** Index into RELEASES of the client version a company runs, or null. */
export function clientReleaseIndexFor(sub) {
  if (!sub || sub.status === 'cancelled') return null;
  const r = hash01(`${sub.id}:client`);
  if (sub.status === 'past_due') return r < 0.3 ? 0 : r < 0.7 ? 1 : 3;
  return r < 0.65 ? 0 : r < 0.9 ? 1 : 2;
}

/** ISO date of the company's last package download, or null. */
export function lastDownloadFor(sub) {
  if (!sub || sub.status === 'cancelled') return null;
  const spread = sub.status === 'past_due' ? 60 : 24;
  return daysFromToday(-Math.round(hash01(`${sub.id}:download`) * spread) - 1);
}

/** Package downloads in the last 30 days, for the platform tiles. */
export function downloadsLast30For(sub) {
  if (!sub || sub.status === 'cancelled') return 0;
  const base = Math.round(hash01(`${sub.id}:count`) * 8);
  return sub.status === 'past_due' ? Math.min(base, 1) : base + 1;
}

