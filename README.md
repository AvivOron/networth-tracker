# Finance Hub

A clean, minimal Mac desktop app for comprehensive financial tracking—net worth, accounts, and recurring expenses all in one place.

Built with Electron + React + TypeScript.

## Features

**Net Worth Tracking**
- **Account Management** — Create custom asset and liability categories (Checking, Brokerage, 401k, Mortgage, etc.) with owner assignment and account types
- **Monthly Snapshots** — Record balances once a month per account; auto-detects and lets you edit existing snapshots with last-updated timestamps
- **Dashboard** — Net worth line chart, assets vs. liabilities area chart, and summary cards with month-over-month change; filter by family member or account
- **History** — Table of all past snapshots with edit and delete support

**Expense Management**
- **Recurring Expenses** — Track fixed monthly costs (housing, subscriptions, utilities, pets, etc.) with monthly and yearly billing cycles
- **Expense Categories** — Pre-built categories (Housing, Childcare, Subscriptions, Insurance, Utilities, Transport, Pets, Other) with color-coded icons
- **Expense Dashboard** — Summary cards showing total monthly and yearly expenses; bar chart breakdown by category
- **Flexible Assignment** — Assign expenses to family members for household budget tracking

**General**
- **Currency switching** — Toggle between NIS (₪, default) and USD ($) from the sidebar; persisted across restarts
- **Data backup** — Export your data as JSON with one click; save to Dropbox, email, or Google Drive manually
- **Local storage** — All data is saved as JSON in your app data directory; no cloud login required

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Electron 29 |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS (dark theme) |
| Charts | Recharts |
| Build | electron-vite + Vite 5 |
| Storage | Local JSON file via Node `fs` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run in dev mode

```bash
git clone https://github.com/AvivOron/networth-tracker.git
cd networth-tracker
npm install
npm run dev
```

This opens the full Electron app with hot-reload.

### Package as a macOS app

```bash
npm run dist
```

This builds the app and produces a `.dmg` installer in `dist/`:

| File | Architecture |
|---|---|
| `Finance Hub-x.x.x-arm64.dmg` | Apple Silicon |
| `Finance Hub-x.x.x.dmg` | Intel |

Open the DMG, drag **Finance Hub** to `/Applications`, and launch it like any other app.

> **First launch on macOS:** If Gatekeeper blocks the app (unsigned build), right-click → Open → Open anyway.

## Project Structure

```
src/
├── main/               # Electron main process (window, IPC, file I/O)
├── preload/            # Context bridge — exposes getData/saveData to renderer
└── renderer/
    └── src/
        ├── components/ # Dashboard, Accounts, SnapshotEntry, History, Expenses, Sidebar
        ├── context/    # CurrencyContext for NIS/USD toggle
        ├── hooks/      # useData — loads/saves AppData, localStorage fallback
        ├── types/      # TypeScript interfaces (Account, MonthlySnapshot, RecurringExpense, etc.)
        └── utils/      # Currency formatting, date helpers, ID generation
```

## Data Model

```ts
interface Account {
  id: string
  name: string
  type: 'asset' | 'liability'
  kind?: 'bank' | 'brokerage' | 'child' | 'custom'  // account subtype
  owner?: string         // family member name
  notes?: string
}

interface SnapshotEntry {
  accountId: string
  balance: number
  subBalances?: Record<string, number>  // for multi-part accounts (e.g., checking + savings)
  lastUpdatedAt?: string                // ISO timestamp of last update
}

interface MonthlySnapshot {
  id: string
  date: string           // YYYY-MM
  entries: SnapshotEntry[]
  createdAt: string
  updatedAt: string
}

interface RecurringExpense {
  id: string
  name: string
  amount: number
  category: 'housing' | 'childcare' | 'subscriptions' | 'insurance' | 'utilities' | 'transport' | 'pets' | 'other'
  billingCycle: 'monthly' | 'yearly'
  owner?: string         // family member
  notes?: string
  active: boolean
}

interface AppData {
  accounts: Account[]
  snapshots: MonthlySnapshot[]
  familyMembers?: string[]        // list of family member names
  expenses?: RecurringExpense[]    // recurring expenses tracker
}
```

Data is stored at:
- **macOS:** `~/Library/Application Support/networth-tracker/networth-data.json`

## License

MIT
