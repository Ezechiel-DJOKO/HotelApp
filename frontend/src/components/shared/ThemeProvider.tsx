"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { applyTheme, theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Attendre le montage côté client avant d'appliquer le thème
  useEffect(() => {
    setMounted(true);
    applyTheme();
  }, [applyTheme]);

  // Écouter les changements système (mode auto)
  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // Empêcher le flash en attendant le montage
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}