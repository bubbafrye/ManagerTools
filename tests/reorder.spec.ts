import { expect, test, type Locator } from "@playwright/test";

async function sortableIds(scope: Locator) {
  return scope.locator("[data-sortable-id]").evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-sortable-id")),
  );
}

test("action items can be dragged to reorder", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const list = page.getByRole("region", { name: "Action Items" });
  const items = list.locator("[data-sortable-id]");
  const before = await sortableIds(list);
  expect(before).toHaveLength(2);

  await items.nth(0).dragTo(items.nth(1), {
    sourcePosition: { x: 6, y: 6 },
    targetPosition: { x: 6, y: 40 },
  });

  await expect.poll(() => sortableIds(list)).toEqual([before[1], before[0]]);
});

test("goals can be dragged between Professional and Personal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const professional = page
    .getByRole("heading", { name: "Professional Goals:" })
    .locator("xpath=..");
  const personal = page
    .getByRole("heading", { name: "Personal Goals:" })
    .locator("xpath=..");

  const fromIds = await sortableIds(professional);
  const toIds = await sortableIds(personal);
  expect(fromIds).toHaveLength(2);
  expect(toIds).toHaveLength(2);

  await professional.locator("[data-sortable-id]").nth(0).dragTo(
    personal.locator("[data-sortable-id]").nth(0),
    {
      sourcePosition: { x: 6, y: 6 },
      targetPosition: { x: 6, y: 8 },
    },
  );

  await expect.poll(() => sortableIds(professional)).toEqual([fromIds[1]]);
  await expect
    .poll(() => sortableIds(personal))
    .toEqual([fromIds[0], ...toIds]);
});

test("dragging an action item out of its section deletes it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const list = page.getByRole("region", { name: "Action Items" });
  await expect(list.locator("[data-sortable-id]")).toHaveCount(2);
  await list.locator("[data-sortable-id]").nth(0).dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 6, y: 6 } },
  );
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS(
    "background-color",
    await list.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  await dialog.getByRole("button", { name: "YES" }).click();
  await expect(list.locator("[data-sortable-id]")).toHaveCount(1);
});

test("declining delete returns the action item to its section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const list = page.getByRole("region", { name: "Action Items" });
  const before = await sortableIds(list);
  await list.locator("[data-sortable-id]").nth(0).dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 6, y: 6 } },
  );
  await page.getByRole("dialog").getByRole("button", { name: "NO" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => sortableIds(list)).toEqual(before);
});

test("dragging a goal out of the Goals palette deletes it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const goals = page.getByRole("region", { name: "Goals" });
  await expect(goals.locator("[data-sortable-id]")).toHaveCount(4);
  await goals.locator("[data-sortable-id]").nth(0).dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 6, y: 6 } },
  );
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS(
    "background-color",
    await goals.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  await dialog.getByRole("button", { name: "YES" }).click();
  await expect(goals.locator("[data-sortable-id]")).toHaveCount(3);
});

test("dragging an agenda entry out deletes notes and both agenda blocks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const agenda = page.getByRole("region", { name: "Agenda" });
  await expect(agenda.locator("[data-sortable-id]")).toHaveCount(1);
  await expect(agenda.locator("[data-layout='agenda-ic']")).toHaveCount(1);
  await agenda.locator("[data-sortable-id]").dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 10, y: 3 } },
  );
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const panel = page.locator("[data-layout='agenda-panel']");
  await expect(dialog).toHaveCSS(
    "background-color",
    await panel.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  await dialog.getByRole("button", { name: "YES" }).click();
  await expect(agenda.locator("[data-sortable-id]")).toHaveCount(0);
  await expect(agenda.locator("[data-layout='agenda-ic']")).toHaveCount(0);
});

test("confirm buttons use the light variant when header text is dark", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("region", { name: "Action Items" }).locator("[data-sortable-id]").nth(0).dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 6, y: 6 } },
  );
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "NO" })).toHaveCSS(
    "background-color",
    "rgb(255, 124, 124)",
  );
  await expect(dialog.getByRole("button", { name: "YES" })).toHaveCSS(
    "background-color",
    "rgb(157, 255, 130)",
  );
});

test("confirm buttons use the dark variant when header text is light", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.setProperty(
      "--document-header-text-color",
      "#ffe3b0",
    );
  });
  await page.getByRole("region", { name: "Action Items" }).locator("[data-sortable-id]").nth(0).dragTo(
    page.locator("[data-layout='document-header']"),
    { sourcePosition: { x: 6, y: 6 } },
  );
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "NO" })).toHaveCSS(
    "background-color",
    "rgb(178, 3, 3)",
  );
  await expect(dialog.getByRole("button", { name: "YES" })).toHaveCSS(
    "background-color",
    "rgb(34, 159, 0)",
  );
});
