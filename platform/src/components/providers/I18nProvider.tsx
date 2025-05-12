"use client";

import { I18nextProvider, useTranslation as useReactI18nextTranslation } from "react-i18next";
import i18n from "../../lib/i18n";
import { ReactNode, useEffect } from "react";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export const useI18n = () => {
  const { t, i18n: i18nInstance } = useReactI18nextTranslation();
  return {
    t,
    locale: i18nInstance.language,
    setLocale: (lang: string) => i18nInstance.changeLanguage(lang),
  };
};
