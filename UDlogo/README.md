# Handoff: Udoka A.M — monogram logo & favicon

## Overview
A black-and-white monogram mark for **Udoka, A.M**, built for use as a favicon and small-scale brand mark. The mark is a "broken square": a solid slab (reads as **U**) beside an open bracket (reads as **D**), separated by a vertical gutter that carries the split.

## About the Design Files
Everything in this bundle is **final production art plus design reference**:
- `assets/` — ready-to-ship SVG and PNG files. Drop these into your `public/` (or equivalent static) directory as-is. No recreation needed.
- `reference/*.dc.html` — HTML design references showing the mark's construction, size ladder, tab mockups, and lockups. These are prototypes for look/behavior, not production code to copy. If you want the mark as a component in your app (React/Vue/SwiftUI/etc.), recreate it in your codebase's existing patterns using the geometry table below — or just use the SVG.

## Fidelity
**High fidelity.** Colors, geometry, and pixel snapping are final.

## The mark — exact geometry
Authored on a **128 × 128** viewBox. Four rectangles, no curves, no strokes — all fills.

| Part | x | y | width | height |
|---|---|---|---|---|
| Slab (U) | 6 | 14 | 50 | 100 |
| Bracket top arm | 68 | 14 | 52 | 22 |
| Bracket bottom arm | 68 | 92 | 52 | 22 |
| Bracket right stem | 98 | 14 | 22 | 100 |

Derived values: stroke weight **22**, gutter between slab and bracket **12**, vertical padding **14** top and bottom, horizontal extents **6 → 120**.

SVG source (light version, ink on transparent):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect x="6" y="14" width="50" height="100" fill="#111111"/>
  <rect x="68" y="14" width="52" height="22" fill="#111111"/>
  <rect x="68" y="92" width="52" height="22" fill="#111111"/>
  <rect x="98" y="14" width="22" height="100" fill="#111111"/>
</svg>
```

For a dark-mode / knockout version, swap all four fills to `#FFFFFF`.

### If you build it as a component
Percentage positions inside a square container (`position:relative`), so it scales to any size:

| Part | left | top | width | height |
|---|---|---|---|---|
| Slab | 4.69% | 10.94% | 39.06% | 78.13% |
| Top arm | 53.13% | 10.94% | 40.63% | 17.19% |
| Bottom arm | 53.13% | 71.88% | 40.63% | 17.19% |
| Right stem | 76.56% | 10.94% | 17.19% | 78.13% |

Two props: `slabColor` (default `#111111`) and `bracketColor` (default `#111111`).

## Design Tokens
- Ink: `#111111`
- Knockout / dark-mode mark: `#FFFFFF`
- Dark tile background (app icon, dark tab): `#141414`
- Reference-page surfaces: page `#FAFAF9`, card `#FFFFFF`, hairline `#E9E7E3` / `#E3E1DD`, muted text `#6E6A65` / `#8A8681`
- Type (reference page and lockups): **Archivo** 400/500/700 for the wordmark, **JetBrains Mono** 400/500 for labels and code. Wordmark "UDOKA" is Archivo 700, letter-spacing `.02em`; "A.M" is 13px, weight 500, letter-spacing `.34em`.
- No border radius anywhere in the mark. No shadows. No gradients. Two colors only — do not introduce an accent.

## Assets
All in `assets/`:

| File | Use |
|---|---|
| `udoka-mark.svg` | Primary mark, ink on transparent |
| `udoka-mark-dark.svg` | Knockout mark, white on transparent (dark backgrounds) |
| `udoka-mark-tile-dark.svg` | White mark on `#141414` tile |
| `favicon-16.png` … `favicon-512.png` | 16 / 32 / 48 / 128 / 512 px, ink on transparent, pixel-snapped |
| `apple-touch-icon-180.png` | 180 px, white mark on `#141414`, 18px inner padding |

The PNGs are rendered with rounded integer edges at each size so the 16 px version stays crisp — **do not** regenerate them by downscaling the 512, and do not add antialiasing padding.

## Drop-in
```html
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" sizes="16x16">
<link rel="icon" href="/udoka-mark.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```

If you serve a web app manifest, use `favicon-512.png` for the `512x512` entry and `apple-touch-icon-180.png` (or a 512 tile variant) for maskable icons.

## Usage rules
- Minimum size **16 px**. Below that the 12-unit gutter closes and the UD split is lost.
- Clear space: at least **14 units** (11% of the mark's width) on all sides — the same as the built-in vertical padding.
- Never recolor, rotate, outline, or change the gutter width. On mid-tone backgrounds use the tile version rather than the transparent mark.

## Files in this bundle
- `assets/` — production SVG + PNG
- `reference/Udoka Logo.dc.html` — construction and application reference page
- `reference/UDMark.dc.html` — the mark itself as a small reusable design component
