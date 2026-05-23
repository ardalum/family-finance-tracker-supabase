import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import {
  applyStoredThemePreference,
  watchSystemThemePreference,
} from "./features/settings/themeMode.js";
import "./styles/index.css";

applyStoredThemePreference();
watchSystemThemePreference();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
