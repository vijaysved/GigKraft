import { Group, Stack, Title } from "@mantine/core";
import { IconShare, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { InviteTimeline } from "../components/InviteTimeline";
import { InviteWizardModal } from "../components/InviteWizardModal";
import type { InviteScenario } from "../types";

// ─── Sleek button styles — Primary / Secondary / Tertiary roles ──────────────

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 20px",
  border: "none",
  borderRadius: 99,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "inherit",
  lineHeight: 1.5,
  transition: "opacity 0.15s ease, box-shadow 0.15s ease",
  whiteSpace: "nowrap" as const,
};

// Primary — highest-intent action (Invite a Pro)
const primaryBtn: React.CSSProperties = {
  ...btnBase,
  background: "var(--gk-brand-gradient, linear-gradient(135deg,#C42200,#FF6B1A 55%,#84CC16))",
  color: "#fff",
  boxShadow: "0 3px 10px -2px var(--gk-accent-primary, #C42200), inset 0 1px 0 rgba(255,255,255,0.18)",
};

// Secondary — outline using the theme's secondary accent (Invite a Friend)
const secondaryBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--gk-accent-secondary, #f39c12)",
  border: "1.5px solid var(--gk-accent-secondary, #f39c12)",
};

// Tertiary / ghost — lowest-intent action (Share My Circle)
const ghostBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--gk-text-secondary, #666)",
  border: "1.5px solid var(--mantine-color-gray-3, #dee2e6)",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function InviteTab() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const senderName = user?.first_name || "";

  const [wizardScenario, setWizardScenario] = useState<InviteScenario | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Stack gap="xl">

      {/* ── Three action buttons ──────────────────────────────────── */}
      <Group gap="sm" wrap="wrap">
        <button style={primaryBtn} onClick={() => setWizardScenario("pro")}>
          <IconUserPlus size={15} />
          Invite a Pro
        </button>
        <button style={secondaryBtn} onClick={() => setWizardScenario("friend")}>
          <IconUsers size={15} />
          Invite a Friend
        </button>
        <button style={ghostBtn} onClick={() => setWizardScenario("circle")}>
          <IconShare size={15} />
          Share My Circle
        </button>
      </Group>

      {/* ── Unified activity timeline ────────────────────────────── */}
      <Stack gap="xs">
        <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
          Activity
        </Title>
        <InviteTimeline refreshKey={refreshKey} />
      </Stack>

      {wizardScenario && (
        <InviteWizardModal
          opened
          onClose={() => setWizardScenario(null)}
          scenario={wizardScenario}
          slug={slug}
          senderName={senderName}
          onSent={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </Stack>
  );
}
