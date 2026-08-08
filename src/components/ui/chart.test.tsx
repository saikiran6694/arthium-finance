import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const CustomIcon = () => <svg data-testid="custom-icon" />;

const config: ChartConfig = {
  desktop: { label: "Desktop", color: "#2563eb", icon: CustomIcon },
  mobile: { label: "Mobile", theme: { light: "#111111", dark: "#eeeeee" } },
  visitors: { label: "Visitors" },
};

function withContainer(children: ReactNode, chartConfig: ChartConfig = config) {
  return <ChartContainer config={chartConfig}>{children as never}</ChartContainer>;
}

describe("ChartContainer / ChartStyle", () => {
  it("renders a responsive container and a theme <style> tag when config has colors", () => {
    const { container } = render(withContainer(<div>chart body</div>));
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(container.querySelector("style")).toBeInTheDocument();
  });

  it("uses the given id instead of generating one", () => {
    const { container } = render(
      <ChartContainer id="custom-id" config={config}>
        <div />
      </ChartContainer>
    );
    expect(
      container.querySelector('[data-chart="chart-custom-id"]')
    ).toBeInTheDocument();
  });

  it("omits the <style> tag when no series define a color or theme", () => {
    const { container } = render(
      withContainer(<div />, { visitors: { label: "Visitors" } })
    );
    expect(container.querySelector("style")).not.toBeInTheDocument();
  });
});

describe("ChartTooltipContent", () => {
  it("throws when used outside a ChartContainer", () => {
    expect(() =>
      render(<ChartTooltipContent active={false} payload={[]} />)
    ).toThrow("useChart must be used within a <ChartContainer />");
  });

  it("renders nothing when inactive or payload is empty", () => {
    const { container } = render(
      withContainer(<ChartTooltipContent active={false} payload={[]} />)
    );
    expect(container.querySelector(".grid")).not.toBeInTheDocument();
  });

  it("renders the label resolved from config and a dot indicator by default", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          label="desktop"
          payload={[
            {
              dataKey: "desktop",
              name: "desktop",
              value: 120,
              color: "#2563eb",
              payload: {},
            },
          ]}
        />
      )
    );

    expect(screen.getAllByText("Desktop")).toHaveLength(2);
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("uses a custom labelFormatter when provided", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          label="desktop"
          labelFormatter={(value) => <span>Custom: {value}</span>}
          payload={[
            { dataKey: "desktop", name: "desktop", value: 1, payload: {} },
          ]}
        />
      )
    );
    expect(screen.getByText(/Custom:/)).toBeInTheDocument();
  });

  it("hides the label when hideLabel is true", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          hideLabel
          label="desktop"
          payload={[
            { dataKey: "desktop", name: "desktop", value: 1, payload: {} },
          ]}
        />
      )
    );
    expect(screen.getAllByText("Desktop")).toHaveLength(1);
  });

  it("renders a custom icon from config instead of the color swatch", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          payload={[
            { dataKey: "desktop", name: "desktop", value: 1, payload: {} },
          ]}
        />
      )
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(container.querySelector(".rounded-\\[2px\\]")).not.toBeInTheDocument();
  });

  it("hides the indicator swatch when hideIndicator is true", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          hideIndicator
          payload={[
            { dataKey: "visitors", name: "visitors", value: 1, payload: {} },
          ]}
        />
      )
    );
    expect(container.querySelector(".shrink-0.rounded-\\[2px\\]")).not.toBeInTheDocument();
  });

  it("renders a line indicator and nests the label when there is a single non-dot item", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          indicator="line"
          label="desktop"
          payload={[
            { dataKey: "visitors", name: "visitors", value: 5, payload: {} },
          ]}
        />
      )
    );
    expect(container.querySelector(".w-1")).toBeInTheDocument();
  });

  it("renders a dashed indicator", () => {
    const { container } = render(
      withContainer(
        <ChartTooltipContent
          active
          indicator="dashed"
          payload={[
            { dataKey: "visitors", name: "visitors", value: 5, payload: {} },
          ]}
        />
      )
    );
    expect(container.querySelector(".border-dashed")).toBeInTheDocument();
  });

  it("uses a custom formatter to render the row when provided", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          formatter={(value, name) => (
            <span>
              {String(name)}={String(value)}
            </span>
          )}
          payload={[
            { dataKey: "visitors", name: "visitors", value: 7, payload: {} },
          ]}
        />
      )
    );
    expect(screen.getByText("visitors=7")).toBeInTheDocument();
  });

  it("resolves the item config through a top-level string field matching the key", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          nameKey="category"
          payload={[
            {
              dataKey: "value",
              category: "desktop",
              value: 3,
              payload: {},
            } as never,
          ]}
        />
      )
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("resolves the item config through the nested payload.payload key", () => {
    render(
      withContainer(
        <ChartTooltipContent
          active
          nameKey="category"
          payload={[
            {
              dataKey: "value",
              value: 3,
              payload: { category: "desktop" },
            },
          ]}
        />
      )
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

describe("ChartLegendContent", () => {
  it("renders nothing when payload is empty", () => {
    const { container } = render(
      withContainer(<ChartLegendContent payload={[]} />)
    );
    expect(container.querySelector(".flex.items-center.justify-center")).not.toBeInTheDocument();
  });

  it("renders legend entries with icons and labels, aligned to the bottom by default", () => {
    const { container } = render(
      withContainer(
        <ChartLegendContent
          payload={[{ value: "desktop", dataKey: "desktop", color: "#2563eb" }]}
        />
      )
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(container.querySelector(".pt-3")).toBeInTheDocument();
  });

  it("aligns to the top when verticalAlign is 'top'", () => {
    const { container } = render(
      withContainer(
        <ChartLegendContent
          verticalAlign="top"
          payload={[{ value: "visitors", dataKey: "visitors" }]}
        />
      )
    );
    expect(container.querySelector(".pb-3")).toBeInTheDocument();
  });

  it("falls back to a color swatch when hideIcon is true or there is no icon", () => {
    const { container } = render(
      withContainer(
        <ChartLegendContent
          hideIcon
          payload={[{ value: "desktop", dataKey: "desktop", color: "#2563eb" }]}
        />
      )
    );
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(container.querySelector(".h-2.w-2")).toBeInTheDocument();
  });
});
