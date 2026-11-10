import { useEffect, useState } from 'react';
import { PLANS, MODULES, MOCK_USERS, priceFor, billedAircraft } from '../../data/mockData';
import { fmtMoney, fmtDate, relativeDays } from '../../lib/format';
import { Badge, PlanPill, ModuleChips, Card, PageHead, EmptyState, Drawer } from './ui';
import { Icon } from './icons';

const STATUS_ORDER = ['active', 'trialing', 'past_due', 'cancelled'];

export default function Subscriptions({ subs, invoices, actions, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState('all');
  const [plan, setPlan] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const q = query.trim().toLowerCase();
  const rows = subs.filter(
    (s) =>
      (status === 'all' || s.status === status) &&
      (plan === 'all' || s.plan === plan) &&
      (!q || s.customer.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.contact.name.toLowerCase().includes(q)),
  );

  const selected = subs.find((s) => s.id === selectedId) || null;
  const mrrShown = rows.filter((s) => s.status !== 'cancelled').reduce((t, s) => t + s.mrr, 0);

  const onRowKey = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedId(id);
    }
  };

  return (
    <div className="db-page">
      <PageHead
        title="Subscriptions"
        text="Every operator licence, priced per aircraft per month. Users are unlimited on every plan."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => actions.notify('New subscriptions are created from a signed order form — not part of this demo.', 'info')}
          >
            <Icon name="plus" size={16} /> New subscription
          </button>
        }
      />

      <ul className="db-status-list db-status-list--filters" aria-label="Filter by status">
        {STATUS_ORDER.map((st) => {
          const on = status === st;
          return (
            <li key={st}>
              <button type="button" className={`db-status-btn ${on ? 'is-active' : ''}`} aria-pressed={on} onClick={() => setStatus(on ? 'all' : st)}>
                <Badge status={st} />
                <strong>{subs.filter((s) => s.status === st).length}</strong>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="db-toolbar">
        <label className="db-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, city or contact…"
            aria-label="Search subscriptions"
          />
        </label>
        <select className="db-select" value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Filter by plan">
          <option value="all">All plans</option>
          {Object.values(PLANS).map((p) => (
            <option key={p.key} value={p.key}>
              {p.name}
            </option>
          ))}
        </select>
        {status !== 'all' && (
          <button type="button" className="db-link" onClick={() => setStatus('all')}>
            <Icon name="x" size={13} /> Clear status filter
          </button>
        )}
        <span className="db-toolbar-count">
          {rows.length} of {subs.length} · {fmtMoney(mrrShown)}/mo
        </span>
      </div>

      <Card flush>
        <div className="db-table-wrap">
          <table className="db-table db-table--clickable">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Plan</th>
                <th scope="col">Modules</th>
                <th scope="col" className="num">Aircraft</th>
                <th scope="col" className="num">MRR</th>
                <th scope="col">Status</th>
                <th scope="col">Renews</th>
                <th scope="col" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  tabIndex={0}
                  onClick={() => setSelectedId(s.id)}
                  onKeyDown={(e) => onRowKey(e, s.id)}
                  className={selectedId === s.id ? 'is-selected' : ''}
                >
                  <td>
                    <div className="db-cell-title">{s.customer}</div>
                    <div className="db-cell-sub">{s.location}</div>
                  </td>
                  <td>
                    <PlanPill plan={s.plan} />
                    <div className="db-cell-sub">{fmtMoney(PLANS[s.plan].perAircraft)}/aircraft</div>
                  </td>
                  <td>
                    <ModuleChips modules={s.modules} max={2} />
                  </td>
                  <td className="num">{s.aircraft}</td>
                  <td className="num">{fmtMoney(s.mrr)}</td>
                  <td>
                    <Badge status={s.status} />
                  </td>
                  <td>
                    {s.status === 'cancelled' ? (
                      <div className="db-cell-sub">Ended {fmtDate(s.endedOn)}</div>
                    ) : (
                      <>
                        <div>{fmtDate(s.renewsOn)}</div>
                        <div className="db-cell-sub">
                          {s.status === 'trialing' ? 'Trial ends ' : ''}
                          {relativeDays(s.renewsOn)}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="db-cell-chevron">
                    <Icon name="chevron-right" size={16} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No subscriptions match" text="Try a different search or clear the filters." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <SubscriptionDrawer
          sub={selected}
          invoices={invoices.filter((i) => i.subscriptionId === selected.id)}
          actions={actions}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function SubscriptionDrawer({ sub, invoices, actions, onClose }) {
  const [planChoice, setPlanChoice] = useState(sub.plan);

  useEffect(() => {
    setPlanChoice(sub.plan);
  }, [sub.plan]);

  const plan = PLANS[sub.plan];
  const billed = billedAircraft(sub.plan, sub.aircraft);
  const nextCharge = sub.billing === 'annual' ? sub.mrr * 12 : sub.mrr;
  const admin = MOCK_USERS.find((u) => u.companyId === sub.companyId);

  return (
    <Drawer
      eyebrow={sub.id}
      title={sub.customer}
      subtitle={
        <>
          <Icon name="map-pin" size={13} /> {sub.location}
        </>
      }
      onClose={onClose}
      footer={
        <>
          <span className="db-muted">
            {sub.aircraft} aircraft · {sub.users} users · {sub.modules.length} modules
          </span>
          <button type="button" className="db-btn" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="db-drawer-status">
        <Badge status={sub.status} />
        <PlanPill plan={sub.plan} />
        <span className="db-chip">{sub.billing === 'annual' ? 'Billed annually' : 'Billed monthly'}</span>
      </div>

      <dl className="db-facts">
        <div>
          <dt>MRR</dt>
          <dd>{fmtMoney(sub.mrr)}</dd>
        </div>
        <div>
          <dt>Next charge</dt>
          <dd>{sub.status === 'cancelled' ? '—' : fmtMoney(nextCharge)}</dd>
        </div>
        <div>
          <dt>Aircraft billed</dt>
          <dd>
            {billed} <small>× {fmtMoney(plan.perAircraft)}</small>
          </dd>
        </div>
        <div>
          <dt>Users</dt>
          <dd>
            {sub.users} <small>unlimited</small>
          </dd>
        </div>
        <div>
          <dt>Customer since</dt>
          <dd>{fmtDate(sub.started)}</dd>
        </div>
        <div>
          <dt>{sub.status === 'trialing' ? 'Trial ends' : sub.status === 'cancelled' ? 'Ended' : 'Renews'}</dt>
          <dd>{sub.status === 'cancelled' ? fmtDate(sub.endedOn) : fmtDate(sub.renewsOn)}</dd>
        </div>
      </dl>
      {billed > sub.aircraft && (
        <p className="db-note">
          <Icon name="alert-circle" size={14} /> Fleet of {sub.aircraft} is billed at the {plan.name} minimum of {plan.minAircraft} aircraft.
        </p>
      )}

      <section className="db-drawer-section">
        <h3>Company workspace</h3>
        {admin ? (
          <div className="db-portal-admin">
            <div>
              <strong>{admin.name}</strong>
              <small>
                {admin.title} · <span className="db-mono">{admin.username}</span>
              </small>
            </div>
            <button type="button" className="db-btn db-btn--sm" onClick={() => actions.viewAs(sub.companyId)}>
              <Icon name="eye" size={14} /> Open workspace
            </button>
          </div>
        ) : (
          <div className="db-portal-admin">
            <div>
              <strong>No company admin yet</strong>
              <small>Invite {sub.contact.name} to manage their workspace</small>
            </div>
            <button type="button" className="db-btn db-btn--sm" onClick={() => actions.notify(`Workspace invitation emailed to ${sub.contact.email}.`)}>
              <Icon name="mail" size={14} /> Invite
            </button>
          </div>
        )}
      </section>

      <section className="db-drawer-section">
        <h3>Modules</h3>
        <ul className="db-module-list">
          {Object.keys(MODULES).map((m) => {
            const on = sub.modules.includes(m);
            return (
              <li key={m} className={on ? 'is-on' : ''}>
                <Icon name={on ? 'check-circle' : 'minus'} size={15} />
                {MODULES[m]}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="db-drawer-section">
        <h3>Billing contact</h3>
        <p className="db-contact">
          <strong>{sub.contact.name}</strong>
          <a href={`mailto:${sub.contact.email}`}>{sub.contact.email}</a>
        </p>
      </section>

      <section className="db-drawer-section">
        <h3>Invoices</h3>
        {invoices.length === 0 ? (
          <p className="db-muted">No invoices yet.</p>
        ) : (
          <ul className="db-mini-list">
            {invoices.slice(0, 4).map((i) => (
              <li key={i.id}>
                <span>
                  <strong>{i.id}</strong>
                  <small>
                    {i.period} · due {fmtDate(i.due)}
                  </small>
                </span>
                <span className="db-mini-right">
                  {fmtMoney(i.amount)}
                  <Badge status={i.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="db-drawer-section">
        <h3>Actions</h3>
        <div className="db-actions">
          {sub.status === 'past_due' && (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.retryPayment(sub.id)}>
                <Icon name="refresh" size={15} /> Retry payment
              </button>
              <button type="button" className="db-btn" onClick={() => actions.sendReminder(sub.id)}>
                <Icon name="mail" size={15} /> Send reminder
              </button>
            </>
          )}
          {sub.status === 'trialing' && (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.convertTrial(sub.id)}>
                <Icon name="check" size={15} /> Convert to paid
              </button>
              <button type="button" className="db-btn" onClick={() => actions.extendTrial(sub.id)}>
                <Icon name="clock" size={15} /> Extend trial 14 days
              </button>
            </>
          )}
          {sub.status === 'cancelled' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.reactivate(sub.id)}>
              <Icon name="refresh" size={15} /> Reactivate
            </button>
          )}
          {(sub.status === 'active' || sub.status === 'past_due') && (
            <div className="db-plan-change">
              <label className="db-field">
                <span>Change plan</span>
                <select className="db-select" value={planChoice} onChange={(e) => setPlanChoice(e.target.value)}>
                  {Object.values(PLANS).map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name} · {fmtMoney(p.perAircraft)}/aircraft
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="db-btn" disabled={planChoice === sub.plan} onClick={() => actions.changePlan(sub.id, planChoice)}>
                Apply · {fmtMoney(priceFor(planChoice, sub.aircraft))}/mo
              </button>
            </div>
          )}
          {sub.status !== 'cancelled' && (
            <button type="button" className="db-btn db-btn--danger" onClick={() => actions.cancel(sub.id)}>
              <Icon name="x-circle" size={15} /> Cancel at period end
            </button>
          )}
        </div>
      </section>
    </Drawer>
  );
}
