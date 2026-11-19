import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppearanceProvider } from "./components/Appearance";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppearanceProvider>
        <App />
      </AppearanceProvider>
    </ErrorBoundary>
  </StrictMode>,
);
