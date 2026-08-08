import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table", () => {
  it("renders the full table structure with expected slots", () => {
    render(
      <Table>
        <TableCaption>A list of transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Groceries</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText("A list of transactions").tagName).toBe(
      "CAPTION"
    );
    expect(screen.getByText("Name").tagName).toBe("TH");
    expect(screen.getByText("Groceries").tagName).toBe("TD");
    expect(screen.getByText("Total").closest("tfoot")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
  });
});
