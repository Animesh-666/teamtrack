/**
 * ThemeContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Manages light / dark theme states with system preference detection.
 */

import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      // 1. Check if user has a saved preference
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      
      // 2. If no saved preference, check their system settings
      const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
      if (userMedia.matches) return "dark";
    }
    // 3. Default fallback
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both to be safe, then add the active one
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily grab theme and toggleTheme in any component
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};