import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SingleSelector, type SingleSelectorRef } from "./single-select";

const options = [
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Dining" },
  { value: "transport", label: "Transport", disable: true },
];

describe("SingleSelector", () => {
  it("opens the list on click and shows all default options", async () => {
    const user = userEvent.setup();
    render(<SingleSelector defaultOptions={options} placeholder="Select..." />);

    await user.click(screen.getByPlaceholderText("Select..."));

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Dining")).toBeInTheDocument();
  });

  it("selects an option and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SingleSelector
        defaultOptions={options}
        placeholder="Select..."
        onChange={onChange}
      />
    );

    await user.click(screen.getByPlaceholderText("Select..."));
    await user.click(screen.getByText("Groceries"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "groceries" })
    );
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Select...")).not.toBeInTheDocument();
  });

  it("clears the selection via the unselect button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SingleSelector
        defaultOptions={options}
        value={{ value: "dining", label: "Dining" }}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Dining")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("does not render the clear button when disabled", () => {
    render(
      <SingleSelector
        defaultOptions={options}
        value={{ value: "dining", label: "Dining" }}
        disabled
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <SingleSelector
        defaultOptions={options}
        placeholder="Select..."
        disabled
      />
    );
    await user.click(screen.getByPlaceholderText("Select..."));
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<SingleSelector defaultOptions={options} placeholder="Select..." />);

    const input = screen.getByPlaceholderText("Select...");
    await user.click(input);
    await user.type(input, "Groc");

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Dining")).not.toBeInTheDocument();
  });

  it("shows the empty indicator when there are no options", async () => {
    const user = userEvent.setup();
    render(
      <SingleSelector
        defaultOptions={[]}
        placeholder="Select..."
        emptyIndicator={<div>No results</div>}
      />
    );
    await user.click(screen.getByPlaceholderText("Select..."));
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("supports creatable options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SingleSelector
        defaultOptions={options}
        placeholder="Select..."
        creatable
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText("Select...");
    await user.click(input);
    await user.type(input, "Custom Category");

    const createOption = await screen.findByText('Create "Custom Category"');
    await user.click(createOption);

    expect(onChange).toHaveBeenCalledWith({
      value: "Custom Category",
      label: "Custom Category",
    });
  });

  it("exposes an imperative handle for focus/reset/selectedValue", async () => {
    const ref = createRef<SingleSelectorRef>();
    render(
      <SingleSelector
        ref={ref}
        defaultOptions={options}
        value={{ value: "dining", label: "Dining" }}
      />
    );

    expect(ref.current?.selectedValue).toEqual({
      value: "dining",
      label: "Dining",
    });

    act(() => {
      ref.current?.reset();
    });
    expect(ref.current?.selectedValue).toBeUndefined();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SingleSelector defaultOptions={options} placeholder="Select..." />
        <button>outside</button>
      </div>
    );

    await user.click(screen.getByPlaceholderText("Select..."));
    expect(screen.getByText("Groceries")).toBeInTheDocument();

    await user.click(screen.getByText("outside"));
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
  });

  it("resolves live options via an async onSearch callback", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn().mockResolvedValue([
      { value: "async-1", label: "Async Result" },
    ]);
    render(
      <SingleSelector
        placeholder="Select..."
        onSearch={onSearch}
        triggerSearchOnFocus
      />
    );

    await user.click(screen.getByPlaceholderText("Select..."));
    expect(await screen.findByText("Async Result")).toBeInTheDocument();
    expect(onSearch).toHaveBeenCalled();
  });

  it("resolves live options via a sync onSearchSync callback", async () => {
    const user = userEvent.setup();
    const onSearchSync = vi
      .fn()
      .mockReturnValue([{ value: "sync-1", label: "Sync Result" }]);
    render(
      <SingleSelector
        placeholder="Select..."
        onSearchSync={onSearchSync}
        triggerSearchOnFocus
      />
    );

    await user.click(screen.getByPlaceholderText("Select..."));
    expect(await screen.findByText("Sync Result")).toBeInTheDocument();
  });

  it("groups options by the groupBy field", async () => {
    const user = userEvent.setup();
    render(
      <SingleSelector
        defaultOptions={[
          { value: "a", label: "A", type: "Food" },
          { value: "b", label: "B", type: "Travel" },
        ]}
        groupBy="type"
        placeholder="Select..."
      />
    );

    await user.click(screen.getByPlaceholderText("Select..."));
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });
});
