// @vitest-environment jsdom

import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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

describe("frontend tooling setup", () => {
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
});
