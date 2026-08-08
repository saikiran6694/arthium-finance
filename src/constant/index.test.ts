import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  CHART_COLORS,
  MAX_FILE_SIZE,
  MAX_HISTORY,
  MAX_IMPORT_LIMIT,
  MODE_SUGGESTIONS,
  PAYMENT_METHODS,
  PAYMENT_METHODS_ENUM,
  SEVERITY_CONFIG,
  SIDEBAR_KEY,
  VERDICT_CONFIG,
  _REPORT_STATUS,
  _TRANSACTION_FREQUENCY,
  _TRANSACTION_STATUS,
  _TRANSACTION_TYPE,
} from "./index";

describe("constants", () => {
  it("exposes the expected primitive constants", () => {
    expect(MAX_IMPORT_LIMIT).toBe(300);
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    expect(SIDEBAR_KEY).toBe("sidebar_collapsed");
    expect(MAX_HISTORY).toBe(50);
  });

  it("provides mode suggestions for every chat mode", () => {
    expect(MODE_SUGGESTIONS.general.length).toBeGreaterThan(0);
    expect(MODE_SUGGESTIONS.advice.length).toBeGreaterThan(0);
    expect(MODE_SUGGESTIONS.simulator.length).toBeGreaterThan(0);
  });

  it("provides severity and verdict config maps", () => {
    expect(SEVERITY_CONFIG.high.color).toBe("text-red-400");
    expect(VERDICT_CONFIG.great.label).toContain("Great Move");
  });

  it("provides chart colors, categories, and payment methods", () => {
    expect(CHART_COLORS.length).toBeGreaterThan(0);
    expect(CATEGORIES.length).toBeGreaterThan(0);
    expect(PAYMENT_METHODS.length).toBe(
      Object.keys(PAYMENT_METHODS_ENUM).length
    );
  });

  it("provides transaction/report enum maps", () => {
    expect(_TRANSACTION_FREQUENCY.DAILY).toBe("DAILY");
    expect(_TRANSACTION_TYPE.INCOME).toBe("INCOME");
    expect(_TRANSACTION_STATUS.COMPLETED).toBe("COMPLETED");
    expect(_REPORT_STATUS.SENT).toBe("SENT");
  });
});
