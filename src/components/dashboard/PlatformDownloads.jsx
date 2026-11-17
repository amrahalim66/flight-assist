import { useState } from 'react';
import { RELEASES, CURRENT_RELEASE, PLATFORMS, entitlementFor, clientReleaseIndexFor, lastDownloadFor, downloadsLast30For, supportFor } from '../../data/releases';
import { fmtDate, relativeDays } from '../../lib/format';
import { Card, PageHead, PlanPill, StatTile, EmptyState } from './ui';
import { Icon } from './icons';
import { ReleaseCard, ReleasesTable } from './ReleaseCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'behind', label: 'Behind' },
  { key: 'paused', label: 'Paused' },
];

const ENTITLEMENT_BADGE = {
  active: { tone: 'good', icon: 'check', label: 'Entitled' },
  trialing: { tone: 'info', icon: 'clock', label: 'Trial' },
  past_due: { tone: 'warning', icon: 'lock', label: 'Paused' },
  cancelled: { tone: 'muted', icon: 'minus', label: 'None' },
};

// Platform-side view of the same catalogue: who is entitled, who has fallen
// behind, and how many downloads each release is seeing.
export default function PlatformDownloads({ subs, actions }) {
  const [filter, setFilter] = useState('all');

  const rows = subs
    .map((s) => {
      const idx = clientReleaseIndexFor(s);
      return {
        sub: s,
        entitlement: entitlementFor(s),
        clientIndex: idx,
        client: idx === null ? null : RELEASES[idx],
        lastDownload: lastDownloadFor(s),
        downloads30: downloadsLast30For(s),
      };
    })
    .sort((a, b) => {
      // Paused and behind first, so the ones needing a nudge are on top.
      const rank = (r) => (r.entitlement.reason === 'past_due' ? 0 : r.clientIndex !== null && r.clientIndex > 0 ? 1 : r.clientIndex === null ? 3 : 2);
      return rank(a) - rank(b) || a.sub.customer.localeCompare(b.sub.customer);
    });

  const entitled = rows.filter((r) => r.entitlement.ok);
  const paused = rows.filter((r) => r.entitlement.reason === 'past_due');
  const onCurrent = entitled.filter((r) => r.clientIndex === 0);
  const behind = rows.filter((r) => r.clientIndex !== null && r.clientIndex > 0);
  const downloads30 = rows.reduce((t, r) => t + r.downloads30, 0);
  const onRelease = (i) => rows.filter((r) => r.clientIndex === i).length;

  const visible = rows.filter((r) => (filter === 'all' ? true : filter === 'paused' ? r.entitlement.reason === 'past_due' : r.clientIndex !== null && r.clientIndex > 0));

  const download = (release, p) => actions.downloadPackage(null, `FlightAssist ${release.version} for ${PLATFORMS[p.platform].label}`, p.file, p.size);
  const copyHash = (p) => actions.copyText(p.sha256, `${PLATFORMS[p.platform].label} checksum`);

  return (
    <div className="db-page">
      <PageHead
        title="Downloads"
        text="The release catalogue every customer downloads from. Versioned packages are served only to companies with a current subscription."
        actions={
          <span className="db-badge db-badge--good">
            <Icon name="package" size={12} strokeWidth={2.5} /> Current {CURRENT_RELEASE.version}
          </span>
        }
      />

      <div className="db-tiles">
        <StatTile
          label="Current release"
          value={CURRENT_RELEASE.version}
          delta={{ text: CURRENT_RELEASE.channel, direction: 'flat', good: true }}
          deltaLabel={`Build ${CURRENT_RELEASE.build}`}
          foot={`Released ${fmtDate(CURRENT_RELEASE.released)} · ${relativeDays(CURRENT_RELEASE.released)}`}
        />
        <StatTile
          label="Entitled companies"
          value={entitled.length}
          delta={paused.length ? { text: `${paused.length} paused`, direction: 'up', good: false } : { text: 'None paused', direction: 'flat', good: true }}
          foot={`of ${subs.length} subscriptions`}
        />
        <StatTile
          label="On current release"
          value={`${entitled.length ? Math.round((onCurrent.length / entitled.length) * 100) : 0}%`}
          delta={{ text: `${onCurrent.length} of ${entitled.length}`, direction: 'flat', good: true }}
          foot={behind.length ? `${behind.length} ${behind.length === 1 ? 'company' : 'companies'} on an older build` : 'Everyone is up to date'}
        />
        <StatTile
          label="Downloads · 30 days"
          value={downloads30}
          delta={{ text: `${RELEASES.length} releases`, direction: 'flat', good: true }}
          foot="Across all platforms"
        />
      </div>

      <ReleaseCard
        release={CURRENT_RELEASE}
        tags={[
          { icon: 'grid', label: `Served to ${entitled.length} companies` },
          { icon: 'monitor', label: `${CURRENT_RELEASE.packages.length} platforms` },
          { icon: 'shield', label: 'Signed packages' },
        ]}
        foot="Companies with an active or trial subscription see this release in their workspace. A failed payment pauses their versioned downloads automatically."
        onDownload={download}
        onCopy={copyHash}
      />

      <Card
        title="Rollout by company"
        subtitle="Which client each customer is running and when they last downloaded a package"
        flush
        actions={
          <div className="db-seg" role="group" aria-label="Filter companies">
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
                <th scope="col">Company</th>
                <th scope="col">Plan</th>
                <th scope="col">Entitlement</th>
                <th scope="col">Client version</th>
                <th scope="col">Last download</th>
                <th scope="col" className="num">30 days</th>
                <th scope="col" className="db-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ sub: s, entitlement, clientIndex, client, lastDownload, downloads30: d30 }) => {
                const ent = ENTITLEMENT_BADGE[entitlement.reason] || ENTITLEMENT_BADGE.cancelled;
                const support = clientIndex === null ? null : supportFor(clientIndex);
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="db-cell-title">{s.customer}</div>
                      <div className="db-cell-sub">{s.location}</div>
                    </td>
                    <td>
                      <PlanPill plan={s.plan} />
                      <div className="db-cell-sub">{s.aircraft} aircraft</div>
                    </td>
                    <td>
                      <span className={`db-badge db-badge--${ent.tone}`}>
                        <Icon name={ent.icon} size={12} strokeWidth={2.5} /> {ent.label}
                      </span>
                      <div className="db-cell-sub">{s.status === 'past_due' ? 'Payment failed' : s.status === 'cancelled' ? `Ended ${fmtDate(s.endedOn)}` : s.status === 'trialing' ? `Trial ends ${relativeDays(s.renewsOn)}` : `Renews ${relativeDays(s.renewsOn)}`}</div>
                    </td>
                    <td>
                      {client ? (
                        <>
                          <div className="db-cell-title db-mono">{client.version}</div>
                          <div className={`db-cell-sub ${support.key === 'eol' ? 'is-urgent' : ''}`}>
                            {clientIndex === 0 ? 'Current' : clientIndex === 1 ? 'One release behind' : support.key === 'eol' ? 'End of life' : `${clientIndex} releases behind`}
                          </div>
                        </>
                      ) : (
                        <span className="db-cell-sub">Not installed</span>
                      )}
                    </td>
                    <td className="db-cell-nowrap">
                      {lastDownload ? (
                        <>
                          <div>{fmtDate(lastDownload)}</div>
                          <div className="db-cell-sub">{relativeDays(lastDownload)}</div>
                        </>
                      ) : (
                        <span className="db-cell-sub">—</span>
                      )}
                    </td>
                    <td className="num">{d30}</td>
                    <td className="db-td-actions">
                      {entitlement.reason === 'past_due' && (
                        <button type="button" className="db-icon-btn db-icon-btn--sm" aria-label={`Send payment reminder to ${s.customer}`} title="Send payment reminder" onClick={() => actions.sendReminder(s.id)}>
                          <Icon name="mail" size={15} />
                        </button>
                      )}
                      <button type="button" className="db-btn db-btn--sm" onClick={() => actions.viewAs(s.companyId, 'downloads')}>
                        <Icon name="eye" size={14} /> Open
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="check-circle" title={filter === 'paused' ? 'No paused companies' : 'Nobody is behind'} text="Every entitled company is on the current release." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ReleasesTable
        subtitle="How many companies run each version. Every plan receives the same client; modules unlock inside it."
        onDownload={download}
        extra={{ label: 'Companies', render: (r, i) => onRelease(i) || '—' }}
      />
    </div>
  );
}
