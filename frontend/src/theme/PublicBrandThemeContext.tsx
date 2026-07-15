import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PublicBrandThemeValue {
  themeId: string | null;
  setThemeId: (id: string | null) => void;
}

const Ctx = createContext<PublicBrandThemeValue | null>(null);

/** Wraps globally-mounted chrome (e.g. FeedbackWidget) so it can pick up the
 * brand theme of whichever public page (community, referrer) is on screen. */
export function PublicBrandThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string | null>(null);
  return <Ctx.Provider value={{ themeId, setThemeId }}>{children}</Ctx.Provider>;
}

function useCtx(): PublicBrandThemeValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("must be used within PublicBrandThemeProvider");
  return ctx;
}

/** Read by globally-mounted chrome that should match the current public page's brand theme. */
export function usePublicBrandThemeId(): string | null {
  return useCtx().themeId;
}

/** Called by a public page (while it owns a brand theme, e.g. a community's `theme`
 * field) to broadcast it up so chrome like FeedbackWidget can match it. Clears on unmount. */
export function useSetPublicBrandTheme(themeId: string | null | undefined): void {
  const { setThemeId } = useCtx();
  useEffect(() => {
    setThemeId(themeId ?? null);
    return () => setThemeId(null);
  }, [themeId, setThemeId]);
}
