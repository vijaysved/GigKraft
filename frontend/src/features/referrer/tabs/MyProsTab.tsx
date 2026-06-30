import { Stack, Tabs, Text, Title } from "@mantine/core";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useState } from "react";

import { AddProByContactModal } from "../components/AddProByContactModal";
import { InviteTimeline } from "../components/InviteTimeline";
import { ProSearchPanel } from "../components/ProSearchPanel";

const inviteBtn: React.CSSProperties = {
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
};

export function MyProsTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function bumpRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <Stack gap="md">
      <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
        My Pros
      </Title>

      <Tabs defaultValue="search">
        <Tabs.List>
          <Tabs.Tab value="search" leftSection={<IconSearch size={14} />}>Search</Tabs.Tab>
          <Tabs.Tab value="invite" leftSection={<IconUserPlus size={14} />}>Invite</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="search" pt="sm">
          <ProSearchPanel onAdded={bumpRefresh} />
        </Tabs.Panel>

        <Tabs.Panel value="invite" pt="sm">
          <Stack gap="sm" align="flex-start">
            <Text size="sm" c="dimmed">
              Know someone who isn't on GigKraft yet, or can't find them by search? Invite them directly by
              email, WhatsApp, or SMS.
            </Text>
            <button style={inviteBtn} onClick={() => setAddOpen(true)}>
              <IconUserPlus size={14} color="#fff" />
              Invite a Pro
            </button>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <InviteTimeline refreshKey={refreshKey} lockType="pro" />

      <AddProByContactModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={bumpRefresh}
      />
    </Stack>
  );
}
