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

test("swatch writes a color token live", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const picker = page.getByLabel("header color", { exact: true });
  await picker.fill("#ff0000");

  const textColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--document-header-text-color")
      .trim()
      .toLowerCase(),
  );
  expect(textColor).toBe("#ff0000");
});

test("rando sits on the right of the edit strip and randomizes look tokens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const strip = page.locator("[data-layout='edit-strip']");
  const panel = page.locator("[data-layout='adjustment-panel']");
  const rando = page.getByRole("button", { name: "rando" });
  const sand = page.getByRole("button", { name: "sand" });
  await expect(rando.locator('img[src="/assets/rando.svg"]')).toBeVisible();
  await expect(sand.locator('img[src="/assets/sand.svg"]')).toBeVisible();

  const boxes = await Promise.all([
    panel.boundingBox(),
    rando.boundingBox(),
    sand.boundingBox(),
    strip.boundingBox(),
  ]);
  expect(boxes[0]?.x).toBeLessThan(boxes[1]?.x ?? 0);
  expect(boxes[1]?.x).toBeLessThan(boxes[2]?.x ?? 0);
  expect((boxes[2]?.x ?? 0) + (boxes[2]?.width ?? 0)).toBeGreaterThan(
    (boxes[3]?.x ?? 0) + (boxes[3]?.width ?? 0) - 8,
  );

  const before = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      header: root.getPropertyValue("--document-header-text-color").trim(),
      actions: root.getPropertyValue("--actions-actions-container-surface").trim(),
      marginTop: root.getPropertyValue("--document-margins-top").trim(),
      marginSides: root.getPropertyValue("--document-margins-sides").trim(),
    };
  });

  await rando.click();

  const after = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const read = (token: string) => root.getPropertyValue(token).trim();
    const px = (token: string) => Number.parseFloat(read(token));
    const hex = (token: string) => {
      const raw = read(token);
      if (raw.startsWith("#")) return raw.slice(0, 7).toLowerCase();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "#000000";
      ctx.fillStyle = raw;
      return String(ctx.fillStyle).slice(0, 7).toLowerCase();
    };
    const luminance = (value: string) => {
      const n = value.replace("#", "");
      const channel = (part: string) => {
        const c = Number.parseInt(part, 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return (
        0.2126 * channel(n.slice(0, 2)) +
        0.7152 * channel(n.slice(2, 4)) +
        0.0722 * channel(n.slice(4, 6))
      );
    };
    const contrast = (a: string, b: string) => {
      const light = Math.max(luminance(a), luminance(b));
      const dark = Math.min(luminance(a), luminance(b));
      return (light + 0.05) / (dark + 0.05);
    };
    const header = hex("--document-header-text-color");
    const body = hex("--document-body-text-color");
    const surfaces = [
      "--document-body-color",
      "--actions-actions-container-surface",
      "--actions-actions-panel-surface",
      "--goals-goals-container-surface",
      "--goals-goals-panel-surface",
      "--agenda-agenda-container-surface",
      "--agenda-agenda-panel-surface",
      "--notes-notes-container-surface",
      "--notes-notes-panel-surface",
      "--ui-ui-surface-color",
    ].map(hex);
    return {
      header: read("--document-header-text-color"),
      actions: read("--actions-actions-container-surface"),
      headerFont: read("--document-text-header-font-face"),
      bodyFont: read("--document-text-body-font-face"),
      marginTop: read("--document-margins-top"),
      marginSides: read("--document-margins-sides"),
      containerRadius: px("--container-container-radii"),
      panelRadius: px("--document-panel-radii"),
      containerStroke: px("--container-container-stroke-weight"),
      panelStroke: px("--document-panel-stroke-weight"),
      uiStroke: px("--ui-ui-stroke-weight"),
      minContrast: Math.min(
        ...surfaces.flatMap((surface) => [
          contrast(header, surface),
          contrast(body, surface),
        ]),
      ),
    };
  });

  expect(after.marginTop).toBe(before.marginTop);
  expect(after.marginSides).toBe(before.marginSides);
  expect(after.panelRadius).toBe(after.containerRadius / 2);
  expect(after.containerRadius).toBeGreaterThanOrEqual(0);
  expect(after.containerRadius).toBeLessThanOrEqual(50);
  expect(after.containerStroke).toBeGreaterThanOrEqual(0);
  expect(after.containerStroke).toBeLessThanOrEqual(20);
  expect(after.panelStroke).toBeGreaterThanOrEqual(0);
  expect(after.panelStroke).toBeLessThanOrEqual(20);
  expect(after.uiStroke).toBeGreaterThanOrEqual(0);
  expect(after.uiStroke).toBeLessThanOrEqual(20);
  expect(after.minContrast).toBeGreaterThanOrEqual(3);
  expect(after.headerFont.length).toBeGreaterThan(0);
  expect(after.bodyFont.length).toBeGreaterThan(0);
  expect(
    after.header !== before.header || after.actions !== before.actions,
  ).toBe(true);
});

