import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageLayout from "./page-layout";

describe("PageLayout", () => {
  it("renders the header and children by default", () => {
    render(
      <PageLayout title="Settings" subtitle="Manage settings">
        <div>Body content</div>
      </PageLayout>
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("hides the header when showHeader is false", () => {
    render(
      <PageLayout title="Settings" showHeader={false}>
        <div>Body content</div>
      </PageLayout>
    );
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies the negative top margin when addMarginTop is true", () => {
    const { container } = render(
      <PageLayout addMarginTop>
        <div>Body content</div>
      </PageLayout>
    );
    expect(container.querySelector(".-mt-20")).toBeInTheDocument();
  });

  it("merges a custom className", () => {
    const { container } = render(
      <PageLayout className="custom-class">
        <div>Body content</div>
      </PageLayout>
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
