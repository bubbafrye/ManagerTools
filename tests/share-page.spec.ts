import { expect, test } from "@playwright/test";

test("Create new page opens an empty shared room and copies the invite URL", async ({
  page,
}) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByText("Make this moar pretty")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create new page" })).toHaveCount(0);
  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("button", { name: "Create new page" }).click();

  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(
    /^#\/p\/[0-9a-f-]{36}$/i,
  );
  await expect(page.getByText("Make this moar pretty")).toHaveCount(0);
  await expect(page.getByText("Copied")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain(page.url());
});
