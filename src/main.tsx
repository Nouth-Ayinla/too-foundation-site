import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Debug: Check if Convex URL is loaded (remove after confirming)
console.log("Convex URL loaded:", convexUrl ? "✓ Connected" : "✗ Not configured");

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (!convexUrl) {
  console.warn("VITE_CONVEX_URL not set. Convex features will be disabled.");
}

const Root = () => {
  if (!convex) {
    return <App />;
  }

  return (
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
