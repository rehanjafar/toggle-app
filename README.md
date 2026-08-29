# Toggle

A single-page personal tracker including habits, one-off tasks, a daily photo journal, a rough calorie log, and an "Honest Hour" focus tracker built with React and Vite, styled with a cat-themed design. Runs entirely client-side with no backend.

## Demo

[Not currently deployed at a stable public URL. Runs locally via the instructions below; `npm run build` produces a static site deployable to any static host (Vercel, Netlify, GitHub Pages).](https://toggle-eta.vercel.app)

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
- Plain CSS via `src/styles.css` — no CSS framework
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for testing
- `localStorage` / `sessionStorage` as the only persistence layer — no backend, no database

## Architecture

```
src/
  App.jsx                  entry component — profile session + top-level routing
  main.jsx                 React root mount
  styles.css                global stylesheet (plain CSS, no framework)
  components/
    ProfileGate.jsx         profile picker / creation / PIN gate
    TrackerApp.jsx           tab shell + Habits/Tasks logic (largest component)
    PhotoJournal.jsx         Photos tab
    DietSection.jsx          Diet tab
    HonestHour.jsx            Hours tab (HourBlockCard + HonestHourSection)
    Tutorial.jsx              first-run walkthrough
    CatMascot.jsx, Paw.jsx    presentational icon components
  hooks/
    useIsWide.js               desktop-breakpoint media query hook
  lib/
    dates.js                 pure date-math helpers (no React, no DOM)
    calories.js               calorie-estimation lookup table + function
    storage.js                 localStorage read/write, validated & hardened
  test/
    setup.js                  vitest + testing-library setup
  *.test.js / *.test.jsx      co-located unit and component tests
```

- **Single view, tab-based navigation.** No router — `TrackerApp` holds a `tab` state string and conditionally renders one of five sections. This is a deliberate choice for an app this size: a client-side router would add a dependency and URL-sync complexity with no real benefit, since there's nothing meaningful to deep-link to.
- **One component per file, one responsibility per component.** Originally the entire app lived in a single ~900-line `App.jsx`. It was split by feature boundary — each tab is its own file, shared UI pieces (`Paw`, `CatMascot`, `Tutorial`) are extracted, and the one cross-cutting hook (`useIsWide`) lives in `hooks/`. `TrackerApp.jsx` is still the largest file (~240 lines) because it owns Habits and Tasks directly rather than splitting those into their own files too — a reasonable next cut if the file keeps growing, but not necessary yet.
- **State model.** Each data type (`habits`, `tasks`, `photos`, `diet`, `hours`) is its own `useState` in `TrackerApp`, passed down to the relevant tab component as props + setters. Derived values (streaks, week completion, sorted/filtered tasks) are computed with `useMemo` rather than stored, so there's a single source of truth per data type.
- **Persistence layer.** `src/lib/storage.js` centralizes all `localStorage` reads/writes behind `loadProfileData` / `saveProfileData`. Every read is defensively parsed and shape-validated (`Array.isArray`, plain-object checks) so a corrupted or unexpected stored value degrades to a safe empty default instead of throwing and blanking the app — this is covered directly by `storage.test.js`. Writes are wrapped in `try/catch` to handle quota-exceeded errors gracefully (surfaced to the user proactively in the Photos tab once usage crosses ~3.5MB, since photo data URLs are the most likely thing to exhaust the ~5–10MB browser limit).
- **Utility modules.** Pure, UI-independent logic — date math (`src/lib/dates.js`) and calorie estimation (`src/lib/calories.js`) — is factored out of components so it's independently readable and testable without rendering anything.

## Technical Decisions

- **Why `localStorage` instead of a backend.** Toggle is a single-user, single-device tool by design intent (a personal tracker, not a shared product), so a backend would add real cost (hosting, auth, a database) without adding real functionality for the current use case. The tradeoff is explicit and disclosed in the UI: no cross-device sync, and browser storage limits (~5–10MB) cap how many photos can realistically be stored.
- **Why the PIN isn't real authentication.** Profile PINs are stored in plain text in `localStorage` and only exist to stop one person from accidentally opening another profile on a shared device (e.g. a shared family computer). This is disclosed directly in the UI's profile-creation screen. It should never be treated as an actual security boundary.
- **Why calorie estimates use a keyword lookup instead of a real nutrition API.** The goal was a fast, zero-dependency, zero-cost rough estimate for casual logging, not dietary accuracy. This is disclosed on-screen every time a calorie total is shown.
- **What would change for a real multi-device product.** Swap `localStorage` for a real backend (e.g. Postgres + a lightweight API, or a BaaS like Supabase) behind the same `loadProfileData`/`saveProfileData` interface, replace the PIN gate with real auth, and move photo storage to object storage (e.g. S3) instead of inline base64 data URLs.

## Testing

```bash
npm test          # run the full suite once
npm run test:watch  # re-run on file changes
```

44 tests across 4 files, using [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/):

- `src/lib/dates.test.js` — date-math edge cases (month/year rollover, week-start convention, calendar grid padding)
- `src/lib/calories.test.js` — lookup behavior, case-insensitivity, the zero-calorie/falsy-value edge case, and an intentionally-documented ordering quirk in the table (see the test file for details — it's a real finding, not a hypothetical)
- `src/lib/storage.test.js` — the validation/hardening logic: corrupted JSON, wrong-shaped data, per-field fallback defaults, profile isolation, and simulated quota-exceeded failures
- `src/components/ProfileGate.test.jsx` — profile creation, duplicate-name prevention, localStorage persistence, and the PIN gate (correct/incorrect PIN)

Coverage is intentionally concentrated on the persistence layer and the logic most likely to silently break (date math, data validation) rather than spread thin across every component.

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

- **Split `TrackerApp.jsx` further** — it's still the largest file (~240 lines) since it owns Habits and Tasks directly. Extracting those into their own components would mirror what was already done for Photos/Diet/Hours.
- **Component tests for the remaining tabs** (`PhotoJournal`, `DietSection`, `HonestHour`) — currently only `ProfileGate` has component-level coverage; the others are covered indirectly through their underlying `lib/` logic.
- **Optional cloud sync**, if this ever needs to work across devices — see Technical Decisions above for the shape that would take.
