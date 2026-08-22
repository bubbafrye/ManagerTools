/** Root-relative public file, prefixed with Vite `base` (needed on GitHub Pages). */
export function publicUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
