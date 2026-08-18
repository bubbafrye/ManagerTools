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

export const DEFAULT_APPEARANCE: Appearance = {
  panelRadius: 8,
  panelBorder: 2,
  cardRadius: 4,
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
  root.setProperty("--container-container-radii", `${appearance.panelRadius}px`);
  root.setProperty(
    "--container-container-stroke-weight",
    `${appearance.panelBorder}px`,
  );
  root.setProperty("--document-panel-radii", `${appearance.cardRadius}px`);
  root.setProperty(
    "--document-panel-stroke-weight",
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

if (typeof document !== "undefined") {
  applyAppearance(DEFAULT_APPEARANCE);
}
