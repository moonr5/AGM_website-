# AGM Local Site

> **Main documentation:** see [README.md](./README.md) and [docs/](./docs/).

This backup is a static mirror, so it needs to be served from the site root instead of opened by double-clicking an HTML file.

Run:

```powershell
npm run prepare
npm start
```

Then open:

```text
/
```

Useful pages:

```text
/en/
/en/brand-representative
/en/about
/en/our-fleet
```

`npm run prepare` downloads missing mirrored assets and rewrites Sanlorenzo/HubSpot asset URLs to local paths. `npm start` serves the site from the repository root and supports extensionless routes like `/en/about`.
