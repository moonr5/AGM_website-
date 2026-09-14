# AGM Web

Static website for **PT. Agara Global Maritim (AGM)** — vessel charter, FRP shipbuilding, and marine support services.

| | |
|---|---|
| **Production** | [agmaritim.com](https://agmaritim.com) |
| **Repository** | [moonr5/AGM-WEB](https://github.com/moonr5/AGM-WEB) |
| **Branch** | `main` (auto-deploy) |

---

## Overview

This repository hosts the live static site mirrored from HubSpot CMS, with AGM-specific overrides for branding, English content, mobile layout, and performance. The homepage uses React **islands** (hero, services, fleet, footer) hydrated client-side; custom CSS/JS layers sit on top without modifying vendor bundles.

## Quick start (local)

```powershell
npm install
npm run prepare   # fetch missing assets & rewrite URLs
npm start         # http://localhost:8080
```

Key routes:

- `/` or `/en/` — homepage
- `/en/about` — company profile
- `/en/our-fleet` — fleet listing
- `/en/contacts/` — contact

See [README_LOCAL.md](./README_LOCAL.md) for local-server details.

## Deployment flow

```
edit → commit → push main → Hostinger pulls → agmaritim.com
```

Full checklist: **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deploy pipeline, cache busting, rollback |
| [docs/HOMEPAGE.md](./docs/HOMEPAGE.md) | Homepage islands, CSS/JS architecture, breakpoints |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Branching, commits, PR expectations |
| [README_LOCAL.md](./README_LOCAL.md) | Local dev server & prepare script |

## Project structure

```
AGM/
├── index.html, en/index.html     # Homepage entry points
├── en/                           # English pages & media
├── hubfs/                        # HubSpot assets + AGM overrides
│   └── raw_assets/homepage/179/js_client_assets/assets/
│       ├── agm-mobile.css        # Global mobile (appbar, safe areas)
│       ├── agm-hero-*.css/js     # Hero (shared / desktop / mobile)
│       ├── agm-home-mobile.css   # seaLiving, range, below (mobile)
│       └── agm-smooth.js         # Video preload helpers
├── tools/                        # Local prep & audit scripts
└── docs/                         # Maintainer documentation
```

## Homepage override stack

Load order on `index.html` / `en/index.html`:

1. `agm-mobile.css` — viewport, appbar, safe-area tokens  
2. `agm-hero-shared.css` — hero video visibility, carousel chrome  
3. `agm-hero-desktop.css` — desktop hero layout (`min-width: 769px`)  
4. `agm-hero-mobile.css` + `agm-hero-mobile.js` — mobile hero (`max-width: 768px`)  
5. `agm-home-mobile.css` — downstream sections on mobile  

**Breakpoint:** `768px` / `769px`. Desktop island CSS is never removed; overrides are additive and scoped to media queries.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Serve site at port 8080 |
| `npm run prepare` | Download assets, rewrite external URLs |
| `npm run audit` | Audit missing mirrored assets |
| `npm run audit:unused` | List potentially unused files |
| `npm run clean:unused` | Remove unused files (use with care) |

## Contributing

Please read [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) before opening a pull request.

## License

Proprietary — © PT. Agara Global Maritim. All rights reserved.
