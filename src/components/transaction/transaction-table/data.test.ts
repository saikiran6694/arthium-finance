import { describe, expect, it } from "vitest";
import { TRANSACTION_DATA } from "./data";

describe("TRANSACTION_DATA", () => {
  it("provides sample transaction records with the expected shape", () => {
    expect(TRANSACTION_DATA.length).toBeGreaterThan(0);
    TRANSACTION_DATA.forEach((txn) => {
      expect(txn).toHaveProperty("_id");
      expect(txn).toHaveProperty("title");
      expect(typeof txn.amount).toBe("number");
    });
  });
});
