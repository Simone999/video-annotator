import { expect, test } from "../fixtures/review-navigation";

test("seeded review navigation uses manifest jump controls on real route", async ({
  page,
  reviewNavigationSeed,
}) => {
  await page.goto(`/review/${reviewNavigationSeed.video_id}`);

  await expect(page.getByRole("heading", { name: "Review surface" })).toBeVisible();
  await expect(
    page.getByText(`Canonical frame ${String(reviewNavigationSeed.frame_indices[0])}`),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Previous annotated frame" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Next annotated frame" }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Next annotated frame" }).click();
  await expect(
    page.getByText(`Canonical frame ${String(reviewNavigationSeed.frame_indices[1])}`),
  ).toBeVisible();

  await page.getByRole("button", { name: "Previous keyframe" }).click();
  await expect(
    page.getByText(`Canonical frame ${String(reviewNavigationSeed.frame_indices[0])}`),
  ).toBeVisible();

  await page.getByRole("button", { name: "Next keyframe" }).click();
  await expect(
    page.getByText(`Canonical frame ${String(reviewNavigationSeed.frame_indices[1])}`),
  ).toBeVisible();
});
