// Product catalogue, shared by the public pricing page and the admin console
// so both quote the same numbers. Pricing is per aircraft per month; users
// are unlimited on every plan.
//
// These are placeholder prices for the demo — change them here and every
// page, invoice total and calculator follows.

export const PLANS = {
  starter: {
    key: 'starter',
    name: 'Starter',
    perAircraft: 190,
    tier: 1,
    minAircraft: 1,
    blurb: 'Operations Control for small fleets',
    modules: ['ops'],
  },
  professional: {
    key: 'professional',
    name: 'Professional',
    perAircraft: 290,
    tier: 2,
    minAircraft: 3,
    blurb: 'Operations, Commercial Planning and Reporting',
    modules: ['ops', 'commercial', 'reporting'],
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise',
    perAircraft: 390,
    tier: 3,
    minAircraft: 5,
    blurb: 'Full suite incl. Crew Management and Maintenance',
    modules: ['ops', 'commercial', 'crew', 'maintenance', 'reporting'],
  },
};

export const MODULES = {
  ops: 'Operations Control',
  commercial: 'Commercial Planning',
  crew: 'Crew Management',
  maintenance: 'Fleet Maintenance',
  reporting: 'Flight Reporting',
};

export const MODULE_BLURBS = {
  ops: 'Live flight monitoring, dispatch CRM and movement messaging',
  commercial: 'Route planning, charter sales and quotations',
  crew: 'FTL engine, qualification tracking and rostering',
  maintenance: 'Airworthiness tracking and scheduled maintenance',
  reporting: 'Schedule reporting, EUROCONTROL and ARINC feeds',
};

/** Annual billing covers twelve months for the price of ten. */
export const ANNUAL_MONTHS = 10;

/** Lowest tier that includes a module — shown on locked module rows. */
export function planRequiredFor(moduleKey) {
  return Object.values(PLANS)
    .sort((a, b) => a.tier - b.tier)
    .find((p) => p.modules.includes(moduleKey));
}

/** Aircraft actually billed: the fleet size, or the plan minimum if larger. */
export function billedAircraft(planKey, aircraft) {
  return Math.max(aircraft, PLANS[planKey].minAircraft);
}

/** Monthly licence price for a fleet of `aircraft` on `planKey`. */
export function priceFor(planKey, aircraft) {
  return billedAircraft(planKey, aircraft) * PLANS[planKey].perAircraft;
}

/** Effective per-aircraft monthly rate when paying annually. */
export function annualPerAircraft(planKey) {
  return Math.round((PLANS[planKey].perAircraft * ANNUAL_MONTHS) / 12);
}
