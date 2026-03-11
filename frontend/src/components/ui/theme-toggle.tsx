"use client";

import { useEffect, useState } from "react";

import { Button } from "./button";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  // On mount, read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = saved ? saved === "dark" : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      size="sm"
      variant={dark ? "primary" : "dark"}
      className={`text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 !flex ${className}`}
    >
      {dark ? (
        <i className="hn hn-sun text-[14px]" />
      ) : (
        <i className="hn hn-moon text-[14px]" />
      )}
      {dark ? "Light" : "Dark"}{" "}
    </Button>
  );
}
