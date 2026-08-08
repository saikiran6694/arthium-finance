import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppAlert } from "./app-alert";

describe("AppAlert", () => {
  it("renders the default title, destructive variant, and message", () => {
    render(<AppAlert message="Something went wrong" />);
    expect(screen.getByText("Notice")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders a custom title and variant", () => {
    render(
      <AppAlert message="Saved successfully" title="Success" variant="success" />
    );
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("dismisses when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<AppAlert message="Notice me" onDismiss={onDismiss} />);

    await user.click(screen.getByText("Close"));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("hides the dismiss button when showDismissButton is false", () => {
    render(<AppAlert message="Notice me" showDismissButton={false} />);
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("auto-dismisses after autoHideDuration when isError is true", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <AppAlert
        message="Auto hide"
        isError
        autoHideDuration={3000}
        onDismiss={onDismiss}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not schedule auto-dismiss when autoHideDuration is 0", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <AppAlert
        message="No auto hide"
        isError
        autoHideDuration={0}
        onDismiss={onDismiss}
      />
    );

    vi.advanceTimersByTime(10000);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("does not schedule auto-dismiss when isError is false", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <AppAlert message="No auto hide" isError={false} onDismiss={onDismiss} />
    );

    vi.advanceTimersByTime(10000);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("clears the pending timer on unmount", () => {
    const { unmount } = render(<AppAlert message="Auto hide" isError />);
    expect(() => unmount()).not.toThrow();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <AppAlert message="Styled" className="custom-alert" />
    );
    expect(container.querySelector(".custom-alert")).toBeInTheDocument();
  });
});
