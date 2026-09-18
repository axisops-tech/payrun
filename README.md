# Payrun

Pay people by name, not by address. Payrun is a Nimiq Pay mini app for team leads who send recurring NIM payroll to handles (`@raph`) instead of raw addresses.

It runs inside the Nimiq Pay mobile WebView. Wallet keys never leave the wallet. Every send and handle-claim is one explicit confirmation in Nimiq Pay.

## What it does

- Roster of handles, NIM amounts, and cadence (weekly / biweekly / monthly)
- Prepare a payday, flag new names, amount jumps (>25%), and unresolved handles
- Send one-by-one with memo `payrun:{period}:@{handle}` — no queued blast
- Personal history lookup by handle
- Payday log of every past run
- Claim a handle by signing `payrun:claim:@name`

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
| `/roster` | Handles, amounts, cadence |
| `/payday` | Prepare / flag / review |
| `/payday/send` | One-by-one send |
| `/history` | Lookup a handle |
| `/log` | Past payday log |
| `/claim` | Bind a handle |

## Production

```bash
npm run build
npx prisma migrate deploy
npm start
```

Railway (and similar) should provide `PORT` and `DATABASE_URL`. The start command runs `prisma migrate deploy` then `next start`.

## Honest limits

Payrun does not custody keys, does not batch-sign, and does not invent a shielded pool. Unclaimed handles stay unresolved until the person signs a claim.
