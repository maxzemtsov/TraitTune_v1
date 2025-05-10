 // i18n_setup_outline.js
 // Revised: May 07 2025
 // Purpose: This document provides a comprehensive conceptual guide for frontend developers 
 // to integrate internationalization (i18n) into the TraitTune application. 
 // It is not executable code but a set of actionable steps and considerations to ensure 
 // full bilingual (English/Russian) support, leveraging existing localization files and 
 // backend data structures, and aligning with project requirements including Olivia's 
 // persona and the specified onboarding flow.

 // --- 1. Introduction & Core Principle ---
 // TraitTune must offer a seamless bilingual experience (English and Russian) across all user-facing text.
 // This includes static UI elements, dynamic content from the backend (questions, reports), 
 // and all dialogue from the AI agent, Olivia.

 // --- 2. Existing Localization Assets ---
 // - Pre-populated JSON files: `/home/ubuntu/traittune_frontend/src/locales/en.json` and 
 //   `/home/ubuntu/traittune_frontend/src/locales/ru.json`. These files contain the primary UI strings, 
 //   including Olivia's complete onboarding dialogue, button labels, messages, etc., 
 //   as per the 'TraitTune Onboarding Specification'.
 // - Backend Bilingual Data: Many database tables (e.g., `questions`, `answer_options`, `dimensions`, 
 //   `interpretation_templates`, `consistency_prompts`) already store content in both `text_en` and `text_ru` columns.
 //   The frontend will need to dynamically select the appropriate field based on the active language.

 // --- 3. Recommended i18n Library & Setup (Example: i18next) ---
 // While the choice of library is up to the frontend team, `i18next` is a popular and robust option.

 //    A. Installation (Example for a React project):
 //       `npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector`
 //       or
 //       `yarn add i18next react-i18next i18next-http-backend i18next-browser-languagedetector`

 //    B. Configuration (e.g., in `src/i18n_config.js`):
 /*
 import i18n from "i18next";
 import { initReactI18next } from "react-i18next";
 import HttpBackend from "i18next-http-backend"; // For loading /locales/*.json files
 import LanguageDetector from "i18next-browser-languagedetector";

 // It's often better to directly import the JSON files if they are part of the build,
 // ensuring they are available immediately without an HTTP request, especially since they are critical.
 import enTranslations from "./locales/en.json";
 import ruTranslations from "./locales/ru.json";

 i18n
   // .use(HttpBackend) // Option 1: Load translations via HTTP. Backend path: /locales/{{lng}}.json
   .use(LanguageDetector) // Detect user language from browser, localStorage, etc.
   .use(initReactI18next) // Pass i18n instance to react-i18next
   .init({
     resources: { // Option 2: Directly pass resources (recommended for core UI text)
       en: { translation: enTranslations },
       ru: { translation: ruTranslations },
     },
     fallbackLng: "en", // Default language if detection fails or selected language is missing
     supportedLngs: ["en", "ru"],
     debug: process.env.NODE_ENV === "development", // Enable debug output in development
     interpolation: {
       escapeValue: false, // React already protects from XSS
     },
     detection: {
       order: ["localStorage", "navigator", "htmlTag"],
       caches: ["localStorage"], // Cache the selected language in localStorage
       lookupLocalStorage: "traitTune_lang", // Key for localStorage
     },
     react: {
       useSuspense: true, // Recommended for loading translations, especially if using HttpBackend
     },
   });

 export default i18n;
 */

 //    C. Initialize in Main Application File (e.g., `src/index.js` or `src/main.js`):
 //       `import "./i18n_config";` // Ensure the configuration is loaded when the app starts.

 // --- 4. Using Translations in Components ---

 //    A. Static UI Text (from `en.json`/`ru.json`):
 //       Use the translation function provided by the i18n library.
 /*
 import { useTranslation } from "react-i18next";

 function MyComponent() {
   const { t } = useTranslation();
   return (
     <div>
       <h1>{t("app_title")}</h1> 
       <button>{t("buttons.submit")}</button>
       <p>{t("onboarding.welcome_message_olivia")}</p> 
     </div>
   );
 }
 */

 //    B. Parameterized Translations (from `en.json`/`ru.json`):
 //       For dynamic values within translated strings.
 //       JSON: `"greeting_user": "Hello, {{name}}!"`
 //       Usage: `t("greeting_user", { name: userName })`

 // --- 5. Handling Dynamic Bilingual Content from Backend ---
 //    Content like questions, dimension names, report narratives, etc., is fetched from the backend.
 //    These API responses will typically include fields like `text_en` and `text_ru`.

 //    A. Helper Function for Backend Content:
 //       Create a utility function to select the correct language string from backend objects.
 /*
 export const getLocalizedBackendText = (item, currentLanguage) => {
   if (!item) return "";
   const langKey = `text_${currentLanguage}`;
   return item[langKey] || item.text_en || ""; // Fallback to English if current lang text is missing
 };

 // Usage in a component:
 // const { i18n } = useTranslation();
 // const currentLanguage = i18n.language; // e.g., "en" or "ru"
 // const questionText = getLocalizedBackendText(apiResponse.question, currentLanguage);
 */

 //    B. Example API Response Structure (Conceptual):
 /*
   // For a question:
   {
     id: 1,
     text_en: "How do you feel in social gatherings?",
     text_ru: "Как вы себя чувствуете на светских мероприятиях?",
     // ... other question properties
   }

   // For a dimension:
   {
     id: 1,
     name_en: "Optimism-Realism",
     name_ru: "Оптимизм-Реализм",
     description_en: "...",
     description_ru: "...",
   }
 */

 // --- 6. Language Switching Functionality ---
 //    Implement UI elements (e.g., a dropdown or buttons) to allow users to switch languages.
 /*
 function LanguageSwitcher() {
   const { i18n } = useTranslation();

   const changeLanguage = (lng) => {
     i18n.changeLanguage(lng); // This will also update localStorage if configured
   };

   return (
     <div>
       <button onClick={() => changeLanguage("en")} disabled={i18n.language === "en"}>English</button>
       <button onClick={() => changeLanguage("ru")} disabled={i18n.language === "ru"}>Русский</button>
     </div>
   );
 }
 */

 // --- 7. Onboarding Language Selection ---
 // - As per 'TraitTune Onboarding Specification', the user MUST be able to select their language (EN/RU) 
 //   at the very beginning of the onboarding flow.
 // - This selection should set the i18n language for the session and be persisted (e.g., in localStorage).
 // - Olivia's initial greeting and subsequent dialogue are already translated in `en.json`/`ru.json`.

 // --- 8. Key Considerations & Best Practices ---
 //    - Consistency: Ensure all user-facing text, including error messages, tooltips, and ARIA labels, is translated.
 //    - Pluralization: Use the i18n library's features for handling plural forms correctly in both languages.
 //    - Date/Number Formatting: Consider language-specific formatting for dates and numbers if applicable, though less critical for MVP.
 //    - Testing: Thoroughly test language switching and display in both English and Russian across all parts of the application.
 //    - Cultural Resonance: While the primary translations are provided, the frontend team should be mindful of layout or UI adjustments 
 //      that might be needed due to text length differences between languages.

 // --- 9. Conclusion ---
 // This outline provides a conceptual framework. The frontend development team will need to adapt these 
 // guidelines to the specific frontend framework (e.g., React, Vue, Angular) and architecture in use.
 // The primary goal is a fully immersive and accurate bilingual experience, leveraging the prepared 
 // localization files and the bilingual capabilities of the backend data.

 console.log("i18n_setup_outline.js has been updated to be a more comprehensive and actionable guide for frontend i18n integration, referencing existing assets and backend capabilities.");

