import { expect, test, type Page } from "@playwright/test";

function urlsFromCssValue(value: string) {
  return [...value.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => match[1]);
}

async function assertOk(page: Page, url: string) {
  const response = await page.request.get(url);
  expect(response.status(), url).toBe(200);
}

test("header adjust and name-edit masks resolve to existing assets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const adjust = page.getByRole("button", { name: "Document settings" }).locator("span");
  const edit = page.locator("[data-icon='edit']").first();

  const masks = await Promise.all(
    [adjust, edit].map((locator) =>
      locator.evaluate((el) => getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage),
    ),
  );

  const assetUrls = masks.flatMap(urlsFromCssValue);
  expect(assetUrls.some((url) => url.includes("assets/adjust.svg"))).toBe(true);
  expect(assetUrls.some((url) => url.includes("assets/edit.svg"))).toBe(true);

  for (const url of assetUrls) {
    await assertOk(page, url);
  }
});

test("img assets on the 1:1 page return 200", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const srcs = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .map((img) => img.currentSrc || img.src)
      .filter(Boolean),
  );
  expect(srcs.some((src) => src.includes("assets/rando.svg"))).toBe(true);

  for (const src of srcs) {
    await assertOk(page, src);
  }
});
