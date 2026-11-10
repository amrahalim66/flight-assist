import { useState } from 'react';
import { motion } from 'framer-motion';
import { PLANS, MODULES, priceFor, billedAircraft, annualPerAircraft, ANNUAL_MONTHS } from '../data/plans';
import { fmtMoney } from '../lib/format';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

// Marketing detail per plan. Prices and modules come from data/plans.js.
const PLAN_EXTRAS = {
    starter: {
        tagline: 'For small operators getting off the ground',
        support: 'Email support, business hours',
        onboarding: 'Self-serve setup in a day',
        trial: '30-day free trial',
        cta: 'Start free trial',
    },
    professional: {
        tagline: 'For regional airlines and charter operators',
        support: 'Priority email and chat',
        onboarding: 'Guided onboarding, two sessions',
        trial: '30-day free trial',
        cta: 'Start free trial',
        featured: true,
    },
    enterprise: {
        tagline: 'For multi-fleet and multi-AOC operations',
        support: '24/7 phone, dedicated account manager',
        onboarding: 'White-glove migration',
        trial: 'Guided pilot programme',
        cta: 'Talk to sales',
    },
};

// true = included, false = not included, string = shown as text.
const COMPARE = [
    {
        group: 'Modules',
        rows: Object.keys(MODULES).map((m) => [MODULES[m], ...Object.values(PLANS).map((p) => p.modules.includes(m))]),
    },
    {
        group: 'Platform',
        rows: [
            ['Users', 'Unlimited', 'Unlimited', 'Unlimited'],
            ['Minimum fleet', '1 aircraft', '3 aircraft', '5 aircraft'],
            ['Mobile apps for crew', true, true, true],
            ['API access and webhooks', false, true, true],
            ['Single sign-on (SSO)', false, false, true],
            ['Sandbox environment', false, false, true],
        ],
    },
    {
        group: 'Support and service',
        rows: [
            ['Support', 'Email, business hours', 'Priority email and chat', '24/7 phone, account manager'],
            ['Onboarding', 'Self-serve', 'Guided, two sessions', 'White-glove migration'],
            ['Uptime SLA', false, '99.9%', '99.95% with service credits'],
            ['Data retention', '12 months', '3 years', 'Unlimited'],
        ],
    },
];

const FAQS = [
    {
        q: 'How is pricing calculated?',
        a: 'Per aircraft, per month, on the plan you choose. A fleet of 12 on Professional is 12 × $290 = $3,480 a month. Users are unlimited, so your whole team can sign in at no extra cost.',
    },
    {
        q: 'What counts as an aircraft?',
        a: 'Any aircraft you manage in FlightAssist — in service, in maintenance or AOG. Aircraft you remove from your fleet stop being billed from the next invoice.',
    },
    {
        q: 'Do you charge per user?',
        a: 'No. Every plan includes unlimited users: dispatchers, crew, planners, maintenance control and finance all get their own login.',
    },
    {
        q: 'Can I change plans or fleet size later?',
        a: 'Yes. Upgrades and added aircraft apply immediately and are pro-rated on your next invoice. Downgrades and removed aircraft take effect at your next renewal.',
    },
    {
        q: 'Is there a free trial?',
        a: 'Starter and Professional come with a 30-day free trial, no card required. Enterprise customers run a guided pilot with our onboarding team instead.',
    },
    {
        q: 'Why is there a minimum fleet size?',
        a: 'Each plan is designed around a fleet size: Professional’s planning tools and Enterprise’s crew and maintenance modules only pay off above a few aircraft. Smaller fleets on those plans are billed at the minimum.',
    },
    {
        q: 'Do larger fleets get a discount?',
        a: 'Fleets over 50 aircraft, multi-AOC groups and multi-year agreements are priced individually. Talk to sales and we’ll put a fleet proposal together.',
    },
    {
        q: 'How does annual billing work?',
        a: 'Annual billing covers twelve months for the price of ten, paid in advance. Monthly plans are billed in advance each month and can be cancelled at any time.',
    },
];

const MAX_FLEET = 50;

const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);
const Dash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const Chevron = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
);

function Cell({ value }) {
    if (value === true) return <span className="compare-yes" role="img" aria-label="Included"><Check /></span>;
    if (value === false) return <span className="compare-no" role="img" aria-label="Not included"><Dash /></span>;
    return value;
}

