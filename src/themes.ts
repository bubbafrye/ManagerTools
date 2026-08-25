import type { Appearance } from "./appearance";
import { LOOK_TOKENS_CHANGED } from "./randomizeLook";

/** Figma One-on-one variable mode names (source of truth). */
export type ThemeId =
  | "spring light"
  | "spring dark"
  | "aqua light"
  | "aqua dark"
  | "sand light"
  | "sand dark"
  | "grey";

export type ThemeTokens = {
  colors: Record<string, string>;
  floats: Record<string, number>;
};

/** Preset order in the themes panel (Figma `themes` component). */
export const THEME_PRESET_ORDER = {
  row1: ["sand light", "aqua light", "spring light"] as const,
  row2: ["grey", "sand dark", "aqua dark", "spring dark"] as const,
};

const FIGMA_COLOR_TO_CSS: Record<string, string> = {
  "document/body-color": "--document-body-color",
  "document/header-text-color": "--document-header-text-color",
  "document/body-text-color": "--document-body-text-color",
  "containers/panel-surface": "--containers-panel-surface",
  "containers/panel-stroke-color": "--containers-panel-stroke-color",
  "containers/card1-surface-color": "--containers-card1-surface-color",
  "containers/card1-stroke-color": "--containers-card1-stroke-color",
  "containers/card2-surface-color": "--containers-card2-surface-color",
  "containers/card2-stroke-color": "--containers-card2-stroke-color",
  "ui/ui-surface-color": "--ui-ui-surface-color",
  "ui/ui-stroke-color": "--ui-ui-stroke-color",
  "ui/ui2-surface-color": "--ui-ui2-surface-color",
  "ui/ui2-stroke-color": "--ui-ui2-stroke-color",
};

const FIGMA_FLOAT_TO_CSS: Record<string, string> = {
  "containers/panel-radii": "--containers-panel-radii",
  "containers/panel-stroke-weight": "--containers-panel-stroke-weight",
  "containers/card1-radii": "--containers-card1-radii",
  "containers/card1-stroke-weight": "--containers-card1-stroke-weight",
  "containers/card2-radii": "--containers-card2-radii",
  "containers/card2-stroke-weight": "--containers-card2-stroke-weight",
  "ui/ui-stroke-weight": "--ui-ui-stroke-weight",
  "ui/ui2-stroke-weight": "--ui-ui2-stroke-weight",
};

