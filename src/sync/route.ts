export const DEFAULT_PAGE_HASH = "#/";

export type AppRoute =
  | { kind: "local" }
  | { kind: "page"; pageId: string };

export function parseHash(hash: string): AppRoute {
  const path = hash.replace(/^#/, "").replace(/^\/+/, "");
  const match = path.match(/^p\/([^/]+)$/);
  if (match?.[1]) return { kind: "page", pageId: decodeURIComponent(match[1]) };
  return { kind: "local" };
}

export function pageHash(pageId: string): string {
  return `#/p/${encodeURIComponent(pageId)}`;
}

export function pageUrl(pageId: string, location: Location = window.location): string {
  return `${location.origin}${location.pathname}${location.search}${pageHash(pageId)}`;
}
