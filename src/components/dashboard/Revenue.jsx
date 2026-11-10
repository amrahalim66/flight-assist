import { useMemo, useState } from 'react';
import { MONTHLY, PLANS, billedAircraft } from '../../data/mockData';
import { fmtMoney, fmtDate, relativeDays, daysUntil, pct } from '../../lib/format';
import { StatTile, Card, PlanPill, SegControl, EmptyState, PageHead, Badge } from './ui';
import { AreaChart, GroupedBars, SegmentedBar, ChartCard } from './Charts';
import { Icon } from './icons';

const RANGES = [
  { key: 6, label: '6M' },
  { key: 12, label: '12M' },
];

// Ordered tiers use one hue, light→dark (validated ordinal ramp in dashboard.css).
const TIER_PAINT = {
  starter: { color: 'var(--viz-tier-1)', ink: 'var(--viz-tier-1-ink)' },
  professional: { color: 'var(--viz-tier-2)', ink: 'var(--viz-tier-2-ink)' },
  enterprise: { color: 'var(--viz-tier-3)', ink: 'var(--viz-tier-3-ink)' },
};

const FLOW_SERIES = [
  { key: 'newSubs', name: 'New', color: 'var(--viz-series-1)' },
  { key: 'churned', name: 'Churned', color: 'var(--viz-series-2)' },
];

const INVOICE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
  { key: 'refunded', label: 'Refunded' },
];

