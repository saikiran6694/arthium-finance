import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders the fallback while the image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="Jane" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies data-slot attributes for styling hooks", () => {
    const { container } = render(
      <Avatar className="custom">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('[data-slot="avatar"]')).toHaveClass(
      "custom"
    );
    expect(
      container.querySelector('[data-slot="avatar-fallback"]')
    ).toBeInTheDocument();
  });
});
