import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";
import YProvider from "y-partyserver/provider";
import { seedDocument, type SeedMode } from "./schema";

export type SyncStatus = "offline" | "connecting" | "live";

export type Room = {
  doc: Y.Doc;
  pageId: string;
  awareness: WebsocketProvider["awareness"] | null;
  getStatus: () => SyncStatus;
  onStatus: (listener: (status: SyncStatus) => void) => () => void;
  destroy: () => void;
};

type StatusEvent = { status: string };

export function persistEnabled(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver !== true;
}

function querySyncHost(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("sync") ?? "";
}

function partyHost(): string {
  const fromQuery = querySyncHost();
  if (fromQuery) return fromQuery;
  const fromEnv = import.meta.env.VITE_PARTYKIT_HOST;
  if (fromEnv) return fromEnv;
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("partykit.dev") ||
      window.location.hostname.endsWith("workers.dev"))
  ) {
    return window.location.host;
  }
  return "";
}

function websocketUrl(): string {
  if (import.meta.env.VITE_SYNC_URL) return import.meta.env.VITE_SYNC_URL;
  if (import.meta.env.DEV) return "ws://localhost:1234";
  return "";
}

function mapStatus(status: string): SyncStatus {
  if (status === "connected") return "live";
  if (status === "connecting") return "connecting";
  return "offline";
}

export function connectSync(pageId: string, seed: SeedMode): Room {
  const doc = new Y.Doc();
  seedDocument(doc, seed);
  return {
    doc,
    pageId,
    awareness: null,
    getStatus: () => "offline",
    onStatus: () => () => {},
    destroy() {
      doc.destroy();
    },
  };
}

export async function connect(pageId: string, seed: SeedMode): Promise<Room> {
  const doc = new Y.Doc();
  const persist = new IndexeddbPersistence(`manager-tools:${pageId}`, doc);
  await persist.whenSynced;
  seedDocument(doc, seed);

  const listeners = new Set<(status: SyncStatus) => void>();
  let status: SyncStatus = "offline";
  const emit = (event: StatusEvent) => {
    status = mapStatus(event.status);
    for (const listener of listeners) listener(status);
  };

  const host = partyHost();
  const socket = websocketUrl();
  const provider = host
    ? new YProvider(host, pageId, doc, { party: "yjs-server" })
    : socket
      ? new WebsocketProvider(socket, pageId, doc)
      : null;

  provider?.on("status", emit);
  provider?.awareness.setLocalState({ present: true });
  if (provider?.wsconnected) status = "live";
  else if (provider?.wsconnecting) status = "connecting";

  return {
    doc,
    pageId,
    awareness: provider?.awareness ?? null,
    getStatus: () => status,
    onStatus: (listener) => {
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    destroy() {
      provider?.awareness.setLocalState(null);
      provider?.destroy();
      persist.destroy();
      doc.destroy();
    },
  };
}
