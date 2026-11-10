import { useState } from 'react';
import { fmtMoney, fmtDate, relativeDays } from '../../../lib/format';
import { Badge, Drawer } from '../ui';
import { Icon } from '../icons';

// Mock checkout. "Pay" waits briefly so the busy state is visible, then hands
// the invoice id to the dashboard's payInvoice action.

export default function PayDrawer({ invoice, sub, onPay, onClose, notify }) {
  const [busy, setBusy] = useState(false);
  const pm = sub.paymentMethod;

  const pay = () => {
    if (!pm) {
      notify('Add a payment card under Settings before paying online.', 'warning');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      onPay(invoice.id);
      setBusy(false);
      onClose();
    }, 900);
  };

  return (
    <Drawer
      eyebrow="Pay invoice"
      title={invoice.id}
      subtitle={invoice.period}
      onClose={onClose}
      footer={
        <>
          <span className="db-muted">
            <Icon name="lock" size={12} /> Secured by FlightAssist Pay
          </span>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={pay}>
            {busy ? 'Processing…' : `Pay ${fmtMoney(invoice.amount)}`}
          </button>
        </>
      }
    >
      <div className="db-drawer-status">
        <Badge status={invoice.status} />
        <span className="db-chip">{invoice.status === 'overdue' ? `Was due ${fmtDate(invoice.due)}` : `Due ${relativeDays(invoice.due)}`}</span>
      </div>

      <dl className="db-facts">
        <div>
          <dt>Amount</dt>
          <dd>{fmtMoney(invoice.amount)}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>{fmtDate(invoice.due)}</dd>
        </div>
        <div>
          <dt>Issued</dt>
          <dd>{fmtDate(invoice.issued)}</dd>
        </div>
        <div>
          <dt>Billed to</dt>
          <dd>{sub.customer}</dd>
        </div>
      </dl>

      <section className="db-drawer-section">
        <h3>Payment method</h3>
        <div className="db-paycard">
          <span className="db-paycard-brand">{pm ? pm.brand : 'Card'}</span>
          {pm ? (
            <>
              <strong>•••• {pm.last4}</strong>
              <span className="db-muted">Expires {pm.expiry}</span>
            </>
          ) : (
            <span className="db-muted">No card on file</span>
          )}
          <button type="button" className="db-link" onClick={() => notify('Switching cards opens a secure payment form — not part of this demo.', 'info')}>
            Change
          </button>
        </div>
      </section>

      <section className="db-drawer-section">
        <h3>Summary</h3>
        <ul className="db-summary">
          <li>
            <span>{invoice.period}</span>
            <span>{fmtMoney(invoice.amount)}</span>
          </li>
          <li>
            <span>VAT (reverse charge)</span>
            <span>{fmtMoney(0)}</span>
          </li>
          <li className="is-total">
            <span>Total due today</span>
            <span>{fmtMoney(invoice.amount)}</span>
          </li>
        </ul>
        {sub.status === 'past_due' && (
          <p className="db-note">
            <Icon name="check-circle" size={14} /> Paying this invoice restores your account to good standing immediately.
          </p>
        )}
      </section>
    </Drawer>
  );
}
