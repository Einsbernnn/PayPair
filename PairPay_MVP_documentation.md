# 📘 Date Expense Split App — MVP Project Plan

> **Core Principle:** Build the split logic perfectly first. Everything else is secondary.

---

## 🧭 Overview

A lightweight web app that helps couples and groups:

- Plan date sessions or shared events
- Track who paid for what
- Automatically calculate and display who owes who

---

## 🧱 Tech Stack

| Layer                | Technology                 |
| -------------------- | -------------------------- |
| Frontend             | Vue 3 + TypeScript (Vite)  |
| UI Framework         | Quasar Framework           |
| State Management     | Pinia                      |
| HTTP / Realtime      | Supabase JS Client         |
| Backend (Serverless) | Supabase (Auth + API + DB) |
| Database             | PostgreSQL (via Supabase)  |
| Deployment           | Vercel                     |
| CI/CD                | GitHub Actions             |

---

## 🎯 MVP Scope

### ✅ Core Features (Must Ship)

1. Create a session (date/event)
2. Add participants to a session
3. Add expenses with payer info
4. Equal-split calculation
5. Balance summary: who owes who

### 🚫 Out of Scope for MVP

- Authentication / login
- Custom (unequal) splits
- Payment confirmation tracking
- Push notifications
- Analytics or spending trends

> These are tracked as **Future Enhancements** — don't implement them until the MVP is stable.

---

## 🧩 Database Schema

### `users`

| Column       | Type        | Notes                       |
| ------------ | ----------- | --------------------------- |
| `id`         | UUID        | Primary key, auto-generated |
| `name`       | TEXT        | Display name                |
| `created_at` | TIMESTAMPTZ | Auto-set                    |

### `sessions`

| Column       | Type        | Notes                                    |
| ------------ | ----------- | ---------------------------------------- |
| `id`         | UUID        | Primary key                              |
| `title`      | TEXT        | e.g., "Dinner at Lusso"                  |
| `date`       | DATE        | Date of the event                        |
| `status`     | TEXT        | `active` or `settled` — default `active` |
| `created_at` | TIMESTAMPTZ | Auto-set                                 |

### `session_users`

| Column       | Type | Notes            |
| ------------ | ---- | ---------------- |
| `session_id` | UUID | FK → sessions.id |
| `user_id`    | UUID | FK → users.id    |

### `expenses`

| Column        | Type          | Notes                                                                 |
| ------------- | ------------- | --------------------------------------------------------------------- |
| `id`          | UUID          | Primary key                                                           |
| `session_id`  | UUID          | FK → sessions.id                                                      |
| `description` | TEXT          | e.g., "Dinner", "Grab ride"                                           |
| `amount`      | NUMERIC(10,2) | In PHP (₱)                                                            |
| `paid_by`     | UUID          | FK → users.id                                                         |
| `category`    | TEXT          | e.g., `food`, `transport`, `accommodation`, `other` — default `other` |
| `created_at`  | TIMESTAMPTZ   | Auto-set                                                              |

### `splits`

| Column       | Type          | Notes               |
| ------------ | ------------- | ------------------- |
| `id`         | UUID          | Primary key         |
| `expense_id` | UUID          | FK → expenses.id    |
| `user_id`    | UUID          | FK → users.id       |
| `amount`     | NUMERIC(10,2) | Each person's share |

### Relationships Diagram

```
users ──┬── session_users ──── sessions
        │                          │
        └── expenses (paid_by)     │
                  │                │
                  └── splits ──────┘
```

---

## ⚙️ Development Phases

### 🔹 Phase 0 — Project Setup

- [ ] Scaffold Quasar project with Vue 3 + Vite + TypeScript: `npm init quasar`
- [ ] Configure ESLint + Prettier
- [ ] Install Zod: `npm install zod`
- [ ] Create Supabase project
- [ ] Run DB migrations to create all tables (including `status` on sessions, `category` on expenses)
- [ ] Set up Supabase client in `src/services/supabase.ts`
- [ ] Configure `.env` with Supabase URL and anon key
- [ ] Push initial repo to GitHub
- [ ] Write `README.md` with local setup instructions (see README section below)

**Exit Criteria:** App boots locally, Supabase connection succeeds, README lets a new dev onboard in under 5 minutes.

---

### 🔹 Phase 1 — Core Data Layer

- [ ] Create `userService` — create and fetch users
- [ ] Create `sessionService` — create and fetch sessions
- [ ] Create `sessionUserService` — add/remove participants
- [ ] Write Pinia stores: `useUserStore`, `useSessionStore`
- [ ] Basic smoke test: create a session with 2 participants via browser console

