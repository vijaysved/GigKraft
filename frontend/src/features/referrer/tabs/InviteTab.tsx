import { Group, Stack } from "@mantine/core";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { InviteBothModal } from "../components/InviteBothModal";
import { InviteTimeline } from "../components/InviteTimeline";
import { InviteWizardModal } from "../components/InviteWizardModal";
import { nativeBtn } from "../components/inviteShared";
import type { InviteScenario } from "../types";

// ─── Main component ───────────────────────────────────────────────────────────

export function InviteTab() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const senderName = user?.first_name || "";

  const [wizardScenario, setWizardScenario] = useState<InviteScenario | null>(null);
  const [inviteBothOpen, setInviteBothOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Stack gap="xs">

      {/* ── Action buttons — 4th is community_lead-only ─────────────── */}
      <Group gap="xs" wrap="wrap">
        <button style={nativeBtn({ primary: true })} onClick={() => setWizardScenario("pro")}>
          Invite a Pro
        </button>
        <button style={nativeBtn({})} onClick={() => setWizardScenario("friend")}>
          Invite a Friend
        </button>
        <button style={nativeBtn({})} onClick={() => setWizardScenario("circle")}>
          Share My Circle
        </button>
        {user?.role === "community_lead" && (
          <button style={nativeBtn({})} onClick={() => setInviteBothOpen(true)}>
            Invite Them (Pro + Friend)
          </button>
        )}
      </Group>

      {/* ── Unified contacts list ────────────────────────────────── */}
      <InviteTimeline refreshKey={refreshKey} title="Contacts" />

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

      <InviteBothModal
        opened={inviteBothOpen}
        onClose={() => setInviteBothOpen(false)}
        slug={slug}
        onSent={() => setRefreshKey((k) => k + 1)}
      />
    </Stack>
  );
}
