import { expect, test } from "@playwright/test";

test("goal text: dash-space on the first line starts a disc bullet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const professional = page
    .getByRole("heading", { name: "Professional Goals:" })
    .locator("xpath=..");
  await professional.getByRole("button", { name: "Add Item" }).click();

  const field = professional.getByRole("textbox", { name: "Goal" }).first();
  await field.click();
  await page.keyboard.type("- ");

  await expect(field.locator("li")).toHaveCount(1);
  await expect(field.locator("li")).toHaveAttribute("data-depth", "0");
  await page.keyboard.type("ship it");
  await expect(field.locator("li")).toHaveText("ship it");
});

test("COMPLETE appears only on a full meter and toggles completed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const professional = page
    .getByRole("heading", { name: "Professional Goals:" })
    .locator("xpath=..");
  const goal = professional.locator("article").first();
  const meter = goal.getByRole("button", { name: "Increment goal progress" });

  await expect(goal.getByRole("button", { name: "Mark goal complete" })).toHaveCount(
    0,
  );

  for (let step = 0; step < 9; step += 1) {
    await meter.click();
  }

  const complete = goal.getByRole("button", { name: "Mark goal complete" });
  await expect(complete).toBeVisible();
  await expect(
    goal.getByText("Press ‘complete’ to close the task."),
  ).toBeVisible();

  await complete.click();
  const pressed = goal.getByRole("button", { name: "Mark goal incomplete" });
  await expect(pressed).toHaveAttribute("aria-pressed", "true");
  await expect(meter).toBeDisabled();
  await expect(
    goal.getByText("Press ‘complete’ to close the task."),
  ).toHaveCount(0);

  await pressed.click();
  await expect(complete).toHaveAttribute("aria-pressed", "false");
  await expect(meter).toBeEnabled();
  await meter.click();
  await expect(complete).toHaveCount(0);
});

test("completed goals hide when show completed is off", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const professional = page
    .getByRole("heading", { name: "Professional Goals:" })
    .locator("xpath=..");
  const goal = professional.locator("article").first();
  const meter = goal.getByRole("button", { name: "Increment goal progress" });
  for (let step = 0; step < 9; step += 1) {
    await meter.click();
  }
  await goal.getByRole("button", { name: "Mark goal complete" }).click();
  await expect(professional.locator("article")).toHaveCount(2);

  await page.getByRole("button", { name: "Document settings" }).click();
  await page.getByRole("checkbox", { name: "show completed" }).click();
  await expect(professional.locator("article")).toHaveCount(1);
});
