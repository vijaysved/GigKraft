import { Box } from "@mantine/core";
import type { ReactNode } from "react";

import "../../theme/marketing.css";
import { WaitlistProvider } from "./WaitlistModal";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <WaitlistProvider>
      <Box className="mk-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--gk-bg-canvas)" }}>
        <MarketingNav />
        <Box style={{ flex: 1 }}>{children}</Box>
        <MarketingFooter />
      </Box>
    </WaitlistProvider>
  );
}
