import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";

import { GkEmptyState } from "../../components/GkEmptyState";

const MOCK_PROS = [
  { id: 1, name: "John Smith", trade: "Plumber", krafts: 12, recs: 8, avgSla: "2h", plan: "Vault", status: "active" },
  { id: 2, name: "Dave Torres", trade: "Electrician", krafts: 5, recs: 3, avgSla: "3h", plan: "Basic", status: "active" },
  { id: 3, name: "Maria Garcia", trade: "HVAC", krafts: 20, recs: 15, avgSla: "1h", plan: "Vault", status: "pending" },
];

export function AdminProsPage() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const filtered = MOCK_PROS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.trade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Pro Ledger</Title>
        <Button size="sm" onClick={() => setInviteOpen(true)}>Invite Pro</Button>
      </Group>

      <TextInput
        placeholder="Search by name or trade…"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        maw={400}
      />

      {filtered.length === 0 ? (
        <GkEmptyState title="No pros found" description="Try a different search." />
      ) : (
        <Stack gap="sm">
          {filtered.map((pro) => (
            <Card key={pro.id} withBorder radius="md" padding="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={700}>{pro.name}</Text>
                  <Text size="sm" c="dimmed">{pro.trade}</Text>
                </Stack>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">{pro.krafts} krafts</Text>
                  <Text size="xs" c="dimmed">{pro.recs} recs</Text>
                  <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    SLA {pro.avgSla}
                  </Text>
                  <Badge variant="light">{pro.plan}</Badge>
                  <Badge color={pro.status === "active" ? "green" : "yellow"}>{pro.status}</Badge>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Pro" size="sm">
        <Stack>
          <TextInput
            label="Email address"
            placeholder="pro@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.currentTarget.value)}
          />
          <Button fullWidth onClick={() => { setInviteOpen(false); setInviteEmail(""); }}>
            Send invite (mock)
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
