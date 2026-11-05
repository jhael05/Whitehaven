import React, { createContext, useContext, useState, useEffect } from 'react';
import { CafeThemeId, CafeThemeOption, CAFE_THEMES } from '../types/cafe';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  currentTheme: CafeThemeId;
  themeConfig: CafeThemeOption;
  availableThemes: CafeThemeOption[];
  setTheme: (themeId: CafeThemeId) => void;
}

const THEME_STORAGE_KEY = 'white_haven_selected_theme_v2';
const DEFAULT_THEME: CafeThemeId = 'warm-classic';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUserTheme } = useAuth();

  const [currentTheme, setCurrentThemeState] = useState<CafeThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as CafeThemeId | null;
      if (saved && CAFE_THEMES.some(t => t.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return DEFAULT_THEME;
  });

  // Sync theme with user's saved preference when logged in
  useEffect(() => {
    if (user?.selectedTheme && user.selectedTheme !== currentTheme) {
      setCurrentThemeState(user.selectedTheme);
      localStorage.setItem(THEME_STORAGE_KEY, user.selectedTheme);
    }
  }, [user?.selectedTheme]);

  // Apply theme attributes and variables to document
  useEffect(() => {
    const selected = CAFE_THEMES.find(t => t.id === currentTheme) || CAFE_THEMES[0];
    const root = document.documentElement;

    root.setAttribute('data-theme', selected.id);

    // Dynamic CSS root variables matching café palette
    root.style.setProperty('--cafe-bg', selected.bgHex);
    root.style.setProperty('--cafe-cream', selected.creamHex);
    root.style.setProperty('--cafe-dark', selected.primaryHex);
    root.style.setProperty('--cafe-accent', selected.accentHex);
    root.style.setProperty('--cafe-brown', selected.primaryHex);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, selected.id);
  }, [currentTheme]);

  const setTheme = (themeId: CafeThemeId) => {
    if (CAFE_THEMES.some(t => t.id === themeId)) {
      setCurrentThemeState(themeId);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      if (user) {
        setUserTheme(themeId);
      }
    }
  };

  const themeConfig = CAFE_THEMES.find(t => t.id === currentTheme) || CAFE_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        availableThemes: CAFE_THEMES,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
