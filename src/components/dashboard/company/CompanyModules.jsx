import { PLANS, MODULES, MODULE_BLURBS, planRequiredFor, priceFor } from '../../../data/mockData';
import { fmtMoney } from '../../../lib/format';
import { Card, PageHead, PlanPill, Badge } from '../ui';
import { Icon } from '../icons';

export default function CompanyModules({ sub, actions }) {
  const plan = PLANS[sub.plan];
  const live = sub.status === 'active' || sub.status === 'past_due' || sub.status === 'trialing';

  return (
    <div className="db-page">
      <PageHead
        title="Modules"
        text={`Turn on the modules your plan includes. ${sub.modules.length} of ${Object.keys(MODULES).length} enabled — included in your per-aircraft price.`}
      />

      <Card title="Your modules" subtitle={`${plan.name} plan`} actions={<Badge status={sub.status} />}>
        <ul className="db-modules">
          {Object.keys(MODULES).map((m) => {
            const allowed = plan.modules.includes(m);
            const on = sub.modules.includes(m);
            return (
              <li key={m} className={allowed ? '' : 'is-locked'}>
                <div>
                  <strong>{MODULES[m]}</strong>
                  <span>{MODULE_BLURBS[m]}</span>
                </div>
                {allowed ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${MODULES[m]} ${on ? 'enabled' : 'disabled'}`}
                    className={`db-switch ${on ? 'is-on' : ''}`}
                    disabled={!live || (m === 'ops' && on)}
                    title={m === 'ops' ? 'Operations Control is always on' : undefined}
                    onClick={() => actions.toggleModule(sub.id, m)}
                  >
                    <span className="db-switch-knob" />
                  </button>
                ) : (
                  <span className="db-chip">
                    <Icon name="lock" size={11} /> {planRequiredFor(m).name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Plans" subtitle={`Prices for your fleet of ${sub.aircraft} aircraft. Upgrades apply today; downgrades at renewal.`}>
        <div className="db-plan-grid">
          {Object.values(PLANS).map((p) => {
            const isCurrent = p.key === sub.plan;
            const monthly = priceFor(p.key, sub.aircraft);
            return (
              <article key={p.key} className={`db-plan-card ${isCurrent ? 'is-current' : ''}`}>
                <header>
                  <PlanPill plan={p.key} />
                  {isCurrent && <span className="db-chip db-chip--you">Current</span>}
                </header>
                <p className="db-plan-price">
                  <strong>{fmtMoney(p.perAircraft)}</strong> /aircraft/mo
                </p>
                <p className="db-muted">{p.blurb}</p>
                <ul>
                  {p.modules.map((m) => (
                    <li key={m}>
                      <Icon name="check" size={14} strokeWidth={2.5} /> {MODULES[m]}
                    </li>
                  ))}
                  <li>
                    <Icon name="check" size={14} strokeWidth={2.5} /> Unlimited users
                  </li>
                  <li>
                    <Icon name="check" size={14} strokeWidth={2.5} /> Min. {p.minAircraft} {p.minAircraft === 1 ? 'aircraft' : 'aircraft'}
                  </li>
                </ul>
                {isCurrent ? (
                  <button type="button" className="db-btn" disabled>
                    {fmtMoney(monthly)}/mo · current
                  </button>
                ) : (
                  <button
                    type="button"
                    className={p.tier > plan.tier ? 'btn btn-primary btn-sm' : 'db-btn'}
                    disabled={!live}
                    onClick={() => actions.changePlan(sub.id, p.key)}
                  >
                    {p.tier > plan.tier ? 'Upgrade' : 'Switch'} · {fmtMoney(monthly)}/mo
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
