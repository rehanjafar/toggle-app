import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PROFILES_KEY,
  dataKey,
  loadProfiles,
  saveProfiles,
  loadProfileData,
  saveProfileData,
  estimateStorageUsedMB,
} from "./storage.js";

beforeEach(() => {
  localStorage.clear();
});

describe("loadProfiles", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadProfiles()).toEqual([]);
  });

  it("returns previously saved profiles", () => {
    saveProfiles([{ name: "Rehan", pin: "" }]);
    expect(loadProfiles()).toEqual([{ name: "Rehan", pin: "" }]);
  });

  it("returns an empty array instead of throwing when the stored value is corrupted JSON", () => {
    localStorage.setItem(PROFILES_KEY, "{not valid json");
    expect(() => loadProfiles()).not.toThrow();
    expect(loadProfiles()).toEqual([]);
  });

  it("returns an empty array when the stored value is valid JSON but the wrong shape (not an array)", () => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify({ oops: "this should be an array" }));
    expect(loadProfiles()).toEqual([]);
  });

  it("filters out malformed entries instead of letting one bad entry break the whole list", () => {
    localStorage.setItem(
      PROFILES_KEY,
      JSON.stringify([{ name: "Valid" }, { pin: "1234" }, null, { name: "" }, "just a string"])
    );
    expect(loadProfiles()).toEqual([{ name: "Valid" }]);
  });
});

describe("loadProfileData", () => {
  it("returns a fully-shaped default object when nothing is stored for this profile", () => {
    expect(loadProfileData("NewUser")).toEqual({
      habits: [],
      tasks: [],
      photos: {},
      diet: {},
      hours: {},
    });
  });

  it("round-trips a full save/load cycle", () => {
    const data = {
      habits: [{ id: "1", name: "stretch", log: {} }],
      tasks: [{ id: "2", name: "email prof", due: "2026-03-01", priority: "high", done: false }],
      photos: { "2026-03-01": [{ id: "3", dataUrl: "data:...", note: "gym day" }] },
      diet: { "2026-03-01": [{ id: "4", name: "banana", calories: 105 }] },
      hours: { "2026-03-01": [{ id: "5", title: "write section", items: [], review: "", done: false }] },
    };
    saveProfileData("Rehan", data);
    expect(loadProfileData("Rehan")).toEqual(data);
  });

  it("keeps profiles isolated from each other under different keys", () => {
    saveProfileData("Alice", { habits: [{ id: "a" }], tasks: [], photos: {}, diet: {}, hours: {} });
    saveProfileData("Bob", { habits: [{ id: "b" }], tasks: [], photos: {}, diet: {}, hours: {} });
    expect(loadProfileData("Alice").habits).toEqual([{ id: "a" }]);
    expect(loadProfileData("Bob").habits).toEqual([{ id: "b" }]);
  });

  it("falls back to safe defaults per-field when the stored object is corrupted JSON", () => {
    localStorage.setItem(dataKey("Broken"), "{this is not json at all");
    expect(loadProfileData("Broken")).toEqual({
      habits: [],
      tasks: [],
      photos: {},
      diet: {},
      hours: {},
    });
  });

  it("falls back to safe defaults per-field when a field is present but the wrong type", () => {
    // Simulates a partially corrupted record: habits is a string instead of
    // an array, photos is an array instead of an object keyed by date.
    localStorage.setItem(
      dataKey("Weird"),
      JSON.stringify({ habits: "oops", tasks: [{ id: "1" }], photos: [], diet: null, hours: undefined })
    );
    const result = loadProfileData("Weird");
    expect(result.habits).toEqual([]); // invalid type -> safe default
    expect(result.tasks).toEqual([{ id: "1" }]); // valid type -> preserved
    expect(result.photos).toEqual({}); // array is not a valid "photos" shape
    expect(result.diet).toEqual({});
    expect(result.hours).toEqual({});
  });
});

describe("saveProfileData", () => {
  it("returns true on a successful save", () => {
    expect(saveProfileData("Rehan", { habits: [], tasks: [], photos: {}, diet: {}, hours: {} })).toBe(true);
  });

  it("returns false instead of throwing when localStorage.setItem fails (e.g. quota exceeded)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => saveProfileData("Rehan", { habits: [], tasks: [], photos: {}, diet: {}, hours: {} })).not.toThrow();
    expect(saveProfileData("Rehan", { habits: [], tasks: [], photos: {}, diet: {}, hours: {} })).toBe(false);
    spy.mockRestore();
  });
});

describe("estimateStorageUsedMB", () => {
  it("returns 0 (or effectively 0) for an empty localStorage", () => {
    expect(estimateStorageUsedMB()).toBeCloseTo(0, 5);
  });

  it("increases as more data is stored", () => {
    const before = estimateStorageUsedMB();
    localStorage.setItem("some-key", "x".repeat(10000));
    const after = estimateStorageUsedMB();
    expect(after).toBeGreaterThan(before);
  });
});
