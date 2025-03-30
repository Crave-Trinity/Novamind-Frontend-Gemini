import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

// Add error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
});

// Add promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
