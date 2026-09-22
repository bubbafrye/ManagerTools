import { expect, test, type Page } from "@playwright/test";

test("Growth Framework Role panel uses CSV copy and five vis cells", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const framework = page.getByRole("region", { name: "Growth Framework" });
  await expect(
    framework.getByRole("heading", { name: "Product Designer I" }),
  ).toBeVisible();
  await expect(framework.getByText("Associate", { exact: true })).toBeVisible();
  await expect(framework.getByRole("button", { name: "See more..." })).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toHaveCount(0);
  await expect(
    framework.getByText(/foundational design execution/),
  ).toHaveCount(0);

  await framework.getByRole("button", { name: "See more..." }).click();
  await expect(
    framework.getByText(/foundational design execution/),
  ).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toBeVisible();
  await framework.getByRole("button", { name: "See less..." }).click();
  await expect(framework.getByRole("button", { name: "See more..." })).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toHaveCount(0);
  await framework.getByRole("button", { name: "See more..." }).click();

  const columns = framework.locator("[data-layout='growth-array'] > div");
  await expect(columns).toHaveCount(6);
  await expect(columns.first().locator("[data-tier]")).toHaveCount(5);
  await expect(columns.first()).toHaveAttribute("data-rating", "1");

  const skills = framework.locator("[data-layout='growth-skills']");
  await expect(skills).toHaveCSS("opacity", "0");

  await framework.getByRole("button", { name: "View Skills" }).click();
  await expect(skills).toHaveCSS("opacity", "1");
  await expect(framework.getByRole("button", { name: "Hide Skills" })).toBeVisible();
  await expect(
    framework.getByRole("heading", { name: "Technical Ability" }),
  ).toBeVisible();
  await expect(skills.getByText("IC’s Assessment").first()).toBeVisible();
  await expect(skills.getByText("Manager’s Assessment").first()).toBeVisible();

  const selector = skills.locator("[data-skill='Technical Ability'] [data-tier]");
  await expect(selector).toHaveCount(5);

  await framework.getByRole("button", { name: "Technical Ability rating 1" }).click();
  await expect(columns.first()).toHaveAttribute("data-rating", "1");

  await framework.getByRole("button", { name: "Technical Ability rating 3" }).click();
  await expect(columns.first()).toHaveAttribute("data-rating", "3");

  await framework.getByRole("button", { name: "Hide Skills" }).click();
  await expect(skills).toHaveCSS("opacity", "0");

  await expect(framework.getByRole("button", { name: "Role level I" })).toHaveCount(0);
  await page.getByRole("button", { name: "Document settings" }).click();
  await expect(framework.getByRole("button", { name: "Role level I", exact: true })).toBeVisible();
  await framework.getByRole("button", { name: "Role level III", exact: true }).click();
  await expect(
    framework.getByRole("heading", { name: "Product Designer III" }),
  ).toBeVisible();
  await expect(framework.getByText("Senior", { exact: true })).toBeVisible();
  await expect(framework.getByText(/Operates with high autonomy/)).toBeVisible();
  await expect(columns.first()).toHaveAttribute("data-rating", "3");
});

test("Growth Framework array columns scrub rating on vertical drag", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const column = page.locator("[data-layout='growth-array'] > div").first();
  await expect(column).toHaveAttribute("data-rating", "1");

  const start = column.locator("[data-tier='1']");
  const end = column.locator("[data-tier='4']");
  const startBox = await start.boundingBox();
  const endBox = await end.boundingBox();
  if (!startBox || !endBox) throw new Error("array cells missing boxes");

  await page.mouse.move(
    startBox.x + startBox.width / 2,
    startBox.y + startBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(column).toHaveAttribute("data-rating", "4");

  await column.locator("[data-tier='2']").click();
  await expect(column).toHaveAttribute("data-rating", "2");
});

