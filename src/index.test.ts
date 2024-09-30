import { describe, expect, it } from "vitest";
import { makeVueComponent } from "./index";

describe("makeVueComponent", () => {
  it("wraps an icon string as a Vue component", () => {
    const iconString = "<svg>...</svg>";
    const component = makeVueComponent(iconString);
    expect(component.type).toBe("span");
    expect(component.props?.innerHTML).toBe(iconString.replace(/"/g, "'"));
  });

  it("handles empty string input", () => {
    const component = makeVueComponent("");
    expect(component.type).toBe("span");
    expect(component.props?.innerHTML).toBe(undefined);
  });

  it("preserves attributes in the SVG and replaces double quotes with single quotes", () => {
    const iconString =
      '<svg width="24" height="24" viewBox="0 0 24 24">...</svg>';
    const component = makeVueComponent(iconString);
    console.log(component.props?.innerHTML);
    expect(component.props?.innerHTML).toContain("width='24'");
    expect(component.props?.innerHTML).toContain("height='24'");
    expect(component.props?.innerHTML).toContain("viewBox='0 0 24 24'");
  });

  it("handles complex nested SVG content", () => {
    const iconString =
      '<svg><g><path d="M10 10"></path><circle cx="5" cy="5" r="3"></circle></g></svg>';
    const component = makeVueComponent(iconString);
    expect(component.props?.innerHTML).toContain("<g>");
    expect(component.props?.innerHTML).toContain("<path d='M10 10'>");
    expect(component.props?.innerHTML).toContain(
      "<circle cx='5' cy='5' r='3'>"
    );
  });

  it("applies the correct size class", () => {
    const iconString = "<svg>...</svg>";
    const component = makeVueComponent(iconString, "md");
    expect(component.props?.class).toBe("icon-md");
  });

  it("applies no size class when size is 'none'", () => {
    const iconString = "<svg>...</svg>";
    const component = makeVueComponent(iconString, "none");
    expect(component.props?.class).toBeUndefined();
  });

  it("sets aria-hidden attribute correctly", () => {
    const iconString = "<svg>...</svg>";
    const hiddenComponent = makeVueComponent(iconString, "sm", true);
    expect(hiddenComponent.props?.["aria-hidden"]).toBe("true");

    const visibleComponent = makeVueComponent(iconString, "sm", false);
    expect(visibleComponent.props?.["aria-hidden"]).toBeUndefined();
  });

  it("uses default values for size and hide when not provided", () => {
    const iconString = "<svg>...</svg>";
    const component = makeVueComponent(iconString);
    expect(component.props?.class).toBe("icon-sm");
    expect(component.props?.["aria-hidden"]).toBe("true");
  });
});

