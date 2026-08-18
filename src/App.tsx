import { useDocumentState } from "./hooks/useDocumentState";
import { OneOnOnePage } from "./pages/OneOnOnePage";

export function App() {
  const documentActions = useDocumentState();

  return <OneOnOnePage {...documentActions} />;
}
