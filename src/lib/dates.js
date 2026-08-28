// Date helpers used across the app. All dates are handled as local-timezone
// ISO strings ("YYYY-MM-DD") rather than Date objects, so they can be used
// directly as object keys for per-day storage (habits, photos, diet, hours).

export function todayISO(d = new Date()) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

export function startOfWeek(iso) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() + ((day === 0 ? -6 : 1) - day));
  return todayISO(d);
}

export function fmtDay(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
}

export function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function monthGrid(iso) {
  const d = new Date(iso + "T00:00:00");
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(todayISO(new Date(year, month, day)));
  return cells;
}

export function monthLabel(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
