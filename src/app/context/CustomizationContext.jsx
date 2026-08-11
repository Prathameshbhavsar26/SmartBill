import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  fetchCustomizationAPI,
  saveCustomizationAPI,
  resetCustomizationAPI,
} from "../api/customizationAPI";
import { t } from "../i18n";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatTime,
} from "../utils/formatters";

export const DEFAULT_CUSTOMIZATION = {
  theme: "light",
  accentColor: "#3b82f6",
  sidebarStyle: "expanded",
  fontSize: "medium",
  language: "English",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24-hour",
  numberFormat: "Indian",
  currency: "INR",
};

export const CustomizationContext = createContext({
  settings: DEFAULT_CUSTOMIZATION,
  tempSettings: DEFAULT_CUSTOMIZATION,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  updateTempSettings: () => {},
  saveSettings: async () => {},
  cancelChanges: () => {},
  resetToDefault: async () => {},
  t: (key) => key,
  formatCurrency: (val) => val,
  formatNumber: (val) => val,
  formatDate: (dateVal) => dateVal,
  formatTime: (dateVal) => dateVal,
});

function adjustColor(hex, percent) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  let num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + percent;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) + percent;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) + percent;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, "0");
}

function applyDOMCustomization(settings) {
  if (typeof window === "undefined" || !document) return;

  const { theme, accentColor, fontSize } = settings;

  // 1. Theme Mode
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

  // 2. Accent Colors
  if (accentColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(accentColor)) {
    const root = document.documentElement;
    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--primary-hover", adjustColor(accentColor, -20));
    root.style.setProperty("--primary-dark", adjustColor(accentColor, -40));
    root.style.setProperty("--primary-light", `${accentColor}1f`);
    root.style.setProperty("--primary-foreground", "#ffffff");
  }

  // 3. Font Size
  const fontMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
    xlarge: "20px",
  };
  const baseSize = fontMap[fontSize] || "16px";
  document.documentElement.style.fontSize = baseSize;
  document.documentElement.style.setProperty("--base-font-size", baseSize);
}

export function CustomizationProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("appSettings");
      return raw
        ? { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(raw) }
        : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sync tempSettings when persisted settings change
  useEffect(() => {
    setTempSettings(settings);
    applyDOMCustomization(settings);
  }, [settings]);

  // Apply DOM live preview when tempSettings changes
  useEffect(() => {
    applyDOMCustomization(tempSettings);
  }, [tempSettings]);

  // Load user settings from backend API on mount
  useEffect(() => {
    const token = localStorage.getItem("smartbill_token");
    if (!token) return;

    setLoading(true);
    fetchCustomizationAPI()
      .then((res) => {
        if (res?.customization) {
          const loaded = {
            ...DEFAULT_CUSTOMIZATION,
            ...res.customization,
          };
          setSettings(loaded);
          setTempSettings(loaded);
          localStorage.setItem("appSettings", JSON.stringify(loaded));
        }
      })
      .catch((err) => {
        console.warn("Backend customization fetch fallback to localStorage:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateTempSettings = useCallback((newPartial) => {
    setError(null);
    setSuccessMessage(null);
    setTempSettings((prev) => ({ ...prev, ...newPartial }));
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Persist to localStorage immediately
    localStorage.setItem("appSettings", JSON.stringify(tempSettings));
    setSettings(tempSettings);

    const token = localStorage.getItem("smartbill_token");
    if (token) {
      try {
        const res = await saveCustomizationAPI(tempSettings);
        if (res?.customization) {
          const saved = { ...DEFAULT_CUSTOMIZATION, ...res.customization };
          setSettings(saved);
          setTempSettings(saved);
          localStorage.setItem("appSettings", JSON.stringify(saved));
        }
      } catch (err) {
        console.error("Failed to save customization to backend:", err.message);
        setError(err.message || "Failed to save settings to server.");
      }
    }

    setSaving(false);
    setSuccessMessage("✓ Customization settings saved successfully!");
  }, [tempSettings]);

  const cancelChanges = useCallback(() => {
    setTempSettings(settings);
    setError(null);
    setSuccessMessage("Changes reverted.");
  }, [settings]);

  const resetToDefault = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    setTempSettings(DEFAULT_CUSTOMIZATION);
    setSettings(DEFAULT_CUSTOMIZATION);
    localStorage.setItem("appSettings", JSON.stringify(DEFAULT_CUSTOMIZATION));

    const token = localStorage.getItem("smartbill_token");
    if (token) {
      try {
        await resetCustomizationAPI();
      } catch (err) {
        console.error("Failed to reset customization on backend:", err.message);
      }
    }

    setSaving(false);
    setSuccessMessage("✓ Customization settings reset to defaults!");
  }, []);

  // i18n helper function bound to active language
  const translate = useCallback(
    (key) => t(key, tempSettings.language || "English"),
    [tempSettings.language],
  );

  // Formatting helpers bound to active currency / date / time formats
  const boundFormatCurrency = useCallback(
    (val) =>
      formatCurrency(val, tempSettings.currency, tempSettings.numberFormat),
    [tempSettings.currency, tempSettings.numberFormat],
  );

  const boundFormatNumber = useCallback(
    (val) => formatNumber(val, tempSettings.numberFormat),
    [tempSettings.numberFormat],
  );

  const boundFormatDate = useCallback(
    (dateVal) => formatDate(dateVal, tempSettings.dateFormat),
    [tempSettings.dateFormat],
  );

  const boundFormatTime = useCallback(
    (dateVal) => formatTime(dateVal, tempSettings.timeFormat),
    [tempSettings.timeFormat],
  );

  return (
    <CustomizationContext.Provider
      value={{
        settings,
        tempSettings,
        loading,
        saving,
        error,
        successMessage,
        updateTempSettings,
        saveSettings,
        cancelChanges,
        resetToDefault,
        t: translate,
        formatCurrency: boundFormatCurrency,
        formatNumber: boundFormatNumber,
        formatDate: boundFormatDate,
        formatTime: boundFormatTime,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}
