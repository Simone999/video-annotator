// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

const { createRootMock, renderMock } = vi.hoisted(() => ({
  createRootMock: vi.fn(),
  renderMock: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("../../../src/app/App", () => ({
  App: () => <div>Mock app</div>,
}));

describe("frontend entrypoint", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("mounts app into root element", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    createRootMock.mockReturnValue({
      render: renderMock,
    });

    await import("../../../src/main");

    expect(createRootMock).toHaveBeenCalledWith(
      document.getElementById("root"),
    );
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("rejects missing root element", async () => {
    createRootMock.mockReturnValue({
      render: renderMock,
    });

    await expect(import("../../../src/main")).rejects.toThrow(
      "Root element not found",
    );
  });
});
