# Portfolio

Next.js (App Router). Static — every route prerenders at build time.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the build
```

## Where things live

| Path | What it is |
|---|---|
| `content/` | Every word and figure on the site. Edit here, not in components. |
| `components/` | One `.jsx` + one `.module.css` per section. |
| `lib/` | `useCountUp` (ledger animation), `theme` (dark mode). |
| `app/globals.css` | Design tokens, reset, and the shared `.wrap` / `.label` / `.section` primitives. |
| `app/layout.js` | Fonts, metadata, and the no-flash theme script. |

## The trial balance

`content/ledger.js` is the one file with logic in it. Debits are what was built,
credits are what it was built on, and **"Hours invested" is derived, never typed**:

```js
value: DR_TOTAL - CR_FIXED_TOTAL
```

Change any other figure and hours moves to keep the columns in agreement. That is
the only way a trial balance is ever allowed to balance. Both columns currently
sum to 3,135.

The `Difference` row is hardcoded to render `DR_TOTAL - CR_TOTAL`. If it ever
shows anything but `0.00`, the arithmetic above broke.

## Theming

Three states: explicit light, explicit dark, or no stored choice (follow the OS).

- Tokens are defined once on `:root`, then redefined in two places — a
  `prefers-color-scheme` block guarded by `:not([data-theme="light"])`, and a
  `[data-theme="dark"]` block. Both are needed so the toggle wins in either
  direction.
- `NO_FLASH_SCRIPT` in `lib/theme.js` runs inline in `<head>` and sets the
  attribute before first paint, so the wrong palette never flashes.
- Every `localStorage` access is wrapped — it throws in a private window.

## Motion

The count-up is decoration; the figures are content. It lands on the real number
immediately under `prefers-reduced-motion`, and in a hidden tab — where
`requestAnimationFrame` never fires at all, so an animated-only figure would
render `0.00` to anything screenshotting the page.

## Still to do

- `#cv` currently anchors to the footer. Point it at a real CV.
- `content/writing.js` entries take an optional `href`; without one they render
  as plain text rather than a dead link. Add links as pieces are published.
- Ecosystems count in `content/ledger.js` is flagged `TODO` — placeholder pending
  the full historical list.
- No `opengraph-image`. Add one before sharing the link anywhere.
