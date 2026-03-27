import React, { createContext, useContext, useMemo, useState } from "react";
import {
  languageOptions,
  translations,
  type SupportedLanguage,
} from "./translations";

type I18nContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  languageOptions: typeof languageOptions;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "language";

function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "nl" || stored === "en") return stored;

  const browser = navigator.language.toLowerCase();
  return browser.startsWith("nl") ? "nl" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = (nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, t, languageOptions }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
