import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SUBSCRIPTIONS,
  INVOICES,
  ACTIVITY,
  COMPANY_TEAM,
  COMPANY_FLEET,
  MOCK_USERS,
  PLANS,
  MODULES,
  ROLES,
  AIRCRAFT_TYPES,
  AIRCRAFT_STATUS_OPTIONS,
  TODAY,
  daysFromToday,
  priceFor,
} from '../data/mockData';
import { SERVICES } from '../data/opsData';
import { addDays, daysUntil, fmtDate, fmtMoney, relativeDays } from '../lib/format';
import { useTheme } from '../lib/useTheme';
import { Icon } from '../components/dashboard/icons';
import { Avatar, EmptyState } from '../components/dashboard/ui';
import Companies from '../components/dashboard/Companies';
import Subscriptions from '../components/dashboard/Subscriptions';
import Revenue from '../components/dashboard/Revenue';
import PlatformModules from '../components/dashboard/PlatformModules';
import Monitoring from '../components/dashboard/Monitoring';
import Settings from '../components/dashboard/Settings';
import Employees from '../components/dashboard/company/Employees';
import Aircraft from '../components/dashboard/company/Aircraft';
import Operations from '../components/dashboard/company/Operations';
import CompanyModules from '../components/dashboard/company/CompanyModules';
import Billing from '../components/dashboard/company/Billing';
import CompanySettings from '../components/dashboard/company/CompanySettings';
import PayDrawer from '../components/dashboard/company/PayDrawer';

// Two consoles share one shell:
//   Super Admin   – platform ownership and control (every company)
//   Company Admin – airline workspace management (their own company), also
//                   reachable by a Super Admin through "view as".
const PLATFORM_VIEWS = [
  { key: 'companies', label: 'Companies', icon: 'grid' },
  { key: 'subscriptions', label: 'Subscriptions', icon: 'credit-card' },
  { key: 'revenue', label: 'Revenue', icon: 'trending-up' },
  { key: 'modules', label: 'Modules', icon: 'layers' },
  { key: 'monitoring', label: 'Monitoring', icon: 'activity' },
];

const COMPANY_VIEWS = [
  { key: 'employees', label: 'Employees', icon: 'users' },
  { key: 'aircraft', label: 'Aircraft', icon: 'plane' },
  { key: 'operations', label: 'Operations', icon: 'activity' },
  { key: 'modules', label: 'Modules', icon: 'layers' },
  { key: 'billing', label: 'Billing', icon: 'credit-card' },
];

const SETTINGS_VIEW = { key: 'settings', label: 'Settings', icon: 'settings' };

