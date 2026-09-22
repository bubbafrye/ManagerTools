export const FONT_OPTIONS = [
  { name: "Inter", stack: "Inter, sans-serif" },
  { name: "Source Sans 3", stack: '"Source Sans 3", sans-serif' },
  { name: "IBM Plex Sans", stack: '"IBM Plex Sans", sans-serif' },
  { name: "DM Sans", stack: '"DM Sans", sans-serif' },
  { name: "Lora", stack: "Lora, serif" },
  { name: "Source Serif 4", stack: '"Source Serif 4", serif' },
  { name: "Merriweather", stack: "Merriweather, serif" },
  { name: "Libre Baskerville", stack: '"Libre Baskerville", serif' },
  { name: "Spectral", stack: "Spectral, serif" },
  { name: "IBM Plex Serif", stack: '"IBM Plex Serif", serif' },
  { name: "EB Garamond", stack: '"EB Garamond", serif' },
  { name: "Crimson Pro", stack: '"Crimson Pro", serif' },
  { name: "Roboto Slab", stack: '"Roboto Slab", serif' },
  { name: "Zilla Slab", stack: '"Zilla Slab", serif' },
  { name: "Arvo", stack: "Arvo, serif" },
  { name: "Playfair Display", stack: '"Playfair Display", serif' },
  { name: "Abril Fatface", stack: '"Abril Fatface", serif' },
  { name: "Cinzel", stack: "Cinzel, serif" },
  { name: "Yeseva One", stack: '"Yeseva One", serif' },
  { name: "Great Vibes", stack: '"Great Vibes", cursive' },
] as const;

export type FontName = (typeof FONT_OPTIONS)[number]["name"];

export type Appearance = {
  panelRadius: number;
  panelBorder: number;
  cardRadius: number;
  cardBorder: number;
  headerFont: FontName;
  bodyFont: FontName;
};

export const CORNER_SLIDER_MAX = 30;
export const BORDER_SLIDER_MAX = 10;

export function clampCornerRadius(value: number) {
  return Math.min(CORNER_SLIDER_MAX, Math.max(0, value));
}

export function clampBorderWidth(value: number) {
  return Math.min(BORDER_SLIDER_MAX, Math.max(0, value));
}

export function cardRadiiFromPanel(panelRadius: number) {
  return Math.ceil(clampCornerRadius(panelRadius) * 0.6);
}

export function cardStrokeFromPanel(panelBorder: number) {
  return Math.round(clampBorderWidth(panelBorder) * 0.8);
}

export function geometryFromSliders(panelRadius: number, panelBorder: number) {
  const radius = clampCornerRadius(panelRadius);
  const border = clampBorderWidth(panelBorder);
  return {
    panelRadius: radius,
    cardRadius: cardRadiiFromPanel(radius),
    panelBorder: border,
    cardBorder: cardStrokeFromPanel(border),
  };
}

/** Spring light geometry (Figma); fonts stay Inter until the user changes them. */
export const DEFAULT_APPEARANCE: Appearance = {
  panelRadius: 6,
  panelBorder: 2,
  cardRadius: 2,
  cardBorder: 2,
  headerFont: "Inter",
  bodyFont: "Inter",
};

export function fontStack(name: FontName): string {
  const match = FONT_OPTIONS.find((font) => font.name === name);
  return match?.stack ?? "Inter, sans-serif";
}

export function applyAppearance(appearance: Appearance) {
  const root = document.documentElement.style;
  root.setProperty("--containers-panel-radii", `${appearance.panelRadius}px`);
  root.setProperty(
    "--containers-panel-stroke-weight",
    `${appearance.panelBorder}px`,
  );
  root.setProperty("--containers-card1-radii", `${appearance.cardRadius}px`);
  root.setProperty("--containers-card2-radii", `${appearance.cardRadius}px`);
  root.setProperty(
    "--containers-card1-stroke-weight",
    `${appearance.cardBorder}px`,
  );
  root.setProperty(
    "--containers-card2-stroke-weight",
    `${appearance.cardBorder}px`,
  );
  root.setProperty(
    "--document-text-header-font-face",
    fontStack(appearance.headerFont),
  );
  root.setProperty(
    "--document-text-body-font-face",
    fontStack(appearance.bodyFont),
  );
}
