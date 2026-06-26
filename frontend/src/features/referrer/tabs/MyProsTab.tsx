import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import { fallbackAvatar } from "../../../assets/fallbackAvatars";
import type { ReferrerProDashboardOut } from "../types";
import { AddProByContactModal } from "../components/AddProByContactModal";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const cardStyle = {
  borderColor: "var(--gk-accent-primary)",
  boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

const iconColor = { color: "var(--gk-accent-primary)" } satisfies React.CSSProperties;

function EmptyProCard() {
  return (
    <Card withBorder radius="md" p="sm"
      style={{ borderStyle: "dashed", borderColor: "var(--mantine-color-gray-3)", position: "relative", overflow: "hidden" }}>
      <Group gap="sm" align="flex-start" wrap="nowrap" mb={8}>
        <Skeleton radius="sm" width={80} height={80} style={{ flexShrink: 0 }} />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton height={12} width="65%" radius="xl" />
          <Skeleton height={10} width="45%" radius="xl" />
          <Skeleton height={10} width="55%" radius="xl" mt={4} />
          <Skeleton height={10} width="40%" radius="xl" />
        </Stack>
      </Group>
      <Skeleton height={10} width="75%" radius="xl" mb={6} />
      <Group gap={6}>
        <Skeleton height={18} width={64} radius="xl" />
        <Skeleton height={18} width={56} radius="xl" />
      </Group>
    </Card>
  );
}

export function MyProsTab() {
  const [pros, setPros] = useState<ReferrerProDashboardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editEndorsement, setEditEndorsement] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());

  const uniqueTrades = useMemo(
    () => [...new Set(pros.map((p) => p.trade).filter(Boolean))].sort(),
    [pros],
  );

  const filteredPros = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pros.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.trade?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.endorsement?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (selectedTrades.size > 0 && !selectedTrades.has(p.trade)) return false;
      return true;
    });
  }, [search, pros, selectedTrades]);

  function toggleTrade(t: string) {
    setSelectedTrades((prev) => {
      const n = new Set(prev);
      if (n.has(t)) { n.delete(t); } else { n.add(t); }
      return n;
    });
  }

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

  if (loading) return <Center py="xl"><Loader size="sm" /></Center>;
  if (error) return <Alert color="red" variant="light">{error}</Alert>;

  return (
    <Stack gap="md">
      {/* Search + Add Pro — mirrors public page right side */}
      <Group gap="sm" align="center">
        <TextInput
          style={{ flex: 1 }}
          placeholder="Search by name, phone, email, trade…"
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="xl"
        />
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

      {/* Trade filter pills */}
      {uniqueTrades.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {uniqueTrades.map((t) => {
            const active = selectedTrades.has(t);
            return (
              <button
                key={t}
                onClick={() => toggleTrade(t)}
                style={{
                  padding: "3px 11px",
                  borderRadius: 99,
                  border: `1.5px solid ${active ? "var(--gk-accent-primary)" : "var(--gk-border)"}`,
                  background: active ? "var(--gk-accent-primary)" : "transparent",
                  color: active ? "#fff" : "var(--gk-text-secondary, #666)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Pro cards grid */}
      {pros.length === 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <EmptyProCard />
          <EmptyProCard />
        </SimpleGrid>
      ) : filteredPros.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No pros match the current filters.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {filteredPros.map((rp) => (
            <Card key={rp.id} withBorder radius="md" p="sm" style={cardStyle}>
              {/* Watermark */}
              <Text style={{
                position: "absolute", top: "42%", left: "50%",
                transform: "translate(-50%, -50%) rotate(-22deg)",
                fontSize: 22, fontWeight: 900, color: "var(--gk-accent-primary)",
                opacity: 0.06, userSelect: "none", pointerEvents: "none",
                whiteSpace: "nowrap", letterSpacing: 3, zIndex: 0,
              }}>
                gigKraft.com
              </Text>

              <Group gap="sm" align="flex-start" wrap="nowrap" mb={5} style={{ position: "relative", zIndex: 1 }}>
                <Avatar
                  src={rp.avatar_url || fallbackAvatar(rp.id)}
                  radius="sm" size={80} color="teal"
                  style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)" }}
                >
                  {rp.name[0]?.toUpperCase()}
                </Avatar>

                <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={4} justify="space-between" wrap="nowrap">
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Group gap={4} wrap="nowrap">
                        <Text fw={700} size="sm"
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rp.name.split(" ")[0]}
                        </Text>
                        {!rp.is_on_platform && (
                          <Badge size="xs" color={rp.is_pending ? "gray" : "green"} variant="outline" style={{ flexShrink: 0 }}>
                            {rp.invite_status === "claimed" ? "Joined" : "Pending"}
                          </Badge>
                        )}
                      </Group>
                      {rp.trade && <Text size="xs" c="dimmed">{rp.trade}</Text>}
                      <Text size="xs" c="dimmed">{rp.referral_count} referral{rp.referral_count !== 1 ? "s" : ""} sent</Text>
                    </Stack>

                    {/* Owner controls */}
                    <Group gap={4} wrap="nowrap" style={{ flexShrink: 0, alignSelf: "flex-start" }}>
                      <Switch
                        size="xs"
                        checked={rp.show_on_page}
                        onChange={() => toggleShow(rp)}
                        title={rp.show_on_page ? "Shown on page" : "Hidden from page"}
                      />
                      <ActionIcon
                        size="xs" variant="subtle"
                        onClick={() => { setEditId(rp.id); setEditEndorsement(rp.endorsement); }}
                      >
                        <IconPencil size={12} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Stack gap={1} mt={2}>
                    <Group gap={4}>
                      <IconPhone size={11} style={iconColor} />
                      <Text size="xs" c={rp.phone ? undefined : "dimmed"}>{rp.phone || "—"}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconMail size={11} style={iconColor} />
                      <Text size="xs" c={rp.email ? undefined : "dimmed"}>{rp.email || "—"}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconMapPin size={11} style={iconColor} />
                      <Text size="xs" c="dimmed">—</Text>
                    </Group>
                  </Stack>
                </Stack>
              </Group>

              {/* Endorsement */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {editId === rp.id ? (
                  <Stack gap="xs">
                    <Textarea
                      size="xs"
                      placeholder="Why do you recommend this pro?"
                      value={editEndorsement}
                      onChange={(e) => setEditEndorsement(e.target.value)}
                      minRows={2}
                      autosize
                    />
                    <Group gap="xs">
                      <Button size="xs" loading={savingId === rp.id} onClick={() => saveEndorsement(rp.id)}>Save</Button>
                      <Button size="xs" variant="subtle" onClick={() => setEditId(null)}>Cancel</Button>
                    </Group>
                  </Stack>
                ) : (
                  <Text size="xs" fs={rp.endorsement ? "italic" : undefined} c="dimmed" lineClamp={2}>
                    {rp.endorsement ? `"${rp.endorsement}"` : "No endorsement yet."}
                  </Text>
                )}
              </div>

              {(rp.is_on_platform) && (
                <Group gap={4} mt={4} style={{ position: "relative", zIndex: 1 }}>
                  <Badge size="xs" variant="outline" color="green" leftSection={<IconShieldCheck size={10} />}>
                    On GigKraft
                  </Badge>
                </Group>
              )}

              <Group justify="space-between" align="center" mt={6} style={{ position: "relative", zIndex: 1 }}>
                <Text style={{ fontSize: 9, color: "var(--gk-accent-primary)", opacity: 0.9, letterSpacing: 0.5 }}>
                  powered by gigKraft.com
                </Text>
                <ActionIcon size="xs" variant="subtle" color="red" onClick={() => removePro(rp.id)}>
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddProByContactModal opened={addOpen} onClose={() => setAddOpen(false)} onAdded={() => { void load(); }} />
    </Stack>
  );
}
