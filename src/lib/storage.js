// Centralized localStorage access for Toggle.
//
// Architecture note: Toggle is entirely client-side — there is no backend,
// no auth, and no sync between devices. Each "profile" is just a named
// bucket inside the browser's localStorage, isolated from other profiles by
// key prefix. A PIN, if set, only gates switching between profiles on a
// shared device; it is stored in plain text and is NOT secure
// authentication. This tradeoff is intentional: it keeps the app fully
// static (deployable to Vercel with zero server cost) at the cost of
// portability and real privacy guarantees. See README "Technical Decisions".
//
// Every read here is defensive: localStorage can contain malformed JSON
// (corrupted by a browser extension, a failed write, manual tampering in
// devtools, or a future schema change) and this module makes sure a bad
// value degrades to a safe empty default instead of crashing the app.

export const PROFILES_KEY = "toggle-profiles-v1";
export const dataKey = (name) => `toggle-data-${name}`;
export const tutorialSeenKey = (name) => `toggle-seen-tutorial-${name}`;

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadProfiles() {
  const raw = localStorage.getItem(PROFILES_KEY);
  const parsed = safeParse(raw, []);
  if (!Array.isArray(parsed)) return [];
  // Guard against malformed entries (e.g. missing "name") rather than
  // letting one bad entry break profile switching for everyone.
  return parsed.filter((p) => p && typeof p.name === "string" && p.name.length > 0);
}

export function saveProfiles(list) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Toggle: failed to save profile list", e);
    return false;
  }
}

// Returns a fully-shaped, validated data object for a profile so the rest
// of the app never has to null-check "did this field exist in old data".
export function loadProfileData(profileName) {
  const raw = localStorage.getItem(dataKey(profileName));
  const parsed = safeParse(raw, {});
  return {
    habits: Array.isArray(parsed.habits) ? parsed.habits : [],
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    photos: isPlainObject(parsed.photos) ? parsed.photos : {},
    diet: isPlainObject(parsed.diet) ? parsed.diet : {},
    hours: isPlainObject(parsed.hours) ? parsed.hours : {},
  };
}

export function saveProfileData(profileName, data) {
  try {
    localStorage.setItem(dataKey(profileName), JSON.stringify(data));
    return true;
  } catch (e) {
    // Most likely cause: localStorage quota exceeded, usually from photo
    // data URLs. The Photos tab already warns the user proactively when
    // usage crosses ~3.5MB — this is the last-resort failure path.
    console.error("Toggle: save failed — storage may be full", e);
    return false;
  }
}

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function estimateStorageUsedMB() {
  let total = 0;
  for (const k in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
      total += (localStorage[k].length + k.length) * 2;
    }
  }
  return total / (1024 * 1024);
}
