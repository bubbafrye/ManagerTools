import { expect, test } from "@playwright/test";

test("adjust toggles the look editor and Escape exits", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const settings = page.getByRole("button", { name: "Document settings" });
  const panel = page.locator("[data-layout='adjustment-panel']");

  await expect(panel).toHaveCount(0);
  await settings.click();
  await expect(panel).toBeVisible();
  await settings.click();
  await expect(panel).toHaveCount(0);

  await settings.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
});

test("font dropdowns list 20 families and show the current face", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const headerFont = page.getByRole("button", { name: "header font" });
  const bodyFont = page.getByRole("button", { name: "body font" });
  await expect(headerFont).toHaveText("Inter");
  await expect(bodyFont).toHaveText("Inter");

  await headerFont.click();
  const options = page.getByRole("option");
  await expect(options).toHaveCount(20);
  await expect(page.getByRole("option", { name: "Lora" })).toHaveCSS(
    "font-family",
    /Lora/,
  );
  await expect(page.getByRole("option", { name: "Roboto Slab" })).toHaveCSS(
    "font-family",
    /Roboto Slab/,
  );
  await expect(page.getByRole("option", { name: "Great Vibes" })).toHaveCSS(
    "font-family",
    /Great Vibes/,
  );
});

test("number and font controls update CSS tokens live", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  await page.getByLabel("panel radius").fill("12");
  await page.getByRole("button", { name: "header font" }).click();
  await page.getByRole("option", { name: "Lora" }).click();

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      radius: root.getPropertyValue("--container-container-radii").trim(),
      header: root.getPropertyValue("--document-text-header-font-face").trim(),
    };
  });
  expect(tokens.radius).toBe("12px");
  expect(tokens.header).toContain("Lora");
});

test("due dates are per item and hidden in static until ticked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByLabel("Due date", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Document settings" }).click();
  const dueTicks = page.getByRole("checkbox", { name: /Show due date/ });
  await expect(dueTicks).toHaveCount(2);
  await expect(page.getByText("Due:")).toHaveCount(2);

  await dueTicks.first().click();
  await page.getByLabel("Due date", { exact: true }).first().fill("2026-08-18");
  await page.getByRole("button", { name: "Document settings" }).click();

  await expect(page.getByText("Due:")).toHaveCount(1);
  await expect(page.getByLabel("Due date", { exact: true })).toHaveValue(
    "2026-08-18",
  );
});

test("IC and Manager names are only editable in look-edit mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC name" });
  await expect(ic).toHaveAttribute("contenteditable", "false");

  await page.getByRole("button", { name: "Document settings" }).click();
  await expect(ic).toHaveAttribute("contenteditable", "true");
});

test("show completed toggle is in the look editor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const toggle = page.getByRole("checkbox", { name: "show completed" });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test("edit mode shows a decorative pencil and section swatches, not nested gears or trash", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const settings = page.getByRole("button", { name: "Document settings" });
  await expect(settings).toHaveCount(1);
  await expect(page.locator('img[src="/assets/trash.svg"]')).toHaveCount(0);
  await expect(page.getByTitle("Action Items container surface")).toHaveCount(0);

  const pencils = page.locator("[data-layout='ic-manager'] img[src='/assets/edit.svg']");
  await expect(pencils).toHaveCount(2);
  await expect(pencils.nth(1).locator("xpath=..")).toHaveCSS(
    "visibility",
    "hidden",
  );

  await settings.click();
  await expect(settings).toHaveCount(1);
  await expect(page.locator('img[src="/assets/trash.svg"]')).toHaveCount(0);
  await expect(page.getByTitle("Action Items container surface")).toHaveCount(1);
  await expect(page.getByTitle("Goals container surface")).toHaveCount(1);
  await expect(page.getByTitle("Agenda container surface")).toHaveCount(1);
  await expect(pencils.nth(1).locator("xpath=..")).toHaveCSS(
    "visibility",
    "visible",
  );
});
