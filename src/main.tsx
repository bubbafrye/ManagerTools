import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { startTextSizeOffsetSync } from "./textSizeOffset";
import "./styles/global.css";

startTextSizeOffsetSync();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
