# Toggle

A cat-themed personal habit + task tracker with a daily photo journal and a rough calorie log. Black + hot pink theme, no gradients.

## Features
- Habit tracking with weekly grid and streaks
- Task manager with due dates and priority
- Profile switcher (name + optional PIN — local device gate, not secure multi-user auth)
- First-run interactive tutorial
- Photo journal on a monthly calendar, multiple photos per day with notes
- Diet log with rough calorie estimates from a built-in lookup table (not medical/nutrition advice)
- Honest Hour tracker — protect one hour at a time with a stated intention, a finish line, freeform custom fields you define per hour, and an honest post-hour review

## Run locally
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run build
```
Outputs a static site in `dist/` — deploy anywhere (Vercel, Netlify, etc).

## Notes on storage
Everything is stored in the browser's `localStorage`/`sessionStorage` — nothing is sent to a server. This means:
- Data is per-browser, per-device (no sync across devices)
- Total storage is capped around 5–10MB, so heavy photo use will eventually hit the limit
- For real cross-device sync or long-term photo storage, this would need a real backend (e.g. Supabase) added later
