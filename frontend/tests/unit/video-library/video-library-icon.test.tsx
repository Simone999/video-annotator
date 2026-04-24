// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VideoLibraryIcon } from "../../../src/features/video-library/components/video-library-icon";

afterEach(() => {
  cleanup();
});

describe("VideoLibraryIcon", () => {
  it.each([
    ["search", "search"],
    ["settings", "settings"],
    ["help", "help"],
    ["chevronDown", "expand_more"],
    ["moreHorizontal", "more_vert"],
  ] as const)("maps %s to material symbol %s", (name, symbolName) => {
    const { container } = render(<VideoLibraryIcon name={name} />);

    expect(container.querySelector(".material-symbol")).toHaveAttribute(
      "data-icon",
      symbolName,
    );
  });
});
