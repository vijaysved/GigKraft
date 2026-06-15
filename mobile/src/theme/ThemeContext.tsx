import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { Scheme, THEME_NAMES, ThemeName, themes } from './themes';

const STORAGE_KEY = 'gk.theme';

interface ThemeContextValue {
  /** Active scheme object consumed by components. */
  scheme: Scheme;
  /** Active theme name. */
  themeName: ThemeName;
  /** Set a specific theme by name (persisted). */
  setTheme: (name: ThemeName) => void;
  /** Cycle to the next theme in order (persisted). */
  toggle: () => void;
  /** True once the persisted theme has been loaded. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeName(value: string | null): value is ThemeName {
  return value !== null && (THEME_NAMES as string[]).includes(value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>(
    systemScheme === 'dark' ? 'gigkraft_dark' : 'gigkraft_light',
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isThemeName(stored)) {
          setThemeName(stored);
        }
      })
      .catch(() => {
        // Fall back to the system-seeded default.
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {
      // Persistence failure is non-fatal; theme still applies in-memory.
    });
  }, []);

  const toggle = useCallback(() => {
    setThemeName((current) => {
      const next =
        THEME_NAMES[(THEME_NAMES.indexOf(current) + 1) % THEME_NAMES.length];
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme: themes[themeName], themeName, setTheme, toggle, ready }),
    [themeName, setTheme, toggle, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
