import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "fr" | "en" | "es";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const applyLanguageToGoogleTranslate = (lang: Language) => {
  if (typeof document === "undefined") return;

  // Supprimer les anciens cookies
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;

  if (lang === "fr") {
    // Retour au français original → recharger
    window.location.reload();
  } else {
    // Définir le cookie de traduction
    document.cookie = `googtrans=/fr/${lang}; path=/;`;
    document.cookie = `googtrans=/fr/${lang}; path=/; domain=${window.location.hostname};`;
    window.location.reload();
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "fr",
      setLanguage: (language: Language) => {
        set({ language });
        applyLanguageToGoogleTranslate(language);
      },
    }),
    {
      name: "language-storage",
    }
  )
);