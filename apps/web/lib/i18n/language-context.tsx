'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'heyama-language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedValue(obj: unknown, path: string[]): string | undefined {
  let current: unknown = obj;
  for (const key of path) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // localStorage/navigator are unavailable during SSR, so the stored preference can only be
    // read after mount — this is the standard pattern for syncing from a browser-only API.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
    } else {
      const browserLang = window.navigator.language.toLowerCase();
      setLanguageState(browserLang.startsWith('fr') ? 'fr' : 'en');
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next = current === 'fr' ? 'en' : 'fr';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useLanguage();

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const path = key.split('.');
      const template = getNestedValue(translations[language], path) ?? key;

      if (!params) return template;

      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) => result.replaceAll(`{${paramKey}}`, paramValue),
        template,
      );
    },
    [language],
  );

  return { t, language };
}
