# Homepage architecture

The AGM homepage is a HubSpot static export with four hydrated **islands**:

| Island ID | Section | Island bundle |
|-----------|---------|---------------|
| `#hero` | Full-screen hero + manifest + video carousel | `island-DKwCZMR6.js` |
| `#seaLiving` | Services carousel (charter, shipbuilding, support) | `island-Dn4nrtOY.css` + JS |
| `#range` | Fleet / range slider | `island-D0xuzvwo.css` + JS |
| `#below` | About, services grid, map, footer | `island-BHS-UEXq.css` + JS |

Vendor island CSS uses desktop-first layout (`100vh`, GSAP ScrollTrigger pin on hero). AGM overrides live in separate files under `hubfs/raw_assets/homepage/179/js_client_assets/assets/`.

## CSS layers

```
┌─────────────────────────────────────────┐
│  Island CSS (HubSpot, do not edit)      │
├─────────────────────────────────────────┤
│  agm-mobile.css        ≤768 / ≤1200     │  appbar, safe-area, page shell
│  agm-hero-shared.css   all              │  video visibility, hide carousel UI
│  agm-hero-desktop.css  ≥769px           │  desktop hero layout
│  agm-hero-mobile.css   ≤768px           │  fullscreen hero, stacked copy
│  agm-home-mobile.css   ≤768px           │  seaLiving, range, below
└─────────────────────────────────────────┘
```

## Mobile hero flow (≤768px)

1. `agm-hero-mobile.js` sets `--agm-hero-h`, `--agm-appbar-h`, `--agm-hero-copy-h`.
2. Hero pinned section height = viewport minus dynamic appbar (not `600dvh`).
3. `disableHeroScrollPin()` kills GSAP ScrollTrigger pin after island hydration.
4. Manifest + carousel headline stack at bottom; manifest body hidden to avoid overlap.
5. Custom smooth-scroll in `index.html` is **skipped** on mobile so touch scroll works.

## Mobile sections flow (≤768px)

`agm-home-mobile.css`:

- Removes full-viewport `min-height: 100svh` gaps from Services / Fleet / About.
- Uses compact card heights and consistent `--agm-mobile-pad` (16px + safe area).
- Collapses GSAP `pin-spacer` elements between sections.
- Sets `.body-wrapper.page` vertical padding to `0` on homepage.

## Desktop hero flow (≥769px)

- GSAP ScrollTrigger pins hero during scroll-scrub animation.
- `_main_ty1x2_1` retains island `600dvh` scroll distance.
- Custom wheel smooth-scroll runs (see inline script at bottom of `index.html`).

## Editing guidelines

| Goal | Where to edit |
|------|----------------|
| Mobile appbar / nav | `agm-mobile.css` |
| Hero desktop only | `agm-hero-desktop.css` |
| Hero mobile only | `agm-hero-mobile.css`, `agm-hero-mobile.js` |
| Services / fleet / footer mobile | `agm-home-mobile.css` |
| Hero manifest copy | `agm-hero-manifest.js` + HTML SSR block |
| Never | Minified `island-*.js` unless re-exporting from HubSpot |

## Breakpoints

| Query | Usage |
|-------|--------|
| `max-width: 768px` | Primary mobile homepage overrides |
| `min-width: 769px` | Desktop hero |
| `max-width: 1200px` | Mobile appbar two-row layout |
