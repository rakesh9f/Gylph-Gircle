
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEMES, ThemeConfig, ThemeId } from '../services/themeConfig';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('glyph_theme') as ThemeId) || 'default';
  });

  const setTheme = (id: ThemeId) => {
    setCurrentThemeId(id);
    localStorage.setItem('glyph_theme', id);
    // Add audio feedback for theme switch
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    // Apply data attribute to body for CSS variable targeting
    document.body.setAttribute('data-theme', currentThemeId);
  }, [currentThemeId]);

  return (
    <ThemeContext.Provider value={{ currentTheme: THEMES[currentThemeId], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
