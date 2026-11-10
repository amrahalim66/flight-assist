import { useState } from 'react';
import { MOCK_USERS, ROLES } from '../../data/mockData';
import { timeAgo } from '../../lib/format';
import { Card, PageHead, Switch, Avatar } from './ui';
import { Icon } from './icons';

// Platform-console settings for the FlightAssist owner.

export default function Settings({ user, notify }) {
  const [alerts, setAlerts] = useState({
    pastDue: true,
    trialEnding: true,
    renewal: false,
    digest: true,
  });
  const [dunning, setDunning] = useState({ retries: '3', reminderDays: '7', graceDays: '14' });

  const setAlert = (key) => (v) => setAlerts((a) => ({ ...a, [key]: v }));
  const setDun = (key) => (e) => setDunning((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="db-page">
      <PageHead title="Settings" text="Your profile, who can sign in, and how billing automation behaves across every customer." />

      <div className="db-grid db-grid--1-1 db-grid--settings">
        <Card title="Profile" subtitle="Managed by your identity provider">
          <div className="db-profile">
            <Avatar name={user.name} size={56} />
            <div>
              <p className="db-profile-name">{user.name}</p>
              <p className="db-muted">{user.title || ROLES[user.role]?.label}</p>
            </div>
          </div>
          <div className="db-form-grid">
            <label className="db-field">
              <span>Full name</span>
              <input className="db-input" value={user.name} readOnly />
            </label>
            <label className="db-field">
              <span>Username</span>
              <input className="db-input" value={user.username} readOnly />
            </label>
            <label className="db-field">
              <span>Email</span>
              <input className="db-input" value={user.email} readOnly />
            </label>
            <label className="db-field">
              <span>Location</span>
              <input className="db-input" value={user.location} readOnly />
            </label>
          </div>
          <p className="db-note">
            <Icon name="shield" size={14} /> {ROLES[user.role]?.label}: {ROLES[user.role]?.blurb}
          </p>
        </Card>

        <Card title="Notifications" subtitle="Email alerts for this account">
          <div className="db-switches">
            <Switch label="Past-due accounts" description="When a payment fails or an invoice goes overdue" checked={alerts.pastDue} onChange={setAlert('pastDue')} />
            <Switch label="Trials ending" description="Seven days before a trial converts or expires" checked={alerts.trialEnding} onChange={setAlert('trialEnding')} />
            <Switch label="Upcoming renewals" description="Annual contracts renewing within 30 days" checked={alerts.renewal} onChange={setAlert('renewal')} />
            <Switch label="Weekly digest" description="MRR, churn and pipeline summary every Monday" checked={alerts.digest} onChange={setAlert('digest')} />
          </div>
          <div className="db-form-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => notify('Notification preferences saved for this session.')}>
              Save preferences
            </button>
          </div>
        </Card>
      </div>

      <Card
        title="Sign-in accounts"
        subtitle="Everyone who can open a FlightAssist console — yours and each customer's"
        flush
        actions={
          <button type="button" className="db-btn db-btn--sm" onClick={() => notify('Invites are sent through your identity provider — not part of this demo.', 'info')}>
            <Icon name="plus" size={14} /> Invite
          </button>
        }
      >
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Username</th>
                <th scope="col">Role</th>
                <th scope="col">Scope</th>
                <th scope="col">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="db-member">
                      <Avatar name={u.name} size={32} />
                      <div>
                        <div className="db-cell-title">
                          {u.name}
                          {u.id === user.id && <span className="db-chip db-chip--you">You</span>}
                        </div>
                        <div className="db-cell-sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="db-mono">{u.username}</td>
                  <td>
                    <div className="db-cell-title">{ROLES[u.role]?.label}</div>
                    <div className="db-cell-sub">{u.title}</div>
                  </td>
                  <td>{u.role === 'super_admin' ? 'All customers' : u.companyName}</td>
                  <td>{u.id === user.id ? 'Now' : timeAgo(u.lastSignIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Billing automation" subtitle="How FlightAssist chases failed payments">
        <div className="db-form-grid db-form-grid--3">
          <label className="db-field">
            <span>Card retry attempts</span>
            <select className="db-select" value={dunning.retries} onChange={setDun('retries')}>
              {['1', '2', '3', '4', '5'].map((n) => (
                <option key={n} value={n}>
                  {n} {n === '1' ? 'attempt' : 'attempts'}
                </option>
              ))}
            </select>
          </label>
          <label className="db-field">
            <span>Reminder before due date</span>
            <select className="db-select" value={dunning.reminderDays} onChange={setDun('reminderDays')}>
              {['3', '7', '14'].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </select>
          </label>
          <label className="db-field">
            <span>Grace period before suspension</span>
            <select className="db-select" value={dunning.graceDays} onChange={setDun('graceDays')}>
              {['7', '14', '21', '30'].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="db-form-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => notify('Billing automation settings saved for this session.')}>
            Save changes
          </button>
        </div>
      </Card>
    </div>
  );
}
