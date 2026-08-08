import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CalendarDateRangePicker } from "./index";

describe("CalendarDateRangePicker", () => {
  it("shows the default selected range on the trigger button", () => {
    render(<CalendarDateRangePicker />);
    expect(screen.getByText(/Jan 20, 2023 - Feb 09, 2023/)).toBeInTheDocument();
  });

  it("opens the calendar popover when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<CalendarDateRangePicker />);

    await user.click(screen.getByText(/Jan 20, 2023/));
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(0);
  });

  it("updates the range when a new day is selected in the calendar", async () => {
    const user = userEvent.setup();
    render(<CalendarDateRangePicker />);

    await user.click(screen.getByText(/Jan 20, 2023/));
    await user.click(screen.getAllByText("5")[0]);

    expect(screen.getByText(/Jan 05, 2023/)).toBeInTheDocument();
  });

  it("applies a custom className to the wrapper", () => {
    const { container } = render(
      <CalendarDateRangePicker className="custom-wrapper" />
    );
    expect(container.querySelector(".custom-wrapper")).toBeInTheDocument();
  });
});