export default function Revenue({ subs, invoices, actions }) {
  const [range, setRange] = useState(12);
  const [invFilter, setInvFilter] = useState('all');
  const [invQuery, setInvQuery] = useState('');

  const live = subs.filter((s) => s.status === 'active' || s.status === 'past_due');
  const mrr = live.reduce((t, s) => t + s.mrr, 0);
  const billed = live.reduce((t, s) => t + billedAircraft(s.plan, s.aircraft), 0);
  const prev = MONTHLY[MONTHLY.length - 2];
  const mrrDelta = ((mrr - prev.mrr) / prev.mrr) * 100;

  const sum = (list) => list.reduce((t, i) => t + i.amount, 0);
  const open = invoices.filter((i) => i.status === 'open');
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const collected = invoices.filter((i) => i.status === 'paid' && i.paidOn && i.paidOn.startsWith(thisMonth));

  // The final point tracks the live total so edits made in the demo show up.
  const months = useMemo(() => {
    const all = MONTHLY.map((m) => ({ ...m }));
    all[all.length - 1].mrr = mrr;
    return all.slice(-range);
  }, [mrr, range]);

  const mrrData = months.map((m) => ({ key: m.key, label: m.label, sublabel: String(m.year), value: m.mrr }));
  const flowData = months.map((m) => ({ key: m.key, label: m.label, sublabel: String(m.year), values: { newSubs: m.newSubs, churned: m.churned } }));

  const planMix = Object.values(PLANS).map((p) => {
    const rows = live.filter((s) => s.plan === p.key);
    return {
      key: p.key,
      name: p.name,
      count: rows.length,
      aircraft: rows.reduce((t, s) => t + s.aircraft, 0),
      value: rows.reduce((t, s) => t + s.mrr, 0),
      ...TIER_PAINT[p.key],
    };
  });

  const renewals = subs
    .filter((s) => s.renewsOn && s.status !== 'cancelled')
    .map((s) => ({ ...s, inDays: daysUntil(s.renewsOn) }))
    .filter((s) => s.inDays >= 0 && s.inDays <= 30)
    .sort((a, b) => a.inDays - b.inDays);

  const q = invQuery.trim().toLowerCase();
  const invRows = invoices
    .filter((i) => (invFilter === 'all' || i.status === invFilter) && (!q || i.customer.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)))
    .sort((a, b) => (a.issued < b.issued ? 1 : -1));

  return (
    <div className="db-page">
      <PageHead
        title="Revenue"
        text={`${fmtMoney(mrr)} MRR · ${fmtMoney(mrr * 12)} ARR from ${live.length} paying operators`}
        actions={<SegControl options={RANGES} value={range} onChange={setRange} label="Chart range" />}
      />

      <div className="db-tiles">
        <StatTile
          label="Monthly recurring revenue"
          value={fmtMoney(mrr)}
          delta={{ text: pct(mrrDelta), direction: mrrDelta > 0 ? 'up' : mrrDelta < 0 ? 'down' : 'flat', good: mrrDelta >= 0 }}
          deltaLabel="vs last month"
          trend={months.map((m) => m.mrr)}
        />
        <StatTile
          label="Billed aircraft"
          value={String(billed)}
          delta={{ text: `${fmtMoney(mrr / Math.max(billed, 1))} avg`, direction: 'flat', good: true }}
          deltaLabel="per aircraft"
          foot={`ARR ${fmtMoney(mrr * 12)}`}
        />
        <StatTile
          label="Outstanding"
          value={fmtMoney(sum(open) + sum(overdue))}
          delta={
            overdue.length
              ? { text: `${fmtMoney(sum(overdue))} overdue`, direction: 'up', good: false }
              : { text: 'Nothing overdue', direction: 'flat', good: true }
          }
          foot={`${open.length + overdue.length} unpaid invoices`}
        />
        <StatTile
          label="Collected this month"
          value={fmtMoney(sum(collected))}
          delta={{ text: `${collected.length} paid`, direction: collected.length ? 'up' : 'flat', good: true }}
          foot={collected.length ? `Average ${fmtMoney(sum(collected) / collected.length)}` : 'No payments yet this month'}
        />
      </div>

      <div className="db-grid db-grid--2-1">
        <ChartCard
          title="Monthly recurring revenue"
          subtitle={`Last ${range} months · active and past-due subscriptions`}
          table={{
            columns: [
              { key: 'label', label: 'Month', render: (r) => `${r.label} ${r.sublabel}` },
              { key: 'value', label: 'MRR', align: 'right', render: (r) => fmtMoney(r.value) },
            ],
            rows: mrrData,
          }}
        >
          <AreaChart
            data={mrrData}
            formatValue={(v) => fmtMoney(v, 'compact')}
            formatTick={(v) => fmtMoney(v, 'tick')}
            label={`Monthly recurring revenue over the last ${range} months`}
          />
        </ChartCard>

        <Card title="Plan mix" subtitle="Share of MRR by tier">
          <SegmentedBar parts={planMix} formatValue={fmtMoney} label="MRR split by plan tier" />
          <table className="db-table db-table--compact db-table--borderless db-planmix">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col" className="num">Aircraft</th>
                <th scope="col" className="num">MRR</th>
              </tr>
            </thead>
            <tbody>
              {planMix.map((p) => (
                <tr key={p.key}>
                  <td>
                    <span className="viz-legend-item">
                      <i className="viz-swatch" style={{ background: p.color }} />
                      {p.name}
                    </span>
                  </td>
                  <td className="num">{p.aircraft}</td>
                  <td className="num">{fmtMoney(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="db-card-foot">
            Enterprise is {Math.round((planMix[2].value / (mrr || 1)) * 100)}% of revenue from {planMix[2].count} operators.
          </p>
        </Card>
      </div>

      <div className="db-grid db-grid--1-1">
        <ChartCard
          title="New vs churned"
          subtitle="Subscriptions started and ended each month"
          table={{
            columns: [
              { key: 'label', label: 'Month', render: (r) => `${r.label} ${r.sublabel}` },
              { key: 'new', label: 'New', align: 'right', render: (r) => r.values.newSubs },
              { key: 'churned', label: 'Churned', align: 'right', render: (r) => r.values.churned },
            ],
            rows: flowData,
          }}
        >
          <GroupedBars data={flowData} series={FLOW_SERIES} label="New and churned subscriptions per month" />
        </ChartCard>

        <Card title="Upcoming renewals" subtitle={`Next 30 days · ${renewals.length} contracts`} flush>
          {renewals.length === 0 ? (
            <EmptyState icon="clock" title="No renewals in the next 30 days" />
          ) : (
            <ul className="db-list">
              {renewals.slice(0, 6).map((s) => (
                <li key={s.id} className="db-list-row">
                  <div className="db-list-main">
                    <span className="db-list-title">{s.customer}</span>
                    <span className="db-list-sub">
                      <PlanPill plan={s.plan} /> · {s.aircraft} aircraft · {s.billing === 'annual' ? 'Annual' : 'Monthly'}
                      {s.status === 'trialing' && ' · trial'}
                    </span>
                  </div>
                  <div className="db-list-side">
                    <span className="db-list-value">{fmtMoney(s.billing === 'annual' ? s.mrr * 12 : s.mrr)}</span>
                    <span className={`db-list-sub ${s.inDays <= 7 ? 'is-urgent' : ''}`}>
                      {s.inDays === 0 ? 'Today' : s.inDays === 1 ? 'Tomorrow' : `In ${s.inDays} days`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Invoices"
        subtitle={`${invoices.length} issued across all operators`}
        flush
        actions={
          <div className="db-seg" role="group" aria-label="Filter invoices by status">
            {INVOICE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`db-seg-btn ${invFilter === f.key ? 'is-active' : ''}`}
                aria-pressed={invFilter === f.key}
                onClick={() => setInvFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="db-card-toolbar">
          <label className="db-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={invQuery}
              onChange={(e) => setInvQuery(e.target.value)}
              placeholder="Search invoice number or customer…"
              aria-label="Search invoices"
            />
          </label>
          <span className="db-toolbar-count">{invRows.length} shown</span>
        </div>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Customer</th>
                <th scope="col" className="num">Amount</th>
                <th scope="col">Due</th>
                <th scope="col">Status</th>
                <th scope="col" className="db-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invRows.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="db-cell-title db-mono">{i.id}</div>
                    <div className="db-cell-sub">{i.period}</div>
                  </td>
                  <td>{i.customer}</td>
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
                      <button type="button" className="db-btn db-btn--sm" onClick={() => actions.markInvoicePaid(i.id)}>
                        <Icon name="check" size={14} /> Mark paid
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
              {invRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon="file-text" title="No invoices match" text="Try a different filter or search term." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
