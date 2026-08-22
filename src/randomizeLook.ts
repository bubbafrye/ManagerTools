import {
  FONT_OPTIONS,
  applyAppearance,
  cardRadiiFromPanel,
  type Appearance,
  type FontName,
} from "./appearance.ts";

export const LOOK_TOKENS_CHANGED = "look-tokens-changed";

export const TEXT_TOKENS = [
  "--document-header-text-color",
  "--document-body-text-color",
] as const;

export const SURFACE_TOKENS = [
  "--document-body-color",
  "--containers-panel-surface",
  "--containers-card1-surface-color",
  "--containers-card2-surface-color",
  "--ui-ui-surface-color",
] as const;

const STROKE_COLOR_TOKENS = [
  "--containers-panel-stroke-color",
  "--containers-card1-stroke-color",
  "--containers-card2-stroke-color",
  "--ui-ui-stroke-color",
  "--ui-ui2-stroke-color",
  "--ui-ui2-surface-color",
  "--column-base",
] as const;

const ALPHA_COLOR_TOKENS: Record<string, string> = {
  "--column-stop1": "b2",
  "--column-stop2": "8c",
  "--column-stop3": "66",
  "--column-stop4": "40",
};

const EXTRA_STROKE_WEIGHT_TOKENS = [
  "--containers-card2-stroke-weight",
  "--ui-ui-stroke-weight",
  "--ui-ui2-stroke-weight",
] as const;

type Rng = () => number;

type Palette = {
  hue: [number, number];
  sat: [number, number];
};

type LookRecipe = {
  radius: [number, number];
  stroke: [number, number];
  base?: Palette;
  accent?: Palette;
  accentTokens?: readonly string[];
};

export type RandomizedLook = {
  appearance: Pick<
    Appearance,
    | "panelRadius"
    | "panelBorder"
    | "cardRadius"
    | "cardBorder"
    | "headerFont"
    | "bodyFont"
  >;
  colors: Record<string, string>;
  strokeWeights: Record<string, string>;
};

function randInt(rng: Rng, min: number, max: number) {
  return min + Math.floor(rng() * (max - min + 1));
}

function toHex(channel: number) {
  return channel.toString(16).padStart(2, "0");
}

function rgbHex(rng: Rng) {
  return `#${toHex(randInt(rng, 0, 255))}${toHex(randInt(rng, 0, 255))}${toHex(randInt(rng, 0, 255))}`;
}

function lerp(rng: Rng, range: [number, number]) {
  return range[0] + rng() * (range[1] - range[0]);
}

function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return `#${toHex(Math.round(f(0) * 255))}${toHex(Math.round(f(8) * 255))}${toHex(Math.round(f(4) * 255))}`;
}

function paletteHex(rng: Rng, palette: Palette) {
  return hslToHex(
    lerp(rng, palette.hue),
    lerp(rng, palette.sat),
    0.28 + rng() * 0.48,
  );
}

export function hexChannels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

export function hexHue(hex: string) {
  const [r, g, b] = hexChannels(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

export function hexSaturation(hex: string) {
  const [r, g, b] = hexChannels(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  const lightness = (max + min) / 2;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

function linearize(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const [r, g, b] = hexChannels(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(a: string, b: string) {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

function colorInLuminance(
  rng: Rng,
  minL: number,
  maxL: number,
  fallback: string,
  palette?: Palette,
  lightness?: [number, number],
) {
  for (let i = 0; i < 80; i += 1) {
    const hex = palette
      ? hslToHex(
          lerp(rng, palette.hue),
          lerp(rng, palette.sat),
          lightness ? lerp(rng, lightness) : rng(),
        )
      : rgbHex(rng);
    const luminance = relativeLuminance(hex);
    if (luminance < minL || luminance > maxL) continue;
    if (palette && hexSaturation(hex) < 0.32) continue;
    return hex;
  }
  return fallback;
}

function pickFont(rng: Rng): FontName {
  return FONT_OPTIONS[randInt(rng, 0, FONT_OPTIONS.length - 1)].name;
}

function pickColor(rng: Rng, token: string, recipe: LookRecipe) {
  const accent = recipe.accentTokens?.includes(token)
    ? recipe.accent
    : undefined;
  const palette = accent ?? recipe.base;
  return palette ? paletteHex(rng, palette) : rgbHex(rng);
}

function randomizeWith(recipe: LookRecipe, rng: Rng): RandomizedLook {
  const containerRadius = randInt(rng, recipe.radius[0], recipe.radius[1]);
  const darkSurfaces = rng() < 0.5;
  const surfaceRange = darkSurfaces
    ? { min: 0, max: 0.12, fallback: recipe.base ? "#6b3210" : "#0a0a0a" }
    : { min: 0.45, max: 1, fallback: recipe.base ? "#e8b86a" : "#f5f5f5" };
  const textRange = darkSurfaces
    ? { min: 0.55, max: 1, fallback: recipe.base ? "#ffe3b0" : "#f7f7f7" }
    : { min: 0, max: 0.08, fallback: recipe.base ? "#4a220c" : "#111111" };

  const colors: Record<string, string> = {};
  const surfaceLightness: [number, number] = darkSurfaces
    ? [0.1, 0.26]
    : [0.52, 0.78];
  const textLightness: [number, number] = darkSurfaces
    ? [0.78, 0.92]
    : [0.1, 0.24];
  for (const token of SURFACE_TOKENS) {
    colors[token] = colorInLuminance(
      rng,
      surfaceRange.min,
      surfaceRange.max,
      surfaceRange.fallback,
      recipe.base,
      recipe.base ? surfaceLightness : undefined,
    );
  }
  for (const token of TEXT_TOKENS) {
    colors[token] = colorInLuminance(
      rng,
      textRange.min,
      textRange.max,
      textRange.fallback,
      recipe.base,
      recipe.base ? textLightness : undefined,
    );
  }
  for (const token of STROKE_COLOR_TOKENS) {
    colors[token] = pickColor(rng, token, recipe);
  }
  for (const [token, alpha] of Object.entries(ALPHA_COLOR_TOKENS)) {
    colors[token] = `${pickColor(rng, token, recipe)}${alpha}`;
  }

  const strokeWeights: Record<string, string> = {};
  for (const token of EXTRA_STROKE_WEIGHT_TOKENS) {
    strokeWeights[token] = `${randInt(rng, recipe.stroke[0], recipe.stroke[1])}px`;
  }

  return {
    appearance: {
      panelRadius: containerRadius,
      cardRadius: cardRadiiFromPanel(containerRadius),
      panelBorder: randInt(rng, recipe.stroke[0], recipe.stroke[1]),
      cardBorder: randInt(rng, recipe.stroke[0], recipe.stroke[1]),
      headerFont: pickFont(rng),
      bodyFont: pickFont(rng),
    },
    colors,
    strokeWeights,
  };
}

export function randomizeLook(rng: Rng = Math.random): RandomizedLook {
  return randomizeWith({ radius: [0, 50], stroke: [0, 20] }, rng);
}

export function applyRandomizedLook(look: RandomizedLook) {
  const root = document.documentElement.style;
  applyAppearance(look.appearance);
  for (const [token, value] of Object.entries(look.colors)) {
    root.setProperty(token, value);
  }
  for (const [token, value] of Object.entries(look.strokeWeights)) {
    root.setProperty(token, value);
  }
  window.dispatchEvent(new Event(LOOK_TOKENS_CHANGED));
}
