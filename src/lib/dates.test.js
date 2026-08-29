import { describe, it, expect } from "vitest";
import { todayISO, addDays, startOfWeek, fmtDay, fmtDate, monthGrid, monthLabel } from "../lib/dates.js";

describe("todayISO", () => {
  it("formats a given date as YYYY-MM-DD", () => {
    // Local noon avoids any timezone edge rolling the date to the
    // previous/next day for timezones near the UTC boundary.
    const d = new Date(2026, 2, 15, 12, 0, 0); // March 15, 2026
    expect(todayISO(d)).toBe("2026-03-15");
  });

  it("zero-pads single-digit months and days", () => {
    const d = new Date(2026, 0, 5, 12, 0, 0); // Jan 5, 2026
    expect(todayISO(d)).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("adds positive days within the same month", () => {
    expect(addDays("2026-03-10", 5)).toBe("2026-03-15");
  });

  it("subtracts days with a negative offset", () => {
    expect(addDays("2026-03-10", -5)).toBe("2026-03-05");
  });

  it("rolls over a month boundary", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });

  it("rolls over a year boundary", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("handles zero offset as a no-op", () => {
    expect(addDays("2026-03-10", 0)).toBe("2026-03-10");
  });
});

describe("startOfWeek", () => {
  it("returns the same date when given a Monday", () => {
    // 2026-03-16 is a Monday.
    expect(startOfWeek("2026-03-16")).toBe("2026-03-16");
  });

  it("returns the preceding Monday when given a mid-week date", () => {
    // 2026-03-19 is a Thursday in the same week as 2026-03-16.
    expect(startOfWeek("2026-03-19")).toBe("2026-03-16");
  });

  it("treats Sunday as the end of the week, not the start", () => {
    // 2026-03-22 is a Sunday; the week it belongs to starts 2026-03-16.
    expect(startOfWeek("2026-03-22")).toBe("2026-03-16");
  });
});

describe("monthGrid", () => {
  it("pads leading cells only — total length is not necessarily a multiple of 7", () => {
    // The grid pads empty leading cells so day 1 lands in the right
    // weekday column, but does not pad trailing cells to complete the
    // final week — the caller's CSS grid handles a partial last row.
    const cells = monthGrid("2026-03-15"); // March 2026: 31 days, starts on a Sunday
    const leadingEmpty = cells.findIndex((c) => c !== null);
    expect(cells).toHaveLength(leadingEmpty + 31);
  });

  it("pads leading empty cells so the 1st lands on its correct weekday column", () => {
    // March 2026 starts on a Sunday, which is column index 6 (Mon-first grid).
    const cells = monthGrid("2026-03-15");
    const firstRealCellIndex = cells.findIndex((c) => c !== null);
    expect(cells[firstRealCellIndex]).toBe("2026-03-01");
    expect(firstRealCellIndex).toBe(6);
  });

  it("includes every day of the month exactly once", () => {
    const cells = monthGrid("2026-04-01"); // April has 30 days
    const realCells = cells.filter((c) => c !== null);
    expect(realCells).toHaveLength(30);
    expect(realCells[0]).toBe("2026-04-01");
    expect(realCells[29]).toBe("2026-04-30");
  });
});

describe("fmtDay / fmtDate / monthLabel", () => {
  it("fmtDay returns a short weekday string", () => {
    expect(fmtDay("2026-03-16")).toMatch(/mon/i);
  });

  it("fmtDate returns a month + day string", () => {
    expect(fmtDate("2026-03-16")).toMatch(/mar/i);
    expect(fmtDate("2026-03-16")).toMatch(/16/);
  });

  it("monthLabel returns a month + year string", () => {
    expect(monthLabel("2026-03-16")).toMatch(/march/i);
    expect(monthLabel("2026-03-16")).toMatch(/2026/);
  });
});