test("Growth Framework 960–1159 uses narrow stacked top-level", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/");

  const role = page.locator("[data-layout='growth-role']");
  await expect(role).toHaveAttribute("data-short", "");

  const metrics = await page.evaluate(() => {
    const roleEl = document.querySelector("[data-layout='growth-role']");
    const label = document.querySelector("[data-layout='growth-array'] p");
    const array = document.querySelector("[data-layout='growth-array']");
    const chart = roleEl?.querySelector("[class*='chart']");
    if (!roleEl || !label || !array || !chart) {
      throw new Error("growth layout nodes missing");
    }
    return {
      roleDirection: getComputedStyle(roleEl).flexDirection,
      labelWritingMode: getComputedStyle(label).writingMode,
      arrayGap: getComputedStyle(array).gap,
      arrayPadding: getComputedStyle(array).padding,
      chartHeight: chart.getBoundingClientRect().height,
    };
  });

  expect(metrics.roleDirection).toBe("column");
  expect(metrics.labelWritingMode).toBe("vertical-rl");
  expect(metrics.arrayGap).toBe("15px");
  expect(metrics.arrayPadding).toBe("10px");
  expect(metrics.chartHeight).toBeCloseTo(274, 0);
});

async function sideBySideMetrics(page: Page) {
  return page.evaluate(() => {
    const role = document.querySelector("[data-layout='growth-role']");
    const info = role?.querySelector("[class*='info']");
    const chart = role?.querySelector("[class*='chart']");
    const array = document.querySelector("[data-layout='growth-array']");
    const column = array?.querySelector(":scope > div");
    const columns = array?.querySelectorAll(":scope > div") ?? [];
    const label = array?.querySelector("p");
    if (!role || !info || !chart || !array || !column || !label) {
      throw new Error("growth layout nodes missing");
    }
    const columnRects = [...columns].map((item) => item.getBoundingClientRect());
    const arrayStyle = getComputedStyle(array);
    const chartRect = chart.getBoundingClientRect();
    return {
      roleDirection: getComputedStyle(role).flexDirection,
      labelWritingMode: getComputedStyle(label).writingMode,
      infoWidth: info.getBoundingClientRect().width,
      infoHeight: info.getBoundingClientRect().height,
      chartWidth: chartRect.width,
      chartHeight: chartRect.height,
      chartFlex: getComputedStyle(chart).flex,
      arrayGap: arrayStyle.gap,
      arrayPadding: arrayStyle.padding,
      columnPadding: getComputedStyle(column).padding,
      columnGap: getComputedStyle(column).gap,
      columnWidth: column.getBoundingClientRect().width,
      columnCount: columnRects.length,
      lastColumnRight: columnRects.at(-1)?.right ?? 0,
      chartRight: chartRect.right,
      roleRight: role.getBoundingClientRect().right,
    };
  });
}

test("Growth Framework 1160–1279 uses medium side-by-side array", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");

  const metrics = await sideBySideMetrics(page);

  expect(metrics.roleDirection).toBe("row");
  expect(metrics.labelWritingMode).toBe("horizontal-tb");
  expect(metrics.columnCount).toBe(6);
  expect(metrics.columnWidth).toBeCloseTo(90, 0);
  expect(metrics.arrayGap).toBe("15px");
  expect(metrics.arrayPadding).toBe("10px");
  expect(metrics.columnPadding).toBe("3px 5px");
  expect(metrics.columnGap).toBe("2px");
  expect(metrics.chartHeight).toBeCloseTo(metrics.infoHeight, 0);
  expect(metrics.lastColumnRight).toBeLessThanOrEqual(metrics.chartRight + 1);
  expect(metrics.chartRight).toBeLessThanOrEqual(metrics.roleRight + 1);
  expect(metrics.infoWidth + metrics.chartWidth).toBeLessThan(metrics.roleRight - 50);
});

test("Growth Framework ≥1280 uses wide side-by-side array", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const metrics = await sideBySideMetrics(page);

  expect(metrics.roleDirection).toBe("row");
  expect(metrics.labelWritingMode).toBe("horizontal-tb");
  expect(metrics.columnCount).toBe(6);
  expect(metrics.arrayGap).toBe("25px");
  expect(metrics.arrayPadding).toBe("10px");
  expect(metrics.columnPadding).toBe("3px 5px");
  expect(metrics.columnGap).toBe("2px");
  expect(metrics.chartWidth).toBeCloseTo(730, 0);
  expect(metrics.chartHeight).toBeCloseTo(metrics.infoHeight, 0);
  expect(metrics.columnWidth).toBeGreaterThan(90);
  expect(metrics.lastColumnRight).toBeLessThanOrEqual(metrics.chartRight + 1);
  expect(metrics.chartRight).toBeLessThanOrEqual(metrics.roleRight + 1);
  expect(metrics.infoWidth + metrics.chartWidth).toBeLessThan(metrics.roleRight - 50);
});
