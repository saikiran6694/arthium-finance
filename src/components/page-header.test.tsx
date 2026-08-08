import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageHeader from "./page-header";

describe("PageHeader", () => {
  it("renders the title, subtitle, and right action", () => {
    render(
      <PageHeader
        title="Transactions"
        subtitle="Manage your transactions"
        rightAction={<button>Add</button>}
      />
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Manage your transactions")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("renders nothing in the title area when neither title nor subtitle is given", () => {
    const { container } = render(<PageHeader />);
    expect(container.querySelector("h2")).not.toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("renders a custom renderPageHeader instead of the default layout", () => {
    render(
      <PageHeader
        title="Ignored"
        renderPageHeader={<div>Custom header</div>}
      />
    );
    expect(screen.getByText("Custom header")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });
});
