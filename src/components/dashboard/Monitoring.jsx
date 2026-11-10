import { useMemo, useState } from 'react';
import { SERVICES, INCIDENTS, latencySeries, hashString } from '../../data/opsData';
import { timeAgo, fmtNumber } from '../../lib/format';
import { Card, PageHead, StatTile, Badge, EmptyState } from './ui';
import { AreaChart, ChartCard } from './Charts';
import { Icon } from './icons';
import { ACTIVITY_ICON } from './activity';

// Platform health for the owner: service status, latency, incidents, each
// operator's integration feeds, and the cross-company audit trail.

export default function Monitoring({ subs, activity }) {
  const latency = useMemo(() => latencySeries(), []);
  const [auditCompany, setAuditCompany] = useState('all');

  const degraded = SERVICES.filter((s) => s.status !== 'operational');
  const uptime = SERVICES.reduce((t, s) => t + s.uptime, 0) / SERVICES.length;
  const p95Now = latency[latency.length - 1].value;
  const p95Avg = Math.round(latency.reduce((t, p) => t + p.value, 0) / latency.length);
  const openIncidents = INCIDENTS.filter((i) => i.status !== 'resolved');

  const live = subs.filter((s) => s.status !== 'cancelled');
  const feeds = live
    .map((s) => {
      const h = hashString(s.companyId);
      return {
        id: s.id,
        companyId: s.companyId,
        customer: s.customer,
        online: Math.max(1, Math.round(s.users * (0.15 + (h % 30) / 100))),
        acarsMin: 1 + (h % 9),
        nm: s.modules.includes('reporting') ? 'degraded' : null,
      };
    })
    .sort((a, b) => b.online - a.online);
  const online = feeds.reduce((t, f) => t + f.online, 0);

  const companies = [...new Map(subs.map((s) => [s.companyId, s.customer])).entries()];
  const audit = activity.filter((a) => auditCompany === 'all' || a.companyId === auditCompany);

  return (
    <div className="db-page">
      <PageHead title="Monitoring" text="Platform health, integrations and the audit trail across every company." />

      <div className={`db-banner db-banner--${degraded.length ? 'warning' : 'good'}`} role="status">
        <span className="db-banner-icon">
          <Icon name={degraded.length ? 'alert-triangle' : 'check-circle'} size={18} />
        </span>
        <div className="db-banner-text">
          <strong>{degraded.length ? `${degraded.length} service degraded` : 'All systems operational'}</strong>
          <span>
            {degraded.length
              ? `${degraded.map((d) => d.name).join(', ')} — ${openIncidents[0]?.update || 'investigating.'}`
              : 'Every service is responding within its target latency.'}
          </span>
        </div>
      </div>

      <div className="db-tiles">
        <StatTile label="Platform uptime" value={`${uptime.toFixed(2)}%`} delta={{ text: 'Target 99.9%', direction: 'flat', good: true }} foot="Average across services, last 30 days" />
        <StatTile
          label="API p95 latency"
          value={`${p95Now} ms`}
          delta={{ text: `${p95Now <= p95Avg ? '' : '+'}${p95Now - p95Avg} ms`, direction: p95Now > p95Avg ? 'up' : 'down', good: p95Now <= p95Avg }}
          deltaLabel="vs 24h average"
          trend={latency.map((p) => p.value)}
        />
        <StatTile label="Users online now" value={fmtNumber(online)} delta={{ text: `${feeds.length} companies`, direction: 'flat', good: true }} foot="Active sessions in the last 15 minutes" />
        <StatTile
          label="Open incidents"
          value={String(openIncidents.length)}
          delta={openIncidents.length ? { text: openIncidents[0].id, direction: 'up', good: false } : { text: 'None', direction: 'flat', good: true }}
          foot={`${INCIDENTS.length - openIncidents.length} resolved this week`}
        />
      </div>

      <div className="db-grid db-grid--2-1">
        <ChartCard
          title="API latency"
          subtitle="p95, last 24 hours"
          table={{
            columns: [
              { key: 'label', label: 'Hour' },
              { key: 'value', label: 'p95 (ms)', align: 'right' },
            ],
            rows: latency,
          }}
        >
          <AreaChart data={latency} formatValue={(v) => `${v} ms`} formatTick={(v) => String(v)} label="API p95 latency over the last 24 hours" height={250} />
        </ChartCard>

        <Card title="Services" subtitle="Uptime, last 30 days" flush>
          <ul className="db-list">
            {SERVICES.map((s) => (
              <li key={s.key} className="db-list-row db-list-row--tight">
                <div className="db-list-main">
                  <span className="db-list-title db-list-title--normal">{s.name}</span>
                  <span className="db-list-sub">
                    {s.uptime.toFixed(2)}% · p95 {fmtNumber(s.p95)} ms
                  </span>
                </div>
                <Badge status={s.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="db-grid db-grid--1-1">
        <Card title="Incidents" subtitle="This week" flush>
          <ul className="db-list">
            {INCIDENTS.map((i) => (
              <li key={i.id} className="db-list-row db-list-row--top">
                <span className={`db-list-icon db-list-icon--${i.status === 'resolved' ? 'payment' : 'warning'}`}>
                  <Icon name={i.status === 'resolved' ? 'check' : 'alert-triangle'} size={15} />
                </span>
                <div className="db-list-main">
                  <span className="db-list-title">
                    <span className="db-mono db-muted">{i.id}</span> {i.title}
                  </span>
                  <span className="db-list-sub db-list-sub--wrap">{i.update}</span>
                  <span className="db-list-sub">
                    {i.service} · started {timeAgo(i.started)}
                    {i.resolved && ` · resolved ${timeAgo(i.resolved)}`}
                  </span>
                </div>
                <Badge status={i.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Company integrations" subtitle="Live feeds and sessions per operator" flush>
          <div className="db-table-wrap">
            <table className="db-table db-table--compact">
              <thead>
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">ACARS</th>
                  <th scope="col">NM B2B</th>
                  <th scope="col" className="num">Online</th>
                </tr>
              </thead>
              <tbody>
                {feeds.map((f) => (
                  <tr key={f.id}>
                    <td className="db-cell-title">{f.customer}</td>
                    <td className="db-cell-sub">{f.acarsMin} min ago</td>
                    <td>{f.nm ? <Badge status={f.nm} /> : <span className="db-muted">Not used</span>}</td>
                    <td className="num">{f.online}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card
        title="Audit log"
        subtitle="Billing, fleet and account events across every company"
        flush
        actions={
          <select className="db-select db-select--sm" value={auditCompany} onChange={(e) => setAuditCompany(e.target.value)} aria-label="Filter audit log by company">
            <option value="all">All companies</option>
            {companies.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        }
      >
        {audit.length === 0 ? (
          <EmptyState icon="activity" title="No events for this company yet" />
        ) : (
          <ul className="db-list db-activity">
            {audit.slice(0, 12).map((a) => (
              <li key={a.id} className="db-list-row">
                <span className={`db-list-icon db-list-icon--${a.type}`}>
                  <Icon name={ACTIVITY_ICON[a.type] || 'activity'} size={15} />
                </span>
                <div className="db-list-main">
                  <span className="db-list-title db-list-title--normal">{a.text}</span>
                </div>
                <time className="db-list-time" dateTime={a.at}>
                  {timeAgo(a.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
