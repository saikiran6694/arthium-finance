import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("shows the default tab content and switches on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Content one</TabsContent>
        <TabsContent value="two">Content two</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content one")).toBeInTheDocument();
    expect(screen.queryByText("Content two")).not.toBeInTheDocument();

    await user.click(screen.getByText("Two"));
    expect(screen.getByText("Content two")).toBeInTheDocument();
    expect(screen.queryByText("Content one")).not.toBeInTheDocument();
  });
});
