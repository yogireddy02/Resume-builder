
# Resume Builder

A small React + Vite project that helps you generate tailored cover letters and resume suggestions using an AI backend (example uses Google Gemini in the client). This README contains setup, development, security notes, and deployment instructions.

## What this project contains

- A Vite + React frontend at the project root (entry: `src/main.jsx`).
- A single main page component at `src/Pages/Home.jsx` which contains the form UI and the AI request logic.
- Build & dev scripts in `package.json` and a GitHub Pages deployment target (`homepage` + `gh-pages` deploy script).

## Quick start (development)

1. Install dependencies

```powershell
cd resume-builder; npm install
```

2. Run the dev server

```powershell
npm run dev
```

3. Open http://localhost:5173 (Vite default) in your browser.

4. Build for production

```powershell
npm run build
```

5. Deploy to GitHub Pages (the repo should be configured and pushed to GitHub)

```powershell
npm run deploy
```

Note: `deploy` runs `predeploy` (build) and then `gh-pages -d dist`.

## Scripts (from `package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle to `dist/`
- `npm run deploy` — build then publish `dist/` to GitHub Pages (requires `gh-pages` and that the repo's remote is set up)

## Project structure

- `index.html` — Vite entry HTML
- `src/main.jsx` — React entry
- `src/App.jsx` — top-level App
- `src/Pages/Home.jsx` — main page and AI integration (form + preview)
- `src/*.css` — styles
- `public/` — static public assets

## Important security note (action required)

While inspecting the code I found a hard-coded Google API key inside `src/Pages/Home.jsx`:

```js
// src/Pages/Home.jsx (excerpt)
headers: {
    'X-goog-api-key': 'AIzaSyAu0dtrTO_KDCjKIT1I2PGY4iMidM35nZs',
    'Content-Type': ''
},
```

This key is embedded in the client bundle and will be exposed publicly if deployed. You should never ship secret or restricted credentials in client-side code. Recommended fixes:

- Remove the key from the frontend. Instead, create a small server-side proxy (Node/Express, Cloud Function, or serverless endpoint) that holds the API key and forwards requests from the frontend. The frontend calls your proxy.
- Use environment variables for non-secret config and server-side secrets for private keys. For example, store the key in an environment variable on the server and reference it from there.
- If you intend to call Google generative models from the browser, prefer using OAuth or endpoints designed for public access with strict quota restrictions — consult Google's documentation.

I left the code as-is but please rotate this key immediately and remove it from the repo history if it's real.

## How the AI integration in `Home.jsx` works (notes)

- `Home.jsx` builds a natural language prompt from form inputs and POSTs to the Google Generative Language API endpoint for `gemini-2.0-flash`.
- The fetch request in the file is missing a proper `Content-Type` header value and may fail. The body is manually serialized as JSON inside a string. Consider using `JSON.stringify()` and set `Content-Type: 'application/json'`.
- Because the code calls Google directly, the client must either expose a valid API key or use a proxy endpoint (recommended).

Example (server proxy) sketch:

```js
// server-side pseudo-code (do NOT run in browser)
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}` },
    body: JSON.stringify({ /* request body */ })
})
```

## Local environment & environment variables

This project currently has no .env handling in the frontend. If you add a server or a build-time key you can use:

- For server-side (Node): store keys in `process.env` (e.g., use a `.env` and `dotenv` for local development).
- For build-time variables used by Vite: use `VITE_` prefixed variables in an `.env` file (these will still be bundled into the client and are not secret).

Example `.env` for Vite (non-secret build-time flags only):

```
VITE_APP_TITLE="Resume Builder"
```

## Known issues & recommended fixes

- Hardcoded API key in `src/Pages/Home.jsx` (security) — fix by moving calls server-side.
- `Content-Type` header is empty in the fetch options — replace with `application/json` and use `JSON.stringify` for the body.
- The UI assumes clipboard API is available; some older browsers may not support `navigator.clipboard`.

## Contribution

If you'd like to contribute:

1. Fork the repo and create a branch: `feature/your-feature`
2. Make changes and include small tests where appropriate
3. Open a pull request with a clear description

## Author

Yogavardhan Reddy
Contact: yogavardhanreddy02@gmail.com

LinkedIn: https://www.linkedin.com/in/yogavardhanreddy

## License

This project does not include a license file. Add one (for example, MIT) if you want to make it open source.

---

If you'd like, I can also:

- Remove the hard-coded key and wire a simple Node proxy in this repo (small, ~50 LOC) so the frontend calls the proxy. (I can implement that next if you want.)
- Fix the fetch call to use `JSON.stringify` and `Content-Type: 'application/json'`.
