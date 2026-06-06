"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "id" | "en" | "zh" | "pt" | "es" | "ar";

interface SettingsState {
  theme: Theme;
  language: Language;
  background: string;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setBackground: (bg: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("id");
  const [background, setBackground] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Load settings on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("app_theme") as Theme;
      const storedLang = localStorage.getItem("app_lang") as Language;
      const storedBg = localStorage.getItem("app_bg");

      if (storedTheme) setTheme(storedTheme);
      if (storedLang) setLanguage(storedLang);
      if (storedBg !== null) setBackground(storedBg);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    setMounted(true);
  }, []);

  // Save and apply settings when they change
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_lang", language);
    localStorage.setItem("app_bg", background);

    // Apply dark mode class to HTML element
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply custom background to body or HTML
    if (background) {
      if (background.startsWith("http") || background.startsWith("data:")) {
        document.body.style.backgroundImage = `url(${background})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
      } else {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = background;
      }
    } else {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = ""; // let CSS variables handle it
    }
  }, [theme, language, background, mounted]);

  return (
    <SettingsContext.Provider value={{ theme, language, background, setTheme, setLanguage, setBackground }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
