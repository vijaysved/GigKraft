import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import {
  applyBrandTokens,
  DEFAULT_THEME_ID,
  resolveThemeId,
  THEMES,
  type ThemeId,
} from "./themes";

const STORAGE_KEY = "gigkraft.theme";

interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadStoredThemeId(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return resolveThemeId(stored);
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(loadStoredThemeId);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable; theme still applies for this session
    }
  }, []);

  const definition = THEMES[themeId];

  useEffect(() => {
    applyBrandTokens(themeId);
  }, [themeId]);

  const value = useMemo(() => ({ themeId, setThemeId }), [themeId, setThemeId]);

  return (
    <ThemeContext.Provider value={value}>
      <MantineProvider
        theme={definition.theme}
        forceColorScheme={definition.colorScheme}
      >
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
