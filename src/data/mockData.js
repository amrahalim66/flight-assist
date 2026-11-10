// ─── Mock data for the admin console ───
//
// Nothing in this file talks to a server. The dashboard copies these arrays
// into React state and mutates that copy, so reloading the page resets the
// demo. Dates are generated relative to the real "today" so renewals, trials
// and overdue invoices always read as current, whenever the demo is opened.
//
// Two kinds of account sign in:
//   super_admin   – the FlightAssist owner: platform ownership and control
//                   (companies, subscriptions, revenue, modules, monitoring)
//   company_admin – an airline's own administrator: workspace management
//                   (employees, aircraft, operations, modules, billing)
//
// Pricing is per aircraft per month. Users are unlimited on every plan.
//
// Passwords are plain text on purpose: they are demo credentials and are
// printed on the sign-in screen. Replace this file with a real auth + billing
// API before anything here is exposed publicly.

import { toISODate } from '../lib/format';
import { PLANS, MODULES, MODULE_BLURBS, planRequiredFor, billedAircraft, priceFor } from './plans';

const today = new Date();
today.setHours(0, 0, 0, 0);

export const TODAY = toISODate(today);

/** ISO date `n` days from today (negative for the past). */
export function daysFromToday(n) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** ISO date-time `n` hours ago, for activity feeds. */
export function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString();
}

// ─── Roles & accounts ───

export const ROLES = {
  super_admin: { key: 'super_admin', label: 'Super Admin', blurb: 'Platform ownership and control — every company, subscription and module' },
  company_admin: { key: 'company_admin', label: 'Company Admin', blurb: 'Airline workspace management for one operator' },
};

export const MOCK_USERS = [
  {
    id: 'usr_001',
    username: 'superadmin',
    password: 'Super@2026',
    name: 'Daniel Mercer',
    role: 'super_admin',
    title: 'Owner, FlightAssist',
    companyId: null,
    companyName: 'FlightAssist',
    email: 'daniel.mercer@flightassist.com',
    location: 'London, UK',
    lastSignIn: hoursAgo(26),
  },
  {
    id: 'usr_101',
    username: 'nordwind.admin',
    password: 'Nordwind@2026',
    name: 'Ingrid Solberg',
    role: 'company_admin',
    title: 'Head of Operations',
    companyId: 'co_nordwind',
    companyName: 'Nordwind Charter',
    email: 'ingrid.solberg@nordwind.example',
    location: 'Oslo, Norway',
    lastSignIn: hoursAgo(5),
  },
  {
    id: 'usr_102',
    username: 'skybridge.admin',
    password: 'SkyBridge@2026',
    name: 'Tom Whitfield',
    role: 'company_admin',
    title: 'Finance Director',
    companyId: 'co_skybridge',
    companyName: 'SkyBridge Regional',
    email: 'tom.whitfield@skybridge.example',
    location: 'Manchester, UK',
    lastSignIn: hoursAgo(50),
  },
];

// ─── Catalogue ───
// Plans and modules live in plans.js (shared with the public pricing page);
// re-exported here so the console keeps one import path.

export { PLANS, MODULES, MODULE_BLURBS, planRequiredFor, billedAircraft, priceFor };

// ─── Aircraft ───

export const AIRCRAFT_TYPES = {
  B738: { code: 'B738', name: 'Boeing 737-800', pax: 189, jet: true },
  E190: { code: 'E190', name: 'Embraer E190', pax: 100, jet: true },
  E175: { code: 'E175', name: 'Embraer E175', pax: 76, jet: true },
  AT76: { code: 'AT76', name: 'ATR 72-600', pax: 70, jet: false },
  DH8D: { code: 'DH8D', name: 'Dash 8-400', pax: 78, jet: false },
};

