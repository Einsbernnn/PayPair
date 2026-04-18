# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PairPay (package name `paypair`, display `PayPair`) — a Quasar/Vue 3 PWA for planning date sessions, tracking shared expenses, and computing who-owes-who balances. Backend is Supabase (Auth + Postgres). Deployed on Vercel.

See `PairPay_MVP_documentation.md` for the full spec: DB schema, split algorithm, debt simplification, MVP scope, and Definition of Done. When extending core domain logic (splits, balances, debt simplification, Zod schemas, DB tables), cross-check against that doc — it is the source of truth for business rules.

## Commands

- `npm run dev` — Quasar dev server in **PWA mode** (`quasar dev -m pwa`). Not plain SPA — the service worker registers in dev too.
- `npm run build` — `quasar build` (production). Note: the repo's `quasar.config.ts` sets `vueRouterBase: '/PayPair/'`, so built assets expect to be served under `/PayPair/`. If deploying at a different path, update `vueRouterBase`.
- `npm run lint` — ESLint flat config against `./src*/**/*.{ts,js,cjs,mjs,vue}` (covers `src/` and `src-pwa/`).
- `npm run format` — Prettier across the repo.
- `npm test` — Placeholder (`echo "No test specified"`); no test framework is wired up yet despite the MVP doc calling for unit tests on `splitCalculator` etc.
- Type checking is enforced at build time via `vite-plugin-checker` with `vueTsc: true` (see `quasar.config.ts`), not as a standalone script.
- `postinstall` runs `quasar prepare` — required after `npm install` to generate the `.quasar/` tsconfig that the root `tsconfig.json` extends.

## Environment

`.env` (never committed) must define:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Note: the code uses `VITE_SUPABASE_PUBLISHABLE_KEY` (not the `VITE_SUPABASE_ANON_KEY` name from the MVP doc / older Supabase convention). `src/services/supabase.ts` throws on startup if either is missing.

## Architecture

### Layered data flow

```
Vue components / pages
        │
        ▼
Pinia stores (src/stores) ── hold reactive state, orchestrate services, handle optimistic UI
        │
        ▼
Services (src/services)    ── thin wrappers over Supabase queries; throw on error
        │
        ▼
Supabase client (src/services/supabase.ts, boot via src/boot/supabase.ts)
```

Components should not call Supabase directly — go through a store, which calls a service. The one exception is `src/services/auth.ts` (OAuth redirect helpers) which the auth store wraps.

### Core domain math (do not duplicate inline)

All monetary and balance logic lives in `src/utils/` and is pure/testable:

- `splitCalculator.ts` — `calculateEqualSplits()`. The **last participant absorbs the rounding remainder** so splits sum exactly to the total. Preserve this invariant.
- `balanceCalculator.ts` — per-user `{ paid, owed, net }`.
- `debtSimplifier.ts` — greedy creditor/debtor matching; rounds to 0.01 to terminate.
- `currency.ts` — `formatPHP()` via `Intl.NumberFormat('en-PH', 'PHP')`. **Never format currency inline** — always call this helper.

`expenseService.addExpense` computes splits via `calculateEqualSplits` and writes both the `expenses` row and the `splits` rows in sequence. If you add new expense types (unequal, percentage), extend the calculator — don't inline the math at the service layer.

### Validation boundary

Input validation uses Zod in `src/types/schemas.ts` (e.g. `ExpenseSchema`). Validate at the form/store boundary **before** calling services. Services themselves don't re-validate; they trust their inputs and surface Supabase errors by throwing.

### Auth flow (Supabase PKCE)

- Client is created with `flowType: 'pkce'` and `detectSessionInUrl: true` (`src/services/supabase.ts`).
- `src/boot/supabase.ts` calls `authStore.init()` on app boot.
- `useAuthStore.init()` attaches `onAuthStateChange` and resolves on the `INITIAL_SESSION` event, with a 5s safety timeout so the app never hangs.
- The router guard in `src/router/index.ts` awaits `authStore.init()` on first navigation, then redirects non-public routes to `/auth` when logged out, and away from `/auth` when logged in. Routes opt in to being public with `meta.public: true` (currently `auth` and `auth/callback`).
- OAuth redirect target is `${origin}${import.meta.env.BASE_URL}auth/callback`. Because `BASE_URL` is `/PayPair/` in production builds, the callback URL differs between local dev (usually `/`) and production — both must be registered in Supabase's allowed redirect URLs.

### Routing

`src/router/routes.ts` nests all app routes under `MainLayout.vue`. Route titles use `makePageTitle()` from `src/constants/app.ts` and are applied to `document.title` in an `afterEach` hook. New protected pages need no extra config; new public pages must set `meta.public: true`.

### Quasar specifics

- Quasar CLI + Vite. Configured via `quasar.config.ts`, not `vite.config.ts`. To extend Vite, use `build.extendViteConf` inside `quasar.config.ts`.
- Boot files registered in `boot: ['supabase']` run before the Vue app mounts — use these for cross-cutting init (store setup, client initialization).
- Only the `Notify` Quasar plugin is enabled. If adding `Dialog`, `Loading`, etc., register them in `framework.plugins`.
- PWA mode is the default (`dev`/`build` both produce a PWA). Service worker strategy is `GenerateSW` (Workbox). Custom SW code lives in `src-pwa/custom-service-worker.ts` but is only used if `workboxMode` switches to `InjectManifest`.
- TypeScript uses path-style imports (`layouts/MainLayout.vue`, `pages/...`, `src/services/...`) enabled by Quasar's generated `.quasar/tsconfig.json`. These only resolve after `quasar prepare` has run.

## Conventions

- Stores expose refs + actions via the composition API (`defineStore('name', () => { ... })`). Follow this pattern, not options-API stores.
- Services export named async functions that throw `Error(message)` on failure — they do not return `{ data, error }` tuples. Stores catch and surface errors to the UI (typically via `Notify`).
- Optimistic UI pattern in `useSessionStore.deleteExpense` (snapshot → mutate → revert on throw). Reuse this pattern for other delete/update flows.
- Money values: store as `number` (NUMERIC(10,2) in DB), display via `formatPHP()`.
- Route base path is `/PayPair/`; use `import.meta.env.BASE_URL` when constructing absolute URLs (see `services/auth.ts`), never hardcode `/`.
