"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, Loader2 } from "lucide-react";

// Types pour Google Translate
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (options: object, id: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
];

interface GoogleTranslateProps {
  variant?: "light" | "dark";
}

export default function GoogleTranslate({ variant = "light" }: GoogleTranslateProps) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("fr");
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Initialiser Google Translate
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Fonction d'initialisation appelée par le script Google
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "fr",
            includedLanguages: languages.map((l) => l.code).join(","),
            layout: 0, // SIMPLE
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setLoading(false);
      }
    };

    // Charger le script Google Translate
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Récupérer la langue actuelle depuis le cookie
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("googtrans="));
    if (cookie) {
      const value = cookie.split("=")[1];
      const parts = value.split("/");
      if (parts.length >= 3) {
        setCurrentLang(parts[2]);
      }
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    // Supprimer le cookie existant
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
      window.location.hostname;

    // Définir la nouvelle langue
    if (langCode === "fr") {
      // Retour au français original
      setCurrentLang("fr");
      setOpen(false);
      window.location.reload();
    } else {
      document.cookie = `googtrans=/fr/${langCode}; path=/;`;
      document.cookie = `googtrans=/fr/${langCode}; path=/; domain=${window.location.hostname};`;
      setCurrentLang(langCode);
      setOpen(false);
      window.location.reload();
    }
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  const buttonClass =
    variant === "dark"
      ? "text-white hover:bg-white/10"
      : "text-slate-700 hover:bg-slate-100";

  return (
    <>
      {/* Widget Google caché */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* CSS pour cacher le widget Google natif */}
      <style jsx global>{`
        .goog-te-banner-frame,
        .skiptranslate {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
        font {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Notre bouton personnalisé */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${buttonClass} disabled:opacity-50`}
          aria-label="Change language"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="text-sm font-medium hidden sm:block">
                {currentLanguage.code.toUpperCase()}
              </span>
            </>
          )}
        </button>

        {open && !loading && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Choisir la langue
              </p>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-slate-900">
                    {lang.label}
                  </span>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
            <div className="px-4 py-2 border-t border-slate-100 mt-1">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Traduit par Google
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}