export const AIRCRAFT_STATUS_OPTIONS = [
  { key: 'in_service', label: 'In service' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'aog', label: 'AOG' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildFleet(companyId, regPrefix, types, bases, statusOverrides) {
  return types.map((type, i) => {
    const status = statusOverrides[i] || 'in_service';
    const jet = AIRCRAFT_TYPES[type].jet;
    return {
      id: `${companyId}_ac${i}`,
      reg: `${regPrefix}${LETTERS[i]}`,
      type,
      msn: String(jet ? 30200 + ((i * 7919) % 9000) : 1100 + ((i * 613) % 800)),
      base: bases[i % bases.length],
      status,
      hoursMtd: status === 'in_service' ? 38 + ((i * 17) % 70) : (i * 5) % 20,
      nextCheck: daysFromToday(status === 'in_service' ? 12 + ((i * 23) % 160) : 2 + (i % 6)),
      added: daysFromToday(-(90 + i * 37)),
    };
  });
}

export const COMPANY_FLEET = {
  co_nordwind: buildFleet(
    'co_nordwind',
    'LN-NW',
    ['B738', 'B738', 'B738', 'B738', 'B738', 'B738', 'B738', 'B738', 'E190', 'E190', 'E190', 'E190', 'E190', 'E190', 'AT76', 'AT76', 'AT76', 'AT76', 'AT76', 'DH8D', 'DH8D', 'DH8D'],
    ['OSL', 'BGO', 'TRD', 'SVG'],
    { 5: 'maintenance', 15: 'maintenance' },
  ),
  co_skybridge: buildFleet(
    'co_skybridge',
    'G-SKB',
    ['AT76', 'AT76', 'AT76', 'AT76', 'AT76', 'AT76', 'E175', 'E175', 'E175', 'E175', 'DH8D', 'DH8D'],
    ['MAN', 'BHX', 'EDI'],
    { 3: 'aog', 8: 'maintenance' },
  ),
};

// ─── Employees of the two tenant companies ───
// A named owner followed by deterministically generated rows.

const NO_FIRST = ['Erik', 'Maja', 'Lars', 'Sofie', 'Henrik', 'Nora', 'Jonas', 'Emma', 'Oskar', 'Ida', 'Magnus', 'Thea', 'Kristian', 'Anna', 'Sander', 'Mari', 'Petter', 'Live', 'Mathias', 'Hanna'];
const NO_LAST = ['Lund', 'Berg', 'Haugen', 'Dahl', 'Moe', 'Vik', 'Strand', 'Holm', 'Nilsen', 'Bakke', 'Aas', 'Rønning', 'Foss', 'Lie', 'Eide', 'Tveit', 'Hagen', 'Sandvik', 'Rud', 'Ness', 'Solheim', 'Bråthen', 'Myhre'];
const UK_FIRST = ['Priya', 'James', 'Aisha', 'Oliver', 'Charlotte', 'Daniel', 'Grace', 'Harry', 'Amelia', 'Ben', 'Chloe', 'Ethan', 'Freya', 'George', 'Isla', 'Jack', 'Lily', 'Max', 'Mia', 'Noah', 'Poppy', 'Ryan', 'Sophie', 'Theo', 'Zara', 'Callum', 'Ella', 'Finn'];
const UK_LAST = ['Nair', 'Carter', 'Khan', 'Grant', 'Hughes', 'Walsh', 'Murphy', 'Reid', 'Bell', 'Price', 'Shaw', 'Doyle', 'Graham', 'Fox', 'Lowe', 'Kerr', 'Rose', 'Burke', 'Hart', 'Lane', 'Mason', 'Ward', 'Hale', 'Dunn', 'Page', 'Cole', 'Hunt', 'Byrne', 'Flynn'];
const TEAM_ROLES = ['Dispatcher', 'Operations Control', 'Crew Planning', 'Commercial Planning', 'Flight Reporting', 'Maintenance Control', 'Dispatcher', 'Operations Control'];

export const TEAM_ROLE_OPTIONS = ['Operations Control', 'Dispatcher', 'Crew Planning', 'Commercial Planning', 'Flight Reporting', 'Maintenance Control', 'Finance'];

const emailSlug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/Ø/g, 'O')
    .replace(/å/g, 'a')
    .toLowerCase();

function buildTeam(companyId, domain, owner, firsts, lasts, total) {
  const members = [
    {
      id: `${companyId}_m0`,
      name: owner.name,
      email: owner.email,
      role: 'Account owner',
      status: 'active',
      lastActive: owner.lastActive,
      owner: true,
    },
  ];
  // Array lengths are coprime with the stride so no (first, last) pair repeats.
  for (let i = 1; i < total; i += 1) {
    const first = firsts[i % firsts.length];
    const last = lasts[(i * 7 + 3) % lasts.length];
    const invited = i % 13 === 0;
    members.push({
      id: `${companyId}_m${i}`,
      name: `${first} ${last}`,
      email: `${emailSlug(first)}.${emailSlug(last)}@${domain}`,
      role: TEAM_ROLES[i % TEAM_ROLES.length],
      status: invited ? 'invited' : 'active',
      lastActive: invited ? null : hoursAgo(i * 2.6 + 0.5),
    });
  }
  return members;
}

export const COMPANY_TEAM = {
  co_nordwind: buildTeam(
    'co_nordwind',
    'nordwind.example',
    { name: 'Ingrid Solberg', email: 'ingrid.solberg@nordwind.example', lastActive: hoursAgo(5) },
    NO_FIRST,
    NO_LAST,
    41,
  ),
  co_skybridge: buildTeam(
    'co_skybridge',
    'skybridge.example',
    { name: 'Tom Whitfield', email: 'tom.whitfield@skybridge.example', lastActive: hoursAgo(50) },
    UK_FIRST,
    UK_LAST,
    28,
  ),
};

// ─── Subscriptions ───
// `mrr` is derived from plan × billed aircraft. `users` is informational —
// every plan includes unlimited users. `renewsOn` doubles as the trial end
// date for trials.

const withPrice = (s) => ({ ...s, mrr: priceFor(s.plan, s.aircraft) });

export const SUBSCRIPTIONS = [
  {
    id: 'sub_1041',
    companyId: 'co_nordwind',
    customer: 'Nordwind Charter',
    location: 'Oslo, Norway',
    aoc: 'NO.AOC.0147',
    timezone: 'Europe/Oslo',
    plan: 'enterprise',
    modules: ['ops', 'commercial', 'crew', 'reporting'],
    aircraft: COMPANY_FLEET.co_nordwind.length,
    users: COMPANY_TEAM.co_nordwind.length,
    billing: 'annual',
    status: 'active',
    started: daysFromToday(-968),
    renewsOn: daysFromToday(26),
    contact: { name: 'Ingrid Solberg', email: 'ingrid.solberg@nordwind.example' },
    paymentMethod: { brand: 'Visa', last4: '4242', expiry: '08/28' },
    accountManager: { name: 'Sarah Mitchell', email: 'sarah.mitchell@flightassist.com' },
  },
  {
    id: 'sub_1008',
    companyId: 'co_gulf',
    customer: 'Gulf Executive Aviation',
    location: 'Dubai, UAE',
    plan: 'enterprise',
    modules: ['ops', 'commercial', 'crew', 'maintenance'],
    aircraft: 15,
    users: 31,
    billing: 'annual',
    status: 'active',
    started: daysFromToday(-1160),
    renewsOn: daysFromToday(116),
    contact: { name: 'Rashid Al Mansoori', email: 'r.almansoori@gulfexec.example' },
  },
  {
    id: 'sub_1117',
    companyId: 'co_atlantic',
    customer: 'Atlantic Wings',
    location: 'Lisbon, Portugal',
    plan: 'professional',
    modules: ['ops', 'commercial'],
    aircraft: 9,
    users: 19,
    billing: 'monthly',
    status: 'active',
    started: daysFromToday(-654),
    renewsOn: daysFromToday(15),
    contact: { name: 'Mariana Costa', email: 'mariana.costa@atlanticwings.example' },
  },
  {
    id: 'sub_1072',
    companyId: 'co_skybridge',
    customer: 'SkyBridge Regional',
    location: 'Manchester, UK',
    aoc: 'UK.AOC.2231',
    timezone: 'Europe/London',
    plan: 'professional',
    modules: ['ops', 'commercial', 'reporting'],
    aircraft: COMPANY_FLEET.co_skybridge.length,
    users: COMPANY_TEAM.co_skybridge.length,
    billing: 'monthly',
    status: 'past_due',
    started: daysFromToday(-850),
    renewsOn: daysFromToday(3),
    contact: { name: 'Tom Whitfield', email: 'tom.whitfield@skybridge.example' },
    paymentMethod: { brand: 'Mastercard', last4: '7731', expiry: '02/27' },
    accountManager: { name: 'Sarah Mitchell', email: 'sarah.mitchell@flightassist.com' },
  },
  {
    id: 'sub_1203',
    companyId: 'co_aurora',
    customer: 'Aurora Air Services',
    location: 'Reykjavík, Iceland',
    plan: 'starter',
    modules: ['ops'],
    aircraft: 3,
    users: 5,
    billing: 'monthly',
    status: 'trialing',
    started: daysFromToday(-12),
    renewsOn: daysFromToday(18),
    contact: { name: 'Sigrún Jónsdóttir', email: 'sigrun@auroraair.example' },
  },
  {
    id: 'sub_1130',
    companyId: 'co_helios',
    customer: 'Helios Jet',
    location: 'Athens, Greece',
    plan: 'professional',
    modules: ['ops', 'commercial'],
    aircraft: 6,
    users: 16,
    billing: 'annual',
    status: 'active',
    started: daysFromToday(-539),
    renewsOn: daysFromToday(191),
    contact: { name: 'Nikos Papadakis', email: 'n.papadakis@heliosjet.example' },
  },
  {
    id: 'sub_0994',
    companyId: 'co_sahara',
    customer: 'Sahara Cargo Lines',
    location: 'Casablanca, Morocco',
    plan: 'enterprise',
    modules: ['ops', 'commercial', 'crew', 'maintenance', 'reporting'],
    aircraft: 27,
    users: 57,
    billing: 'annual',
    status: 'active',
    started: daysFromToday(-1436),
    renewsOn: daysFromToday(25),
    contact: { name: 'Yasmine Benali', email: 'y.benali@saharacargo.example' },
  },
  {
    id: 'sub_1155',
    companyId: 'co_pacific',
    customer: 'Pacific Island Air',
    location: 'Nadi, Fiji',
    plan: 'starter',
    modules: ['ops'],
    aircraft: 4,
    users: 8,
    billing: 'monthly',
    status: 'active',
    started: daysFromToday(-460),
    renewsOn: daysFromToday(27),
    contact: { name: 'Josefa Waqa', email: 'josefa.waqa@pacificisland.example' },
  },
  {
    id: 'sub_1168',
    companyId: 'co_meridian',
    customer: 'Meridian Flight Support',
    location: 'Frankfurt, Germany',
    plan: 'professional',
    modules: ['ops', 'reporting'],
    aircraft: 4,
    users: 12,
    billing: 'monthly',
    status: 'active',
    started: daysFromToday(-359),
    renewsOn: daysFromToday(6),
    contact: { name: 'Katrin Weber', email: 'k.weber@meridianfs.example' },
  },
  {
    id: 'sub_1121',
    companyId: 'co_andes',
    customer: 'Andes Charter Group',
    location: 'Santiago, Chile',
    plan: 'starter',
    modules: ['ops'],
    aircraft: 2,
    users: 4,
    billing: 'monthly',
    status: 'cancelled',
    started: daysFromToday(-629),
    renewsOn: null,
    endedOn: daysFromToday(-21),
    contact: { name: 'Camila Rojas', email: 'camila.rojas@andescharter.example' },
  },
  {
    id: 'sub_1209',
    companyId: 'co_baltic',
    customer: 'Baltic Air Taxi',
    location: 'Riga, Latvia',
    plan: 'professional',
    modules: ['ops', 'commercial'],
    aircraft: 5,
    users: 7,
    billing: 'monthly',
    status: 'trialing',
    started: daysFromToday(-7),
    renewsOn: daysFromToday(23),
    contact: { name: 'Jānis Ozols', email: 'janis.ozols@balticairtaxi.example' },
  },
  {
    id: 'sub_1083',
    companyId: 'co_reddune',
    customer: 'Red Dune Aviation',
    location: 'Riyadh, Saudi Arabia',
    plan: 'professional',
    modules: ['ops', 'commercial', 'reporting'],
    aircraft: 8,
    users: 20,
    billing: 'annual',
    status: 'past_due',
    started: daysFromToday(-761),
    renewsOn: daysFromToday(0),
    contact: { name: 'Faisal Al Harbi', email: 'f.alharbi@reddune.example' },
  },
  {
    id: 'sub_1190',
    companyId: 'co_caledonia',
    customer: 'Caledonia Executive',
    location: 'Edinburgh, UK',
    plan: 'starter',
    modules: ['ops'],
    aircraft: 2,
    users: 5,
    billing: 'monthly',
    status: 'active',
    started: daysFromToday(-140),
    renewsOn: daysFromToday(13),
    contact: { name: 'Fiona McLeod', email: 'fiona@caledoniaexec.example' },
  },
  {
    id: 'sub_1032',
    companyId: 'co_transasia',
    customer: 'TransAsia Jet Partners',
    location: 'Singapore',
    plan: 'enterprise',
    modules: ['ops', 'commercial', 'crew', 'reporting'],
    aircraft: 19,
    users: 39,
    billing: 'annual',
    status: 'active',
    started: daysFromToday(-1031),
    renewsOn: daysFromToday(65),
    contact: { name: 'Wei Ling Tan', email: 'weiling.tan@transasiajet.example' },
  },
].map(withPrice);

// ─── Invoices ───
// Amounts follow the subscription price: monthly = MRR, annual = MRR × 12.

const SUB = Object.fromEntries(SUBSCRIPTIONS.map((s) => [s.id, s]));
const monthlyAmt = (id) => SUB[id].mrr;
const annualAmt = (id) => SUB[id].mrr * 12;
const fleetLabel = (id) => `${SUB[id].aircraft} aircraft`;

function inv(id, subscriptionId, kind, issuedDaysAgo, dueInDays, status, paidDaysAgo) {
  const s = SUB[subscriptionId];
  const annual = kind === 'annual';
  return {
    id,
    subscriptionId,
    companyId: s.companyId,
    customer: s.customer,
    amount: annual ? annualAmt(subscriptionId) : monthlyAmt(subscriptionId),
    issued: daysFromToday(-issuedDaysAgo),
    due: daysFromToday(dueInDays),
    status,
    ...(paidDaysAgo != null ? { paidOn: daysFromToday(-paidDaysAgo) } : {}),
    period: `${annual ? 'Annual renewal' : 'Monthly licence'} · ${fleetLabel(subscriptionId)}`,
  };
}

export const INVOICES = [
  inv('INV-2026-1190', 'sub_1117', 'monthly', 2, 12, 'open'),
  inv('INV-2026-1187', 'sub_1041', 'annual', 4, 26, 'open'),
  inv('INV-2026-1182', 'sub_0994', 'annual', 5, 25, 'open'),
  inv('INV-2026-1176', 'sub_1072', 'monthly', 28, -14, 'overdue'),
  inv('INV-2026-1174', 'sub_1083', 'annual', 31, -1, 'overdue'),
  inv('INV-2026-1171', 'sub_1117', 'monthly', 32, -18, 'paid', 24),
  inv('INV-2026-1168', 'sub_1168', 'monthly', 25, -11, 'paid', 22),
  inv('INV-2026-1163', 'sub_1155', 'monthly', 34, -20, 'paid', 33),
  inv('INV-2026-1159', 'sub_1190', 'monthly', 18, -4, 'paid', 6),
  inv('INV-2026-1152', 'sub_1121', 'monthly', 52, -38, 'refunded'),
  inv('INV-2026-1150', 'sub_1072', 'monthly', 58, -44, 'paid', 50),
  inv('INV-2026-1121', 'sub_1072', 'monthly', 89, -75, 'paid', 82),
  inv('INV-2026-1093', 'sub_1072', 'monthly', 120, -106, 'paid', 115),
  inv('INV-2026-1109', 'sub_1008', 'annual', 249, -219, 'paid', 232),
  inv('INV-2026-1061', 'sub_1032', 'annual', 300, -270, 'paid', 282),
  {
    // Last year's Nordwind renewal, when the fleet was 18 aircraft.
    id: 'INV-2025-0871',
    subscriptionId: 'sub_1041',
    companyId: 'co_nordwind',
    customer: 'Nordwind Charter',
    amount: priceFor('enterprise', 18) * 12,
    issued: daysFromToday(-369),
    due: daysFromToday(-339),
    status: 'paid',
    paidOn: daysFromToday(-352),
    period: 'Annual renewal · 18 aircraft',
  },
];

// ─── Twelve months of platform history, ending this month ───
// The shape is fixed; it is scaled so the final month lands on the live MRR
// computed from SUBSCRIPTIONS. The dashboard also overwrites the last point
// with the live total, so edits made in the demo show up on the chart.

const LIVE_MRR = SUBSCRIPTIONS.filter((s) => s.status === 'active' || s.status === 'past_due').reduce((t, s) => t + s.mrr, 0);
const MRR_SHAPE = [27400, 28900, 29600, 31200, 31900, 33400, 34100, 34800, 35600, 36300, 37200, 38061];
const MRR_HISTORY = MRR_SHAPE.map((v) => Math.round((v * LIVE_MRR) / MRR_SHAPE[MRR_SHAPE.length - 1] / 10) * 10);
const NEW_HISTORY = [2, 3, 1, 2, 2, 3, 2, 1, 2, 2, 3, 2];
const CHURN_HISTORY = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];
const ACTIVE_HISTORY = [6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11];

