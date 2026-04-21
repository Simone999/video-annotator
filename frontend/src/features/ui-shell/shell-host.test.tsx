// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { UiShellApp } from "./shell-host";

afterEach(() => {
  cleanup();
});

describe("UiShellApp", () => {
  it("renders library mockup chrome and required fixture metadata", async () => {
    render(<UiShellApp />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Video Annotation")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search filename, folder, or tag"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();

    const summary = screen.getByRole("list", { name: "Library summary" });
    expect(within(summary).getByText("Total Videos")).toBeInTheDocument();
    expect(within(summary).getByText("193")).toBeInTheDocument();
    expect(within(summary).getByText("Started")).toBeInTheDocument();
    expect(within(summary).getByText("21")).toBeInTheDocument();
    expect(within(summary).getByText("In Progress")).toBeInTheDocument();
    expect(within(summary).getByText("38")).toBeInTheDocument();
    expect(within(summary).getByText("Ready for Review")).toBeInTheDocument();
    expect(within(summary).getByText("5")).toBeInTheDocument();
    expect(within(summary).getByText("Exported")).toBeInTheDocument();
    expect(within(summary).getByText("83")).toBeInTheDocument();

    const reviewCard = screen.getByRole("article", {
      name: "tunnel_cam_007.mp4",
    });
    expect(within(reviewCard).getByText("Ready")).toBeInTheDocument();
    expect(
      within(reviewCard).getByText("validation_set / ready-review"),
    ).toBeInTheDocument();
    expect(within(reviewCard).getByText("8,512")).toBeInTheDocument();
    expect(within(reviewCard).getByText("30")).toBeInTheDocument();
    expect(within(reviewCard).getByText("2560x1440")).toBeInTheDocument();
    expect(within(reviewCard).getByText("Not Started")).toBeInTheDocument();
    expect(
      within(reviewCard).getByText("Boxes only: 6 objects"),
    ).toBeInTheDocument();

    const progressCard = screen.getByRole("article", {
      name: "street_scene_014.mp4",
    });
    expect(within(progressCard).getByText("In Progress")).toBeInTheDocument();
    expect(
      within(progressCard).getByText("Masks: 14 objects"),
    ).toBeInTheDocument();
    expect(
      within(progressCard).getByLabelText(
        "Propagation completion street_scene_014.mp4 68 percent",
      ),
    ).toBeInTheDocument();

    const exportedCard = screen.getByRole("article", {
      name: "loading_bay_102.mp4",
    });
    expect(within(exportedCard).getByText("Exported")).toBeInTheDocument();
    expect(
      within(exportedCard).getByText("JSON + PNG masks"),
    ).toBeInTheDocument();
    expect(
      within(exportedCard).queryByLabelText(/Propagation completion/i),
    ).not.toBeInTheDocument();
  });

  it("opens review shell through local open-review action only", async () => {
    const user = userEvent.setup();

    render(<UiShellApp />);

    await screen.findByRole("heading", { name: "Video Library" });

    await user.click(
      screen.getByRole("button", {
        name: "Open Review loading_bay_102.mp4",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Review Shell" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Selected fixture:")).toBeInTheDocument();
    expect(screen.getByText("loading_bay_102.mp4")).toBeInTheDocument();
  });
});
