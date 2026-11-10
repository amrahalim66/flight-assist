import { useState } from 'react';
import { PLANS, MODULES, MODULE_BLURBS } from '../../data/mockData';
import { fmtMoney } from '../../lib/format';
import { Card, PageHead, Meter, PlanPill, Switch, StatTile } from './ui';
import { Icon } from './icons';

// Super-admin view of the product catalogue: what each module is, which plans
// package it, and how widely operators have switched it on.

export default function PlatformModules({ subs, notify }) {
  const [available, setAvailable] = useState(() => Object.fromEntries(Object.keys(MODULES).map((k) => [k, true])));

  const current = subs.filter((s) => s.status !== 'cancelled');
  const plans = Object.values(PLANS);

  const rows = Object.keys(MODULES).map((key) => {
    const using = current.filter((s) => s.modules.includes(key));
    const eligible = current.filter((s) => PLANS[s.plan].modules.includes(key));
    return {
      key,
      using: using.length,
      eligible: eligible.length,
      idle: eligible.length - using.length,
      aircraft: using.reduce((t, s) => t + s.aircraft, 0),
      plans: plans.filter((p) => p.modules.includes(key)),
    };
  });

  const avgModules = current.reduce((t, s) => t + s.modules.length, 0) / Math.max(current.length, 1);
  const top = [...rows].sort((a, b) => b.using - a.using)[1] || rows[0]; // [0] is always Operations Control
  const upsell = current.filter((s) => !PLANS[s.plan].modules.includes('crew')).length;

  const toggle = (key) => (v) => {
    setAvailable((a) => ({ ...a, [key]: v }));
    notify(`${MODULES[key]} ${v ? 'is available to' : 'is hidden from'} new customers.`, v ? 'success' : 'warning');
  };

  return (
    <div className="db-page">
      <PageHead title="Modules" text="The product catalogue, how each plan packages it, and adoption across every operator." />

      <div className="db-tiles">
        <StatTile label="Modules in catalogue" value={String(rows.length)} foot={`${Object.values(available).filter(Boolean).length} available to new customers`} />
        <StatTile
          label="Modules per operator"
          value={avgModules.toFixed(1)}
          delta={{ text: `of ${rows.length}`, direction: 'flat', good: true }}
          foot="Average across current accounts"
        />
        <StatTile
          label="Most adopted add-on"
          value={MODULES[top.key]}
          delta={{ text: `${top.using} operators`, direction: 'flat', good: true }}
          foot={`${top.aircraft} aircraft covered`}
        />
        <StatTile
          label="Crew Management upsell"
          value={String(upsell)}
          delta={{ text: 'operators', direction: 'flat', good: true }}
          foot="On a plan without Crew Management"
        />
      </div>

      <div className="db-module-grid">
        {rows.map((r) => (
          <article key={r.key} className={`db-module-card ${available[r.key] ? '' : 'is-hidden'}`}>
            <header>
              <h2>{MODULES[r.key]}</h2>
              {!available[r.key] && <span className="db-chip">Hidden</span>}
            </header>
            <p className="db-muted">{MODULE_BLURBS[r.key]}</p>

            <div className="db-adoption">
              <div className="db-adoption-head">
                <span>Adoption</span>
                <strong>{Math.round((r.using / Math.max(current.length, 1)) * 100)}%</strong>
              </div>
              <Meter used={r.using} total={current.length} label={`${MODULES[r.key]} adoption`} />
              <p className="db-muted">
                {r.using} of {current.length} operators · {r.aircraft} aircraft
                {r.idle > 0 && ` · ${r.idle} eligible but off`}
              </p>
            </div>

            <div className="db-module-plans">
              <span className="db-muted">Included in</span>
              {r.plans.map((p) => (
                <PlanPill key={p.key} plan={p.key} />
              ))}
            </div>

            <Switch label="Available to new customers" checked={available[r.key]} onChange={toggle(r.key)} />
          </article>
        ))}
      </div>

      <Card title="Plan packaging" subtitle="What each plan includes. Prices are per aircraft per month; users are unlimited." flush>
        <div className="db-table-wrap">
          <table className="db-table db-matrix">
            <thead>
              <tr>
                <th scope="col">Module</th>
                {plans.map((p) => (
                  <th key={p.key} scope="col" className="center">
                    <PlanPill plan={p.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="db-matrix-meta">
                <td>Price per aircraft</td>
                {plans.map((p) => (
                  <td key={p.key} className="center">
                    <strong>{fmtMoney(p.perAircraft)}</strong>
                    <span className="db-muted">/mo</span>
                  </td>
                ))}
              </tr>
              <tr className="db-matrix-meta">
                <td>Minimum fleet</td>
                {plans.map((p) => (
                  <td key={p.key} className="center">
                    {p.minAircraft} aircraft
                  </td>
                ))}
              </tr>
              <tr className="db-matrix-meta">
                <td>Operators on plan</td>
                {plans.map((p) => (
                  <td key={p.key} className="center">
                    {current.filter((s) => s.plan === p.key).length}
                  </td>
                ))}
              </tr>
              {Object.keys(MODULES).map((m) => (
                <tr key={m}>
                  <td>{MODULES[m]}</td>
                  {plans.map((p) => (
                    <td key={p.key} className="center">
                      {p.modules.includes(m) ? (
                        <span className="db-yes" aria-label="Included">
                          <Icon name="check" size={16} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="db-no" aria-label="Not included">
                          <Icon name="minus" size={16} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
