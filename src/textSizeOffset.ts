const TEXT_SIZE_KEYS = [
  "header",
  "subheader",
  "body",
  "label",
] as const;

/** Below 960px, set each document text size to round(base × text-size-offset). */
export function startTextSizeOffsetSync() {
  const root = document.documentElement;
  const mq = window.matchMedia("(max-width: 959px)");

  const apply = () => {
    const styles = getComputedStyle(root);
    const offsetRaw = Number.parseFloat(
      styles.getPropertyValue("--document-text-size-offset"),
    );
    const offset =
      mq.matches && Number.isFinite(offsetRaw) ? offsetRaw : 1;

    for (const key of TEXT_SIZE_KEYS) {
      const base = Number.parseFloat(
        styles.getPropertyValue(`--document-text-${key}-font-size-base`),
      );
      if (!Number.isFinite(base)) continue;
      root.style.setProperty(
        `--document-text-${key}-font-size`,
        `${Math.round(base * offset)}px`,
      );
    }
  };

  apply();
  mq.addEventListener("change", apply);
  return () => {
    mq.removeEventListener("change", apply);
    for (const key of TEXT_SIZE_KEYS) {
      root.style.removeProperty(`--document-text-${key}-font-size`);
    }
  };
}
