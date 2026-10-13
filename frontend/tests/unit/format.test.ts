import { describe, it, expect } from "vitest";
import { formatCOP, formatInventoryDate, isOutOfStock } from "@/lib/format";

describe("formatCOP", () => {
  it("formats a typical price", () => {
    expect(formatCOP(89900)).toBe("$89.900");
  });

  it("formats zero", () => {
    expect(formatCOP(0)).toBe("$0");
  });

  it("formats a large price", () => {
    expect(formatCOP(1299900)).toBe("$1.299.900");
  });

  it("formats a small price", () => {
    expect(formatCOP(900)).toBe("$900");
  });
});

describe("formatInventoryDate", () => {
  it("formats a UTC datetime to Bogota timezone date", () => {
    // 2026-10-13 01:30 UTC = 2026-10-12 20:30 Bogotá (UTC-5)
    const result = formatInventoryDate("2026-10-13T01:30:00+00:00");
    expect(result).toContain("12");
    expect(result).toContain("octubre");
    expect(result).toContain("2026");
  });

  it("keeps same-day dates in Bogota", () => {
    // 2026-10-13 18:00 UTC = 2026-10-13 13:00 Bogotá
    const result = formatInventoryDate("2026-10-13T18:00:00+00:00");
    expect(result).toContain("13");
    expect(result).toContain("octubre");
  });
});

describe("isOutOfStock", () => {
  it("returns true when all variants have zero stock", () => {
    expect(isOutOfStock([{ stock: 0 }, { stock: 0 }])).toBe(true);
  });

  it("returns false when any variant has stock", () => {
    expect(isOutOfStock([{ stock: 0 }, { stock: 1 }])).toBe(false);
  });
});
