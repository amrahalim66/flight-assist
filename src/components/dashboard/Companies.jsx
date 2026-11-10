import { useEffect, useState } from 'react';
import { PLANS, MODULES, MOCK_USERS } from '../../data/mockData';
import { fmtMoney, fmtDate, fmtNumber, relativeDays, daysUntil } from '../../lib/format';
import { Badge, PlanPill, PageHead, StatTile, Card, EmptyState } from './ui';
import { Icon } from './icons';

const SORTS = [
  { key: 'mrr', label: 'Highest MRR' },
  { key: 'aircraft', label: 'Largest fleet' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'newest', label: 'Newest' },
];

const STATUSES = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'trialing', label: 'Trialing' },
  { key: 'past_due', label: 'Past due' },
  { key: 'cancelled', label: 'Cancelled' },
];

const portalAdminFor = (companyId) => MOCK_USERS.find((u) => u.companyId === companyId);

export default function Companies({ subs, invoices, go, actions, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('mrr');

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const live = subs.filter((s) => s.status === 'active' || s.status === 'past_due');
  const current = subs.filter((s) => s.status !== 'cancelled');
  const trials = subs.filter((s) => s.status === 'trialing');
  const aircraft = current.reduce((t, s) => t + s.aircraft, 0);
  const users = current.reduce((t, s) => t + s.users, 0);
  const countries = new Set(subs.map((s) => s.location.split(', ').pop())).size;

  const overdue = invoices.filter((i) => i.status === 'overdue');
  const attention = [
    ...subs
      .filter((s) => s.status === 'past_due')
      .map((s) => ({
        id: `pd-${s.id}`,
        tone: 'critical',
        icon: 'alert-circle',
        title: `${s.customer} is past due`,
        text: `${fmtMoney(s.mrr)}/mo at risk · ${s.aircraft} aircraft · renewal ${relativeDays(s.renewsOn)}`,
        view: 'subscriptions',
        query: s.customer,
      })),
    ...trials
      .filter((s) => daysUntil(s.renewsOn) <= 21)
      .map((s) => ({
        id: `tr-${s.id}`,
        tone: 'warning',
        icon: 'clock',
        title: `${s.customer} trial ends ${relativeDays(s.renewsOn)}`,
        text: `${PLANS[s.plan].name} · ${s.aircraft} aircraft · would add ${fmtMoney(s.mrr)}/mo`,
        view: 'subscriptions',
        query: s.customer,
      })),
    ...overdue.map((i) => ({
      id: `inv-${i.id}`,
      tone: 'critical',
      icon: 'file-text',
      title: `${i.id} is overdue`,
      text: `${i.customer} · ${fmtMoney(i.amount)} · was due ${fmtDate(i.due)}`,
      view: 'revenue',
    })),
  ];

  const q = query.trim().toLowerCase();
  const rows = subs
    .filter((s) => (status === 'all' || s.status === status) && (!q || s.customer.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (sort === 'name') return a.customer.localeCompare(b.customer);
      if (sort === 'newest') return a.started < b.started ? 1 : -1;
      if (sort === 'aircraft') return b.aircraft - a.aircraft;
      return b.mrr - a.mrr;
    });

  return (
    <div className="db-page">
      <PageHead
        title="Companies"
        text={`Platform ownership and control · ${subs.length} operators in ${countries} countries`}
      />

      <div className="db-tiles">
        <StatTile
          label="Paying operators"
          value={fmtNumber(live.length)}
          delta={{ text: `+${trials.length} on trial`, direction: 'flat', good: true }}
          foot={`${subs.length - current.length} cancelled`}
        />
        <StatTile
          label="Aircraft on FlightAssist"
          value={fmtNumber(aircraft)}
          delta={{ text: `${(aircraft / Math.max(current.length, 1)).toFixed(1)} avg fleet`, direction: 'flat', good: true }}
          foot="Active, past-due and trial accounts"
        />
        <StatTile
          label="Users"
          value={fmtNumber(users)}
          delta={{ text: 'Unlimited on every plan', direction: 'flat', good: true }}
          foot={`${(users / Math.max(aircraft, 1)).toFixed(1)} users per aircraft`}
        />
        <StatTile
          label="Needs attention"
          value={fmtNumber(attention.length)}
          delta={
            attention.length
              ? { text: `${attention.filter((a) => a.tone === 'critical').length} critical`, direction: 'up', good: false }
              : { text: 'All clear', direction: 'flat', good: true }
          }
          foot="Past due, overdue invoices and ending trials"
        />
      </div>

      {attention.length > 0 && (
        <Card title="Needs attention" subtitle="Past-due accounts, ending trials and overdue invoices" flush>
          <ul className="db-list">
            {attention.map((item) => (
              <li key={item.id} className="db-list-row">
                <span className={`db-list-icon db-list-icon--${item.tone}`}>
                  <Icon name={item.icon} size={16} />
                </span>
                <div className="db-list-main">
                  <span className="db-list-title">{item.title}</span>
                  <span className="db-list-sub">{item.text}</span>
                </div>
                <button type="button" className="db-btn db-btn--sm" onClick={() => go(item.view, { query: item.query })}>
                  Review
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="db-toolbar">
        <label className="db-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies or cities…"
            aria-label="Search companies"
          />
        </label>
        <select className="db-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <select className="db-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort companies">
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="db-toolbar-count">
          {rows.length} of {subs.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="db-card">
          <EmptyState title="No companies match" text="Try a different search or filter." />
        </div>
      ) : (
        <div className="db-customer-grid">
          {rows.map((s) => {
            const admin = portalAdminFor(s.companyId);
            return (
              <article key={s.id} className={`db-customer ${s.status === 'cancelled' ? 'is-inactive' : ''}`}>
                <header className="db-customer-head">
                  <div>
                    <h2 className="db-customer-name">{s.customer}</h2>
                    <p className="db-customer-loc">
                      <Icon name="map-pin" size={13} /> {s.location}
                    </p>
                  </div>
                  <Badge status={s.status} />
                </header>

                <dl className="db-customer-stats">
                  <div>
                    <dt>MRR</dt>
                    <dd>{fmtMoney(s.mrr)}</dd>
                  </div>
                  <div>
                    <dt>Aircraft</dt>
                    <dd>{s.aircraft}</dd>
                  </div>
                  <div>
                    <dt>Users</dt>
                    <dd>{s.users}</dd>
                  </div>
                </dl>

                <div className="db-customer-plan">
                  <PlanPill plan={s.plan} />
                  <span className="db-muted">{fmtMoney(PLANS[s.plan].perAircraft)} per aircraft</span>
                </div>

                <ul className="db-customer-modules">
                  {s.modules.map((m) => (
                    <li key={m}>{MODULES[m]}</li>
                  ))}
                </ul>

                <footer className="db-customer-foot">
                  <span className="db-muted">
                    {admin ? (
                      <>
                        <Icon name="user" size={12} /> {admin.name}
                      </>
                    ) : (
                      <>Since {fmtDate(s.started)}</>
                    )}
                  </span>
                  <span className="db-customer-links">
                    {admin && (
                      <button type="button" className="db-btn db-btn--sm" onClick={() => actions.viewAs(s.companyId)}>
                        <Icon name="eye" size={14} /> Workspace
                      </button>
                    )}
                    <button type="button" className="db-link" onClick={() => go('subscriptions', { query: s.customer })}>
                      Manage <Icon name="arrow-right" size={14} />
                    </button>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
