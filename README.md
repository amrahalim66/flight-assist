# FlightAssist

Marketing website and admin console for FlightAssist, an airline management system. Built with React 18 and Vite 5.

## Pages

- **Home**, **Operations Control**, **Commercial Planning**, **Pricing** (per-aircraft plans with a fleet calculator)
- **Admin dashboard** (`#login`), using mock data:
  - Super Admin: Companies, Subscriptions, Revenue, Modules, Monitoring
  - Company Admin: Employees, Aircraft, Operations, Modules, Billing

### Demo accounts (mock data only)

| Role | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `Super@2026` |
| Company Admin (Nordwind) | `nordwind.admin` | `Nordwind@2026` |
| Company Admin (SkyBridge) | `skybridge.admin` | `SkyBridge@2026` |

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run lint
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`.