**Exit Criteria:** Can create a session with participants stored in DB.

---

### 🔹 Phase 2 — Expense Logic _(CORE — highest priority)_

- [ ] Create `expenseService` — add expense, fetch by session
- [ ] Add Zod schema for expense input validation:

```typescript
// types/schemas.ts
import { z } from 'zod';

export const ExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paid_by: z.string().uuid('Invalid payer'),
  category: z.enum(['food', 'transport', 'accommodation', 'other']).default('other'),
  session_id: z.string().uuid(),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;
```

- [ ] Implement equal split calculation:

```typescript
// utils/splitCalculator.ts

export function calculateEqualSplits(
  amount: number,
  participants: string[], // user IDs
): Record<string, number> {
  const share = parseFloat((amount / participants.length).toFixed(2));
  const splits: Record<string, number> = {};
  let distributed = 0;

  participants.forEach((userId, index) => {
    if (index === participants.length - 1) {
      // Last person absorbs rounding remainder
      splits[userId] = parseFloat((amount - distributed).toFixed(2));
    } else {
      splits[userId] = share;
      distributed += share;
    }
  });

  return splits;
}
```

- [ ] Store computed splits in `splits` table on expense creation
- [ ] Unit test split function with edge cases (odd amounts, 3+ people)

**Exit Criteria:** Adding an expense automatically creates correct split records in DB. Invalid inputs are rejected by Zod before reaching Supabase.

---

### 🔹 Phase 3 — Balance Summary

- [ ] Implement balance computation:

```typescript
// utils/balanceCalculator.ts

export interface Balance {
  userId: string;
  paid: number;
  owed: number;
  net: number; // positive = is owed money, negative = owes money
}

export function computeBalances(expenses: Expense[], splits: Split[]): Balance[] {
  const balanceMap: Record<string, Balance> = {};

  // Sum what each person paid
  for (const expense of expenses) {
    if (!balanceMap[expense.paid_by]) {
      balanceMap[expense.paid_by] = { userId: expense.paid_by, paid: 0, owed: 0, net: 0 };
    }
    balanceMap[expense.paid_by].paid += expense.amount;
  }

  // Sum what each person owes
  for (const split of splits) {
    if (!balanceMap[split.user_id]) {
      balanceMap[split.user_id] = { userId: split.user_id, paid: 0, owed: 0, net: 0 };
    }
    balanceMap[split.user_id].owed += split.amount;
  }

  // Compute net
  return Object.values(balanceMap).map((b) => ({
    ...b,
    net: parseFloat((b.paid - b.owed).toFixed(2)),
  }));
}
```

- [ ] Implement debt simplification to minimize transactions:

```typescript
// utils/debtSimplifier.ts

export interface Transaction {
  from: string; // user ID who pays
  to: string; // user ID who receives
  amount: number;
}

export function simplifyDebts(balances: Balance[]): Transaction[] {
  const transactions: Transaction[] = [];

  // Separate into creditors (net > 0) and debtors (net < 0)
  const creditors = balances.filter((b) => b.net > 0).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < 0).map((b) => ({ ...b }));

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = parseFloat(Math.min(Math.abs(debtor.net), creditor.net).toFixed(2));

    transactions.push({ from: debtor.userId, to: creditor.userId, amount });

    debtor.net += amount;
    creditor.net -= amount;

    if (Math.abs(debtor.net) < 0.01) i++;
    if (Math.abs(creditor.net) < 0.01) j++;
  }

  return transactions;
}
```

- [ ] Display result as:
  - `"You owe ₱X to [Name]"` (net < 0)
  - `"[Name] owes you ₱X"` (net > 0)
  - `"You're all settled up!"` (net === 0)
- [ ] Show simplified transaction list: e.g., "3 people, 2 payments needed"

**Exit Criteria:** Correct balances displayed after adding 2–3 expenses. Debt simplification reduces transactions to the minimum possible.

---

### 🔹 Phase 4 — Frontend UI

**Pages:**

| Route           | Component         | Purpose                                 |
| --------------- | ----------------- | --------------------------------------- |
| `/`             | `HomePage.vue`    | List of all sessions (active + settled) |
| `/sessions/:id` | `SessionPage.vue` | Expenses + balance summary              |

**Components:**

