import { expect, test, type Page } from "@playwright/test";

type ViewportSpec = {
  width: number;
  height: number;
  leftColumnWidth: number;
  columnGap: number;
  tokenSides: number;
  tokenTop: number;
  tokenBottom: number;
};

const viewports: ViewportSpec[] = [
  {
    width: 1440,
    height: 900,
    leftColumnWidth: 480,
    columnGap: 25,
    tokenSides: 50,
    tokenTop: 40,
    tokenBottom: 40,
  },
  {
    width: 1200,
    height: 800,
    leftColumnWidth: 480,
    columnGap: 15,
    tokenSides: 25,
    tokenTop: 35,
    tokenBottom: 35,
  },
  {
    width: 1100,
    height: 800,
    leftColumnWidth: 320,
    columnGap: 10,
    tokenSides: 15,
    tokenTop: 20,
    tokenBottom: 20,
  },
  {
    width: 1024,
    height: 768,
    leftColumnWidth: 320,
    columnGap: 10,
    tokenSides: 15,
    tokenTop: 20,
    tokenBottom: 20,
  },
  {
    width: 700,
    height: 900,
    leftColumnWidth: 680,
    columnGap: 0,
    tokenSides: 10,
    tokenTop: 20,
    tokenBottom: 20,
  },
];

async function layoutMetrics(page: Page) {
  return page.evaluate(() => {
    const pageEl = document.querySelector("[data-layout='page']");
    const oneOnOne = document.querySelector("[data-layout='one-on-one']");
    const left = document.querySelector("[data-layout='left-column']");
    const agendaColumn = document.querySelector("[data-layout='agenda-column']");
    const agendaPanel = document.querySelector("[data-layout='agenda-panel']");
    const period = document.querySelector("[data-layout='period']");
    const agendaIc = document.querySelector("[data-layout='agenda-ic']");
    const agendaManager = document.querySelector("[data-layout='agenda-manager']");
    if (!pageEl || !oneOnOne || !left || !agendaColumn || !agendaPanel || !period) {
      throw new Error("layout nodes missing");
    }
    if (!agendaIc || !agendaManager) {
      throw new Error("agenda subcolumns missing");
    }
    const pageStyle = getComputedStyle(pageEl);
    const oneOnOneStyle = getComputedStyle(oneOnOne);
    const leftRect = left.getBoundingClientRect();
    const columnRect = agendaColumn.getBoundingClientRect();
    const panelRect = agendaPanel.getBoundingClientRect();
    const periodRect = period.getBoundingClientRect();
    const icRect = agendaIc.getBoundingClientRect();
    const managerRect = agendaManager.getBoundingClientRect();
    const px = (value: string) => Number.parseFloat(value);
    const pageTokenTop = px(pageStyle.getPropertyValue("--document-margins-top"));
    const pageTokenSides = px(pageStyle.getPropertyValue("--document-margins-sides"));
    const pageTokenBottom = px(pageStyle.getPropertyValue("--document-margins-bottom"));

    const layoutChain = (el: Element) => {
      const nodes = [];
      let current: Element | null = el;
      while (current) {
        const s = getComputedStyle(current);
        nodes.push({
          name: `${current.tagName.toLowerCase()}${current.id ? `#${current.id}` : ""}`,
          transform: s.transform,
          width: s.width,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          marginLeft: s.marginLeft,
          marginRight: s.marginRight,
          position: s.position,
          boxSizing: s.boxSizing,
          left: s.left,
          right: s.right,
        });
        current = current.parentElement;
      }
      return nodes;
    };

    return {
      tokenTop: pageTokenTop,
      tokenSides: pageTokenSides,
      tokenBottom: pageTokenBottom,
      paddingTop: px(pageStyle.paddingTop),
      paddingRight: px(pageStyle.paddingRight),
      paddingBottom: px(pageStyle.paddingBottom),
      paddingLeft: px(pageStyle.paddingLeft),
      oneOnOneDirection: oneOnOneStyle.flexDirection,
      leftWidth: leftRect.width,
      leftLeft: leftRect.left,
      columnWidth: columnRect.width,
      columnRight: columnRect.right,
      columnTop: columnRect.top,
      leftTop: leftRect.top,
      panelWidth: panelRect.width,
      panelLeft: panelRect.left,
      panelRight: panelRect.right,
      periodRight: periodRect.right,
      icWidth: icRect.width,
      icLeft: icRect.left,
      icRight: icRect.right,
      managerWidth: managerRect.width,
      managerLeft: managerRect.left,
      managerRight: managerRect.right,
      gap: columnRect.left - leftRect.right,
      columnRightGutter: window.innerWidth - columnRect.right,
      panelRightGutter: window.innerWidth - panelRect.right,
      periodRightGutter: window.innerWidth - periodRect.right,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      periodChain: layoutChain(period),
      panelChain: layoutChain(agendaPanel),
    };
  });
}

