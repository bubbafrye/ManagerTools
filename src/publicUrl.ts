/** Public file URL. Always origin-absolute so CSS masks resolve from any stylesheet. */
export function publicUrl(path: string) {
  const relative = path.replace(/^\//, "");
  const base = import.meta.env.BASE_URL;
  if (base.startsWith("/") || /^https?:/i.test(base)) {
    return `${base}${relative}`;
  }
  const prefix = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname.replace(/\/[^/]*$/, "/")}`;
  return `${prefix}${relative}`;
}
