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

  await page.getByLabel("corners").fill("12");
  await page.getByLabel("outer borders").fill("5");
  await page.getByLabel("inner borders").fill("7");
  await page.getByRole("button", { name: "header font" }).click();
  await page.getByRole("option", { name: "Lora" }).click();

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      panel: root.getPropertyValue("--containers-panel-radii").trim(),
      panelStroke: root.getPropertyValue("--containers-panel-stroke-weight").trim(),
      card1: root.getPropertyValue("--containers-card1-radii").trim(),
      card1Stroke: root.getPropertyValue("--containers-card1-stroke-weight").trim(),
      card2Stroke: root.getPropertyValue("--containers-card2-stroke-weight").trim(),
      header: root.getPropertyValue("--document-text-header-font-face").trim(),
    };
  });
  expect(tokens.panel).toBe("12px");
  expect(tokens.panelStroke).toBe("5px");
  expect(tokens.card1).toBe("8px");
  expect(tokens.card1Stroke).toBe("7px");
  expect(tokens.card2Stroke).toBe("7px");
  expect(tokens.header).toContain("Lora");
});

test("corner and border inputs can be cleared without changing the live tokens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const corners = page.getByLabel("corners");
  await corners.fill("12");
  await corners.fill("");
  await expect(corners).toHaveValue("");

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      panel: root.getPropertyValue("--containers-panel-radii").trim(),
      card1: root.getPropertyValue("--containers-card1-radii").trim(),
    };
  });
  expect(tokens.panel).toBe("12px");
  expect(tokens.card1).toBe("8px");

  await corners.fill("10");
  const after = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--containers-panel-radii")
      .trim(),
  );
  expect(after).toBe("10px");
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

test("show completed toggle is in edit mode next to Add Item", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const toggle = page.getByRole("checkbox", { name: "show completed" });
  await expect(toggle).toHaveCount(0);

  await page.getByRole("button", { name: "Document settings" }).click();
  await expect(
    page.locator("[data-layout='adjustment-panel']").getByRole("checkbox", {
      name: "show completed",
    }),
  ).toHaveCount(0);
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test("edit mode shows look-editor swatches in the panel, not section headers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const settings = page.getByRole("button", { name: "Document settings" });
  await expect(settings).toHaveCount(1);
  await expect(page.locator('img[src$="assets/trash.svg"]')).toHaveCount(0);
  await expect(page.getByLabel("panels surface")).toHaveCount(0);

  const pencils = page.locator("[data-layout='ic-manager'] [data-icon='edit']");
  await expect(pencils).toHaveCount(2);
  await expect(pencils.nth(1).locator("xpath=..")).toHaveCSS(
    "visibility",
    "hidden",
  );

  await settings.click();
  await expect(settings).toHaveCount(1);
  await expect(page.locator('img[src$="assets/trash.svg"]')).toHaveCount(0);
  const panel = page.locator("[data-layout='adjustment-panel']");
  await expect(panel.getByLabel("panels surface")).toHaveCount(1);
  await expect(panel.getByLabel("section 1 surface")).toHaveCount(1);
  await expect(panel.getByLabel("section 2 surface")).toHaveCount(1);
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

test("themes sit on the left, edit panel on the right, and rando still randomizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const strip = page.locator("[data-layout='edit-strip']");
  const editor = page.locator("[data-layout='theme-editor']");
  const themes = page.locator("[data-layout='themes']");
  const panel = page.locator("[data-layout='adjustment-panel']");
  const rando = page.getByRole("button", { name: "rando" });
  const save = page.getByRole("button", { name: "save theme" });
  await expect(rando.locator('img[src$="assets/rando.svg"]')).toBeVisible();
  await expect(page.locator('img[src$="assets/sand.svg"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "grey" })).toBeVisible();
  await expect(page.getByRole("button", { name: "spring light" })).toBeVisible();
  await expect(page.getByRole("button", { name: "sand light" })).toBeVisible();
  await expect(save).toBeVisible();

  const boxes = await Promise.all([
    themes.boundingBox(),
    panel.boundingBox(),
    rando.boundingBox(),
    strip.boundingBox(),
    editor.boundingBox(),
  ]);
  expect(boxes[0]?.x).toBeLessThan(boxes[1]?.x ?? 0);
  expect(boxes[2]?.x).toBeLessThan(boxes[1]?.x ?? 0);
  expect((boxes[4]?.x ?? 0) + (boxes[4]?.width ?? 0)).toBeGreaterThan(
    (boxes[3]?.x ?? 0) + (boxes[3]?.width ?? 0) - 8,
  );

  const before = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      header: root.getPropertyValue("--document-header-text-color").trim(),
      actions: root.getPropertyValue("--containers-panel-surface").trim(),
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
      "--containers-panel-surface",
      "--containers-card1-surface-color",
      "--containers-card2-surface-color",
      "--ui-ui-surface-color",
    ].map(hex);
    return {
      header: read("--document-header-text-color"),
      actions: read("--containers-panel-surface"),
      headerFont: read("--document-text-header-font-face"),
      bodyFont: read("--document-text-body-font-face"),
      marginTop: read("--document-margins-top"),
      marginSides: read("--document-margins-sides"),
      containerRadius: px("--containers-panel-radii"),
      panelRadius: px("--containers-card1-radii"),
      containerStroke: px("--containers-panel-stroke-weight"),
      panelStroke: px("--containers-card1-stroke-weight"),
      card2Stroke: px("--containers-card2-stroke-weight"),
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
  expect(after.panelRadius).toBe(Math.ceil(after.containerRadius * 0.6));
  expect(after.card2Stroke).toBe(after.panelStroke);
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

test("theme presets apply Figma mode tokens without changing fonts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  await page.getByRole("button", { name: "header font" }).click();
  await page.getByRole("option", { name: "Lora" }).click();

  await page.getByRole("button", { name: "sand dark" }).click();

  const after = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const read = (token: string) => root.getPropertyValue(token).trim();
    return {
      page: read("--document-body-color").toLowerCase(),
      panel: read("--containers-panel-surface").toLowerCase(),
      card1: read("--containers-card1-surface-color").toLowerCase(),
      card2: read("--containers-card2-surface-color").toLowerCase(),
      panelRadii: read("--containers-panel-radii"),
      card1Radii: read("--containers-card1-radii"),
      headerFont: read("--document-text-header-font-face"),
      bodyFont: read("--document-text-body-font-face"),
      corners: (
        document.querySelector(
          '[data-layout="adjustment-panel"] input[aria-label="corners"]',
        ) as HTMLInputElement | null
      )?.value,
    };
  });

  expect(after.page).toBe("#241914");
  expect(after.panel).toBe("#33261e");
  expect(after.card1).toBe("#46372b");
  expect(after.card2).toBe("#2a1d18");
  expect(after.panelRadii).toBe("6px");
  expect(after.card1Radii).toBe("2px");
  expect(after.corners).toBe("6");
  expect(after.headerFont).toMatch(/Lora/);
  expect(after.bodyFont).toMatch(/Inter/);
});

test("grey preset restores the original base palette", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("button", { name: "grey" }).click();

  const after = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const read = (token: string) => root.getPropertyValue(token).trim().toLowerCase();
    return {
      page: read("--document-body-color"),
      panel: read("--containers-panel-surface"),
      card1: read("--containers-card1-surface-color"),
      panelRadii: read("--containers-panel-radii"),
    };
  });

  expect(after.page).toBe("#808080");
  expect(after.panel).toBe("#c6c6c6");
  expect(after.card1).toBe("#e2e2e2");
  expect(after.panelRadii).toBe("6px");
});

