import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renders in single-select mode and reports the selected day", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 7, 1)}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText("15"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders in range mode with distinct cell styling", () => {
    const { container } = render(
      <Calendar mode="range" defaultMonth={new Date(2026, 7, 1)} />
    );
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });

  it("navigates to the next month via the built-in nav button", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 7, 1)} />);

    expect(screen.getByText("August 2026")).toBeInTheDocument();
    await user.click(screen.getByLabelText(/next month/i));
    expect(screen.getByText("September 2026")).toBeInTheDocument();
  });

  it("hides outside days when showOutsideDays is false", () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 7, 1)}
        showOutsideDays={false}
      />
    );
    expect(screen.getByText("August 2026")).toBeInTheDocument();
  });
});
