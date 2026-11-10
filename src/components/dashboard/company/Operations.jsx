import { useEffect, useMemo, useState } from 'react';
import { AIRCRAFT_TYPES } from '../../../data/mockData';
import { buildSchedule, dailyHistory } from '../../../data/opsData';
import { fmtTime, fmtDate, relativeDays } from '../../../lib/format';
import { StatTile, Card, PageHead, Badge, SegControl, EmptyState } from '../ui';
import { GroupedBars, ChartCard } from '../Charts';
import { Icon } from '../icons';

const SERIES = [
  { key: 'ontime', name: 'On time', color: 'var(--viz-series-1)' },
  { key: 'delayed', name: 'Delayed', color: 'var(--viz-series-2)' },
];

const BOARD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'airborne', label: 'Airborne' },
  { key: 'done', label: 'Completed' },
];

const MATCH = {
  all: () => true,
  upcoming: (f) => f.status === 'scheduled' || f.status === 'boarding' || f.status === 'delayed',
  airborne: (f) => f.status === 'airborne',
  done: (f) => f.status === 'landed' || f.status === 'cancelled',
};

export default function Operations({ sub, fleet, go }) {
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState('all');

  // Statuses follow the real clock.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const inService = fleet.filter((a) => a.status === 'in_service');
  const unavailable = fleet.filter((a) => a.status !== 'in_service');
  const flights = useMemo(() => buildSchedule(sub.companyId, fleet, now), [sub.companyId, fleet, now]);
  const history = useMemo(() => dailyHistory(sub.companyId, inService.length), [sub.companyId, inService.length]);

  const by = (st) => flights.filter((f) => f.status === st).length;
  const departed = flights.filter((f) => f.status === 'landed' || f.status === 'airborne');
  const onTime = departed.filter((f) => f.delay < 15).length;
  const onTimePct = departed.length ? Math.round((onTime / departed.length) * 100) : 100;
  const rows = flights.filter(MATCH[filter]);
  const nextOut = flights.find((f) => f.status === 'boarding' || f.status === 'scheduled' || f.status === 'delayed');

  return (
    <div className="db-page">
      <PageHead
        title="Operations"
        text={`Today’s flying for ${sub.customer} · updated ${fmtTime(now)} local`}
        actions={
          <button type="button" className="db-btn" onClick={() => go('aircraft')}>
            <Icon name="plane" size={15} /> Fleet status
          </button>
        }
      />

      <div className="db-tiles">
        <StatTile
          label="Flights today"
          value={String(flights.length - by('cancelled'))}
          delta={{ text: `${by('landed')} landed`, direction: 'flat', good: true }}
          foot={by('cancelled') ? `${by('cancelled')} cancelled` : 'No cancellations'}
        />
        <StatTile
          label="Airborne now"
          value={String(by('airborne'))}
          delta={{ text: `${by('boarding')} boarding`, direction: 'flat', good: true }}
          foot={nextOut ? `Next: ${nextOut.flight} ${nextOut.from}→${nextOut.to} at ${fmtTime(nextOut.etd)}` : 'No more departures today'}
        />
        <StatTile
          label="On-time departures"
          value={`${onTimePct}%`}
          delta={{ text: `${departed.length - onTime} late`, direction: departed.length - onTime ? 'up' : 'flat', good: departed.length - onTime === 0 }}
          foot="Within 15 min of schedule"
        />
        <StatTile
          label="Aircraft available"
          value={`${inService.length} / ${fleet.length}`}
          delta={unavailable.length ? { text: `${unavailable.length} unavailable`, direction: 'up', good: false } : { text: 'Full fleet', direction: 'flat', good: true }}
          foot="Maintenance and AOG are off the schedule"
        />
      </div>

      <div className="db-grid db-grid--2-1">
        <ChartCard
          title="Daily flights"
          subtitle="Last 14 days · departures within 15 min counted on time"
          table={{
            columns: [
              { key: 'label', label: 'Day', render: (r) => `${r.label} ${r.sublabel}` },
              { key: 'ontime', label: 'On time', align: 'right', render: (r) => r.values.ontime },
              { key: 'delayed', label: 'Delayed', align: 'right', render: (r) => r.values.delayed },
            ],
            rows: history,
          }}
        >
          <GroupedBars data={history} series={SERIES} label="On-time and delayed flights per day over the last 14 days" />
        </ChartCard>

        <Card title="Fleet status" subtitle={`${fleet.length} aircraft`} flush>
          <ul className="db-status-stack">
            {['in_service', 'maintenance', 'aog'].map((st) => (
              <li key={st}>
                <Badge status={st} />
                <strong>{fleet.filter((a) => a.status === st).length}</strong>
              </li>
            ))}
          </ul>
          {unavailable.length === 0 ? (
            <EmptyState icon="check-circle" title="Every aircraft is in service" />
          ) : (
            <ul className="db-list">
              {unavailable.map((a) => (
                <li key={a.id} className="db-list-row db-list-row--tight">
                  <div className="db-list-main">
                    <span className="db-list-title db-mono">{a.reg}</span>
                    <span className="db-list-sub">
                      {AIRCRAFT_TYPES[a.type].name} · {a.base}
                    </span>
                  </div>
                  <div className="db-list-side">
                    <Badge status={a.status} />
                    <span className="db-list-sub">Back {relativeDays(a.nextCheck)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Flight board"
        subtitle={`${fmtDate(now.toISOString().slice(0, 10))} · ${flights.length} sectors`}
        flush
        actions={<SegControl options={BOARD_FILTERS} value={filter} onChange={setFilter} label="Filter flights" />}
      >
        <div className="db-table-wrap db-board-wrap">
          <table className="db-table db-table--compact db-board">
            <thead>
              <tr>
                <th scope="col">Flight</th>
                <th scope="col">Route</th>
                <th scope="col">Aircraft</th>
                <th scope="col">STD</th>
                <th scope="col">ETD / ATD</th>
                <th scope="col">ETA / ATA</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className={f.status === 'cancelled' ? 'is-muted' : ''}>
                  <td className="db-cell-title db-mono">{f.flight}</td>
                  <td>
                    <span className="db-route">
                      {f.from}
                      <Icon name="arrow-right" size={12} />
                      {f.to}
                    </span>
                  </td>
                  <td>
                    <div className="db-mono">{f.reg}</div>
                    <div className="db-cell-sub">{AIRCRAFT_TYPES[f.type].name}</div>
                  </td>
                  <td className="db-mono">{fmtTime(f.std)}</td>
                  <td className={`db-mono ${f.delay ? 'is-late' : ''}`}>
                    {f.status === 'cancelled' ? '—' : fmtTime(f.etd)}
                    {f.delay > 0 && f.status !== 'cancelled' && <small> +{f.delay}</small>}
                  </td>
                  <td className="db-mono">{f.status === 'cancelled' ? '—' : fmtTime(f.eta)}</td>
                  <td>
                    <Badge status={f.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="plane" title="No flights in this view" text={inService.length ? 'Try another filter.' : 'No aircraft are in service.'} />
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
