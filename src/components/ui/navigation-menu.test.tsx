import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

describe("NavigationMenu", () => {
  it("renders the menu structure with an in-flow viewport by default", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/a">Link A</NavigationMenuLink>
            </NavigationMenuContent>
            <NavigationMenuIndicator />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("omits the built-in viewport when viewport is false", () => {
    const { container } = render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/a">Link A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(
      container.querySelector('[data-slot="navigation-menu"]')
    ).toHaveAttribute("data-viewport", "false");
    expect(
      container.querySelector('[data-slot="navigation-menu-viewport"]')
    ).not.toBeInTheDocument();
  });

  it("mounts an explicit NavigationMenuViewport without throwing", () => {
    expect(() =>
      render(
        <NavigationMenu viewport={false}>
          <NavigationMenuList />
          <NavigationMenuViewport />
        </NavigationMenu>
      )
    ).not.toThrow();
  });

  it("exposes navigationMenuTriggerStyle for external use", () => {
    expect(navigationMenuTriggerStyle()).toContain("inline-flex");
  });
});