test("sand randomizes a warm look with aquatic accents", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("button", { name: "sand" }).click();

  const after = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const read = (token: string) => root.getPropertyValue(token).trim();
    const px = (token: string) => Number.parseFloat(read(token));
    const hex = (token: string) => {
      const raw = read(token);
      if (raw.startsWith("#")) return raw.slice(0, 7).toLowerCase();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "#000000";
      ctx.fillStyle = raw;
      return String(ctx.fillStyle).slice(0, 7).toLowerCase();
    };
    const hue = (value: string) => {
      const n = value.replace("#", "");
      const r = Number.parseInt(n.slice(0, 2), 16) / 255;
      const g = Number.parseInt(n.slice(2, 4), 16) / 255;
      const b = Number.parseInt(n.slice(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      if (delta === 0) return 0;
      let h = 0;
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      return h < 0 ? h + 360 : h;
    };
    const luminance = (value: string) => {
      const n = value.replace("#", "");
      const channel = (part: string) => {
        const c = Number.parseInt(part, 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return (
        0.2126 * channel(n.slice(0, 2)) +
        0.7152 * channel(n.slice(2, 4)) +
        0.0722 * channel(n.slice(4, 6))
      );
    };
    const contrast = (a: string, b: string) => {
      const light = Math.max(luminance(a), luminance(b));
      const dark = Math.min(luminance(a), luminance(b));
      return (light + 0.05) / (dark + 0.05);
    };
    const header = hex("--document-header-text-color");
    const body = hex("--document-body-text-color");
    const surfaces = [
      "--document-body-color",
      "--actions-actions-container-surface",
      "--actions-actions-panel-surface",
      "--goals-goals-container-surface",
      "--goals-goals-panel-surface",
      "--agenda-agenda-container-surface",
      "--agenda-agenda-panel-surface",
      "--notes-notes-container-surface",
      "--notes-notes-panel-surface",
      "--ui-ui-surface-color",
    ].map(hex);
    return {
      containerRadius: px("--container-container-radii"),
      panelRadius: px("--document-panel-radii"),
      containerStroke: px("--container-container-stroke-weight"),
      panelStroke: px("--document-panel-stroke-weight"),
      uiStroke: px("--ui-ui-stroke-weight"),
      bodyHue: hue(hex("--document-body-color")),
      accentHue: hue(hex("--ui-ui2-surface-color")),
      minContrast: Math.min(
        ...surfaces.flatMap((surface) => [
          contrast(header, surface),
          contrast(body, surface),
        ]),
      ),
    };
  });

  expect(after.panelRadius).toBe(after.containerRadius / 2);
  expect(after.containerRadius).toBeGreaterThanOrEqual(0);
  expect(after.containerRadius).toBeLessThan(10);
  expect(after.panelRadius).toBeLessThan(10);
  expect(after.containerStroke).toBeGreaterThanOrEqual(0);
  expect(after.containerStroke).toBeLessThan(5);
  expect(after.panelStroke).toBeLessThan(5);
  expect(after.uiStroke).toBeLessThan(5);
  expect(after.bodyHue).toBeGreaterThanOrEqual(15);
  expect(after.bodyHue).toBeLessThanOrEqual(55);
  expect(after.accentHue).toBeGreaterThanOrEqual(160);
  expect(after.accentHue).toBeLessThanOrEqual(220);
  expect(after.minContrast).toBeGreaterThanOrEqual(3);
});
