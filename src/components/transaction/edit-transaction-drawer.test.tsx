import { render, screen } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import EditTransactionDrawer from "./edit-transaction-drawer";

vi.mock("./transaction-form", () => ({
  default: ({
    isEdit,
    transactionId,
  }: {
    isEdit?: boolean;
    transactionId?: string;
  }) => (
    <div>
      Transaction Form {isEdit ? "(edit)" : "(create)"} - {transactionId}
    </div>
  ),
}));

describe("EditTransactionDrawer", () => {
  it("stays closed when the drawer query params are not set", () => {
    render(<EditTransactionDrawer />, {
      wrapper: withNuqsTestingAdapter(),
    });
    expect(screen.queryByText(/Transaction Form/)).not.toBeInTheDocument();
  });

  it("opens with the transaction id from the query params", () => {
    render(<EditTransactionDrawer />, {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?edit=true&transactionId=txn-42",
      }),
    });

    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByText(/Transaction Form \(edit\) - txn-42/)).toBeInTheDocument();
  });
});