- `SessionCard.vue` — Uses `QCard` + `QBadge` for status
- `ExpenseList.vue` — Uses `QTable` for itemized expenses with category icons (`QIcon`)
- `AddExpenseForm.vue` — Uses `QDialog` + `QForm` + `QSelect` for category dropdown
- `BalanceSummary.vue` — Uses `QCard` + `QList` for transaction summary
- `EmptyState.vue` — Uses `QIcon` + centered layout
- `LoadingSpinner.vue` — Uses `QSpinner` or `QInnerLoading`
- `ConfirmDialog.vue` — Uses `QDialog` with `QBtn` confirm/cancel actions

**UI Requirements:**

- [ ] Responsive layout using Quasar's grid system (`QLayout`, `QPage`, `QPageContainer`)
- [ ] Mobile-first with Quasar breakpoints (`xs`, `sm`, `md`)
- [ ] Currency formatted via `formatPHP()` utility — `₱1,234.50` everywhere
- [ ] Disable submit button using `QBtn` `:loading` prop during async ops
- [ ] Optimistic UI: update Pinia store immediately on add/delete, then sync with Supabase
- [ ] Show `EmptyState.vue` when no sessions or no expenses exist
- [ ] Show `ConfirmDialog.vue` before any delete (expense, participant)
- [ ] Session shareable link: `/sessions/:id` is publicly accessible, no login required
- [ ] Session status toggle: mark a session as `settled` using a `QToggle` or `QBtn`
- [ ] Use `QNotify` (Quasar's notification plugin) for all toast messages

**Exit Criteria:** All pages render correctly on mobile and desktop. Delete actions require confirmation. Empty and loading states appear consistently.

---

### 🔹 Phase 5 — Polish & Hardening

- [ ] Wire up `QNotify` for success, error, and info feedback across all actions
- [ ] `QInnerLoading` overlays on all async-driven containers
- [ ] Full form validation using Quasar's built-in `QForm` rules + Zod
- [ ] Prevent duplicate expense submissions (debounce or disable-after-submit)
- [ ] Handle Supabase errors gracefully (network failures, constraint violations)
- [ ] Basic accessibility: `QInput` labels, focus states, ARIA via Quasar defaults

**Exit Criteria:** App handles errors without crashing; no console errors in production.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── SessionCard.vue
│   ├── ExpenseList.vue
│   ├── AddExpenseForm.vue
│   ├── BalanceSummary.vue
│   ├── EmptyState.vue        ← Reusable empty state
│   ├── LoadingSpinner.vue    ← Reusable loading indicator
│   └── ConfirmDialog.vue     ← Reusable delete confirmation
├── pages/
│   ├── HomePage.vue
│   └── SessionPage.vue
├── services/
│   ├── supabase.ts           ← Supabase client init
│   ├── userService.ts
│   ├── sessionService.ts
│   └── expenseService.ts
├── stores/
│   ├── useUserStore.ts
│   └── useSessionStore.ts
├── types/
│   ├── index.ts              ← Shared TypeScript interfaces
│   └── schemas.ts            ← Zod validation schemas
└── utils/
    ├── splitCalculator.ts    ← Equal split logic
    ├── balanceCalculator.ts  ← Net balance logic
    ├── debtSimplifier.ts     ← Minimize transactions algorithm
    └── currency.ts           ← formatPHP() helper
```

---

## 💱 Currency Utility

All monetary values must be formatted through a single utility. Never format currency inline.

```typescript
// utils/currency.ts

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Usage: formatPHP(1234.5) → "₱1,234.50"
```

> Use `formatPHP()` in every component that displays a money value — `BalanceSummary`, `ExpenseList`, `SessionCard`, etc.

---

## 📄 README.md Template

The root `README.md` must allow any developer to get the app running from scratch.

```markdown
# Date Expense Split App

A web app for planning dates and tracking shared expenses.
Built with Quasar + Vue 3 + Supabase.

## Prerequisites

- Node.js 18+
- Quasar CLI: `npm install -g @quasar/cli`
- A Supabase account

## Local Setup

1. Clone the repo
   git clone https://github.com/your-username/date-split-app.git
   cd date-split-app

2. Install dependencies
   npm install

3. Configure environment variables
   cp .env.example .env

   # Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

4. Run database migrations

   # Paste the SQL from /supabase/migrations/ into your Supabase SQL editor

5. Start the dev server
   quasar dev

## Scripts

- quasar dev — Start local dev server
- quasar build — Production build
- npm run type-check — TypeScript check

## Deployment

Deployed on Vercel. Pushes to main trigger production deploys.
```

---

## 🌿 Git Workflow

### Branch Strategy

| Branch      | Purpose                                  |
| ----------- | ---------------------------------------- |
| `main`      | Production — always stable               |
| `dev`       | Integration — tested features merge here |
| `feature/*` | Individual features, branched from `dev` |

### Example Feature Branches

- `feature/add-expense`
- `feature/session-ui`
- `feature/balance-summary`
- `feature/split-calculator`
- `feature/debt-simplifier`
- `feature/optimistic-ui`
- `feature/zod-validation`
- `feature/session-status`

### Workflow

```
1. git checkout dev
2. git checkout -b feature/my-feature
3. Make changes + commit
4. git push origin feature/my-feature
5. Open Pull Request → dev
6. Review + test
7. Merge PR
8. Periodically: merge dev → main for releases
```

### Commit Message Format

```
feat: add equal split calculation
fix: correct rounding on 3-way splits
chore: setup supabase client
test: add unit tests for balanceCalculator
```

---

## 🔐 Environment Variables

### Local — `.env`

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit `.env` to Git. It is already in `.gitignore`.

### Vercel — Dashboard Settings

Add the same two variables under **Project → Settings → Environment Variables**.

---

## 🚀 Deployment

### Vercel Setup

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set **Framework Preset** to `Vite`
4. Add environment variables
5. Deploy

### Preview vs Production

| Branch | Deployment                         |
| ------ | ---------------------------------- |
| `dev`  | Auto-deploys to **preview URL**    |
| `main` | Auto-deploys to **production URL** |

---

## ⚡ GitHub Actions — CI/CD

### `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches:
      - main
      - dev

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Quasar CLI
        run: npm install -g @quasar/cli

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Build project
        run: quasar build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

> Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to GitHub → Settings → Secrets.

---

## 🧠 Future Enhancements

These are intentionally deferred. Do not build until MVP is validated.

| Feature                          | Priority | Notes                        |
| -------------------------------- | -------- | ---------------------------- |
| Supabase Auth (email/magic link) | High     | Needed for real users        |
| Custom unequal splits            | High     | e.g., 60/40 instead of 50/50 |
| Settlement / payment tracking    | Medium   | Mark debts as paid           |
| Share session via link           | Medium   | Invite participants easily   |
| Push notifications               | Low      | Remind people they owe money |
| Spending analytics               | Low      | Trends, categories, totals   |
| PWA / offline support            | Low      | Works without internet       |

---

## ✅ MVP Definition of Done

The MVP is **complete** when all of the following are true:

- [ ] Can create a session with a title and date
- [ ] Can add participants to a session
- [ ] Can add an expense with payer, amount, and category
- [ ] Invalid expense inputs are rejected by Zod before hitting the DB
- [ ] Splits are calculated correctly and stored (rounding handled)
- [ ] Debt simplification shows minimum transactions needed
- [ ] Final balance summary is accurate and readable
- [ ] Session can be marked as `settled`
- [ ] Deleting an expense or participant requires confirmation
- [ ] All amounts displayed via `formatPHP()` — no raw numbers in UI
- [ ] Empty states and loading spinners appear on every async view
- [ ] App is deployed and accessible via public Vercel URL
- [ ] No crashes or unhandled errors on the happy path
- [ ] README lets a new dev run the app locally in under 5 minutes

---

## 🆕 MVP Additions Summary

The following 10 items were added to improve the MVP's quality, correctness, and developer experience:

| #   | Addition                                           | Where Applied                         |
| --- | -------------------------------------------------- | ------------------------------------- |
| 1   | **Session status field** (`active`/`settled`)      | DB Schema → sessions, Phase 4 UI      |
| 2   | **Debt simplification algorithm**                  | Phase 3, `utils/debtSimplifier.ts`    |
| 3   | **Expense categories** (`food`, `transport`, etc.) | DB Schema → expenses, Phase 2         |
| 4   | **Optimistic UI updates** via Pinia                | Phase 4 UI requirements               |
| 5   | **`formatPHP()` currency utility**                 | `utils/currency.ts`, own section      |
| 6   | **Zod input validation**                           | Phase 2, `types/schemas.ts`           |
| 7   | **Confirmation before delete**                     | Phase 4, `ConfirmDialog.vue`          |
| 8   | **Shareable session link**                         | Phase 4, public `/sessions/:id` route |
| 9   | **`EmptyState` + `LoadingSpinner` components**     | Phase 4, `components/`                |
| 10  | **README with local setup instructions**           | Phase 0, README template section      |

---

_Last updated: April 2026_
