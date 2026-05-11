import { expect, test } from "@playwright/test";

test("Encrypt renderer loads the research shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Encrypt/);
  await expect(page.getByText("Finance-first research terminal")).toBeVisible();
  await expect(page.getByText("AI summary card")).toBeVisible();
});
