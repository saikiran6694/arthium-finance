import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it("formats a positive value with default options (USD, 2 decimals)", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats a negative value", () => {
    expect(formatCurrency(-1234.5)).toBe("-$1,234.50");
  });

  it("respects a custom currency", () => {
    expect(formatCurrency(10, { currency: "EUR" })).toBe("€10.00");
  });

  it("respects custom decimal places", () => {
    expect(formatCurrency(10, { decimalPlaces: 0 })).toBe("$10");
  });

  it("formats compact notation", () => {
    expect(formatCurrency(1500000, { compact: true })).toBe("$1.50M");
  });

  it("always shows a sign when showSign is true", () => {
    expect(formatCurrency(10, { showSign: true })).toBe("+$10.00");
    expect(formatCurrency(-10, { showSign: true })).toBe("-$10.00");
  });

  it("treats the value as an expense by forcing it negative", () => {
    expect(formatCurrency(10, { isExpense: true })).toBe("-$10.00");
    expect(formatCurrency(-10, { isExpense: true })).toBe("-$10.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
