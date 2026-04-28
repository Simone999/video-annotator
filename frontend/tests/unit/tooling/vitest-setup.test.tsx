// @vitest-environment jsdom

import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

function ToolingSmokeHarness() {
  const [message, setMessage] = useState("idle");

  async function handleLoadMessage() {
    const response = await fetch("/api/tooling-smoke");
    const data = (await response.json()) as { message: string };
    setMessage(data.message);
  }

  return (
    <div>
      <button type="button" onClick={() => void handleLoadMessage()}>
        Load message
      </button>
      <p>{message}</p>
    </div>
  );
}

describe.sequential("frontend tooling setup", () => {
  it("uses shared msw setup and jest-dom matchers", async () => {
    server.use(
      http.get("/api/tooling-smoke", () =>
        HttpResponse.json({
          message: "ready",
        }),
      ),
    );

    render(<ToolingSmokeHarness />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Load message" }));

    expect(await screen.findByText("ready")).toBeInTheDocument();
  });

  it("can rely on deterministic media play and pause in jsdom", async () => {
    const video = document.createElement("video");

    await expect(video.play()).resolves.toBeUndefined();
    expect(() => {
      video.pause();
    }).not.toThrow();
  });

  it("can dirty timers and globals inside one test", () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());

    expect(vi.isFakeTimers()).toBe(true);
    expect(vi.isMockFunction(globalThis.fetch)).toBe(true);
  });

  it("starts the next test with real timers and original globals", () => {
    expect(vi.isFakeTimers()).toBe(false);
    expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
  });

  it("can dirty rendered dom and leave a restored spy behind", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<div>Rendered DOM</div>);
    console.error("dirty");

    expect(screen.getByText("Rendered DOM")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("starts the next test with clean dom and restored spies", () => {
    expect(document.body).toBeEmptyDOMElement();
    expect(vi.isMockFunction(console.error)).toBe(false);
  });
});
