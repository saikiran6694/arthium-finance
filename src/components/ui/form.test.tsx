import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { Input } from "./input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

type Values = { email: string };

function Example({ withDescription = true }: { withDescription?: boolean }) {
  const form = useForm<Values>({
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(() => {});

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {withDescription && (
                <FormDescription>We'll never share it.</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("renders the label, control, and description with no error initially", () => {
    render(<Example />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("We'll never share it.")).toBeInTheDocument();
    expect(
      screen.queryByText("Email is required")
    ).not.toBeInTheDocument();
  });

  it("shows the validation error message after a failed submit", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByText("Submit"));

    const message = await screen.findByText("Email is required");
    expect(message).toBeInTheDocument();

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("renders no message element when there is no error and no children", () => {
    const { container } = render(<Example withDescription={false} />);
    expect(
      container.querySelector('[data-slot="form-message"]')
    ).not.toBeInTheDocument();
  });
});