/** Synced from Figma One-on-one modes (file yLoM56mVPrxu2czhbZcPSY). */
export const THEMES: Record<ThemeId, ThemeTokens> = {
  "spring light": {
    colors: {
      "document/body-color": "#d1e7d0",
      "document/header-text-color": "#1a4a18",
      "document/body-text-color": "#224521",
      "containers/panel-surface": "#b2d3b1",
      "containers/panel-stroke-color": "#2e632c",
      "containers/card1-surface-color": "#e8f3e8",
      "containers/card1-stroke-color": "#2e632c",
      "containers/card2-surface-color": "#c6ddc5",
      "containers/card2-stroke-color": "#2e632c",
      "ui/ui-surface-color": "#f4fbf4",
      "ui/ui-stroke-color": "#2f8c2c",
      "ui/ui2-surface-color": "#2f962c",
      "ui/ui2-stroke-color": "#236321",
    },
    floats: {
      "containers/panel-radii": 4,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 2,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  "spring dark": {
    colors: {
      "document/body-color": "#162216",
      "document/header-text-color": "#dcf0db",
      "document/body-text-color": "#b8d7b7",
      "containers/panel-surface": "#213121",
      "containers/panel-stroke-color": "#67b464",
      "containers/card1-surface-color": "#2f422e",
      "containers/card1-stroke-color": "#67b464",
      "containers/card2-surface-color": "#1d2b1c",
      "containers/card2-stroke-color": "#67b464",
      "ui/ui-surface-color": "#2a3c2a",
      "ui/ui-stroke-color": "#62c95e",
      "ui/ui2-surface-color": "#34a630",
      "ui/ui2-stroke-color": "#75ca72",
    },
    floats: {
      "containers/panel-radii": 4,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 2,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  "aqua light": {
    colors: {
      "document/body-color": "#cee6e9",
      "document/header-text-color": "#1a535b",
      "document/body-text-color": "#22494f",
      "containers/panel-surface": "#abd0d4",
      "containers/panel-stroke-color": "#2e636b",
      "containers/card1-surface-color": "#e8f1f3",
      "containers/card1-stroke-color": "#2e636b",
      "containers/card2-surface-color": "#c4dbde",
      "containers/card2-stroke-color": "#2e636b",
      "ui/ui-surface-color": "#f4fafa",
      "ui/ui-stroke-color": "#29848e",
      "ui/ui2-surface-color": "#298e99",
      "ui/ui2-stroke-color": "#215d63",
    },
    floats: {
      "containers/panel-radii": 10,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 8,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  "aqua dark": {
    colors: {
      "document/body-color": "#121f21",
      "document/header-text-color": "#daeff1",
      "document/body-text-color": "#b6d4d8",
      "containers/panel-surface": "#1f3033",
      "containers/panel-stroke-color": "#5eb1ba",
      "containers/card1-surface-color": "#2a3e41",
      "containers/card1-stroke-color": "#5eb1ba",
      "containers/card2-surface-color": "#19272a",
      "containers/card2-stroke-color": "#5eb1ba",
      "ui/ui-surface-color": "#243538",
      "ui/ui-stroke-color": "#59c3cf",
      "ui/ui2-surface-color": "#2b95a1",
      "ui/ui2-stroke-color": "#72c1ca",
    },
    floats: {
      "containers/panel-radii": 4,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 2,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  "sand light": {
    colors: {
      "document/body-color": "#e9e2ce",
      "document/header-text-color": "#5d281b",
      "document/body-text-color": "#4b291e",
      "containers/panel-surface": "#d4c3ab",
      "containers/panel-stroke-color": "#763e2d",
      "containers/card1-surface-color": "#f3f0e8",
      "containers/card1-stroke-color": "#763e2d",
      "containers/card2-surface-color": "#f0e3c1",
      "containers/card2-stroke-color": "#763e2d",
      "ui/ui-surface-color": "#fff7e3",
      "ui/ui-stroke-color": "#923513",
      "ui/ui2-surface-color": "#a54427",
      "ui/ui2-stroke-color": "#6f3020",
    },
    floats: {
      "containers/panel-radii": 10,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 2,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  "sand dark": {
    colors: {
      "document/body-color": "#241914",
      "document/header-text-color": "#f0e8db",
      "document/body-text-color": "#d7c8b7",
      "containers/panel-surface": "#33261e",
      "containers/panel-stroke-color": "#b48a64",
      "containers/card1-surface-color": "#46372b",
      "containers/card1-stroke-color": "#b48a64",
      "containers/card2-surface-color": "#2a1d18",
      "containers/card2-stroke-color": "#b48a64",
      "ui/ui-surface-color": "#382b24",
      "ui/ui-stroke-color": "#d4a574",
      "ui/ui2-surface-color": "#c4844a",
      "ui/ui2-stroke-color": "#e0b888",
    },
    floats: {
      "containers/panel-radii": 4,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 2,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 8,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
  grey: {
    colors: {
      "document/body-color": "#808080",
      "document/header-text-color": "#313131",
      "document/body-text-color": "#424242",
      "containers/panel-surface": "#c6c6c6",
      "containers/panel-stroke-color": "#5e5e5e",
      "containers/card1-surface-color": "#e2e2e2",
      "containers/card1-stroke-color": "#5e5e5e",
      "containers/card2-surface-color": "#d4d4d4",
      "containers/card2-stroke-color": "#5e5e5e",
      "ui/ui-surface-color": "#ffffff",
      "ui/ui-stroke-color": "#5e5e5e",
      "ui/ui2-surface-color": "#414141",
      "ui/ui2-stroke-color": "#545454",
    },
    floats: {
      "containers/panel-radii": 8,
      "containers/panel-stroke-weight": 2,
      "containers/card1-radii": 4,
      "containers/card1-stroke-weight": 2,
      "containers/card2-radii": 4,
      "containers/card2-stroke-weight": 2,
      "ui/ui-stroke-weight": 1,
      "ui/ui2-stroke-weight": 0,
    },
  },
};

export const DEFAULT_THEME_ID: ThemeId = "spring light";

export function themeCssVars(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [figmaName, value] of Object.entries(theme.colors)) {
    const css = FIGMA_COLOR_TO_CSS[figmaName];
    if (css) vars[css] = value;
  }
  return vars;
}

export function themeAppearancePatch(
  theme: ThemeTokens,
): Pick<
  Appearance,
  "panelRadius" | "panelBorder" | "cardRadius" | "cardBorder"
> {
  return {
    panelRadius: theme.floats["containers/panel-radii"],
    panelBorder: theme.floats["containers/panel-stroke-weight"],
    cardRadius: theme.floats["containers/card1-radii"],
    cardBorder: theme.floats["containers/card1-stroke-weight"],
  };
}

/** Apply theme colors + floats. Does not change font-family tokens. */
export function applyThemeTokens(theme: ThemeTokens) {
  const root = document.documentElement.style;
  for (const [figmaName, value] of Object.entries(theme.colors)) {
    const css = FIGMA_COLOR_TO_CSS[figmaName];
    if (css) root.setProperty(css, value);
  }
  for (const [figmaName, value] of Object.entries(theme.floats)) {
    if (figmaName === "containers/card2-stroke-weight") continue;
    const css = FIGMA_FLOAT_TO_CSS[figmaName];
    if (css) root.setProperty(css, `${value}px`);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOOK_TOKENS_CHANGED));
  }
}

/** Apply a named preset; keeps current font families. */
export function applyTheme(id: ThemeId, appearance: Appearance): Appearance {
  const theme = THEMES[id];
  applyThemeTokens(theme);
  return {
    ...appearance,
    ...themeAppearancePatch(theme),
  };
}
