import { Group, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import { AddProByContactModal } from "../components/AddProByContactModal";
import { InviteTimeline } from "../components/InviteTimeline";

export function MyProsTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
          My Pros
        </Title>
        <button
          onClick={() => setAddOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "var(--gk-brand-gradient)",
            color: "#fff",
            border: "none",
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 10px -2px var(--gk-accent-primary)",
            flexShrink: 0,
          }}
        >
          <IconPlus size={14} color="#fff" />
          Add a Pro
        </button>
      </Group>

      <InviteTimeline refreshKey={refreshKey} lockType="pro" />

      <AddProByContactModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
    </Stack>
  );
}
