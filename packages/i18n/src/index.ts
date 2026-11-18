import i18next, { type i18n as I18n } from "i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const supportedLocales = ["es", "en"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "es";

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

/** Crea una instancia de i18next lista para usar (síncrona, recursos embebidos). */
export function initI18n(lng: Locale = defaultLocale): I18n {
  const instance = i18next.createInstance();
  void instance.init({
    lng,
    fallbackLng: defaultLocale,
    resources,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}

export { es, en };