export default function Pricing({ onNavigate }) {
    const [billing, setBilling] = useState('monthly');
    const [fleet, setFleet] = useState(12);
    const [calcPlan, setCalcPlan] = useState('professional');

    const go = (e, page, hash) => {
        e.preventDefault();
        onNavigate(page, hash);
    };

    const plans = Object.values(PLANS);
    const annual = billing === 'annual';
    const rate = (p) => (annual ? annualPerAircraft(p.key) : p.perAircraft);

    const clampFleet = (n) => Math.max(1, Math.min(MAX_FLEET, Math.round(n) || 1));
    const monthly = priceFor(calcPlan, fleet);
    const billed = billedAircraft(calcPlan, fleet);
    const yearly = monthly * ANNUAL_MONTHS;
    const perMonth = annual ? Math.round(yearly / 12) : monthly;
    const perYear = annual ? yearly : monthly * 12;

    return (
        <main id="main" tabIndex={-1}>
            <section className="hero hero--service hero--simple" style={{ position: 'relative' }}>
                <div className="container hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <nav className="breadcrumb" aria-label="Breadcrumb" style={{ justifyContent: 'center' }}>
                        <a href="#home" onClick={(e) => go(e, 'home', null)}>Home</a>
                        <span>/</span>
                        <span>Pricing</span>
                    </nav>
                    <span className="eyebrow">Pricing</span>
                    <h1 className="hero-title hero-title--dark">
                        Simple pricing, <span>per aircraft.</span>
                    </h1>
                    <p className="hero-description hero-description--dark">
                        One price per aircraft per month. Unlimited users on every plan, no setup fees and no per-seat charges — so the whole operation can work in one system.
                    </p>
                    <div className="billing-toggle" role="group" aria-label="Billing period">
                        <button type="button" className={!annual ? 'is-active' : ''} aria-pressed={!annual} onClick={() => setBilling('monthly')}>
                            Monthly
                        </button>
                        <button type="button" className={annual ? 'is-active' : ''} aria-pressed={annual} onClick={() => setBilling('annual')}>
                            Annual <span className="billing-save">2 months free</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section className="section section--white pricing-plans">
                <div className="container">
                    <motion.div className="price-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
                        {plans.map((p) => {
                            const extra = PLAN_EXTRAS[p.key];
                            return (
                                <motion.article key={p.key} className={`price-card ${extra.featured ? 'is-featured' : ''}`} variants={fadeInUp}>
                                    {extra.featured && <span className="price-badge">Most popular</span>}
                                    <header>
                                        <h2 className="price-name">{p.name}</h2>
                                        <p className="price-tagline">{extra.tagline}</p>
                                    </header>
                                    <div className="price-amount" aria-label={`${fmtMoney(rate(p))} per aircraft per month`}>
                                        <span className="price-currency">$</span>
                                        <span className="price-value">{rate(p)}</span>
                                        <span className="price-unit">
                                            per aircraft
                                            <br />
                                            per month
                                        </span>
                                    </div>
                                    <p className="price-meta">
                                        {annual ? `Billed annually · ${fmtMoney(p.perAircraft * ANNUAL_MONTHS)} per aircraft per year` : 'Billed monthly · cancel any time'}
                                    </p>
                                    <a href="#contact" className={`btn ${extra.featured ? 'btn-primary' : 'btn-secondary'}`} onClick={(e) => go(e, 'home', '#contact')}>
                                        {extra.cta}
                                    </a>
                                    <ul className="price-features">
                                        <li className="is-head">Includes</li>
                                        {Object.keys(MODULES).map((m) => {
                                            const on = p.modules.includes(m);
                                            return (
                                                <li key={m} className={on ? '' : 'is-off'}>
                                                    {on ? <Check /> : <Dash />}
                                                    {MODULES[m]}
                                                </li>
                                            );
                                        })}
                                        <li><Check /> Unlimited users</li>
                                        <li><Check /> {extra.support}</li>
                                        <li><Check /> {extra.onboarding}</li>
                                        <li><Check /> {extra.trial}</li>
                                        <li><Check /> Minimum {p.minAircraft} {p.minAircraft === 1 ? 'aircraft' : 'aircraft'}</li>
                                    </ul>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                    <p className="pricing-note">
                        Prices in USD, excluding VAT. Every aircraft in your fleet is billed whatever its status, and you can add or remove aircraft at any time from your workspace.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section section--light" id="calculator">
                <div className="container calc">
                    <div className="calc-copy">
                        <span className="eyebrow">Estimate</span>
                        <h2 className="section-title">What would FlightAssist cost your fleet?</h2>
                        <p className="section-subtitle">
                            Pick a plan, set your fleet size and see the monthly and annual total. There are no hidden fees — the number here is the number on your invoice.
                        </p>
                    </div>

                    <div className="calc-card">
                        <div className="calc-row">
                            <label htmlFor="fleetSize">Aircraft in your fleet</label>
                            <div className="calc-fleet">
                                <input
                                    type="range"
                                    id="fleetRange"
                                    min="1"
                                    max={MAX_FLEET}
                                    value={fleet}
                                    onChange={(e) => setFleet(clampFleet(Number(e.target.value)))}
                                    aria-label="Aircraft in your fleet"
                                />
                                <input
                                    type="number"
                                    id="fleetSize"
                                    min="1"
                                    max={MAX_FLEET}
                                    value={fleet}
                                    onChange={(e) => setFleet(clampFleet(Number(e.target.value)))}
                                />
                            </div>
                        </div>

                        <div className="calc-row">
                            <span className="calc-label">Plan</span>
                            <div className="calc-seg" role="group" aria-label="Plan">
                                {plans.map((p) => (
                                    <button key={p.key} type="button" className={calcPlan === p.key ? 'is-active' : ''} aria-pressed={calcPlan === p.key} onClick={() => setCalcPlan(p.key)}>
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="calc-row">
                            <span className="calc-label">Billing</span>
                            <div className="calc-seg" role="group" aria-label="Billing period">
                                <button type="button" className={!annual ? 'is-active' : ''} aria-pressed={!annual} onClick={() => setBilling('monthly')}>Monthly</button>
                                <button type="button" className={annual ? 'is-active' : ''} aria-pressed={annual} onClick={() => setBilling('annual')}>Annual</button>
                            </div>
                        </div>

                        <dl className="calc-result" aria-live="polite">
                            <div>
                                <dt>Per month</dt>
                                <dd>
                                    {fmtMoney(perMonth)} {annual && <small>equivalent</small>}
                                </dd>
                            </div>
                            <div>
                                <dt>Per year</dt>
                                <dd>
                                    {fmtMoney(perYear)} {annual && <small>12 months for 10</small>}
                                </dd>
                            </div>
                        </dl>
                        <p className="calc-note">
                            {billed} aircraft × {fmtMoney(PLANS[calcPlan].perAircraft)} on {PLANS[calcPlan].name}
                            {billed > fleet && ` — billed at the ${PLANS[calcPlan].name} minimum of ${PLANS[calcPlan].minAircraft} aircraft`}
                            {fleet >= MAX_FLEET && (
                                <>
                                    . Fleets of {MAX_FLEET}+ aircraft get fleet pricing —{' '}
                                    <a href="#contact" onClick={(e) => go(e, 'home', '#contact')}>talk to sales</a>
                                </>
                            )}
                            .
                        </p>
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className="section section--white">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">Compare</span>
                        <h2 className="section-title">Every plan, side by side</h2>
                        <p className="section-subtitle">All three run the same platform. The difference is which modules are switched on and how much support comes with them.</p>
                    </div>

                    <div className="compare-wrap">
                        <table className="compare">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <span className="sr-only">Feature</span>
                                    </th>
                                    {plans.map((p) => (
                                        <th key={p.key} scope="col" className={PLAN_EXTRAS[p.key].featured ? 'is-featured' : ''}>
                                            <span className="compare-plan">{p.name}</span>
                                            <span className="compare-price">
                                                {fmtMoney(rate(p))} / aircraft / mo
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARE.map((section) => (
                                    <GroupRows key={section.group} section={section} plans={plans} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section section--light">
                <div className="container">
                    <div className="section-header section-header--center">
                        <span className="eyebrow">FAQ</span>
                        <h2 className="section-title">Questions, answered</h2>
                    </div>
                    <div className="faq">
                        {FAQS.map((f) => (
                            <details className="faq-item" key={f.q}>
                                <summary>
                                    {f.q}
                                    <Chevron />
                                </summary>
                                <p>{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section--white">
                <div className="container">
                    <div className="pricing-cta">
                        <h2 className="section-title section-title--light">Not sure which plan fits?</h2>
                        <p className="section-subtitle section-subtitle--light">
                            Tell us about your fleet and we&rsquo;ll recommend a plan — or start a 30-day trial and decide for yourself.
                        </p>
                        <div className="cta-actions">
                            <a href="#contact" className="btn btn-primary btn-lg" onClick={(e) => go(e, 'home', '#contact')}>Talk to sales</a>
                            <a href="#contact" className="btn btn-secondary btn-lg" onClick={(e) => go(e, 'home', '#contact')}>Request a demo</a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function GroupRows({ section, plans }) {
    return (
        <>
            <tr className="compare-group">
                <th scope="colgroup" colSpan={plans.length + 1}>{section.group}</th>
            </tr>
            {section.rows.map(([label, ...cells]) => (
                <tr key={label}>
                    <th scope="row">{label}</th>
                    {cells.map((value, i) => (
                        <td key={plans[i].key} className={PLAN_EXTRAS[plans[i].key].featured ? 'is-featured' : ''}>
                            <Cell value={value} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