export const MONTHLY = MRR_HISTORY.map((mrr, i) => {
  const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
  return {
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    label: d.toLocaleDateString('en-GB', { month: 'short' }),
    year: d.getFullYear(),
    mrr,
    newSubs: NEW_HISTORY[i],
    churned: CHURN_HISTORY[i],
    activeSubs: ACTIVE_HISTORY[i],
  };
});

// ─── Activity feed ───
// `companyId` scopes an event to a company workspace; null = platform-only.

export const ACTIVITY = [
  { id: 'act_01', companyId: 'co_atlantic', type: 'payment', text: 'Atlantic Wings paid INV-2026-1171', at: hoursAgo(2) },
  { id: 'act_02', companyId: 'co_nordwind', type: 'login', text: 'Ingrid Solberg signed in to the Nordwind workspace', at: hoursAgo(5) },
  { id: 'act_03', companyId: 'co_skybridge', type: 'fleet', text: 'G-SKBD reported AOG at MAN — removed from today’s schedule', at: hoursAgo(9) },
  { id: 'act_04', companyId: 'co_reddune', type: 'dunning', text: 'Card payment failed for Red Dune Aviation — retry scheduled', at: hoursAgo(19) },
  { id: 'act_05', companyId: 'co_nordwind', type: 'invoice', text: 'Annual renewal invoice INV-2026-1187 issued to Nordwind Charter', at: hoursAgo(31) },
  { id: 'act_06', companyId: 'co_sahara', type: 'invoice', text: 'Annual renewal invoice issued to Sahara Cargo Lines', at: hoursAgo(49) },
  { id: 'act_07', companyId: 'co_skybridge', type: 'login', text: 'Tom Whitfield signed in to the SkyBridge workspace', at: hoursAgo(50) },
  { id: 'act_08', companyId: 'co_nordwind', type: 'seat', text: `${COMPANY_TEAM.co_nordwind[39].name} invited as ${COMPANY_TEAM.co_nordwind[39].role}`, at: hoursAgo(3 * 24) },
  { id: 'act_09', companyId: 'co_baltic', type: 'trial', text: 'Baltic Air Taxi started a 30-day Professional trial', at: hoursAgo(7 * 24) },
  { id: 'act_10', companyId: 'co_nordwind', type: 'fleet', text: 'LN-NWV (Dash 8-400) added to the Nordwind fleet', at: hoursAgo(9 * 24) },
  { id: 'act_11', companyId: 'co_aurora', type: 'trial', text: 'Aurora Air Services started a 30-day Starter trial', at: hoursAgo(12 * 24) },
  { id: 'act_12', companyId: 'co_skybridge', type: 'dunning', text: 'Mastercard •••• 7731 was declined for INV-2026-1176 — access at risk', at: hoursAgo(14 * 24) },
  { id: 'act_13', companyId: 'co_andes', type: 'cancel', text: 'Andes Charter Group cancelled at period end', at: hoursAgo(21 * 24) },
  { id: 'act_14', companyId: 'co_skybridge', type: 'invoice', text: 'Monthly invoice INV-2026-1176 issued to SkyBridge Regional', at: hoursAgo(28 * 24) },
  { id: 'act_15', companyId: 'co_skybridge', type: 'payment', text: 'SkyBridge Regional paid INV-2026-1150', at: hoursAgo(50 * 24) },
];
