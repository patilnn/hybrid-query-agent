# Job Search Query Agent

This repository contains a lightweight, full-stack job search assistant that generates Boolean and Google X-Ray queries for six popular job boards (LinkedIn, Indeed, Naukri, Glassdoor, Reed, and TotalJobs). The React frontend collects the role, skills, location, seniority, and work-preference inputs, then sends them to the Express backend. The backend sanitizes the inputs, maps the preference flags to keywords (e.g., “hybrid”, “on-site”, “internship”), and builds the base Boolean string plus both the native site query and the `site:<domain>` X-Ray variation for each target platform.

## Key Features

- **Interactive Form:** Frontend reuses a single form to collect role, comma-separated skills, location, seniority, and preference checkboxes (Hybrid, On-site, Internship).
- **Preference-aware Boolean Builder:** Backend injects preference keywords into the Boolean clauses before joining them with role, skills, and location segments.
- **Per-site Output:** Each site rule includes a domain/name pair so the controller can emit both the “native” boolean string and the Google X-Ray string (prefixed with `site:`).
- **Copy-ready UI:** Results render in cards with copy buttons for quick pasting into job boards or Google searches.

## Architecture Overview

1. **Client (Vite + React):**
   - `src/App.jsx` renders the form, handles preference toggles, posts JSON to `/api/queries`, and displays the returned Boolean/X-ray strings with copy actions.
   - `src/App.css` styles the cards, chip rows, and preference controls.
   - `src/main.jsx` bootstraps the React tree.

2. **Server (Express + Node):**
   - `server/index.js` loads `dotenv`, applies CORS and JSON parsing, mounts `/api` routes, and starts the listener on `process.env.PORT` (default `5000` via `server/.env`).
   - `server/routes/agent.js` exposes `/api/queries`.
   - `server/controllers/agentController.js` validates the payload, cleans the input (with `sanitizeInput`), and calls the query builder.
   - `server/services/queryGenerator.js` runs helpers (`normalizeSkills`, `quote`, preference keyword mapping) to produce the base Boolean string, site queries, and X-ray versions.
   - `server/services/siteRules/*.js` define `key`, `label`, and `domain` for each supported job board.

3. **Environment:**
   - `dotenv` loads `NODE_ENV` and `PORT` defaults from `server/.env`.

## Getting Started

### Prerequisites

- Node.js 20+ (the repo relies on ES modules).
- npm (bundled with Node.js).

### Install Dependencies

```bash
npm install        # install Vite/react deps (root)
cd server && npm install  # install Express backend deps
```

### Run the App

Open two terminal tabs:

1. **Frontend:**  
   ```bash
   npm run dev        # from the root directory
   ```
2. **Backend:**  
   ```bash
   cd server
   npm run dev        # starts Express server on PORT from .env (default 5000)
   ```

The frontend assumes the server sits at `http://localhost:5000` by default (`src/App.jsx`), but the API base can be overridden through `VITE_API_BASE` in a `.env` file at the project root if you need a different address.

## Environment Variables

| Variable   | Default | Description |
|------------|---------|-------------|
| `NODE_ENV` | `development` | Controls Express/React behavior for logging, etc. |
| `PORT`     | `5000`        | Port that the backend listens on. |

Drop any overrides into `server/.env` (already tracked) or export them before starting the server.

## API Reference

- **POST `/api/queries`**
  - Payload:
    ```json
    {
      "role": "Frontend Developer",
      "skills": "React, TypeScript, Next.js",
      "location": "Bangalore",
      "seniority": "Mid",
      "preferences": ["hybrid", "internship"]
    }
    ```
  - Response:
    ```json
    {
      "input": { ... },
      "booleanQuery": "...",
      "siteQueries": {
        "linkedin": "...",
        ...
      },
      "xrayQueries": { ... }
    }
    ```
  - The response always includes the sanitized input, the base Boolean string, and each site’s query plus its X-ray variant.

- The backend only requires the `role` property to be present; missing optional fields default to empty strings, and preferences are optional arrays of the keys `hybrid`, `onSite`, or `internship`.

## Project Layout

```
.
├── public/              # Static assets for Vite
├── server/
│   ├── controllers/
│   │   └── agentController.js
│   ├── routes/           # Express routers
│   │   └── agent.js
│   ├── services/
│   │   ├── queryGenerator.js
│   │   └── siteRules/    # Domain metadata per job board
│   ├── utils/
│   │   └── sanitize.js
│   ├── .env              # NODE_ENV/PORT defaults
│   ├── index.js          # Express entry
│   └── package.json
├── src/
│   ├── App.jsx           # Main interface
│   ├── App.css
│   └── main.jsx          # React bootstrap
├── package.json          # Vite scripts (dev/build/etc.)
└── eslint.config.js
```

## Styling & UX Notes

- Preference checkboxes render as pill-like controls inside `.preference-options`.
- Results show a base query card plus a grid of per-site cards, each with copy buttons for both the site query and the Google X-ray variant.

## Testing & Validation

- No automated tests are included yet; manual testing consists of running both servers and verifying:
  1. The form submits without errors.
  2. Preference selections appear in the `booleanQuery`.
  3. Copy buttons successfully place text onto the clipboard.

## Extending the Agent

1. Add/remap keywords in `PREFERENCE_KEYWORDS` inside `queryGenerator.js` to support additional preference styles (e.g., “remote-first”).
2. Insert new job boards by adding files under `server/services/siteRules/` and they will automatically appear in the output.
3. Wire the backend to a database or caching layer if you need to persist query history or run analytics.

## Contributing & Publishing

1. Update the README with any new APIs, scripts, or architecture changes.
2. Run `npm run lint` from the root before pushing.
3. Commit both the frontend and backend changes together.

Once ready, push your branch to GitHub and open a PR. The project is licensed under MIT (add a LICENSE file if you need to specify it explicitly).
