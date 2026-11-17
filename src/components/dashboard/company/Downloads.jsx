import { PLANS } from '../../../data/mockData';
import { CURRENT_RELEASE, PLATFORMS, SYSTEM_REQUIREMENTS, entitlementFor } from '../../../data/releases';
import { fmtDate, fmtMoney } from '../../../lib/format';
import { Card, PageHead } from '../ui';
import { Icon } from '../icons';
import { ReleaseCard, ReleasesTable } from '../ReleaseCard';

export default function Downloads({ sub, invoices, onPay, actions, go }) {
  const plan = PLANS[sub.plan];
  const entitlement = entitlementFor(sub);
  const overdue = invoices.filter((i) => i.status === 'overdue').sort((a, b) => (a.due < b.due ? -1 : 1))[0] || null;

  const download = (release, p) => actions.downloadPackage(sub.companyId, `FlightAssist ${release.version} for ${PLATFORMS[p.platform].label}`, p.file, p.size);
  const copyHash = (p) => actions.copyText(p.sha256, `${PLATFORMS[p.platform].label} checksum`);

  return (
    <div className="db-page">
      <PageHead
        title="Downloads"
        text="Desktop client packages for your workstations. Versioned releases are available while your subscription is current."
        actions={
          entitlement.ok ? (
            <span className="db-badge db-badge--good">
              <Icon name="check" size={12} strokeWidth={2.5} /> {entitlement.reason === 'trialing' ? 'Trial entitlement' : 'Entitled'}
            </span>
          ) : (
            <span className="db-badge db-badge--warning">
              <Icon name="lock" size={12} strokeWidth={2.5} /> {entitlement.reason === 'past_due' ? 'Paused' : 'No entitlement'}
            </span>
          )
        }
      />

      {entitlement.ok ? (
        <ReleaseCard
          release={CURRENT_RELEASE}
          tags={[
            { icon: 'tag', label: `${plan.name} plan` },
            { icon: 'plane', label: `${sub.aircraft} aircraft licensed` },
            { icon: 'users', label: 'Unlimited installs' },
          ]}
          foot="Installed clients update themselves in the background. Older versions stay downloadable for twelve months."
          onDownload={download}
          onCopy={copyHash}
        />
      ) : (
        <section className={`db-card db-release db-release--locked ${entitlement.reason === 'cancelled' ? 'db-locked--cancelled' : ''}`} aria-labelledby="lockedTitle">
          <div className="db-locked">
            <span className="db-locked-icon">
              <Icon name="lock" size={24} />
            </span>
            <h2 id="lockedTitle">{entitlement.reason === 'past_due' ? 'Versioned downloads are paused' : 'No versioned entitlement'}</h2>
            <p>
              {entitlement.reason === 'past_due'
                ? `The last payment for ${sub.customer} failed${overdue ? `, and ${overdue.id} for ${fmtMoney(overdue.amount)} was due ${fmtDate(overdue.due)}` : ''}. Packages reappear the moment the invoice is paid. Installed clients keep working in the meantime.`
                : `This subscription ended ${fmtDate(sub.endedOn)}, so no commercial download package is assigned to ${sub.customer}. Reactivate to restore access to the current release.`}
            </p>
            <p className="db-locked-release">
              <Icon name="package" size={14} /> Current release: FlightAssist {CURRENT_RELEASE.version}, released {fmtDate(CURRENT_RELEASE.released)}
            </p>
            <div className="db-locked-actions">
              {entitlement.reason === 'past_due' ? (
                <>
                  {overdue && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => onPay(overdue)}>
                      <Icon name="credit-card" size={15} /> Pay {fmtMoney(overdue.amount)}
                    </button>
                  )}
                  <button type="button" className="db-btn" onClick={() => go('billing')}>
                    Go to billing <Icon name="arrow-right" size={14} />
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => actions.reactivate(sub.id)}>
                  <Icon name="refresh" size={15} /> Reactivate
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <Card
        title="System requirements"
        subtitle="The same for every package and platform"
        actions={
          sub.accountManager && (
            <a className="db-link" href={`mailto:${sub.accountManager.email}`}>
              <Icon name="mail" size={14} /> Rollout help from {sub.accountManager.name.split(' ')[0]}
            </a>
          )
        }
      >
        <ul className="db-reqs">
          {SYSTEM_REQUIREMENTS.map((r) => (
            <li key={r.label}>
              <span className="db-reqs-icon">
                <Icon name={r.icon} size={18} />
              </span>
              <span className="db-reqs-label">{r.label}</span>
              <strong>{r.value}</strong>
            </li>
          ))}
        </ul>
      </Card>

      {entitlement.ok && <ReleasesTable title="Previous releases" subtitle="Older versions stay downloadable for twelve months. Only the current release gets new features." onDownload={download} />}
    </div>
  );
}
