import { expect, test } from "@playwright/test";

test("list placeholders sit on the first line, hide on focus, and return only if still blank", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC agenda" });
  const notes = page.getByRole("textbox", { name: "Meeting notes" });
  const icHint = ic.locator("xpath=..").locator("[data-list-placeholder]");
  const notesHint = notes.locator("xpath=..").locator("[data-list-placeholder]");

  await expect(icHint).toHaveText("Agenda item");
  await expect(notesHint).toHaveText("Meeting notes");

  const bullet = ic.locator("li").first();
  const fieldBox = await ic.boundingBox();
  const bulletBox = await bullet.boundingBox();
  const hintBox = await icHint.boundingBox();
  expect(fieldBox).toBeTruthy();
  expect(bulletBox).toBeTruthy();
  expect(hintBox).toBeTruthy();
  expect(Math.abs(hintBox!.y - bulletBox!.y)).toBeLessThan(4);
  expect(Math.abs(hintBox!.x - bulletBox!.x)).toBeLessThan(4);
  expect(hintBox!.x).toBeGreaterThan(fieldBox!.x + 16);

  await ic.click();
  await expect(icHint).toHaveCount(0);
  await notes.click();
  await expect(icHint).toHaveText("Agenda item");

  await ic.click();
  await page.keyboard.type("keep this");
  await notes.click();
  await expect(icHint).toHaveCount(0);
});

test("Enter in an agenda bullet commits it and adds an empty bullet below", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC agenda" });
  await expect(ic).toHaveCount(1);
  await ic.click();
  await page.keyboard.type("first item");
  await page.keyboard.press("Enter");

  await expect(ic.locator("li")).toHaveCount(2);
  await expect(ic.locator("li").nth(0)).toHaveText("first item");
  await expect(ic.locator("li").nth(1)).toHaveText("");
});

test("Shift+Enter in an agenda bullet inserts a newline without adding a bullet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC agenda" });
  await ic.click();
  await page.keyboard.type("line one");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("line two");

  await expect(ic).toHaveCount(1);
  await expect(ic.locator("li")).toHaveCount(1);
  await expect(ic.locator("li br")).not.toHaveCount(0);
  expect(
    await ic.locator("li").evaluate((el) =>
      el.innerText.replace(/\u200B/g, ""),
    ),
  ).toMatch(/line one\s+line two/);
});

test("Tab in an agenda bullet indents under the previous item", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const ic = page.getByRole("textbox", { name: "IC agenda" });
  await ic.click();
  await page.keyboard.type("parent");
  await page.keyboard.press("Enter");
  await page.keyboard.type("child");
  await page.keyboard.press("Tab");

  await expect(ic.locator("li").nth(1)).toHaveAttribute("data-depth", "1");
  await expect(ic.locator("li").nth(1)).toHaveCSS("margin-left", "24px");
});

test("notes: dash-space on the first line starts a disc bullet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const notes = page.getByRole("textbox", { name: "Meeting notes" });
  await notes.click();
  await page.keyboard.type("- ");

  await expect(notes.locator("li")).toHaveCount(1);
  await expect(notes.locator("li")).toHaveAttribute("data-depth", "0");
  await page.keyboard.type("alpha");
  await expect(notes.locator("li")).toHaveText("alpha");
});

test("notes: dash-space starts a disc bullet, Enter adds one, Tab indents, empty Enter exits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const notes = page.getByRole("textbox", { name: "Meeting notes" });
  await expect(notes).toHaveCount(1);
  await notes.click();
  await notes.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await page.keyboard.press("Enter");
  await page.keyboard.type("- ");

  await expect(notes.locator("li")).toHaveCount(1);
  await expect(notes.locator("li")).toHaveAttribute("data-depth", "0");

  await page.keyboard.type("alpha");
  await page.keyboard.press("Enter");
  await expect(notes.locator("li")).toHaveCount(2);
  await expect(notes.locator("li").nth(0)).toHaveText("alpha");

  await page.keyboard.type("beta");
  await page.keyboard.press("Tab");
  await expect(notes.locator("li").nth(1)).toHaveAttribute("data-depth", "1");
  await expect(notes.locator("li").nth(1)).toHaveCSS("margin-left", "24px");

  await page.keyboard.press("Enter");
  await expect(notes.locator("li")).toHaveCount(3);
  await page.keyboard.press("Enter");
  await expect(notes.locator("li")).toHaveCount(2);
  await expect(notes).toHaveCount(1);
});

test("Enter in notes date commits it and moves focus to notes text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const date = page.getByLabel("Notes date");
  const notes = page.getByRole("textbox", { name: "Meeting notes" });
  await date.fill("2026-03-15");
  await date.press("Enter");

  await expect(date).toHaveValue("2026-03-15");
  await expect(date.locator("xpath=..")).toContainText("03-15-26");
  await expect(notes).toBeFocused();
});

test("adding an Agenda block prefills today's date as mm-dd-yy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page
    .getByRole("region", { name: "Agenda" })
    .getByRole("button", { name: "Add Item" })
    .click();

  const now = new Date();
  const expected = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getFullYear()).slice(-2)}`;
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const dates = page.getByLabel("Notes date");
  await expect(dates).toHaveCount(2);
  await expect(dates.first()).toHaveValue(iso);
  await expect(dates.first().locator("xpath=..")).toContainText(expected);
  await expect(dates.nth(1).locator("xpath=..")).toContainText("01-99-99");
});
