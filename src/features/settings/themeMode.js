import { defaultAppSettings, readAppSettings } from "./appSettings.js";

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

function canUseDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function getResolvedTheme(theme = defaultAppSettings.theme) {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  if (canUseDom() && typeof window.matchMedia === "function") {
    return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
  }
  return "light";
}

export function applyThemePreference(theme = defaultAppSettings.theme) {
  const resolvedTheme = getResolvedTheme(theme);
  if (!canUseDom()) return resolvedTheme;

  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.classList.toggle("dark", resolvedTheme === "dark");
  return resolvedTheme;
}

export function applyStoredThemePreference() {
  const settings = readAppSettings();
  return applyThemePreference(settings?.theme ?? defaultAppSettings.theme);
}

export function watchSystemThemePreference(callback) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);

  const handleThemeChange = () => {
    const settings = readAppSettings();
    if ((settings?.theme ?? defaultAppSettings.theme) !== "system") return;
    const resolvedTheme = applyThemePreference("system");
    callback?.(resolvedTheme);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleThemeChange);
    return () => mediaQuery.removeListener(handleThemeChange);
  }

  return () => {};
}
