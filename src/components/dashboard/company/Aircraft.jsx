import { useState } from 'react';
import { AIRCRAFT_TYPES, AIRCRAFT_STATUS_OPTIONS, PLANS, priceFor, billedAircraft } from '../../../data/mockData';
import { fmtMoney, fmtDate, relativeDays, daysUntil } from '../../../lib/format';
import { Badge, Card, PageHead, StatTile, Drawer, EmptyState } from '../ui';
import { Icon } from '../icons';

const FILTERS = [{ key: 'all', label: 'All' }, ...AIRCRAFT_STATUS_OPTIONS];
const REG_PATTERN = /^[A-Z0-9]{1,2}-[A-Z0-9]{3,5}$/;

export default function Aircraft({ sub, fleet, actions }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);

  const plan = PLANS[sub.plan];
  const live = sub.status !== 'cancelled';
  const billed = billedAircraft(sub.plan, fleet.length);
  const count = (st) => fleet.filter((a) => a.status === st).length;
  const types = new Set(fleet.map((a) => a.type)).size;

  const q = query.trim().toLowerCase();
  const rows = fleet.filter(
    (a) =>
      (filter === 'all' || a.status === filter) &&
      (!q || a.reg.toLowerCase().includes(q) || AIRCRAFT_TYPES[a.type].name.toLowerCase().includes(q) || a.base.toLowerCase().includes(q)),
  );
  const selected = fleet.find((a) => a.id === selectedId) || null;

  const onRowKey = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedId(id);
    }
  };

  return (
    <div className="db-page">
      <PageHead
        title="Aircraft"
        text={`Your fleet on FlightAssist. Each aircraft is billed at ${fmtMoney(plan.perAircraft)} per month on ${plan.name}.`}
        actions={
          <button type="button" className="btn btn-primary btn-sm" disabled={!live} onClick={() => setAdding(true)}>
            <Icon name="plus" size={15} /> Add aircraft
          </button>
        }
      />

      <div className="db-tiles">
        <StatTile label="Fleet" value={String(fleet.length)} delta={{ text: `${types} types`, direction: 'flat', good: true }} foot={`${new Set(fleet.map((a) => a.base)).size} bases`} />
        <StatTile
          label="In service"
          value={`${count('in_service')} / ${fleet.length}`}
          delta={{ text: `${Math.round((count('in_service') / Math.max(fleet.length, 1)) * 100)}% available`, direction: 'flat', good: true }}
          foot="Scheduled in Operations today"
        />
        <StatTile
          label="Maintenance & AOG"
          value={String(count('maintenance') + count('aog'))}
          delta={count('aog') ? { text: `${count('aog')} AOG`, direction: 'up', good: false } : { text: 'No AOG', direction: 'flat', good: true }}
          foot={`${count('maintenance')} in scheduled maintenance`}
        />
        <StatTile
          label="Fleet licence"
          value={`${fmtMoney(sub.mrr)}/mo`}
          delta={{ text: `${billed} × ${fmtMoney(plan.perAircraft)}`, direction: 'flat', good: true }}
          foot={billed > fleet.length ? `Billed at the ${plan.minAircraft}-aircraft minimum` : 'Every aircraft is billed, any status'}
        />
      </div>

      <div className="db-toolbar">
        <label className="db-search">
          <Icon name="search" size={16} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search registration, type or base…" aria-label="Search aircraft" />
        </label>
        <div className="db-seg" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={`db-seg-btn ${filter === f.key ? 'is-active' : ''}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="db-toolbar-count">
          {rows.length} of {fleet.length}
        </span>
      </div>

      <Card flush>
        <div className="db-table-wrap">
          <table className="db-table db-table--clickable">
            <thead>
              <tr>
                <th scope="col">Registration</th>
                <th scope="col">Type</th>
                <th scope="col">Base</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">Hours this month</th>
                <th scope="col">Next check</th>
                <th scope="col" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const t = AIRCRAFT_TYPES[a.type];
                const soon = daysUntil(a.nextCheck) <= 7;
                return (
                  <tr key={a.id} tabIndex={0} onClick={() => setSelectedId(a.id)} onKeyDown={(e) => onRowKey(e, a.id)} className={selectedId === a.id ? 'is-selected' : ''}>
                    <td>
                      <div className="db-cell-title db-mono">{a.reg}</div>
                      <div className="db-cell-sub">MSN {a.msn}</div>
                    </td>
                    <td>
                      <div>{t.name}</div>
                      <div className="db-cell-sub">{t.pax} seats</div>
                    </td>
                    <td className="db-mono">{a.base}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                    <td className="num">{a.hoursMtd}</td>
                    <td>
                      <div>{fmtDate(a.nextCheck)}</div>
                      <div className={`db-cell-sub ${soon ? 'is-urgent' : ''}`}>{relativeDays(a.nextCheck)}</div>
                    </td>
                    <td className="db-cell-chevron">
                      <Icon name="chevron-right" size={16} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="plane" title="No aircraft match" text="Try a different search or status." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && <AircraftDrawer aircraft={selected} sub={sub} fleetSize={fleet.length} actions={actions} live={live} onClose={() => setSelectedId(null)} />}
      {adding && <AddAircraftDrawer sub={sub} fleet={fleet} actions={actions} onClose={() => setAdding(false)} />}
    </div>
  );
}

function AircraftDrawer({ aircraft: a, sub, fleetSize, actions, live, onClose }) {
  const t = AIRCRAFT_TYPES[a.type];
  const after = priceFor(sub.plan, fleetSize - 1);
  const saving = sub.mrr - after;

  return (
    <Drawer
      eyebrow={t.name}
      title={a.reg}
      subtitle={
        <>
          <Icon name="map-pin" size={13} /> Based at {a.base}
        </>
      }
      onClose={onClose}
      footer={
        <>
          <span className="db-muted">On FlightAssist since {fmtDate(a.added)}</span>
          <button type="button" className="db-btn" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="db-drawer-status">
        <Badge status={a.status} />
        <span className="db-chip">{t.pax} seats</span>
        <span className="db-chip">ICAO {t.code}</span>
      </div>

      <dl className="db-facts">
        <div>
          <dt>MSN</dt>
          <dd className="db-mono">{a.msn}</dd>
        </div>
        <div>
          <dt>Home base</dt>
          <dd className="db-mono">{a.base}</dd>
        </div>
        <div>
          <dt>Hours this month</dt>
          <dd>{a.hoursMtd}</dd>
        </div>
        <div>
          <dt>Next check</dt>
          <dd>
            {fmtDate(a.nextCheck)} <small>{relativeDays(a.nextCheck)}</small>
          </dd>
        </div>
      </dl>

      <section className="db-drawer-section">
        <h3>Status</h3>
        <div className="db-choice" role="group" aria-label="Aircraft status">
          {AIRCRAFT_STATUS_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`db-btn db-btn--sm ${a.status === o.key ? 'is-active' : ''}`}
              aria-pressed={a.status === o.key}
              disabled={!live}
              onClick={() => a.status !== o.key && actions.setAircraftStatus(sub.companyId, a.id, o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="db-muted db-mt">Aircraft in maintenance or AOG are taken off the schedule in Operations. Billing doesn’t change.</p>
      </section>

      <section className="db-drawer-section">
        <h3>Remove from fleet</h3>
        <div className="db-danger-row">
          <p>{saving > 0 ? `Removing ${a.reg} lowers your licence by ${fmtMoney(saving)}/mo to ${fmtMoney(after)}/mo.` : `Your fleet is at the ${PLANS[sub.plan].name} minimum, so your licence stays ${fmtMoney(after)}/mo.`}</p>
          <button
            type="button"
            className="db-btn db-btn--danger"
            disabled={!live}
            onClick={() => {
              actions.removeAircraft(sub.companyId, a.id);
              onClose();
            }}
          >
            <Icon name="x-circle" size={15} /> Remove {a.reg}
          </button>
        </div>
      </section>
    </Drawer>
  );
}

function AddAircraftDrawer({ sub, fleet, actions, onClose }) {
  const bases = [...new Set(fleet.map((a) => a.base))];
  const [form, setForm] = useState({ reg: '', type: Object.keys(AIRCRAFT_TYPES)[0], msn: '', base: bases[0] || '' });
  const [error, setError] = useState('');
  const plan = PLANS[sub.plan];
  const after = priceFor(sub.plan, fleet.length + 1);
  const added = after - sub.mrr;

  const submit = (e) => {
    e.preventDefault();
    const reg = form.reg.trim().toUpperCase();
    if (!REG_PATTERN.test(reg)) return setError('Enter a registration like LN-NWX or G-SKBM.');
    if (fleet.some((a) => a.reg === reg)) return setError(`${reg} is already in your fleet.`);
    if (!/^\d{3,6}$/.test(form.msn.trim())) return setError('Enter the manufacturer serial number (3–6 digits).');
    if (!form.base.trim()) return setError('Enter a home base.');
    if (actions.addAircraft(sub.companyId, { ...form, reg, msn: form.msn.trim(), base: form.base.trim().toUpperCase() })) onClose();
    return undefined;
  };

  return (
    <Drawer
      eyebrow="Fleet"
      title="Add aircraft"
      subtitle={`${plan.name} · ${fmtMoney(plan.perAircraft)} per aircraft per month`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="db-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="aircraftForm" className="btn btn-primary btn-sm">
            <Icon name="plus" size={15} /> Add to fleet
          </button>
        </>
      }
    >
      <form id="aircraftForm" className="db-form-stack" onSubmit={submit} noValidate>
        <div className="db-form-grid">
          <label className="db-field">
            <span>Registration</span>
            <input className="db-input db-mono" name="reg" value={form.reg} onChange={(e) => setForm({ ...form, reg: e.target.value.toUpperCase() })} placeholder="LN-NWX" autoComplete="off" />
          </label>
          <label className="db-field">
            <span>MSN</span>
            <input className="db-input" name="msn" inputMode="numeric" value={form.msn} onChange={(e) => setForm({ ...form, msn: e.target.value })} placeholder="e.g. 1342" autoComplete="off" />
          </label>
          <label className="db-field">
            <span>Type</span>
            <select className="db-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.values(AIRCRAFT_TYPES).map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="db-field">
            <span>Home base</span>
            <input className="db-input db-mono" name="base" list="baseOptions" value={form.base} onChange={(e) => setForm({ ...form, base: e.target.value.toUpperCase() })} maxLength={4} />
            <datalist id="baseOptions">
              {bases.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="db-summary-box">
          <ul className="db-summary">
            <li>
              <span>Current licence · {fleet.length} aircraft</span>
              <span>{fmtMoney(sub.mrr)}/mo</span>
            </li>
            <li>
              <span>This aircraft</span>
              <span>{added > 0 ? `+${fmtMoney(added)}/mo` : 'Included in minimum'}</span>
            </li>
            <li className="is-total">
              <span>New licence · {fleet.length + 1} aircraft</span>
              <span>{fmtMoney(after)}/mo</span>
            </li>
          </ul>
          <p className="db-muted">Billed pro-rata from today on your next invoice.</p>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            <Icon name="alert-circle" size={15} /> {error}
          </p>
        )}
      </form>
    </Drawer>
  );
}
