import { describe, expect, it } from "vitest";
import { formatPercentage } from "./format-percentage";

describe("formatPercentage", () => {
  it("returns 0% for NaN", () => {
    expect(formatPercentage(NaN)).toBe("0%");
  });

  it("returns 0% for a non-number value", () => {
    expect(formatPercentage("bad" as unknown as number)).toBe("0%");
  });

  it("formats a positive value with default decimal places", () => {
    expect(formatPercentage(12.34)).toBe("12.3%");
  });

  it("formats a negative value using its absolute value when sign is hidden", () => {
    expect(formatPercentage(-12.34)).toBe("12.3%");
  });

  it("respects custom decimal places", () => {
    expect(formatPercentage(12.345, { decimalPlaces: 2 })).toBe("12.35%");
  });

  describe("showSign true, isExpense false (income/balance semantics)", () => {
    it("prefixes a positive value with +", () => {
      expect(formatPercentage(10, { showSign: true })).toBe("+10.0%");
    });

    it("prefixes zero with + (>= 0 branch)", () => {
      expect(formatPercentage(0, { showSign: true })).toBe("+0.0%");
    });

    it("prefixes a negative value with -", () => {
      expect(formatPercentage(-10, { showSign: true })).toBe("-10.0%");
    });
  });

  describe("showSign true, isExpense true (inverted semantics)", () => {
    it("prefixes a positive value with -", () => {
      expect(formatPercentage(10, { showSign: true, isExpense: true })).toBe("-10.0%");
    });

    it("prefixes zero with + (<= 0 branch)", () => {
      expect(formatPercentage(0, { showSign: true, isExpense: true })).toBe("+0.0%");
    });

    it("prefixes a negative value with +", () => {
      expect(formatPercentage(-10, { showSign: true, isExpense: true })).toBe("+10.0%");
    });
  });
});
