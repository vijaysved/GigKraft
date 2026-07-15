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

import { useAuth } from "../auth/AuthContext";
import { patchMe } from "../api/endpoints";
import {
  applyBrandTokens,
  DEFAULT_THEME_ID,
  isThemeId,
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
  const { user, updateUser } = useAuth();
  const [themeId, setThemeIdState] = useState<ThemeId>(loadStoredThemeId);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable; theme still applies for this session
    }
    if (user) {
      updateUser({ theme: id });
      patchMe({ theme: id }).catch(() => {
        // theme already applied locally; a failed sync just means it
        // won't follow the user to another device until the next change
      });
    }
  }, [user, updateUser]);

  // Once the authenticated user's saved theme is known, it's the source of
  // truth (so a theme picked on another device follows the user here).
  useEffect(() => {
    if (user && isThemeId(user.theme) && user.theme !== themeId) {
      setThemeIdState(user.theme);
      try {
        window.localStorage.setItem(STORAGE_KEY, user.theme);
      } catch {
        // localStorage unavailable; theme still applies for this session
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.theme]);

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
