# Payrun

[![Payrun](public/social/banner.png)](https://payrun.up.railway.app)

## Live

**Web app:** [https://payrun.up.railway.app](https://payrun.up.railway.app)

Open that URL in a browser, or paste it into Nimiq Pay → Mini Apps.

Pay people by name. Payrun is a Nimiq Pay mini app for team leads who send recurring NIM payroll. Each person on the roster has a name and a Nimiq wallet — Nimiq has no username protocol, so the send always goes to the address on file.

It runs inside the Nimiq Pay mobile WebView. Wallet keys never leave the wallet. Every send is one explicit confirmation in Nimiq Pay.

## What it does

- Roster of username + Nimiq wallet, NIM amount, and cadence (weekly / biweekly / monthly)
- Prepare a payday, flag new names, amount jumps (>25%), and missing wallets
- Send one-by-one with memo `payrun:{period}:@{username}` — no queued blast
- Personal history lookup by username
- Payday log of every past run
- Optional: confirm a username for the connected wallet

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma + PostgreSQL (schema `payrun` on a shared database)
- `@nimiq/mini-app-sdk` for NIM sends and message signing
- Tailwind v4, Mulish, official Nimiq colors (`#1F2348`, `#0582CA`, `#E9B213`, `#21BCA5`)
- Phosphor icons, mobile-first `min-h-[100dvh]`, 375px WebView

## Shared database (no conflicts with StealthPay)

Both mini apps can use **one** Supabase (or any Postgres) project.

| App        | Schema        | Tables |
|------------|---------------|--------|
| Payrun     | `payrun`      | `handles`, `roster_entries`, `pay_cycles`, `pay_items` |
| StealthPay | `stealthpay`  | `businesses`, `invoices`, `viewing_grants`, `settlements` |

Use the **direct** connection string (port `5432`), not the transaction pooler (`6543`). Set the same `DATABASE_URL` on both apps.

```bash
cp .env.example .env
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
npx prisma migrate deploy
```

Payrun’s migration is named `20260918120000_payrun_init` so it will not collide with StealthPay’s row in `_prisma_migrations`.

## Develop

```bash
cd payrun
npm install
cp .env.example .env
npx prisma migrate deploy
npm run dev
```

Dev server: `http://localhost:3010` (binds `0.0.0.0` for LAN).

1. Phone and computer on the same Wi-Fi.
2. Open Nimiq Pay → Mini Apps → paste `http://192.168.x.x:3010`.
3. If the WebView cannot hydrate, add the LAN host to `allowedDevOrigins` in `next.config.ts`.
4. Test NIM: long-press Settings for 10 seconds, switch to Testnet.

## Surfaces

| Route | Purpose |
|-------|---------|
| `/` | Intro |
| `/roster` | Username, wallet, amounts, cadence |
| `/payday` | Prepare / flag / review |
| `/payday/send` | One-by-one send |
| `/history` | Lookup a username |
| `/log` | Past payday log |
| `/claim` | Optional username confirmation |

## Production

```bash
npm run build
npx prisma migrate deploy
npm start
```

Live deployment: https://payrun.up.railway.app

Railway (and similar) should provide `PORT` and `DATABASE_URL`. The start command runs `prisma migrate deploy` then `next start`.

## Honest limits

Payrun does not custody keys, does not batch-sign, and does not invent a Nimiq username protocol. Add both a local username and the recipient wallet on the roster.
