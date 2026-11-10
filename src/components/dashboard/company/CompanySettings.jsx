import { useState } from 'react';
import { ROLES } from '../../../data/mockData';
import { Card, PageHead, Switch } from '../ui';
import { Icon } from '../icons';

const TIMEZONES = ['Europe/Oslo', 'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore', 'America/New_York', 'UTC'];

// Workspace settings for a company admin. Billing contact and card live on
// the Billing page.

export default function CompanySettings({ sub, user, actions, notify }) {
  const [profile, setProfile] = useState({
    customer: sub.customer,
    aoc: sub.aoc || '',
    location: sub.location,
    timezone: sub.timezone || 'UTC',
  });
  const [alerts, setAlerts] = useState({ invoice: true, paymentFailed: true, renewal: true, aog: true });

  const setP = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setAlert = (key) => (v) => setAlerts((a) => ({ ...a, [key]: v }));

  const saveProfile = (e) => {
    e.preventDefault();
    if (!profile.customer.trim()) {
      notify('Company name can’t be empty.', 'warning');
      return;
    }
    actions.updateCompany(sub.id, {
      customer: profile.customer.trim(),
      aoc: profile.aoc.trim(),
      location: profile.location.trim(),
      timezone: profile.timezone,
    });
  };

  return (
    <div className="db-page">
      <PageHead title="Settings" text="Company details, notifications and your own sign-in." />

      <div className="db-grid db-grid--1-1 db-grid--settings">
        <Card title="Company" subtitle="Shown on invoices and across FlightAssist">
          <form className="db-form-stack" onSubmit={saveProfile}>
            <div className="db-form-grid">
              <label className="db-field">
                <span>Company name</span>
                <input className="db-input" value={profile.customer} onChange={setP('customer')} />
              </label>
              <label className="db-field">
                <span>AOC / registration</span>
                <input className="db-input" value={profile.aoc} onChange={setP('aoc')} placeholder="e.g. NO.AOC.0147" />
              </label>
              <label className="db-field">
                <span>Base location</span>
                <input className="db-input" value={profile.location} onChange={setP('location')} />
              </label>
              <label className="db-field">
                <span>Operations timezone</span>
                <select className="db-select" value={profile.timezone} onChange={setP('timezone')}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="db-form-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                Save company details
              </button>
            </div>
          </form>
        </Card>

        <Card title="Your sign-in" subtitle="Managed by FlightAssist">
          <div className="db-form-grid">
            <label className="db-field">
              <span>Name</span>
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
              <span>Role</span>
              <input className="db-input" value={ROLES[user.role]?.label || user.role} readOnly />
            </label>
          </div>
          <p className="db-note">
            <Icon name="shield" size={14} /> To change your password or add another workspace admin, contact your account manager.
          </p>
        </Card>
      </div>

      <Card title="Notifications" subtitle="Emails sent to workspace admins">
        <div className="db-switches">
          <Switch label="New invoice" description="When an invoice is issued, with a PDF attached" checked={alerts.invoice} onChange={setAlert('invoice')} />
          <Switch label="Payment failed" description="Immediately, with a link to retry" checked={alerts.paymentFailed} onChange={setAlert('paymentFailed')} />
          <Switch label="Renewal reminder" description="30 and 7 days before an annual renewal" checked={alerts.renewal} onChange={setAlert('renewal')} />
          <Switch label="Aircraft AOG" description="When an aircraft is marked AOG and removed from the schedule" checked={alerts.aog} onChange={setAlert('aog')} />
        </div>
        <div className="db-form-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => notify('Notification preferences saved for this session.')}>
            Save preferences
          </button>
        </div>
      </Card>
    </div>
  );
}