// `#dashboard/aircraft` → 'aircraft'. Unknown keys fall back to the first view.
function viewFromHash() {
  const [, view] = window.location.hash.replace(/^#/, '').split('/');
  return view || null;
}

const statusLabel = (key) => AIRCRAFT_STATUS_OPTIONS.find((o) => o.key === key)?.label || key;

export default function Dashboard({ user, onSignOut, onNavigate }) {
  const isSuper = user.role === 'super_admin';
  const [viewAs, setViewAs] = useState(null);
  const companyId = isSuper ? viewAs : user.companyId;
  const views = companyId ? COMPANY_VIEWS : PLATFORM_VIEWS;

  const [view, setViewState] = useState(viewFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  // Working copies of the mock data. Actions below mutate these; a reload
  // resets them.
  const [subs, setSubs] = useState(() => SUBSCRIPTIONS.map((s) => ({ ...s })));
  const [invoices, setInvoices] = useState(() => INVOICES.map((i) => ({ ...i })));
  const [activity, setActivity] = useState(ACTIVITY);
  const [team, setTeam] = useState(() => Object.fromEntries(Object.entries(COMPANY_TEAM).map(([k, list]) => [k, list.map((m) => ({ ...m }))])));
  const [fleet, setFleet] = useState(() => Object.fromEntries(Object.entries(COMPANY_FLEET).map(([k, list]) => [k, list.map((a) => ({ ...a }))])));

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [paying, setPaying] = useState(null);

  const go = useCallback((next, opts = {}) => {
    setViewState(next);
    setMenuOpen(false);
    if (opts.query !== undefined) setQuery(opts.query || '');
    const hash = `#dashboard/${next}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0 });
  }, []);

  // Back/forward and hand-typed hashes.
  useEffect(() => {
    const sync = () => setViewState(viewFromHash());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // Mobile drawer: Escape closes, body scroll locked while open.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  const notify = useCallback((text, tone = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const log = (type, text, cid = null) =>
    setActivity((list) => [{ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, companyId: cid, type, text, at: new Date().toISOString() }, ...list]);
  const byId = (id) => subs.find((s) => s.id === id);
  const byCompany = (cid) => subs.find((s) => s.companyId === cid);
  const patchSub = (id, patch) => setSubs((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Shared by "Mark paid" (platform) and "Pay now" (workspace).
  const settleInvoice = (invoiceId, via) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;
    const s = byId(inv.subscriptionId);
    setInvoices((list) => list.map((i) => (i.id === invoiceId ? { ...i, status: 'paid', paidOn: TODAY } : i)));
    const stillOverdue = invoices.some((i) => i.subscriptionId === inv.subscriptionId && i.id !== invoiceId && i.status === 'overdue');
    if (s && s.status === 'past_due' && !stillOverdue) {
      const future = s.renewsOn && daysUntil(s.renewsOn) > 0;
      patchSub(s.id, { status: 'active', renewsOn: future ? s.renewsOn : daysFromToday(s.billing === 'annual' ? 365 : 30) });
    }
    log('payment', `${inv.customer} paid ${inv.id} (${fmtMoney(inv.amount)})${via ? ` with ${via}` : ''}`, inv.companyId);
    return inv;
  };

  const actions = {
    notify,
    retryPayment(id) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, { status: 'active', renewsOn: daysFromToday(s.billing === 'annual' ? 365 : 30) });
      setInvoices((list) => list.map((i) => (i.subscriptionId === id && i.status !== 'paid' && i.status !== 'refunded' ? { ...i, status: 'paid', paidOn: TODAY } : i)));
      log('payment', `${s.customer} payment retried successfully — account back in good standing`, s.companyId);
      notify(`Payment collected from ${s.customer}.`);
    },
    sendReminder(id) {
      const s = byId(id);
      if (!s) return;
      log('dunning', `Payment reminder emailed to ${s.contact.name} at ${s.customer}`, s.companyId);
      notify(`Reminder sent to ${s.contact.email}.`);
    },
    convertTrial(id) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, { status: 'active', renewsOn: daysFromToday(30) });
      log('upgrade', `${s.customer} converted to a paid ${PLANS[s.plan].name} plan (${fmtMoney(s.mrr)}/mo)`, s.companyId);
      notify(`${s.customer} is now a paying customer.`);
    },
    extendTrial(id) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, { renewsOn: addDays(s.renewsOn, 14) });
      log('trial', `${s.customer} trial extended by 14 days`, s.companyId);
      notify('Trial extended by 14 days.');
    },
    cancel(id) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, { status: 'cancelled', endedOn: s.renewsOn || TODAY, renewsOn: null });
      log('cancel', `${s.customer} cancelled — access ends ${s.renewsOn || TODAY}`, s.companyId);
      notify(`${s.customer} will be cancelled at period end.`, 'warning');
    },
    reactivate(id) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, { status: 'active', renewsOn: daysFromToday(30), endedOn: null });
      log('upgrade', `${s.customer} reactivated on ${PLANS[s.plan].name}`, s.companyId);
      notify(`${s.customer} reactivated.`);
    },
    changePlan(id, plan) {
      const s = byId(id);
      if (!s || !PLANS[plan] || s.plan === plan) return;
      const next = PLANS[plan];
      const mrr = priceFor(plan, s.aircraft);
      const modules = s.modules.filter((m) => next.modules.includes(m));
      patchSub(id, { plan, mrr, modules });
      const up = next.tier > PLANS[s.plan].tier;
      log('upgrade', `${s.customer} ${up ? 'upgraded' : 'moved'} to ${next.name} (${fmtMoney(mrr)}/mo)`, s.companyId);
      notify(`${s.customer} moved to ${next.name} — ${fmtMoney(mrr)}/mo.`);
    },
    toggleModule(id, key) {
      const s = byId(id);
      if (!s || !PLANS[s.plan].modules.includes(key)) return;
      const on = s.modules.includes(key);
      if (on && key === 'ops') return;
      const modules = on ? s.modules.filter((m) => m !== key) : [...s.modules, key];
      patchSub(id, { modules });
      log('upgrade', `${s.customer} ${on ? 'disabled' : 'enabled'} ${MODULES[key]}`, s.companyId);
      notify(`${MODULES[key]} ${on ? 'disabled' : 'enabled'}.`);
    },
    setBilling(id, billing) {
      const s = byId(id);
      if (!s || s.billing === billing) return;
      patchSub(id, { billing });
      log('upgrade', `${s.customer} switched to ${billing} billing`, s.companyId);
      notify(`Switched to ${billing} billing from the next renewal.`);
    },
    updateCompany(id, patch) {
      const s = byId(id);
      if (!s) return;
      patchSub(id, patch);
      if (patch.customer) setInvoices((list) => list.map((i) => (i.subscriptionId === id ? { ...i, customer: patch.customer } : i)));
      notify('Saved.');
    },
    markInvoicePaid(invoiceId) {
      const inv = settleInvoice(invoiceId, null);
      if (inv) notify(`${inv.id} marked as paid.`);
    },
    payInvoice(invoiceId) {
      const inv = invoices.find((i) => i.id === invoiceId);
      const s = inv && byId(inv.subscriptionId);
      const via = s?.paymentMethod ? `${s.paymentMethod.brand} •••• ${s.paymentMethod.last4}` : 'card';
      const paid = settleInvoice(invoiceId, via);
      if (paid) notify(`Payment of ${fmtMoney(paid.amount)} received — thank you.`);
    },
    downloadInvoice(inv) {
      notify(`PDF export for ${inv.id} is not wired up in this demo.`, 'info');
    },

    // ── Employees (unlimited, not billed)
    addEmployee(cid, member) {
      const s = byCompany(cid);
      if (!s) return false;
      const entry = { id: `${cid}_m${Date.now()}`, name: member.name.trim(), email: member.email.trim(), role: member.role, status: 'invited', lastActive: null };
      setTeam((t) => ({ ...t, [cid]: [...(t[cid] || []), entry] }));
      patchSub(s.id, { users: s.users + 1 });
      log('seat', `${entry.name} invited as ${entry.role}`, cid);
      notify(`Invitation sent to ${entry.email}.`);
      return true;
    },
    removeEmployee(cid, memberId) {
      const s = byCompany(cid);
      const m = (team[cid] || []).find((x) => x.id === memberId);
      if (!s || !m || m.owner) return;
      setTeam((t) => ({ ...t, [cid]: t[cid].filter((x) => x.id !== memberId) }));
      patchSub(s.id, { users: Math.max(0, s.users - 1) });
      log('seat', `${m.name} removed from the workspace`, cid);
      notify(`${m.name} no longer has access.`);
    },

    // ── Aircraft (each one is billed)
    addAircraft(cid, ac) {
      const s = byCompany(cid);
      if (!s) return false;
      const entry = {
        id: `${cid}_ac${Date.now()}`,
        reg: ac.reg,
        type: ac.type,
        msn: ac.msn,
        base: ac.base,
        status: 'in_service',
        hoursMtd: 0,
        nextCheck: daysFromToday(180),
        added: TODAY,
      };
      const aircraft = (fleet[cid] || []).length + 1;
      const mrr = priceFor(s.plan, aircraft);
      setFleet((f) => ({ ...f, [cid]: [...(f[cid] || []), entry] }));
      patchSub(s.id, { aircraft, mrr });
      log('fleet', `${entry.reg} (${AIRCRAFT_TYPES[entry.type].name}) added to the fleet — licence now ${fmtMoney(mrr)}/mo`, cid);
      notify(`${entry.reg} added. Licence is now ${fmtMoney(mrr)}/mo.`);
      return true;
    },
    removeAircraft(cid, aircraftId) {
      const s = byCompany(cid);
      const a = (fleet[cid] || []).find((x) => x.id === aircraftId);
      if (!s || !a) return;
      const aircraft = Math.max(0, (fleet[cid] || []).length - 1);
      const mrr = priceFor(s.plan, aircraft);
      setFleet((f) => ({ ...f, [cid]: f[cid].filter((x) => x.id !== aircraftId) }));
      patchSub(s.id, { aircraft, mrr });
      log('fleet', `${a.reg} removed from the fleet — licence now ${fmtMoney(mrr)}/mo`, cid);
      notify(`${a.reg} removed. Licence is now ${fmtMoney(mrr)}/mo.`, 'warning');
    },
    setAircraftStatus(cid, aircraftId, status) {
      const a = (fleet[cid] || []).find((x) => x.id === aircraftId);
      if (!a || a.status === status) return;
      setFleet((f) => ({
        ...f,
        [cid]: f[cid].map((x) => (x.id === aircraftId ? { ...x, status, nextCheck: status === 'in_service' ? daysFromToday(60) : daysFromToday(3) } : x)),
      }));
      log('fleet', `${a.reg} marked ${statusLabel(status)}`, cid);
      notify(`${a.reg} is now ${statusLabel(status)}.`, status === 'aog' ? 'warning' : 'success');
    },

    // ── Super admin: open a company's workspace
    viewAs(cid) {
      const s = byCompany(cid);
      if (!s) return;
      setViewAs(cid);
      go(COMPANY_VIEWS[0].key);
      notify(`Viewing ${s.customer}'s workspace.`, 'info');
    },
    exitViewAs() {
      setViewAs(null);
      go('companies');
    },
  };

  // ─── Derived for the current console ───
  const current = views.find((v) => v.key === view) || (view === 'settings' ? SETTINGS_VIEW : views[0]);
  const companySub = companyId ? byCompany(companyId) || null : null;
  const companyInvoices = companyId ? invoices.filter((i) => i.companyId === companyId) : [];
  const companyTeam = (companyId && team[companyId]) || [];
  const companyFleet = (companyId && fleet[companyId]) || [];
  const workspaceName = companySub ? companySub.customer : user.companyName;
  const workspaceAdmin = companyId ? MOCK_USERS.find((u) => u.companyId === companyId) : null;

  const pastDueCount = subs.filter((s) => s.status === 'past_due').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
  const degradedCount = SERVICES.filter((s) => s.status !== 'operational').length;
  const companyDue = companyInvoices.filter((i) => i.status === 'open' || i.status === 'overdue').length;
  const aogCount = companyFleet.filter((a) => a.status === 'aog').length;
  const attentionCount = companyId
    ? (companySub?.status === 'past_due' ? 1 : 0) + companyInvoices.filter((i) => i.status === 'overdue').length + aogCount
    : pastDueCount + overdueCount + degradedCount;

  const navCount = (key) => {
    if (companyId) {
      if (key === 'billing') return companySub?.status === 'past_due' ? { n: '!', alert: true } : companyDue ? { n: companyDue } : null;
      if (key === 'aircraft' && aogCount) return { n: aogCount, alert: true };
      return null;
    }
    if (key === 'subscriptions' && pastDueCount) return { n: pastDueCount };
    if (key === 'revenue' && overdueCount) return { n: overdueCount };
    if (key === 'monitoring' && degradedCount) return { n: '!', alert: true };
    return null;
  };

  const onSearch = (e) => {
    e.preventDefault();
    go('companies', { query: search });
  };

  const payingInvoice = paying ? invoices.find((i) => i.id === paying) : null;
  const openPay = (inv) => setPaying(inv.id);

  const renderCompany = () => {
    if (!companySub) return <EmptyState icon="credit-card" title="No subscription found" text="This account isn't linked to a FlightAssist subscription yet." />;
    switch (current.key) {
      case 'aircraft':
        return <Aircraft sub={companySub} fleet={companyFleet} actions={actions} />;
      case 'operations':
        return <Operations sub={companySub} fleet={companyFleet} go={go} />;
      case 'modules':
        return <CompanyModules sub={companySub} actions={actions} />;
      case 'billing':
        return <Billing sub={companySub} invoices={companyInvoices} onPay={openPay} actions={actions} go={go} />;
      case 'settings':
        return <CompanySettings sub={companySub} user={isSuper && workspaceAdmin ? workspaceAdmin : user} actions={actions} notify={notify} />;
      default:
        return <Employees sub={companySub} team={companyTeam} actions={actions} />;
    }
  };

  const renderPlatform = () => {
    switch (current.key) {
      case 'subscriptions':
        return <Subscriptions subs={subs} invoices={invoices} actions={actions} initialQuery={query} />;
      case 'revenue':
        return <Revenue subs={subs} invoices={invoices} actions={actions} />;
      case 'modules':
        return <PlatformModules subs={subs} notify={notify} />;
      case 'monitoring':
        return <Monitoring subs={subs} activity={activity} />;
      case 'settings':
        return <Settings user={user} notify={notify} />;
      default:
        return <Companies subs={subs} invoices={invoices} go={go} actions={actions} initialQuery={query} />;
    }
  };

  return (
    <div className="db">
      {menuOpen && <div className="db-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <aside className={`db-sidebar ${menuOpen ? 'is-open' : ''}`} id="dbSidebar">
        <div className="db-brand">
          <button type="button" className="db-brand-link" onClick={() => go(views[0].key)}>
            <img src="./assets/logo.png" alt="" width="36" height="36" />
            <span>
              <strong>FlightAssist</strong>
              <small>{companyId ? workspaceName : 'Super Admin'}</small>
            </span>
          </button>
          <button type="button" className="db-icon-btn db-icon-btn--onDark db-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <nav className="db-nav" aria-label="Dashboard">
          <p className="db-nav-label">{companyId ? 'Airline workspace' : 'Platform control'}</p>
          {views.map((v) => {
            const count = navCount(v.key);
            return (
              <a
                key={v.key}
                href={`#dashboard/${v.key}`}
                className={`db-nav-link ${current.key === v.key ? 'is-active' : ''}`}
                aria-current={current.key === v.key ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(v.key);
                }}
              >
                <Icon name={v.icon} size={18} />
                <span>{v.label}</span>
                {count && <span className={`db-nav-count ${count.alert ? 'db-nav-count--alert' : ''}`}>{count.n}</span>}
              </a>
            );
          })}
        </nav>

        <div className="db-sidebar-foot">
          <a
            href="#dashboard/settings"
            className={`db-sidebar-link ${current.key === 'settings' ? 'is-active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              go('settings');
            }}
          >
            <Icon name="settings" size={16} /> Settings
          </a>
          <a
            href="#home"
            className="db-sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
          >
            <Icon name="external" size={16} /> Back to website
          </a>
          <div className="db-user">
            <Avatar name={user.name} size={38} />
            <div className="db-user-meta">
              <strong>{user.name}</strong>
              <span>{ROLES[user.role]?.label || user.role}</span>
            </div>
            <button type="button" className="db-icon-btn db-icon-btn--onDark" onClick={onSignOut} aria-label="Sign out" title="Sign out">
              <Icon name="log-out" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="db-main">
        {isSuper && viewAs && (
          <div className="db-viewas" role="status">
            <Icon name="eye" size={16} />
            <span>
              Viewing <strong>{workspaceName}</strong>&rsquo;s workspace{workspaceAdmin ? ` as ${workspaceAdmin.name}` : ''}
            </span>
            <button type="button" className="db-btn db-btn--sm" onClick={actions.exitViewAs}>
              <Icon name="x" size={14} /> Exit
            </button>
          </div>
        )}

        <header className="db-topbar">
          <button type="button" className="db-icon-btn db-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-controls="dbSidebar" aria-expanded={menuOpen}>
            <Icon name="menu" />
          </button>

          <div className="db-topbar-title">
            <span className="db-crumb">{companyId ? workspaceName : 'Super Admin'}</span>
            <Icon name="chevron-right" size={14} />
            <strong>{current.label}</strong>
          </div>

          {!companyId && (
            <form className="db-search db-topbar-search" role="search" onSubmit={onSearch}>
              <Icon name="search" size={16} />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies…" aria-label="Search companies" />
            </form>
          )}

          <div className="db-topbar-actions">
            <button
              type="button"
              className="db-icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button
              type="button"
              className="db-icon-btn db-bell"
              onClick={() => go(companyId ? (companySub?.status === 'past_due' ? 'billing' : aogCount ? 'aircraft' : 'billing') : 'companies')}
              aria-label={attentionCount ? `${attentionCount} items need attention` : 'No alerts'}
              title={attentionCount ? `${attentionCount} items need attention` : 'No alerts'}
            >
              <Icon name="bell" />
              {attentionCount > 0 && <span className="db-bell-dot" aria-hidden="true" />}
            </button>
            <button type="button" className="db-avatar-btn" onClick={() => go('settings')} aria-label="Account settings">
              <Avatar name={user.name} size={34} />
            </button>
          </div>
        </header>

        <main id="main" className="db-content" tabIndex={-1}>
          {companySub && <WorkspaceBanner sub={companySub} invoices={companyInvoices} onPay={openPay} actions={actions} />}
          {companyId ? renderCompany() : renderPlatform()}
        </main>
      </div>

      {payingInvoice && companySub && <PayDrawer invoice={payingInvoice} sub={companySub} onPay={actions.payInvoice} onClose={() => setPaying(null)} notify={notify} />}

      {toast && (
        <div key={toast.id} className={`db-toast db-toast--${toast.tone}`} role="status">
          <Icon name={toast.tone === 'success' ? 'check-circle' : toast.tone === 'warning' ? 'alert-triangle' : 'alert-circle'} size={18} />
          <span>{toast.text}</span>
          <button type="button" className="db-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// Account-level alert shown on every workspace page, so a failed payment is
// never more than one click from being fixed.
function WorkspaceBanner({ sub, invoices, onPay, actions }) {
  const overdue = invoices.filter((i) => i.status === 'overdue').sort((a, b) => (a.due < b.due ? -1 : 1));
  let b = null;
  if (sub.status === 'past_due') {
    b = {
      tone: 'critical',
      icon: 'alert-circle',
      title: 'Payment failed — your access is at risk',
      text: overdue[0]
        ? `${overdue[0].id} for ${fmtMoney(overdue[0].amount)} was due ${fmtDate(overdue[0].due)}. Pay now to keep your ${sub.aircraft} aircraft and ${sub.users} users online.`
        : 'Update your card to keep your team online.',
      action: overdue[0] ? { label: `Pay ${fmtMoney(overdue[0].amount)}`, onClick: () => onPay(overdue[0]) } : null,
    };
  } else if (sub.status === 'trialing') {
    b = {
      tone: 'info',
      icon: 'zap',
      title: `Your ${PLANS[sub.plan].name} trial ends ${relativeDays(sub.renewsOn)}`,
      text: `Convert now to keep your fleet, employees and settings — ${fmtMoney(sub.mrr)}/mo for ${sub.aircraft} aircraft.`,
      action: { label: 'Convert to paid', onClick: () => actions.convertTrial(sub.id) },
    };
  } else if (sub.status === 'cancelled') {
    b = {
      tone: 'warning',
      icon: 'x-circle',
      title: 'This subscription is cancelled',
      text: `Access ended ${fmtDate(sub.endedOn)}. Your data is retained for 90 days.`,
      action: { label: 'Reactivate', onClick: () => actions.reactivate(sub.id) },
    };
  }
  if (!b) return null;
  return (
    <div className={`db-banner db-banner--${b.tone} db-banner--shell`} role="status">
      <span className="db-banner-icon">
        <Icon name={b.icon} size={18} />
      </span>
      <div className="db-banner-text">
        <strong>{b.title}</strong>
        <span>{b.text}</span>
      </div>
      {b.action && (
        <button type="button" className="btn btn-primary btn-sm" onClick={b.action.onClick}>
          {b.action.label}
        </button>
      )}
    </div>
  );
}
