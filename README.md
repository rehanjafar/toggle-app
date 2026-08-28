# Toggle

A single-page personal tracker — habits, one-off tasks, a daily photo journal, a rough calorie log, and an "Honest Hour" focus tracker — built with React and Vite, styled with a cat-themed black/hot-pink identity. Runs entirely client-side with no backend.

## Demo

Not currently deployed at a stable public URL. Runs locally via the instructions below; `npm run build` produces a static site deployable to any static host (Vercel, Netlify, GitHub Pages).

## Features

- **Habits** — weekly grid view, per-habit streak counting, toggle any past day (not just today)
- **Tasks** — due dates, priority levels (high/medium/low), open/done/all filtering, automatic overdue highlighting
- **Photos** — a monthly calendar; pick any day, attach one or more photos with a note, browse past days
- **Diet** — free-text food logging with a rough calorie estimate from a small built-in keyword lookup (explicitly not a nutrition database — see Technical Decisions)
- **Honest Hour** — a focus-tracking tool: for a chosen hour, set an intention, a concrete "finish line," any number of custom freeform label/value fields you define yourself, and a short honest post-hour review
- **Profiles** — multiple named profiles on one device/browser, with an optional numeric PIN to switch between them (a local gate, not real authentication — see Technical Decisions)
- **First-run tutorial** — a short interactive walkthrough, replayable at any time

## Tech Stack

- [React 18](https://react.dev/) (function components, hooks — no external state management library)
- [Vite 5](https://vitejs.dev/) for dev server and static build
- [lucide-react](https://lucide.dev/) for icons
- Plain CSS-in-JS via a single injected `<style>` tag — no CSS framework
- `localStorage` / `sessionStorage` as the only persistence layer — no backend, no database

## Architecture

- **Single view, tab-based navigation.** No router — `TrackerApp` holds a `tab` state string and conditionally renders one of five sections (`Habits`, `Tasks`, `Photos`, `Diet`, `Hours`). This is a deliberate choice for an app this size: a client-side router would add a dependency and URL-sync complexity with no real benefit, since there's nothing meaningful to deep-link to.
- **State model.** Each data type (`habits`, `tasks`, `photos`, `diet`, `hours`) is its own `useState` in `TrackerApp`, lifted down to the relevant tab component as props + setters. Derived values (current streak, week completion, sorted/filtered tasks) are computed with `useMemo` rather than stored, so there's a single source of truth per data type.
- **Persistence layer.** `src/lib/storage.js` centralizes all `localStorage` reads/writes behind `loadProfileData` / `saveProfileData`. Every read is defensively parsed and shape-validated (`Array.isArray`, plain-object checks) so a corrupted or unexpected stored value degrades to a safe empty default instead of throwing and blanking the app. Writes are wrapped in `try/catch` to handle quota-exceeded errors gracefully (surfaced to the user proactively in the Photos tab once usage crosses ~3.5MB, since photo data URLs are the most likely thing to exhaust the ~5–10MB browser limit).
- **Utility modules.** Pure, UI-independent logic — date math (`src/lib/dates.js`) and calorie estimation (`src/lib/calories.js`) — is factored out of the component file so it's independently readable and testable.
- **Component file.** `src/App.jsx` still holds all UI components in one file. This is a known limitation, not an oversight — see Future Improvements.

## Technical Decisions

- **Why `localStorage` instead of a backend.** Toggle is a single-user, single-device tool by design intent (a personal tracker, not a shared product), so a backend would add real cost (hosting, auth, a database) without adding real functionality for the current use case. The tradeoff is explicit and disclosed in the UI: no cross-device sync, and browser storage limits (~5–10MB) cap how many photos can realistically be stored.
- **Why the PIN isn't real authentication.** Profile PINs are stored in plain text in `localStorage` and only exist to stop one person from accidentally opening another profile on a shared device (e.g. a shared family computer). This is disclosed directly in the UI's profile-creation screen. It should never be treated as an actual security boundary.
- **Why calorie estimates use a keyword lookup instead of a real nutrition API.** The goal was a fast, zero-dependency, zero-cost rough estimate for casual logging, not dietary accuracy. This is disclosed on-screen every time a calorie total is shown.
- **What would change for a real multi-device product.** Swap `localStorage` for a real backend (e.g. Postgres + a lightweight API, or a BaaS like Supabase) behind the same `loadProfileData`/`saveProfileData` interface, replace the PIN gate with real auth, and move photo storage to object storage (e.g. S3) instead of inline base64 data URLs.

## Running Locally

Requires [Node.js](https://nodejs.org) (LTS) and npm.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

To produce a production build:

```bash
npm run build
```

Outputs a static site to `dist/`, deployable to any static host.

## Future Improvements

- **Split `App.jsx` into per-component files** (`components/`, one file per tab/section). The file currently holds every component in the app; it works and builds cleanly, but it's the single largest maintainability gap in the codebase and the next thing to fix.
- **Move inline CSS-in-JS to a real `.css` file** imported via Vite, for normal syntax highlighting/tooling instead of a giant template string.
- **Add a lightweight test** around `src/lib/storage.js`'s validation logic (pure functions, no DOM — the easiest and highest-value place to start testing this codebase).
- **Optional cloud sync**, if this ever needs to work across devices — see Technical Decisions above for the shape that would take.
