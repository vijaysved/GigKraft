import { Badge, Button, Card, Divider, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { communityFetch } from "../hooks/useCommunity";
import type { CommunityBillingOut } from "../types";
import { DowngradeCommunityModal } from "./DowngradeCommunityModal";

const STATUS_COLOR: Record<string, string> = {
  active: "green",
  past_due: "orange",
  cancelled: "red",
  paid: "green",
  open: "orange",
  void: "gray",
};

interface Props {
  communityName: string;
  onDowngraded: () => void;
}

export function CommunityBillingTab({ communityName, onDowngraded }: Props) {
  const [billing, setBilling] = useState<CommunityBillingOut | null>(null);
  const [downgradeOpen, setDowngradeOpen] = useState(false);

  useEffect(() => {
    communityFetch("/api/me/community/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CommunityBillingOut | null) => setBilling(d))
      .catch(() => setBilling(null));
  }, []);

  if (!billing) return null;

  return (
    <Stack gap="md">
      <Card radius="md" padding="lg" style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
              <Text size="xs" fw={600} style={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current plan</Text>
              <Title order={3} style={{ color: "#fff" }}>{billing.plan_label ?? "Community Directory"}</Title>
            </Stack>
            <Badge color={STATUS_COLOR[billing.status ?? ""] ?? "gray"} variant="filled" size="sm">
              {billing.status ?? "—"}
            </Badge>
          </Group>
          <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
          <Group gap="xl" wrap="wrap">
            <Stack gap={0}>
              <Text size="xs" style={{ opacity: 0.75 }}>Monthly value</Text>
              <Text fw={700}>${billing.monthly_value?.toFixed(2) ?? "—"}/mo</Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" style={{ opacity: 0.75 }}>Next renewal</Text>
              <Text fw={700}>{billing.renews_at ?? "—"}</Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" style={{ opacity: 0.75 }}>Card on file</Text>
              <Text fw={700}>•••• •••• •••• {billing.card_last4 || "—"}</Text>
            </Stack>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="md">
        <Stack gap="sm">
          <Title order={6}>Invoice history</Title>
          {billing.invoices.length === 0 ? (
            <Text size="sm" c="dimmed">No invoices yet.</Text>
          ) : (
            <Table withRowBorders striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Period</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {billing.invoices.map((inv) => (
                  <Table.Tr key={inv.id}>
                    <Table.Td>{inv.period_label}</Table.Td>
                    <Table.Td>{inv.issued_at}</Table.Td>
                    <Table.Td>${inv.amount.toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={STATUS_COLOR[inv.status] ?? "gray"} variant="light">{inv.status}</Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      {billing.status !== "cancelled" && (
        <Button variant="light" color="red" size="xs" radius="xl" onClick={() => setDowngradeOpen(true)} style={{ alignSelf: "flex-start" }}>
          Downgrade to Free
        </Button>
      )}

      <DowngradeCommunityModal
        opened={downgradeOpen}
        onClose={() => setDowngradeOpen(false)}
        communityName={communityName}
        onDowngraded={onDowngraded}
      />
    </Stack>
  );
}
