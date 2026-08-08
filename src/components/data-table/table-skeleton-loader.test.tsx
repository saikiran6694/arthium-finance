import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TableSkeleton from "./table-skeleton-loader";

describe("TableSkeleton", () => {
  it("renders the given number of header and row columns with the default row count", () => {
    const { container } = render(<TableSkeleton columns={4} />);
    const header = container.querySelector(".flex.h-10.bg-gray-50");
    expect(header?.children).toHaveLength(4);

    const body = container.querySelector(".divide-y");
    expect(body?.children).toHaveLength(25);
    expect(body?.children[0].children).toHaveLength(4);
  });

  it("respects a custom row count", () => {
    const { container } = render(<TableSkeleton columns={2} rows={3} />);
    const body = container.querySelector(".divide-y");
    expect(body?.children).toHaveLength(3);
  });
});
