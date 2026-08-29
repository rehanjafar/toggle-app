import { describe, it, expect } from "vitest";
import { estimateCalories } from "./calories.js";

describe("estimateCalories", () => {
  it("returns a known calorie value for an exact match", () => {
    expect(estimateCalories("banana")).toBe(105);
  });

  it("is case-insensitive", () => {
    expect(estimateCalories("BANANA")).toBe(105);
    expect(estimateCalories("Banana")).toBe(105);
  });

  it("matches via substring, so free-text entries still resolve", () => {
    expect(estimateCalories("grilled chicken breast plate")).toBe(165);
  });

  it("documents a real ordering quirk: earlier generic entries shadow later specific ones", () => {
    // CALORIE_TABLE lists "egg" (78) before "fried egg" (90). Since
    // estimateCalories returns the FIRST substring match, any input
    // containing the word "egg" — including "fried egg" — matches the
    // generic "egg" entry first, so the dedicated "fried egg" entry is
    // effectively unreachable today. This test isn't asserting desired
    // behavior, it's pinning down actual behavior so a future table
    // reorder is a deliberate choice, not a silent regression.
    expect(estimateCalories("fried egg on toast")).toBe(78);
  });

  it("falls back to a default estimate for unrecognized food", () => {
    expect(estimateCalories("xyzzy quantum fruit")).toBe(250);
  });

  it("handles an empty string without throwing", () => {
    expect(() => estimateCalories("")).not.toThrow();
    expect(estimateCalories("")).toBe(250);
  });

  it("returns 0 for zero-calorie items rather than falling back", () => {
    // Regression guard: 0 is falsy in JS, so a naive `if (cal)` check
    // would incorrectly skip "water" and fall through to the 250 default.
    expect(estimateCalories("glass of water")).toBe(0);
  });
});
