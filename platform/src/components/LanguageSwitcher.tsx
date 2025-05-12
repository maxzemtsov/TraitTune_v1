// /home/ubuntu/traittune_frontend/src/components/LanguageSwitcher.tsx
"use client";

import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}>
      <button 
        onClick={() => changeLanguage("en")} 
        disabled={i18n.language === "en"} 
        style={{marginRight: "5px", padding: "5px 10px", cursor: i18n.language === "en" ? "default" : "pointer"}}
      >
        EN
      </button>
      <button 
        onClick={() => changeLanguage("ru")} 
        disabled={i18n.language === "ru"}
        style={{padding: "5px 10px", cursor: i18n.language === "ru" ? "default" : "pointer"}}
      >
        RU
      </button>
    </div>
  );
}

