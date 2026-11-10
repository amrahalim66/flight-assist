import { useEffect, useState } from 'react';
import { PLANS, billedAircraft } from '../../../data/mockData';
import { fmtMoney, fmtDate, relativeDays } from '../../../lib/format';
import { Badge, Card, PageHead, StatTile, PlanPill, EmptyState } from '../ui';
import { Icon } from '../icons';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'due', label: 'Due' },
  { key: 'paid', label: 'Paid' },
];

export default function Billing({ sub, invoices, onPay, actions, go }) {
  const [filter, setFilter] = useState('all');
  const [contact, setContact] = useState({ name: sub.contact.name, email: sub.contact.email });

  useEffect(() => {
    setContact({ name: sub.contact.name, email: sub.contact.email });
  }, [sub.contact.name, sub.contact.email]);

  const plan = PLANS[sub.plan];
  const billed = billedAircraft(sub.plan, sub.aircraft);
  const live = sub.status === 'active' || sub.status === 'past_due' || sub.status === 'trialing';

  const dueList = invoices.filter((i) => i.status === 'open' || i.status === 'overdue').sort((a, b) => (a.due < b.due ? -1 : 1));
  const overdue = dueList.filter((i) => i.status === 'overdue');
  const next = dueList[0] || null;
  const year = String(new Date().getFullYear());
  const paidThisYear = invoices.filter((i) => i.status === 'paid' && i.paidOn && i.paidOn.startsWith(year));
  const sum = (list) => list.reduce((t, i) => t + i.amount, 0);
  const endDate = sub.renewsOn || sub.endedOn;

  const rows = invoices
    .filter((i) => filter === 'all' || (filter === 'due' ? i.status === 'open' || i.status === 'overdue' : i.status === 'paid'))
    .sort((a, b) => (a.issued < b.issued ? 1 : -1));

  const saveContact = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      actions.notify('Enter a valid billing email.', 'warning');
      return;
    }
    actions.updateCompany(sub.id, { contact: { name: contact.name.trim(), email: contact.email.trim() } });
  };

  return (
    <div className="db-page">
      <PageHead
        title="Billing"
        text="Your FlightAssist licence is priced per aircraft. Users are unlimited on every plan."
        actions={
          next &&
          sub.status !== 'cancelled' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onPay(next)}>
              <Icon name="credit-card" size={15} /> Pay {fmtMoney(next.amount)}
            </button>
          )
        }
      />

      <div className="db-tiles">
        <StatTile
          label="Monthly licence"
          value={`${fmtMoney(sub.mrr)}/mo`}
          delta={{ text: plan.name, direction: 'flat', good: true }}
          deltaLabel={`${billed} aircraft × ${fmtMoney(plan.perAircraft)}`}
          foot={sub.billing === 'annual' ? `Billed annually · ${fmtMoney(sub.mrr * 12)}/yr` : 'Billed monthly'}
        />
        <StatTile
          label="Outstanding"
          value={fmtMoney(sum(dueList))}
          delta={
            overdue.length
              ? { text: `${overdue.length} overdue`, direction: 'up', good: false }
              : { text: dueList.length ? `${dueList.length} open` : 'Nothing due', direction: 'flat', good: true }
          }
          foot={next ? `${next.id} due ${fmtDate(next.due)}` : 'All invoices settled'}
        />
        <StatTile
          label={sub.status === 'trialing' ? 'Trial ends' : sub.status === 'cancelled' ? 'Access ended' : 'Renews'}
          value={fmtDate(endDate)}
          delta={{ text: relativeDays(endDate), direction: 'flat', good: true }}
          foot={`Customer since ${fmtDate(sub.started)}`}
        />
        <StatTile
          label={`Paid in ${year}`}
          value={fmtMoney(sum(paidThisYear))}
          delta={{ text: `${paidThisYear.length} ${paidThisYear.length === 1 ? 'invoice' : 'invoices'}`, direction: 'flat', good: true }}
          foot="Excludes refunds"
        />
      </div>

      <div className="db-grid db-grid--2-1">
        <Card
          title="Invoices"
          subtitle="Pay online or download a PDF"
          flush
          actions={
            <div className="db-seg" role="group" aria-label="Filter invoices">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" className={`db-seg-btn ${filter === f.key ? 'is-active' : ''}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th scope="col">Invoice</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">Due</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="db-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="db-cell-title db-mono">{i.id}</div>
                      <div className="db-cell-sub">{i.period}</div>
                    </td>
                    <td className="num">{fmtMoney(i.amount)}</td>
                    <td>
                      <div>{fmtDate(i.due)}</div>
                      <div className={`db-cell-sub ${i.status === 'overdue' ? 'is-urgent' : ''}`}>
                        {i.status === 'paid' ? `Paid ${fmtDate(i.paidOn)}` : i.status === 'refunded' ? 'Refunded' : relativeDays(i.due)}
                      </div>
                    </td>
                    <td>
                      <Badge status={i.status} />
                    </td>
                    <td className="db-td-actions">
                      {(i.status === 'open' || i.status === 'overdue') && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => onPay(i)}>
                          Pay now
                        </button>
                      )}
                      <button
                        type="button"
                        className="db-icon-btn db-icon-btn--sm"
                        aria-label={`Download ${i.id} as PDF`}
                        title="Download PDF"
                        onClick={() => actions.downloadInvoice(i)}
                      >
                        <Icon name="download" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon="file-text" title="No invoices here" text="Try a different filter." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Plan & payment">
          <dl className="db-facts db-facts--list">
            <div>
              <dt>Plan</dt>
              <dd className="db-dd-row">
                <PlanPill plan={sub.plan} />
                <button type="button" className="db-link" onClick={() => go('modules')}>
                  Change <Icon name="arrow-right" size={13} />
                </button>
              </dd>
            </div>
            <div>
              <dt>Aircraft billed</dt>
              <dd className="db-dd-row">
                <span>
                  {billed} × {fmtMoney(plan.perAircraft)}
                  <small>{billed > sub.aircraft ? `Fleet of ${sub.aircraft}, ${plan.name} minimum is ${plan.minAircraft}` : 'Matches your fleet'}</small>
                </span>
                <button type="button" className="db-link" onClick={() => go('aircraft')}>
                  Fleet <Icon name="arrow-right" size={13} />
                </button>
              </dd>
            </div>
            <div>
              <dt>Billing cycle</dt>
              <dd className="db-dd-row">
                <span>
                  {sub.billing === 'annual' ? 'Annual' : 'Monthly'}
                  <small>{sub.billing === 'annual' ? 'Two months free vs monthly' : `Annual would be ${fmtMoney(sub.mrr * 10)}/yr`}</small>
                </span>
                <button type="button" className="db-link" disabled={!live} onClick={() => actions.setBilling(sub.id, sub.billing === 'annual' ? 'monthly' : 'annual')}>
                  Switch <Icon name="refresh" size={13} />
                </button>
              </dd>
            </div>
          </dl>
          <div className="db-field db-mt">
            <span>Payment method</span>
            <div className="db-paycard">
              <span className="db-paycard-brand">{sub.paymentMethod ? sub.paymentMethod.brand : 'Card'}</span>
              {sub.paymentMethod ? (
                <>
                  <strong>•••• {sub.paymentMethod.last4}</strong>
                  <span className="db-muted">Exp. {sub.paymentMethod.expiry}</span>
                </>
              ) : (
                <span className="db-muted">No card on file</span>
              )}
              <button type="button" className="db-link" onClick={() => actions.notify('Card updates open a secure payment form — not part of this demo.', 'info')}>
                {sub.paymentMethod ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="db-grid db-grid--1-1">
        <Card title="Billing contact" subtitle="Invoices and receipts go here">
          <form className="db-form-stack" onSubmit={saveContact}>
            <div className="db-form-grid">
              <label className="db-field">
                <span>Name</span>
                <input className="db-input" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
              </label>
              <label className="db-field">
                <span>Email</span>
                <input className="db-input" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
              </label>
            </div>
            <div className="db-form-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                Save contact
              </button>
            </div>
          </form>
        </Card>

        <Card title={sub.status === 'cancelled' ? 'Reactivate' : 'Cancel subscription'} className="db-card--danger">
          <div className="db-danger-row">
            <p>
              {sub.status === 'cancelled'
                ? 'Reactivate to restore access for your team. Your fleet, employees and data are retained for 90 days after cancellation.'
                : `Cancelling keeps your team online until ${fmtDate(sub.renewsOn)}, then access ends. Your data is retained for 90 days.`}
            </p>
            {sub.status === 'cancelled' ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.reactivate(sub.id)}>
                <Icon name="refresh" size={15} /> Reactivate
              </button>
            ) : (
              <button type="button" className="db-btn db-btn--danger" onClick={() => actions.cancel(sub.id)}>
                <Icon name="x-circle" size={15} /> Cancel at period end
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
