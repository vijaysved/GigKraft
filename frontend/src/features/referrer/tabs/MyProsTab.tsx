import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import type { ReferrerProDashboardOut } from "../types";
import { AddProModal } from "../components/AddProModal";
import { InviteProModal } from "../components/InviteProModal";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function MyProsTab() {
  const [pros, setPros] = useState<ReferrerProDashboardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editEndorsement, setEditEndorsement] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/pros`, { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load pros.");
      setPros(await r.json() as ReferrerProDashboardOut[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleShow(rp: ReferrerProDashboardOut) {
    await fetch(`${API_BASE_URL}/api/referrer/me/pros/${rp.id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ show_on_page: !rp.show_on_page }),
    });
    load();
  }

  async function saveEndorsement(id: number) {
    setSavingId(id);
    await fetch(`${API_BASE_URL}/api/referrer/me/pros/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ endorsement: editEndorsement }),
    });
    setSavingId(null);
    setEditId(null);
    load();
  }

  async function removePro(id: number) {
    if (!confirm("Remove this pro from your page?")) return;
    await fetch(`${API_BASE_URL}/api/referrer/me/pros/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    load();
  }

  if (loading) return <Loader size="sm" />;
  if (error) return <Alert color="red" variant="light">{error}</Alert>;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={4}>My Pros ({pros.length})</Title>
        <Group gap="xs">
          <Button size="xs" radius="xl" leftSection={<IconPlus size={14} />} onClick={() => setAddOpen(true)}>
            Add pro
          </Button>
          <Button size="xs" radius="xl" variant="outline" leftSection={<IconPlus size={14} />} onClick={() => setInviteOpen(true)}>
            Invite pro
          </Button>
        </Group>
      </Group>

      {pros.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          You haven't added any pros yet. Add pros who are already on GigKraft, or invite off-platform pros.
        </Text>
      )}

      {pros.map((rp) => (
        <Stack
          key={rp.id}
          gap="xs"
          p="sm"
          style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Avatar src={rp.avatar_url || undefined} size={48} radius="sm" color="teal">
                {rp.name[0]?.toUpperCase()}
              </Avatar>
              <Stack gap={2}>
                <Group gap={6}>
                  <Text fw={600} size="sm">{rp.name}</Text>
                  {!rp.is_on_platform && (
                    <Badge size="xs" color={rp.is_pending ? "gray" : "green"} variant="outline">
                      {rp.invite_status === "claimed" ? "Joined" : "Pending invite"}
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed">{rp.trade}</Text>
                <Text size="xs" c="dimmed">{rp.referral_count} referral{rp.referral_count !== 1 ? "s" : ""} sent</Text>
              </Stack>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Switch
                size="xs"
                checked={rp.show_on_page}
                onChange={() => toggleShow(rp)}
                label="Show"
              />
              <ActionIcon
                size="sm"
                color="red"
                variant="subtle"
                onClick={() => removePro(rp.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Group>

          {editId === rp.id ? (
            <Stack gap="xs">
              <Textarea
                size="xs"
                placeholder="Why do you recommend this pro?"
                value={editEndorsement}
                onChange={(e) => setEditEndorsement(e.target.value)}
                minRows={2}
              />
              <Group gap="xs">
                <Button size="xs" loading={savingId === rp.id} onClick={() => saveEndorsement(rp.id)}>Save</Button>
                <Button size="xs" variant="subtle" onClick={() => setEditId(null)}>Cancel</Button>
              </Group>
            </Stack>
          ) : (
            <Group gap="xs">
              <Text size="xs" c="dimmed" fs={rp.endorsement ? "italic" : undefined} style={{ flex: 1 }}>
                {rp.endorsement || "No endorsement yet."}
              </Text>
              <Button
                size="compact-xs"
                variant="subtle"
                onClick={() => { setEditId(rp.id); setEditEndorsement(rp.endorsement); }}
              >
                Edit
              </Button>
            </Group>
          )}
        </Stack>
      ))}

      <AddProModal opened={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
      <InviteProModal opened={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />
    </Stack>
  );
}