for (const viewport of viewports) {
  test.describe(`viewport ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("1:1 section matches Figma gutters and column geometry", async ({
      page,
    }) => {
      await page.goto("/");
      const metrics = await layoutMetrics(page);

      expect(metrics.paddingTop).toBe(metrics.tokenTop);
      expect(metrics.paddingRight).toBe(metrics.tokenSides);
      expect(metrics.paddingBottom).toBe(metrics.tokenBottom);
      expect(metrics.paddingLeft).toBe(metrics.tokenSides);
      expect(metrics.tokenTop).toBe(viewport.tokenTop);
      expect(metrics.tokenSides).toBe(viewport.tokenSides);
      expect(metrics.tokenBottom).toBe(viewport.tokenBottom);

      expect(metrics.leftLeft).toBe(metrics.tokenSides);

      if (viewport.width < 960) {
        expect(metrics.oneOnOneDirection).toBe("column");
        expect(metrics.columnTop).toBeLessThan(metrics.leftTop);
        expect(metrics.leftWidth).toBeCloseTo(
          metrics.viewport - metrics.tokenSides * 2,
          0,
        );
        expect(metrics.columnWidth).toBeCloseTo(metrics.leftWidth, 0);
        expect(metrics.panelWidth).toBeCloseTo(metrics.leftWidth, 0);
      } else {
        expect(metrics.oneOnOneDirection).toBe("row");
        expect(metrics.leftWidth).toBe(viewport.leftColumnWidth);
        expect(metrics.gap).toBe(viewport.columnGap);

        const expectedWidth =
          metrics.viewport -
          metrics.tokenSides * 2 -
          viewport.leftColumnWidth -
          viewport.columnGap;

        expect(metrics.columnWidth).toBeCloseTo(expectedWidth, 0);
        expect(metrics.panelWidth).toBeCloseTo(expectedWidth, 0);
      }

      expect(metrics.panelRightGutter).toBeCloseTo(metrics.tokenSides, 0);
      expect(metrics.periodRightGutter).toBeCloseTo(metrics.tokenSides, 0);
      expect(metrics.periodRight).toBeCloseTo(metrics.panelRight, 0);
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 1);

      expect(metrics.icWidth).toBeCloseTo(metrics.managerWidth, 0);
      expect(metrics.icLeft).toBeGreaterThan(metrics.panelLeft);
      expect(metrics.managerRight).toBeLessThan(metrics.panelRight);
      expect(metrics.managerRight).toBeLessThanOrEqual(
        metrics.viewport - metrics.tokenSides + 1,
      );
    });
  });
}

test("changing margin tokens updates gutters and keeps the panel on-screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    const pageEl = document.querySelector("[data-layout='page']");
    if (!pageEl) return;
    pageEl.style.setProperty("--document-margins-top", "20px");
    pageEl.style.setProperty("--document-margins-sides", "80px");
    pageEl.style.setProperty("--document-margins-bottom", "40px");
  });

  await expect.poll(async () => (await layoutMetrics(page)).paddingLeft).toBe(80);

  const metrics = await layoutMetrics(page);
  expect(metrics.paddingLeft).toBe(80);
  expect(metrics.paddingRight).toBe(80);
  expect(metrics.leftLeft).toBe(80);
  expect(metrics.panelRightGutter).toBeCloseTo(80, 0);
  expect(metrics.leftWidth).toBe(480);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 1);

  const expectedWidth = metrics.viewport - 80 - 80 - 480 - 25;
  expect(metrics.panelWidth).toBeCloseTo(expectedWidth, 0);
});

test("header period and agenda panel move 1:1 when the viewport resizes", async ({
  page,
}) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1400, height: 800 });
  const wide = await layoutMetrics(page);

  await page.setViewportSize({ width: 1300, height: 800 });
  const narrow = await layoutMetrics(page);

  const viewportDelta = wide.viewport - narrow.viewport;
  const periodDelta = wide.periodRight - narrow.periodRight;
  const panelDelta = wide.panelRight - narrow.panelRight;

  expect(wide.periodChain.some((node) => node.transform !== "none")).toBe(
    false,
  );
  expect(wide.panelChain.some((node) => node.transform !== "none")).toBe(
    false,
  );
  expect(periodDelta).toBeCloseTo(viewportDelta, 0);
  expect(panelDelta).toBeCloseTo(viewportDelta, 0);
  expect(periodDelta).toBeCloseTo(panelDelta, 0);
});
