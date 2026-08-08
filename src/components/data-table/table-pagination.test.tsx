import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTablePagination } from "./table-pagination";

describe("DataTablePagination", () => {
  it("shows the current range and page info", () => {
    render(
      <DataTablePagination
        pageNumber={2}
        pageSize={10}
        totalCount={45}
        totalPages={5}
      />
    );
    expect(screen.getByText(/Showing 11-20 of 45/)).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <DataTablePagination
        pageNumber={1}
        pageSize={10}
        totalCount={30}
        totalPages={3}
      />
    );
    expect(screen.getByText("Go to previous page").closest("button")).toBeDisabled();
    expect(screen.getByText("Go to next page").closest("button")).not.toBeDisabled();

    rerender(
      <DataTablePagination
        pageNumber={3}
        pageSize={10}
        totalCount={30}
        totalPages={3}
      />
    );
    expect(screen.getByText("Go to next page").closest("button")).toBeDisabled();
  });

  it("calls onPageChange with prev/next and direct page numbers", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <DataTablePagination
        pageNumber={2}
        pageSize={10}
        totalCount={30}
        totalPages={3}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByText("Go to previous page").closest("button")!);
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByText("Go to next page").closest("button")!);
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows a simple 1..totalPages window when totalPages <= 5", () => {
    render(
      <DataTablePagination
        pageNumber={1}
        pageSize={10}
        totalCount={30}
        totalPages={3}
      />
    );
    ["1", "2", "3"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument()
    );
  });

  it("windows around the start when pageNumber <= 3", () => {
    render(
      <DataTablePagination
        pageNumber={2}
        pageSize={10}
        totalCount={100}
        totalPages={10}
      />
    );
    ["1", "2", "3", "4", "5"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument()
    );
  });

  it("windows around the end when pageNumber >= totalPages - 2", () => {
    render(
      <DataTablePagination
        pageNumber={9}
        pageSize={10}
        totalCount={100}
        totalPages={10}
      />
    );
    ["6", "7", "8", "9", "10"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument()
    );
  });

  it("windows around the current page in the middle", () => {
    render(
      <DataTablePagination
        pageNumber={5}
        pageSize={10}
        totalCount={100}
        totalPages={10}
      />
    );
    ["3", "4", "5", "6", "7"].forEach((n) =>
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument()
    );
  });

  it("changes the page size, resets to page 1, and notifies both handlers", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <DataTablePagination
        pageNumber={3}
        pageSize={10}
        totalCount={100}
        totalPages={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("30"));

    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageSizeChange).toHaveBeenCalledWith(30);
  });
});
