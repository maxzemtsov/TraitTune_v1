// /home/ubuntu/traittune_frontend/src/components/providers/I18nProvider.tsx
"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../../lib/i18n"; // Adjust path as necessary
import { ReactNode, useEffect } from "react";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string; // Optional: if you want to force a locale from the server
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

