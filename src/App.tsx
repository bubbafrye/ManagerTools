import { useCallback, useState } from "react";
import { useDocumentState } from "./hooks/useDocumentState";
import { useHashRoute } from "./hooks/useHashRoute";
import { OneOnOnePage } from "./pages/OneOnOnePage";
import { pageHash, pageUrl } from "./sync/route";
import { DEFAULT_PAGE_ID } from "./sync/schema";
import { createId } from "./types/document";

function Workspace({
  pageId,
  seed,
  copied,
  onCopied,
  onNewPage,
}: {
  pageId: string;
  seed: "demo" | "empty";
  copied: boolean;
  onCopied: () => void;
  onNewPage: () => void;
}) {
  const { ready, peerCount, syncStatus, ...documentActions } =
    useDocumentState(
    pageId,
    seed,
  );

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onCopied();
    } catch {
      /* clipboard can be denied; the URL is still in the address bar */
    }
  }, [onCopied]);

  if (!ready) return null;

  return (
    <OneOnOnePage
      {...documentActions}
      peerCount={peerCount}
      syncStatus={syncStatus}
      copied={copied}
      onNewPage={onNewPage}
      onCopyLink={() => void onCopyLink()}
    />
  );
}

export function App() {
  const route = useHashRoute();
  const pageId = route.kind === "page" ? route.pageId : DEFAULT_PAGE_ID;
  const seed = route.kind === "page" ? "empty" : "demo";
  const [copied, setCopied] = useState(false);

  const markCopied = useCallback(() => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  const onNewPage = useCallback(() => {
    const id = createId();
    window.location.hash = pageHash(id);
    void navigator.clipboard.writeText(pageUrl(id)).then(markCopied);
  }, [markCopied]);

  return (
    <Workspace
      key={pageId}
      pageId={pageId}
      seed={seed}
      copied={copied}
      onCopied={markCopied}
      onNewPage={onNewPage}
    />
  );
}