test("save theme shows a not-supported notice with OK", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("button", { name: "save theme" }).click();

  const dialog = page.locator("dialog[data-confirm-kind='save-theme']");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Save functionality not supported yet.");
  await expect(dialog.getByRole("button", { name: "OK" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "NO" })).toHaveCount(0);

  await dialog.getByRole("button", { name: "OK" }).click();
  await expect(dialog).toHaveCount(0);
});

test("role editor lists CSV roles with New Role last and save starts disabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Document settings" }).click();

  const role = page.getByRole("button", { name: "Role", exact: true });
  const save = page.getByRole("button", { name: "save role preset" });
  const editPreset = page.getByRole("button", { name: "Edit Preset" });
  await expect(role).toHaveText("Product Designer");
  await expect(save).toBeDisabled();
  await expect(editPreset).toBeEnabled();

  await role.click();
  const options = page.getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(options.nth(0)).toHaveText("Product Designer");
  await expect(options.nth(1)).toHaveText("-- New Role --");

  await page.getByRole("option", { name: "-- New Role --" }).click();
  await expect(role).toHaveText("-- New Role --");
  await expect(
    page.getByRole("heading", { name: "-- New Role -- I" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Role title" })).toBeEditable();
  await expect(page.getByRole("textbox", { name: "Role description" })).toBeEditable();
  await expect(page.getByText("Associate", { exact: true })).toBeVisible();
  await expect(save).toBeEnabled();
  await expect(editPreset).toBeDisabled();
  await expect(page.getByLabel("IC’s Assessment")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Skill 1 header" }),
  ).toBeVisible();

  await role.click();
  await page.getByRole("option", { name: "Product Designer" }).click();
  await expect(save).toBeDisabled();
  await expect(editPreset).toBeEnabled();

  await page.getByRole("button", { name: "Read more..." }).click();
  await page.getByRole("button", { name: "View Skills" }).click();
  await expect(page.getByLabel("IC’s Assessment").first()).toBeVisible();
  await editPreset.click();
  await expect(save).toBeEnabled();
  await expect(editPreset).toBeDisabled();
  await expect(page.getByLabel("IC’s Assessment")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Technical Ability header" }),
  ).toBeEditable();

  await save.click();
  const dialog = page.locator("dialog[data-confirm-kind='save-role-preset']");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Save functionality not supported yet.");
  await dialog.getByRole("button", { name: "OK" }).click();
  await expect(dialog).toHaveCount(0);
});
