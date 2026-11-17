import { RELEASES, PLATFORMS, supportFor } from '../../data/releases';
import { fmtDate, relativeDays } from '../../lib/format';
import { Card } from './ui';
import { Icon } from './icons';

const SUPPORT_ICON = { good: 'check', info: 'shield', muted: 'minus' };

// Shared between the company Downloads page and the platform release
// overview: the current-release hero and the releases table.

export function ReleaseCard({ release, tags = [], foot, onDownload, onCopy }) {
  return (
    <section className="db-card db-release" aria-labelledby="releaseTitle">
      <div className="db-release-main">
        <p className="db-release-eyebrow">
          <Icon name="package" size={14} /> Current release · {release.channel}
        </p>
        <h2 id="releaseTitle" className="db-release-version">
          FlightAssist {release.version}
          <small>
            Released {fmtDate(release.released)} ({relativeDays(release.released)}) · Build {release.build}
          </small>
        </h2>
        {tags.length > 0 && (
          <div className="db-release-tags">
            {tags.map((t) => (
              <span className="db-chip" key={t.label}>
                <Icon name={t.icon} size={11} /> {t.label}
              </span>
            ))}
          </div>
        )}
        <p className="db-release-notes-head">What’s new</p>
        <ul className="db-release-notes" aria-label="What’s new">
          {release.notes.map((n) => (
            <li key={n}>
              <Icon name="check" size={14} strokeWidth={2.5} /> {n}
            </li>
          ))}
        </ul>
        {foot && (
          <p className="db-release-foot">
            <Icon name="refresh" size={14} /> {foot}
          </p>
        )}
      </div>

      <div className="db-release-packages">
        <p className="db-release-packages-head">
          Packages
          <span>Signed · verify the SHA-256 before a managed rollout</span>
        </p>
        {release.packages.map((p) => {
          const platform = PLATFORMS[p.platform];
          return (
            <div className="db-pkg" key={p.platform}>
              <span className="db-pkg-icon">
                <Icon name="monitor" size={20} />
              </span>
              <div className="db-pkg-body">
                <strong>{platform.label}</strong>
                <span>
                  {platform.detail} · .{platform.ext} · {p.size}
                </span>
                <span className="db-pkg-hash">
                  SHA-256 {p.sha256.slice(0, 12)}…
                  <button type="button" className="db-icon-btn db-icon-btn--sm" aria-label={`Copy SHA-256 for ${platform.label}`} title="Copy checksum" onClick={() => onCopy(p)}>
                    <Icon name="copy" size={13} />
                  </button>
                </span>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onDownload(release, p)}>
                <Icon name="download" size={15} /> Download
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// extra: optional { label, render(release, index) } column before Packages.
export function ReleasesTable({ title = 'All releases', subtitle, onDownload, extra }) {
  return (
    <Card title={title} subtitle={subtitle} flush>
      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col">Released</th>
              <th scope="col">Support</th>
              <th scope="col">Highlights</th>
              {extra && (
                <th scope="col" className="num">
                  {extra.label}
                </th>
              )}
              <th scope="col" className="db-th-actions">Packages</th>
            </tr>
          </thead>
          <tbody>
            {RELEASES.map((r, i) => {
              const support = supportFor(i);
              return (
                <tr key={r.version}>
                  <td>
                    <div className="db-cell-title db-mono">FlightAssist {r.version}</div>
                    <div className="db-cell-sub">Build {r.build}</div>
                  </td>
                  <td className="db-cell-nowrap">
                    <div>{fmtDate(r.released)}</div>
                    <div className="db-cell-sub">{relativeDays(r.released)}</div>
                  </td>
                  <td>
                    <span className={`db-badge db-badge--${support.tone}`}>
                      <Icon name={SUPPORT_ICON[support.tone]} size={12} strokeWidth={2.5} /> {support.label}
                    </span>
                  </td>
                  <td className="db-cell-sub db-cell-wrap">{r.notes[0]}</td>
                  {extra && <td className="num">{extra.render(r, i)}</td>}
                  <td className="db-td-actions">
                    <span className="db-pkg-links">
                      {r.packages.map((p) => (
                        <button key={p.platform} type="button" className="db-pkg-link" onClick={() => onDownload(r, p)} title={`${p.file} · ${p.size}`}>
                          <Icon name="download" size={12} /> {PLATFORMS[p.platform].label}
                        </button>
                      ))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
