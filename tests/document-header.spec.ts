import { expect, test, type Locator } from "@playwright/test";

async function colorAlpha(locator: Locator) {
  return locator.evaluate((el) => {
    const color = getComputedStyle(el).color;
    const slash = color.match(/\/\s*([\d.]+)/);
    if (slash) return Number(slash[1]);
    const rgba = color.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
    if (rgba) return Number(rgba[1]);
    return 1;
  });
}

test("document header IC and Manager names are full opacity in static view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC name" });
  const manager = page.getByRole("textbox", { name: "Manager name" });
  expect(await colorAlpha(ic)).toBe(1);
  expect(await colorAlpha(manager)).toBe(1);

  await page.getByRole("button", { name: "Document settings" }).click();
  expect(await colorAlpha(ic)).toBeCloseTo(0.6);
  expect(await colorAlpha(manager)).toBeCloseTo(0.6);

  await ic.click();
  await page.keyboard.type(" Ada");
  expect(await colorAlpha(ic)).toBe(1);
  expect(await colorAlpha(manager)).toBeCloseTo(0.6);
});

test("document header places adjust left, names center, and range right", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const header = page.locator("[data-layout='document-header']");
  const settings = page.getByRole("button", { name: "Document settings" });
  const names = page.locator("[data-layout='ic-manager']");
  const period = page.locator("[data-layout='period']");
  const ic = page.getByRole("textbox", { name: "IC name" });
  const manager = page.getByRole("textbox", { name: "Manager name" });

  const headerBox = await header.boundingBox();
  const settingsBox = await settings.boundingBox();
  const namesBox = await names.boundingBox();
  const periodBox = await period.boundingBox();
  const icBox = await ic.boundingBox();
  const managerBox = await manager.boundingBox();
  expect(headerBox).toBeTruthy();
  expect(settingsBox).toBeTruthy();
  expect(namesBox).toBeTruthy();
  expect(periodBox).toBeTruthy();
  expect(icBox).toBeTruthy();
  expect(managerBox).toBeTruthy();

  expect(settingsBox!.x).toBeCloseTo(headerBox!.x + 17, 1);
  expect(settingsBox!.width).toBeCloseTo(28, 0);
  expect(settingsBox!.height).toBeCloseTo(29, 0);

  const settingsSlot = page.locator("[data-layout='settings']");
  const settingsSlotBox = await settingsSlot.boundingBox();
  expect(settingsSlotBox).toBeTruthy();
  expect(settingsSlotBox!.width).toBeCloseTo(180, 0);

  expect(periodBox!.width).toBeGreaterThanOrEqual(179);
  expect(periodBox!.x + periodBox!.width).toBeCloseTo(
    headerBox!.x + headerBox!.width - 17,
    1,
  );

  const clusterMid = (icBox!.x + managerBox!.x + managerBox!.width) / 2;
  const leftoverMid = namesBox!.x + namesBox!.width / 2;
  const headerMid = headerBox!.x + headerBox!.width / 2;
  expect(clusterMid).toBeCloseTo(leftoverMid, 0);
  expect(clusterMid).toBeCloseTo(headerMid, 1);
});

test("document header stacks settings+period above centered names under 768px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const header = page.locator("[data-layout='document-header']");
  const settings = page.getByRole("button", { name: "Document settings" });
  const names = page.locator("[data-layout='ic-manager']");
  const period = page.locator("[data-layout='period']");
  const ic = page.getByRole("textbox", { name: "IC name" });
  const manager = page.getByRole("textbox", { name: "Manager name" });

  const headerBox = await header.boundingBox();
  const settingsBox = await settings.boundingBox();
  const namesBox = await names.boundingBox();
  const periodBox = await period.boundingBox();
  const icBox = await ic.boundingBox();
  const managerBox = await manager.boundingBox();
  expect(headerBox).toBeTruthy();
  expect(settingsBox).toBeTruthy();
  expect(namesBox).toBeTruthy();
  expect(periodBox).toBeTruthy();
  expect(icBox).toBeTruthy();
  expect(managerBox).toBeTruthy();

  expect(periodBox!.y).toBeLessThan(settingsBox!.y + settingsBox!.height);
  expect(settingsBox!.y).toBeLessThan(periodBox!.y + periodBox!.height);
  expect(periodBox!.x).toBeGreaterThan(settingsBox!.x + settingsBox!.width - 1);
  expect(namesBox!.y).toBeGreaterThan(periodBox!.y + periodBox!.height - 1);

  const clusterMid = (icBox!.x + managerBox!.x + managerBox!.width) / 2;
  const headerMid = headerBox!.x + headerBox!.width / 2;
  expect(clusterMid).toBeCloseTo(headerMid, 0);

  const periodSize = await period.evaluate((el) =>
    Number.parseFloat(getComputedStyle(el).fontSize),
  );
  const subheaderSize = await page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--document-text-subheader-font-size",
      ),
    ),
  );
  expect(periodSize).toBeCloseTo(subheaderSize, 0);
});

test("default IC and Manager names clear on focus and restore if left unchanged", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const ic = page.getByRole("textbox", { name: "IC name" });
  const manager = page.getByRole("textbox", { name: "Manager name" });

  await expect(ic).toHaveText("IC");
  await ic.click();
  await expect(ic).toHaveText("");
  await manager.click();
  await expect(ic).toHaveText("IC");
  await expect(manager).toHaveText("");
  await page.locator("[data-layout='period']").click();
  await expect(manager).toHaveText("Manager");

  await ic.click();
  await page.keyboard.type("Ada");
  await manager.click();
  await expect(ic).toHaveText("Ada");
  await ic.click();
  await expect(ic).toHaveText("Ada");
});

test("unset period shows Date Range at half opacity until a range is chosen", async ({
  page,
}) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("button", { name: "Create new page" }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(
    /^#\/p\/[0-9a-f-]{36}$/i,
  );

  const period = page.locator("[data-layout='period']");
  const label = period.locator("[data-layout='period-label']");
  await expect(label).toHaveText("Date Range");
  await expect(label).toHaveCSS("opacity", "0.5");

  await period.getByRole("button").first().click();
  await page.getByRole("button", { name: "Q1" }).click();
  await expect(label).toContainText("Q1");
  await expect(label).not.toHaveText("Date Range");
  await expect(label).toHaveCSS("opacity", "1");
});

test("Date Range control opens a picker that updates the header period", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const period = page.locator("[data-layout='period']");
  await period.getByRole("button").first().click();

  const picker = page.locator("[data-layout='date-picker']");
  await expect(picker).toBeVisible();
  await expect(picker.getByRole("button", { name: "Q1" })).toBeVisible();
  await expect(picker.getByRole("button", { name: "YEAR", exact: true })).toBeVisible();

  await picker.getByRole("button", { name: "Q3" }).click();
  await expect(picker).toHaveCount(0);
  await expect(period).toContainText("Q3");

  await period.getByRole("button").first().click();
  await page.getByRole("button", { name: "Year", exact: true }).click();
  const nextYear = page.getByRole("option").nth(1);
  const year = (await nextYear.innerText()).trim();
  await nextYear.click();
  await expect(period).toContainText(`Q3 ${year}`);

  await page.getByRole("button", { name: "YEAR", exact: true }).click();
  await expect(period).toContainText(year);
});
