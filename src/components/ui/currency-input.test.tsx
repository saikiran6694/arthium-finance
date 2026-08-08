import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import CurrencyInputField from "./currency-input";

describe("CurrencyInputField", () => {
  it("renders with the default $ prefix and reports value changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CurrencyInputField
        name="amount"
        placeholder="0.00"
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    await user.type(input, "12.5");

    expect(onValueChange).toHaveBeenCalled();
    expect(input).toHaveValue("$12.5");
  });

  it("supports a custom prefix and disabled state", () => {
    render(
      <CurrencyInputField
        name="amount"
        prefix="€"
        value="10"
        disabled
        placeholder="0.00"
      />
    );

    const input = screen.getByPlaceholderText("0.00");
    expect(input).toBeDisabled();
    expect(input).toHaveValue("€10.00");
  });

  it("forwards the ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<CurrencyInputField name="amount" ref={ref} placeholder="0.00" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
