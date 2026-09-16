# AGM Marine Intelligence

Operational vessel picture for PT. Agara Global Maritim. Demo mode runs with no API key.

```bash
npm install
npm run dev
```

Open the URL Vite prints. The map loads Indonesian waters with labeled **DEMO DATA**.

The desk uses Leaflet for the map so it runs without a WebGL stack.

## Live Data Docked feed

The browser never sends an API key. Vite (and the AGM local server) proxy requests to Data Docked.

Copy `.env.example` to `.env` and set `DATADOCKED_API_KEY`. Then choose **LIVE** in the sidebar.

Documented endpoints used:

- `GET /get-vessels-by-area`
- `GET /get-vessel-info`
- `GET /get-vessel-historical-data`
- `GET /port-calls-by-port`

If live fails, the desk stays on **DEMO DATA** and says so.

## Site subpage

`npm run build` writes the app to `/en/marine-intelligence/` on the AGM static site.
