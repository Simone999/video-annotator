import { expect, test } from "@playwright/test";

test("route flow opens review, survives refresh, and returns to library", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Video Library" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Open Review bedroom.mp4" }).click();

  await expect(page).toHaveURL(/\/review\/video-/);
  await expect(
    page.getByRole("heading", { name: "Review surface" }),
  ).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/review\/video-/);
  await expect(page.getByText(/^Canonical frame \d+$/)).toBeVisible();

  await page.getByRole("button", { name: "Back to Library" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Video Library" }),
  ).toBeVisible();
});
