import {
  Alert,
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

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import type { ReferralRequestDetailOut, ReferrerProDashboardOut } from "../types";
import { SendReferralModal } from "../components/SendReferralModal";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function statusColor(status: string) {
  if (status === "sent") return "teal";
  if (status === "otp_pending") return "blue";
  if (status === "declined") return "red";
  if (status === "expired") return "gray";
  return "yellow";
}

interface Props {
  pros: ReferrerProDashboardOut[];
}

export function RequestsTab({ pros }: Props) {
  const [filter, setFilter] = useState("pending");
  const [requests, setRequests] = useState<ReferralRequestDetailOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendReq, setSendReq] = useState<ReferralRequestDetailOut | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch(`${API_BASE_URL}/api/referrer/me/requests?status=${filter}`, {
      headers: authHeaders(),
    });
    if (r.ok) setRequests(await r.json() as ReferralRequestDetailOut[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function decline(id: number) {
    if (!confirm("Decline this request?")) return;
    await fetch(`${API_BASE_URL}/api/referrer/me/requests/${id}/decline`, {
      method: "POST",
      headers: authHeaders(),
    });
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
