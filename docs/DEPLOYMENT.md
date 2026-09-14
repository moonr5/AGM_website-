# Deployment

## Pipeline

```mermaid
flowchart LR
  A[Local edits] --> B[git commit]
  B --> C[git push origin main]
  C --> D[GitHub moonr5/AGM-WEB]
  D --> E[Hostinger auto-deploy]
  E --> F[agmaritim.com]
```

| Stage | Detail |
|-------|--------|
| Source branch | `main` |
| Remote | `https://github.com/moonr5/AGM-WEB.git` |
| Hosting | Hostinger (static pull from GitHub) |
| Live URL | https://agmaritim.com |

## Pre-push checklist

1. **Test locally** — `npm start`, check `/` and `/en/` at desktop and mobile widths.
2. **Cache bust** — bump `?v=N` on any changed CSS/JS linked from `index.html` or `en/index.html`.
3. **Scope** — mobile-only fixes belong in `agm-*-mobile.css` / `agm-hero-mobile.js`, not in island vendor bundles.
4. **No secrets** — never commit `.env`, API keys, or Hostinger credentials.
5. **Large media** — keep hero video (`en/p8.mp4`) under deploy limits; use Git LFS if needed.

## Cache busting

Homepage assets use query-string versions:

```html
<link rel="stylesheet" href=".../agm-home-mobile.css?v=2">
<script defer src=".../agm-hero-mobile.js?v=4"></script>
```

Increment `v` whenever the file content changes so production browsers skip stale caches.

## Verify production

After deploy (allow 1–5 minutes):

1. Hard refresh on phone (or private window).
2. Confirm hero video plays and sections scroll (Services → Fleet → About).
3. Check DevTools → Network that new `?v=` values load.

## Rollback

```bash
git revert <commit-sha>
git push origin main
```

Or reset to a known-good commit on `main` and force-push **only** if you understand the impact on Hostinger sync.

## What not to deploy

- `node_modules/`
- `local-server.err`, debug scripts under `tools/` (unless intentionally added)
- `en/p8-deploy.mp4`, `en/p8-original.mp4` (gitignored staging files)
