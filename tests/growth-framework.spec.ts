import { expect, test } from "@playwright/test";

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
  await expect(framework.getByRole("button", { name: "Read more..." })).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toHaveCount(0);
  await expect(
    framework.getByText(/foundational design execution/),
  ).toHaveCount(0);

  await framework.getByRole("button", { name: "Read more..." }).click();
  await expect(
    framework.getByText(/foundational design execution/),
  ).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toBeVisible();
  await framework.getByText(/foundational design execution/).click();
  await expect(framework.getByRole("button", { name: "Read more..." })).toBeVisible();
  await expect(framework.getByRole("button", { name: "View Skills" })).toHaveCount(0);
  await framework.getByRole("button", { name: "Read more..." }).click();

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

test("Growth Framework top-level uses side-by-side layout from 960px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/");

  const role = page.locator("[data-layout='growth-role']");
  await expect(role).toHaveAttribute("data-short", "");

  const metrics = await page.evaluate(() => {
    const roleEl = document.querySelector("[data-layout='growth-role']");
    const label = document.querySelector("[data-layout='growth-array'] p");
    if (!roleEl || !label) throw new Error("growth layout nodes missing");
    return {
      roleDirection: getComputedStyle(roleEl).flexDirection,
      labelWritingMode: getComputedStyle(label).writingMode,
      roleHeight: roleEl.getBoundingClientRect().height,
    };
  });

  expect(metrics.roleDirection).toBe("row");
  expect(metrics.labelWritingMode).toBe("horizontal-tb");
  expect(metrics.roleHeight).toBeCloseTo(240, 0);
});
