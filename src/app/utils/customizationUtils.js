export const DEFAULT_CUSTOMIZATION = {
  theme: "light",
  accentColor: "#3b82f6",
  sidebarStyle: "expanded",
  fontSize: "medium",
  language: "English",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24-hour",
  currencyFormat: "Indian",
};

/**
 * Retrieve saved customization settings from localStorage merged with defaults.
 */
export function getSavedCustomization() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return { ...DEFAULT_CUSTOMIZATION };
    return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to parse appSettings from localStorage:", e);
    return { ...DEFAULT_CUSTOMIZATION };
  }
}

/**
 * Apply customization settings globally to the document DOM.
 */
export function applyCustomization(settings = getSavedCustomization()) {
  if (typeof window === "undefined" || !document) return;

  const { theme, accentColor, fontSize } = settings;

  // 1. Apply Theme
  const isSystemDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && isSystemDark);

  if (isDark) {
    document.documentElement.classList.add("dark");
    document.body.style.backgroundColor = "#0f172a";
    document.body.style.color = "#f8fafc";
  } else {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#f8fafc";
    document.body.style.color = "#0f172a";
  }

  // 2. Apply Accent Color
  if (accentColor) {
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }

  // 3. Apply Font Size
  const fontMap = { small: "14px", medium: "16px", large: "18px" };
  document.documentElement.style.fontSize = fontMap[fontSize] || "16px";
}

/**
 * Save customization settings to localStorage and trigger global application and broadcast.
 */
export function saveCustomization(newSettings) {
  try {
    const current = getSavedCustomization();
    const updated = { ...current, ...newSettings };
    localStorage.setItem("appSettings", JSON.stringify(updated));
    applyCustomization(updated);
    window.dispatchEvent(
      new CustomEvent("appSettingsChanged", { detail: updated }),
    );
    return updated;
  } catch (e) {
    console.error("Failed to save appSettings to localStorage:", e);
    return newSettings;
  }
}
