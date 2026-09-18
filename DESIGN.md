# Design System: Payrun

Reading this as: mobile-first Nimiq Pay mini app for team leads running NIM payroll, with official Nimiq identity (Mulish + hexagon + Nimiq palette), leaning toward a typeset payday ledger on Nimiq gray paper.

Dials: VARIANCE 5 / MOTION 3 / DENSITY 5.

## 1. Visual Theme & Atmosphere

A Nimiq payday ledger, not a generic fintech dashboard. Nimiq gray paper, Nimiq-blue ink, gold hex lockup, light-blue radial CTAs. Lined-paper texture on the intro only. Product screens stay documentary: names, amounts, cadence, memos.

## 2. Color Palette & Roles

Official tokens from the [Nimiq Design Kit](https://nimiq.dev/raw/design-kit/index.md) / `nimiq-style` theme.css:

- **Nimiq Gray** (#F4F4F4) — App canvas
- **Nimiq White** (#FFFFFF) — Sheets, memo boxes, inputs
- **Nimiq Blue** (#1F2348) — Primary text, hex lockup plate
- **Mute** (#5C6488) — Secondary labels (blue-tinted gray)
- **Hairline** (rgba(31, 35, 72, 0.1)) — Dividers
- **Nimiq Light Blue** (#0582CA) + radial `#265DD7 → #0582CA` — Primary CTAs, nav active, focus rings
- **Nimiq Gold** (#E9B213) — Hex mark, NIM amounts
- **Nimiq Green** (#21BCA5) — Sent / OK
- **Nimiq Orange** (#FC8702) / wash — Amount jump
- **Nimiq Red** (#D94432) / wash — New name, unresolved

## 3. Typography Rules

- **Display / Body:** Mulish (Nimiq typeface), tracking tight, weight 600–800, headlines 2 lines max on intro (`max-w-5xl`, `clamp(2.25rem, 8vw, 4.5rem)`)
- **Body:** 16px minimum, line-height 1.5
- **Mono:** Geist Mono, tabular amounts, memos, timestamps
- **Banned:** Inter, Roboto, Open Sans, generic serifs in product UI, emojis

## 4. Component Stylings

- **Buttons:** Radius 8px, min-height 52px. Primary uses Nimiq light-blue radial. Secondary hairline on paper. Ghost is light-blue underline. Active: `scale(0.98)` with cubic-bezier(0.32,0.72,0,1).
- **Lockup:** Gold filled hexagon on a Nimiq-blue 8px plate.
- **Rows:** Hairline dividers, not stacked cards-in-cards. 16px vertical padding, 44px+ tap targets. Amounts in gold.
- **Chips:** 4px radius, Nimiq green/orange/red washes, 11px uppercase tracking.
- **Inputs:** Label above, error below. White field, hairline border, light-blue focus ring, 8px radius.
- **Loaders:** Skeletal rules matching row height. No circular spinners.
- **Empty states:** Composed copy plus one action. Example: “No one on the roster yet.” / Add person.

## 5. Layout Principles

Mobile-first single column, 20px page gutters, max-width 430px centered. Bottom nav: Roster / Payday / History. `min-h-[100dvh]`. No desktop-only grids. Intro uses AIDA-lite: hero then a 2x2 gapless bento that collapses to one column.

## 6. Motion & Interaction

Restrained. 180–280ms opacity/transform only. Stagger roster rows 40ms. No GSAP pinning. No floating glass pill nav. Respect `prefers-reduced-motion`.

## 7. Anti-Patterns (Banned)

No emojis, no Inter, no pure black (#000000), no neon glows, no purple AI gradients, no glassmorphism, no 3-column equal cards, no Lucide-thick icons (Phosphor only), no “Elevate/Seamless/Unleash”, no John Doe / Acme, no charts, no GSAP ScrollTrigger in product flows.
