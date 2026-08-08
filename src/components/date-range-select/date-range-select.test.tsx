import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import {
  DateRangeEnum,
  DateRangeSelect,
  type DateRangeType,
} from "./index";

function ControlledSelect({
  initial = null,
  defaultRange,
}: {
  initial?: DateRangeType;
  defaultRange?: (typeof DateRangeEnum)[keyof typeof DateRangeEnum];
}) {
  const [dateRange, setDateRange] = useState<DateRangeType>(initial);
  return (
    <DateRangeSelect
      dateRange={dateRange}
      setDateRange={setDateRange}
      defaultRange={defaultRange}
    />
  );
}

describe("DateRangeSelect", () => {
  it("applies the default preset (Last 30 Days) when no range is provided", () => {
    render(<ControlledSelect />);
    expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
  });

  it("applies a custom defaultRange preset", () => {
    render(<ControlledSelect defaultRange={DateRangeEnum.THIS_YEAR} />);
    expect(screen.getByText("This Year")).toBeInTheDocument();
  });

  it("shows a formatted range when the value doesn't match a known preset", () => {
    render(
      <ControlledSelect
        initial={{
          from: new Date(2024, 0, 1),
          to: new Date(2024, 0, 15),
          label: "custom",
        }}
      />
    );
    expect(screen.getByText(/Jan 01, 2024 - Jan 15, 2024/)).toBeInTheDocument();
  });

  it("shows '- Present' when there is a from date but no to date", () => {
    render(
      <ControlledSelect
        initial={{ from: new Date(2024, 0, 1), to: null, label: "custom" }}
      />
    );
    expect(screen.getByText(/Jan 01, 2024 - Present/)).toBeInTheDocument();
  });

  it("falls back to 'Select a duration' when there is no from date and no matching preset", () => {
    render(
      <ControlledSelect
        initial={{ from: null, to: null, value: "unknown", label: "x" }}
      />
    );
    expect(screen.getByText("Select a duration")).toBeInTheDocument();
  });

  it("lets the user pick a different preset, closing the popover", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByText("Last 30 Days"));
    await user.click(screen.getByText("This Month"));

    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.queryByText("Last Year")).not.toBeInTheDocument();
  });

  it("highlights the currently selected preset in the list", async () => {
    const user = userEvent.setup();
    render(
      <ControlledSelect
        initial={{
          from: new Date(),
          to: new Date(),
          value: DateRangeEnum.THIS_MONTH,
          label: "for This Month",
        }}
      />
    );

    await user.click(screen.getAllByText("This Month")[0]);
    const listItem = screen.getAllByText("This Month")[1];
    expect(listItem).toHaveClass("bg-accent");
  });

  it("selects the All Time preset with null from/to", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    await user.click(screen.getByText("Last 30 Days"));
    await user.click(screen.getByText("All Time"));

    expect(screen.getByText("All Time")).toBeInTheDocument();
  });
});
