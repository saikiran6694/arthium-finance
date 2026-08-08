import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "./index";

interface Row {
  _id: string;
  name: string;
  category: string;
}

const rows: Row[] = [
  { _id: "1", name: "Coffee", category: "Food" },
  { _id: "2", name: "Bus ticket", category: "Transport" },
];

const columns: ColumnDef<Row, unknown>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
];

describe("DataTable", () => {
  it("renders rows and column headers", () => {
    render(<DataTable data={rows} columns={columns} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Bus ticket")).toBeInTheDocument();
  });

  it("shows the skeleton loader while isLoading is true", () => {
    const { container } = render(
      <DataTable data={rows} columns={columns} isLoading />
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Coffee")).not.toBeInTheDocument();
  });

  it("shows an empty state when there is no data", () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("calls onSearch as the user types and shows a reset button", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        onSearch={onSearch}
        searchPlaceholder="Search transactions"
      />
    );

    const input = screen.getByPlaceholderText("Search transactions");
    await user.type(input, "cof");
    expect(onSearch).toHaveBeenLastCalledWith("cof");
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("hides the search box when showSearch is false", () => {
    render(<DataTable data={rows} columns={columns} showSearch={false} />);
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });

  it("clears search, filters, and selection when Reset is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<DataTable data={rows} columns={columns} onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "cof");
    await user.click(screen.getByText("Reset"));

    expect(input).toHaveValue("");
    expect(onSearch).toHaveBeenLastCalledWith("");
  });

  it("renders filter dropdowns and reports filter changes", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        onFilterChange={onFilterChange}
        filters={[
          {
            key: "category",
            label: "Category",
            options: [
              { value: "food", label: "Food" },
              { value: "transport", label: "Transport" },
            ],
          },
        ]}
      />
    );

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(await screen.findByRole("option", { name: "Food" }));

    expect(onFilterChange).toHaveBeenCalledWith({ category: "food" });
  });

  it("selects a row and triggers bulk delete", async () => {
    const user = userEvent.setup();
    const onBulkDelete = vi.fn();
    render(
      <DataTable data={rows} columns={columns} onBulkDelete={onBulkDelete} />
    );

    const checkboxes = screen.getAllByLabelText("Select row");
    await user.click(checkboxes[0]);

    const deleteButton = screen.getByText(/Delete \(1\)/);
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);
    expect(onBulkDelete).toHaveBeenCalledWith(["1"]);
  });

  it("shows a loading spinner on the delete button while bulk deleting", () => {
    render(
      <DataTable data={rows} columns={columns} isBulkDeleting />
    );
    expect(screen.getByText(/Delete \(0\)/)).toBeInTheDocument();
  });

  it("hides the selection checkbox column state when selection is false", async () => {
    const user = userEvent.setup();
    const onBulkDelete = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        selection={false}
        onBulkDelete={onBulkDelete}
      />
    );

    const checkboxes = screen.getAllByLabelText("Select row");
    await user.click(checkboxes[0]);
    expect(screen.queryByText(/Delete \(/)).not.toBeInTheDocument();
  });

  it("hides pagination when isShowPagination is false", () => {
    render(
      <DataTable data={rows} columns={columns} isShowPagination={false} />
    );
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
  });

  it("shows pagination using the provided pagination info and forwards handlers", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        pagination={{ pageNumber: 2, pageSize: 10, totalItems: 25, totalPages: 3 }}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    await user.click(screen.getByText("Go to next page").closest("button")!);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
