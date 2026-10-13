import { describe, it, expect } from "vitest";
import { formatCOP, formatDate } from "@/lib/format";

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

describe("formatDate", () => {
  it("formats an ISO date string to spanish locale", () => {
    const result = formatDate("2026-10-08");
    expect(result).toContain("2026");
    expect(result).toContain("8");
  });
});
