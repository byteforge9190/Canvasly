import React, { createContext, useState, useCallback } from 'react';
import type { SiteTheme } from '@canvasly/dsl-schema';
import { DEFAULT_THEME } from '@canvasly/dsl-schema';

interface ThemeContextValue {
  theme: SiteTheme;
  isLoading: boolean;
  error: string | null;
  updateTheme: (theme: SiteTheme) => void;
  resetTheme: () => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  siteId: string | null;
  initialTheme?: SiteTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<SiteTheme>(initialTheme || DEFAULT_THEME);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const updateTheme = useCallback((newTheme: SiteTheme) => {
    setTheme(newTheme);
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, []);

  const refreshTheme = useCallback(async () => {
    // No-op in local mode
  }, []);

  const value: ThemeContextValue = {
    theme,
    isLoading,
    error,
    updateTheme,
    resetTheme,
    refreshTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export { ThemeContext };
