import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

const translations = {
  English: en,
  Hindi: hi,
  Marathi: mr,
  en: en,
  hi: hi,
  mr: mr,
};

/**
 * Resolve nested translation keys like "nav.dashboard" or "settings.theme_mode"
 */
export function t(key, lang = "English") {
  const dict = translations[lang] || translations["English"];
  const parts = key.split(".");
  let current = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English dictionary if key is missing in target language
      let fallback = translations["English"];
      for (const p of parts) {
        if (fallback && typeof fallback === "object" && p in fallback) {
          fallback = fallback[p];
        } else {
          return key; // return raw key if missing everywhere
        }
      }
      return typeof fallback === "string" ? fallback : key;
    }
  }

  return typeof current === "string" ? current : key;
}



