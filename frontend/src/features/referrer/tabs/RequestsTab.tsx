import {
  Badge,
  Button,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  declineReferrerRequest,
  getReferrerPros,
  getReferrerRequests,
  type ReferrerProRow,
} from "../../../api/endpoints";
import type { ReferralRequestDetailOut } from "../types";
import { SendReferralModal } from "../components/SendReferralModal";

function statusColor(status: string) {
  if (status === "sent") return "teal";
  if (status === "otp_pending") return "blue";
  if (status === "declined") return "red";
  if (status === "expired") return "gray";
  return "yellow";
}

export function RequestsTab() {
  const [filter, setFilter] = useState("pending");
  const [requests, setRequests] = useState<ReferralRequestDetailOut[]>([]);
  const [pros, setPros] = useState<ReferrerProRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendReq, setSendReq] = useState<ReferralRequestDetailOut | null>(null);

  useEffect(() => {
    getReferrerPros().then(setPros).catch(() => undefined);
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRequests(await getReferrerRequests(filter));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function decline(id: number) {
    if (!confirm("Decline this request?")) return;
    await declineReferrerRequest(id);
    load();
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={4}>Referral Requests</Title>
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={setFilter}
          data={[
            { label: "Pending", value: "pending" },
            { label: "Sent", value: "sent" },
            { label: "All", value: "all" },
          ]}
        />
      </Group>

      {loading ? (
        <Loader size="sm" />
      ) : requests.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No {filter} requests.</Text>
      ) : (
        requests.map((req) => (
          <Stack
            key={req.id}
            gap="xs"
            p="sm"
            style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Group gap={6}>
                  <Text fw={600} size="sm">{req.follower_name}</Text>
                  <Badge size="xs" color={statusColor(req.status)} variant="light">{req.status}</Badge>
                </Group>
                <Text size="xs" c="dimmed">{req.follower_phone}</Text>
                {req.pro_name && (
                  <Text size="xs">Pro: <b>{req.pro_name}</b>{req.pro_trade ? ` · ${req.pro_trade}` : ""}</Text>
                )}
                {req.job_description && (
                  <Text size="xs" c="dimmed" lineClamp={2}>{req.job_description}</Text>
                )}
                <Text size="xs" c="dimmed">{new Date(req.created_at).toLocaleDateString()}</Text>
              </Stack>
              {(req.status === "pending" || req.status === "otp_pending") && (
                <Group gap="xs" wrap="nowrap">
                  <Button size="xs" radius="xl" onClick={() => setSendReq(req)}>
                    Send referral
                  </Button>
                  <Button size="xs" radius="xl" variant="subtle" color="red" onClick={() => decline(req.id)}>
                    Decline
                  </Button>
                </Group>
              )}
            </Group>
          </Stack>
        ))
      )}

      {sendReq && (
        <SendReferralModal
          opened={!!sendReq}
          onClose={() => setSendReq(null)}
          request={sendReq}
          pros={pros}
          onSent={() => { setSendReq(null); load(); }}
        />
      )}
    </Stack>
  );
}
