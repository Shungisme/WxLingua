"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_KEY = "theme";
const SNOW_KEY = "wxlingua:snow-enabled";
const HEARTS_KEY = "wxlingua:hearts-enabled";

interface UiSettingsContextValue {
  darkMode: boolean;
  snowEnabled: boolean;
  heartsEnabled: boolean;
  setDarkMode: (enabled: boolean) => void;
  setSnowEnabled: (enabled: boolean) => void;
  setHeartsEnabled: (enabled: boolean) => void;
}

const UiSettingsContext = createContext<UiSettingsContextValue | undefined>(
  undefined,
);

export function UiSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [heartsEnabled, setHeartsEnabled] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setDarkMode(initialDark);

    const savedSnow = localStorage.getItem(SNOW_KEY);
    setSnowEnabled(savedSnow === null ? true : savedSnow === "true");

    const savedHearts = localStorage.getItem(HEARTS_KEY);
    setHeartsEnabled(savedHearts === null ? true : savedHearts === "true");

    setInitialized(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    if (initialized) {
      localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    }
  }, [darkMode, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(SNOW_KEY, String(snowEnabled));
  }, [snowEnabled, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(HEARTS_KEY, String(heartsEnabled));
  }, [heartsEnabled, initialized]);

  const value = useMemo(
    () => ({
      darkMode,
      snowEnabled,
      heartsEnabled,
      setDarkMode,
      setSnowEnabled,
      setHeartsEnabled,
    }),
    [darkMode, snowEnabled, heartsEnabled],
  );

  return (
    <UiSettingsContext.Provider value={value}>
      {children}
    </UiSettingsContext.Provider>
  );
}

export function useUiSettings() {
  const context = useContext(UiSettingsContext);
  if (!context) {
    throw new Error("useUiSettings must be used within UiSettingsProvider");
  }
  return context;
}
