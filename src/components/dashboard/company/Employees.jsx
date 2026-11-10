import { useState } from 'react';
import { TEAM_ROLE_OPTIONS } from '../../../data/mockData';
import { timeAgo } from '../../../lib/format';
import { Badge, Card, PageHead, Avatar, Drawer, EmptyState, StatTile } from '../ui';
import { Icon } from '../icons';

const EMPTY_FORM = { name: '', email: '', role: TEAM_ROLE_OPTIONS[0] };

export default function Employees({ sub, team, actions }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const live = sub.status !== 'cancelled';
  const q = query.trim().toLowerCase();
  const rows = team.filter(
    (m) => (role === 'all' || m.role === role) && (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)),
  );
  const invited = team.filter((m) => m.status === 'invited').length;
  const activeToday = team.filter((m) => m.lastActive && Date.now() - new Date(m.lastActive).getTime() < 24 * 3600000).length;
  const roles = [...new Set(team.map((m) => m.role))];
  const domain = sub.contact.email.split('@')[1];

  const closeInvite = () => {
    setInviting(false);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const submitInvite = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Enter the person’s name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setFormError('Enter a valid email address.');
    if (team.some((m) => m.email.toLowerCase() === form.email.trim().toLowerCase())) return setFormError('That email already has access.');
    if (actions.addEmployee(sub.companyId, form)) closeInvite();
    return undefined;
  };

  return (
    <div className="db-page">
      <PageHead
        title="Employees"
        text="Everyone in your airline who can sign in to FlightAssist. Users are unlimited on your plan."
        actions={
          <button type="button" className="btn btn-primary btn-sm" disabled={!live} onClick={() => setInviting(true)}>
            <Icon name="user" size={15} /> Invite employee
          </button>
        }
      />

      <div className="db-tiles db-tiles--3">
        <StatTile label="Employees" value={String(team.length - invited)} delta={{ text: 'Unlimited users', direction: 'flat', good: true }} foot={`${roles.length} roles`} />
        <StatTile label="Pending invitations" value={String(invited)} foot={invited ? 'Waiting for first sign-in' : 'Everyone has signed in'} />
        <StatTile label="Active in the last 24 h" value={String(activeToday)} foot={`${Math.round((activeToday / Math.max(team.length, 1)) * 100)}% of the team`} />
      </div>

      <div className="db-toolbar">
        <label className="db-search">
          <Icon name="search" size={16} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or role…" aria-label="Search employees" />
        </label>
        <select className="db-select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <span className="db-toolbar-count">
          {rows.length} of {team.length}
        </span>
      </div>

      <Card flush>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Last active</th>
                <th scope="col" className="db-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="db-member">
                      <Avatar name={m.name} size={32} />
                      <div>
                        <div className="db-cell-title">
                          {m.name}
                          {m.owner && <span className="db-chip db-chip--you">Admin</span>}
                        </div>
                        <div className="db-cell-sub">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.role}</td>
                  <td>
                    <Badge status={m.status} />
                  </td>
                  <td>{m.lastActive ? timeAgo(m.lastActive) : <span className="db-muted">Not yet</span>}</td>
                  <td className="db-td-actions">
                    {m.status === 'invited' && (
                      <button type="button" className="db-btn db-btn--sm" onClick={() => actions.notify(`Invitation re-sent to ${m.email}.`)}>
                        <Icon name="mail" size={14} /> Resend
                      </button>
                    )}
                    <button
                      type="button"
                      className="db-icon-btn db-icon-btn--sm"
                      aria-label={`Remove ${m.name}`}
                      title={m.owner ? 'The workspace admin cannot be removed' : 'Remove access'}
                      disabled={m.owner || !live}
                      onClick={() => actions.removeEmployee(sub.companyId, m.id)}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No employees match" text="Try a different search or role." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {inviting && (
        <Drawer
          eyebrow="New employee"
          title="Invite to FlightAssist"
          subtitle="Included in your plan — no extra cost"
          onClose={closeInvite}
          footer={
            <>
              <button type="button" className="db-btn" onClick={closeInvite}>
                Cancel
              </button>
              <button type="submit" form="inviteForm" className="btn btn-primary btn-sm">
                <Icon name="mail" size={15} /> Send invitation
              </button>
            </>
          }
        >
          <form id="inviteForm" className="db-form-stack" onSubmit={submitInvite} noValidate>
            <label className="db-field">
              <span>Full name</span>
              <input className="db-input" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
            </label>
            <label className="db-field">
              <span>Work email</span>
              <input
                className="db-input"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={`name@${domain}`}
                autoComplete="off"
              />
            </label>
            <label className="db-field">
              <span>Role</span>
              <select className="db-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {TEAM_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            {formError && (
              <p className="auth-error" role="alert">
                <Icon name="alert-circle" size={15} /> {formError}
              </p>
            )}
            <p className="db-note">
              <Icon name="mail" size={14} /> They’ll receive an email to set a password and appear here as <em>Invited</em> until they sign in.
            </p>
          </form>
        </Drawer>
      )}
    </div>
  );
}
