## Droid Factory

Minimal React + Vite + TypeScript app that lists Star Wars films and characters using SWAPI GraphQL, with posters/details from OMDb.

### Prerequisites
- Node.js 18+ and pnpm installed

### 1) Clone and install
```bash
pnpm install
```

### 2) Configure API keys
This project uses OMDb for posters and extra movie details. You need a (free) API key.

Create a `.env` file in the project root:
```bash
# required (get one free at https://www.omdbapi.com/apikey.aspx)
VITE_OMDB_API_KEY=your_omdb_key

# optional: override SWAPI GraphQL endpoint (defaults to swapi-graphql.netlify.app)
# VITE_SWAPI_GRAPHQL_URL=https://swapi-graphql.netlify.app/graphql

# optional: Wookieepedia MediaWiki API base (defaults to starwars.fandom.com/api.php)
# VITE_WOOKIEEPEDIA_API_BASE=https://starwars.fandom.com/api.php
```

Where to get the OMDb key
- Request a key here: https://www.omdbapi.com/apikey.aspx
- After receiving it by email, paste it into `.env` as shown above.

### 3) Run the app
```bash
pnpm dev
```
Open the printed localhost URL (e.g., http://localhost:5173).

### 4) Build and preview (optional)
```bash
pnpm build
pnpm preview
```

### Testing
- Install dev deps (once): `pnpm install`
- Run tests in watch mode: `pnpm test`
- Run tests once (CI): `pnpm test:run`

Tests include:
- Environment check: verifies `VITE_OMDB_API_KEY` is set.
- GraphQL connectivity: makes a small query against SWAPI GraphQL and expects a non-zero films count.

Notes:
- You can override the GraphQL endpoint with `VITE_SWAPI_GRAPHQL_URL` in your `.env`.
- Tests run under Node; they don’t need the dev server running.

### Notes
- Images: character headshots first try Wookieepedia (Fandom) via MediaWiki API, then OMDb, then a film poster fallback.
- If you see missing posters, confirm `VITE_OMDB_API_KEY` is set and valid.
- Tailwind CSS v4 is configured via the CSS-first approach in `src/index.css`.
