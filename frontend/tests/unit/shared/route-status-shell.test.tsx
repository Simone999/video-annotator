// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RouteStatusShell } from "../../../src/shared/ui/route-status-shell";

afterEach(() => {
  cleanup();
});

describe("RouteStatusShell", () => {
  it("uses defaults when optional class names are omitted", () => {
    render(
      <RouteStatusShell
        copy="Body copy"
        eyebrow="Route"
        title="Missing page"
      />,
    );

    expect(screen.getByRole("main")).toHaveClass("route-status-screen");
    expect(screen.getByText("Route").className).toContain("text-slate-500");
    expect(
      screen.getByRole("heading", { name: "Missing page" }).className,
    ).toContain("text-slate-50");
    expect(screen.getByText("Body copy").className).toContain("console-copy");
  });

  it("applies custom card, eyebrow, title, copy, and child content classes", () => {
    render(
      <RouteStatusShell
        cardClassName="max-w-2xl"
        copy="Body copy"
        copyClassName="text-sky-100"
        eyebrow="Review route"
        eyebrowClassName="text-slate-400"
        title="Loading"
        titleClassName="tracking-tight"
      >
        <button type="button">Retry</button>
      </RouteStatusShell>,
    );

    expect(screen.getByText("Review route").className).toContain(
      "text-slate-400",
    );
    expect(
      screen.getByRole("heading", { name: "Loading" }).className,
    ).toContain("tracking-tight");
    expect(screen.getByText("Body copy").className).toContain("text-sky-100");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
