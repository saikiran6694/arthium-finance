import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

describe("Pagination", () => {
  it("renders the full pagination structure", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
    expect(screen.getByText("More pages")).toBeInTheDocument();

    const activeLink = screen.getByText("1");
    expect(activeLink).toHaveAttribute("aria-current", "page");
    expect(activeLink).toHaveAttribute("data-active", "true");

    const inactiveLink = screen.getByText("2");
    expect(inactiveLink).not.toHaveAttribute("aria-current");
  });
});
