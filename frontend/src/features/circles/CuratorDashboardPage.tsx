import {
  ActionIcon,
  Alert,
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBolt,
  IconCircleCheck,
  IconCircleX,
  IconCircles,
  IconCopy,
  IconExternalLink,
  IconMapPin,
  IconMail,
  IconMessagePlus,
  IconPencil,
  IconPhone,
  IconStar,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";
import type { CircleAnalyticsOut, CircleFollowRequestOut, CircleOut } from "./types";
import { AddProUnified } from "./components/AddProUnified";
import { CircleAnalyticsPanel } from "./components/CircleAnalyticsPanel";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export function CuratorDashboardPage() {
  const { user } = useAuth();
  const [circle, setCircle] = useState<CircleOut | null>(null);
  const [analytics, setAnalytics] = useState<CircleAnalyticsOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [handleInput, setHandleInput] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);
  const [savingHandle, setSavingHandle] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [addProOpen, setAddProOpen] = useState(false);
  const [followRequests, setFollowRequests] = useState<CircleFollowRequestOut[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seededRef   = useRef(false);

  async function load() {
    setLoading(true);
    const [cRes, aRes, fRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/circles/me`, { headers: authHeaders() }),
      fetch(`${API_BASE_URL}/api/circles/me/analytics`, { headers: authHeaders() }),
      fetch(`${API_BASE_URL}/api/circles/me/follow-requests`, { headers: authHeaders() }),
    ]);
    if (cRes.ok) setCircle(await cRes.json() as CircleOut);
    if (aRes.ok) setAnalytics(await aRes.json() as CircleAnalyticsOut);
    if (fRes.ok) setFollowRequests(await fRes.json() as CircleFollowRequestOut[]);
    setLoading(false);
  }

  async function handleFollowRequest(id: number, status: "approved" | "rejected") {
    setApprovingId(id);
    try {
      await fetch(`${API_BASE_URL}/api/circles/me/follow-requests/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setApprovingId(null);
    }
  }

  useEffect(() => {
    load().catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  // Seed the handle input exactly once — fires whenever loading/circle/user changes
  // until all three conditions are met: done loading, no circle, user present.
  useEffect(() => {
    if (loading || circle || seededRef.current || !user) return;
    const first = (user.first_name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const last  = (user.last_name  ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const def   = `${first}${last}` || (user.email ?? "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (def) {
      seededRef.current = true;
      setHandleInput(def);
    }
  }, [loading, circle, user]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const raw = handleInput.trim();
    if (!raw) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/circles/check-slug?slug=${encodeURIComponent(raw)}`);
        if (!r.ok) { setSlugStatus("idle"); return; }
        const data = (await r.json()) as { available: boolean; reason?: string };
        if (data.reason === "invalid") setSlugStatus("invalid");
        else setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [handleInput]);

  async function runAction(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function removePro(id: number) {
    await runAction(`remove-${id}`, async () => {
      const r = await fetch(`${API_BASE_URL}/api/circles/me/pros/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error("Failed to remove pro.");
    });
  }

  async function saveEndorsement(id: number) {
    await runAction(`edit-${id}`, async () => {
      const r = await fetch(`${API_BASE_URL}/api/circles/me/pros/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ endorsement: editText }),
      });
      if (!r.ok) throw new Error("Failed to save endorsement.");
      setEditingId(null);
    });
  }

  async function addOnPlatformPro(proId: number, endorsement: string) {
    await runAction("add-on", async () => {
      const r = await fetch(`${API_BASE_URL}/api/circles/me/pros`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ pro_id: proId, endorsement }),
      });
      if (!r.ok) {
        const d = (await r.json()) as { detail?: string };
        throw new Error(d.detail ?? "Failed to add pro.");
      }
    });
  }

  async function addOffPlatformPro(payload: { name: string; skill: string; phone: string; email: string; endorsement: string }) {
    await runAction("add-off", async () => {
      const r = await fetch(`${API_BASE_URL}/api/circles/me/pros/off-platform`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const d = (await r.json()) as { detail?: string };
        throw new Error(d.detail ?? "Failed to add pro.");
      }
    });
  }

  async function saveHandle() {
    const slug = handleInput.trim().toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug) { setHandleError("Handle cannot be empty."); return; }
    setSavingHandle(true);
    setHandleError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/circles/me`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ slug }),
      });
      if (!r.ok) {
        const d = (await r.json()) as { detail?: string };
        throw new Error(d.detail ?? "That handle is already taken.");
      }
      await load();
    } catch (e) {
      setHandleError(e instanceof Error ? e.message : "Failed to save handle.");
    } finally {
      setSavingHandle(false);
    }
  }

  const iconColor = "var(--mantine-primary-color-filled)";
  const circlePublicUrl = circle ? `${window.location.origin}/circle/${circle.slug}` : null;
  const previewSlug = handleInput.trim().toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconCircles size={22} color={iconColor} />
          <Title order={3}>Your Circle</Title>
        </Group>
        {circlePublicUrl && (
          <Group gap={4} align="center">
            <Anchor
              href={circlePublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
              style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
            >
              gigkraft.com/circle/{circle!.slug}
              <IconExternalLink size={13} />
            </Anchor>
            <Tooltip label="Copy link" withArrow position="bottom">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => navigator.clipboard.writeText(circlePublicUrl)}
              >
                <IconCopy size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      {!loading && !circle && (
        <Card withBorder radius="md" p="md" style={{ borderColor: "var(--gk-accent-primary)", boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)" }}>
          <Stack gap="sm">
            <Stack gap={2}>
              <Text fw={600} size="sm">Set your Circle handle</Text>
              <Text size="xs" c="dimmed">
                This is your permanent public URL. Choose carefully — it cannot be changed once saved.
              </Text>
            </Stack>
            <TextInput
              placeholder="e.g. alex-jones"
              value={handleInput}
              onChange={(e) => { setHandleInput(e.currentTarget.value); setHandleError(null); }}
              error={
                handleError ??
                (slugStatus === "taken" ? "That handle is already taken." : null) ??
                (slugStatus === "invalid" ? "Use letters, numbers, and hyphens only." : null)
              }
              description={
                slugStatus === "available"
                  ? `✓ gigkraft.com/circle/${previewSlug} is available!`
                  : previewSlug
                  ? `gigkraft.com/circle/${previewSlug}`
                  : "gigkraft.com/circle/your-handle"
              }
              styles={{
                description: slugStatus === "available" ? { color: "var(--mantine-color-green-6)" } : undefined,
              }}
              rightSection={
                slugStatus === "checking" ? (
                  <Loader size="xs" />
                ) : slugStatus === "available" ? (
                  <IconCircleCheck size={18} color="var(--mantine-color-green-6)" />
                ) : slugStatus === "taken" || slugStatus === "invalid" ? (
                  <IconCircleX size={18} color="var(--mantine-color-red-6)" />
                ) : null
              }
            />
            <Button
              size="sm"
              radius="xl"
              loading={savingHandle}
              disabled={!handleInput.trim() || slugStatus !== "available"}
              onClick={saveHandle}
              style={{ background: "var(--gk-brand-gradient)", alignSelf: "flex-start", paddingLeft: 24, paddingRight: 24 }}
            >
              Save Handle
            </Button>
          </Stack>
        </Card>
      )}

      <CircleAnalyticsPanel analytics={analytics} loading={loading} />

      {/* Follow Requests */}
      {followRequests.length > 0 && (
        <Stack gap="xs">
          <Group gap="xs">
            <IconUsers size={18} color={iconColor} />
            <Title order={5}>
              Follow Requests
              {followRequests.filter((f) => f.status === "pending").length > 0 && (
                <Badge color="yellow" variant="filled" size="xs" ml={6}>
                  {followRequests.filter((f) => f.status === "pending").length} pending
                </Badge>
              )}
            </Title>
          </Group>
          {followRequests.map((fr) => (
            <Card key={fr.id} withBorder radius="md" p="sm">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text size="sm" fw={600}>{fr.follower_name}</Text>
                  <Text size="xs" c="dimmed">{fr.follower_email}</Text>
                </Stack>
                {fr.status === "pending" ? (
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      color="green"
                      variant="light"
                      loading={approvingId === fr.id}
                      onClick={() => handleFollowRequest(fr.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="subtle"
                      loading={approvingId === fr.id}
                      onClick={() => handleFollowRequest(fr.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Group>
                ) : (
                  <Badge
                    color={fr.status === "approved" ? "green" : "red"}
                    variant="light"
                    size="sm"
                  >
                    {fr.status}
                  </Badge>
                )}
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Group>
        <Button
          leftSection={<IconUserPlus size={15} />}
          radius="xl"
          size="sm"
          variant={addProOpen ? "light" : "filled"}
          onClick={() => setAddProOpen((o) => !o)}
          style={!addProOpen ? { background: "var(--gk-brand-gradient)" } : undefined}
        >
          {addProOpen ? "Cancel" : "Add a Pro"}
        </Button>
      </Group>

      <Collapse opened={addProOpen}>
        <Card
          withBorder
          radius="md"
          padding="md"
          mt="xs"
          style={{ maxWidth: 480, borderColor: "var(--gk-accent-primary)", boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)" }}
        >
          <AddProUnified
            onAddOnPlatform={async (id, endorsement) => {
              await addOnPlatformPro(id, endorsement);
              setAddProOpen(false);
            }}
            onAddOffPlatform={async (payload) => {
              await addOffPlatformPro(payload);
              setAddProOpen(false);
            }}
            busy={busy === "add-on" || busy === "add-off"}
          />
        </Card>
      </Collapse>

      <Stack gap="sm">
        <Group gap="xs">
          <IconUsers size={18} color={iconColor} />
          <Title order={5}>Your Pros ({circle?.pros.length ?? 0})</Title>
        </Group>
        {circle?.pros.length === 0 && (
          <Text c="dimmed" size="sm">
            No pros added yet. Use the panel above to build your circle.
          </Text>
        )}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
          {circle?.pros.map((cp) => {
            const profileUrl = cp.handle
              ? `${window.location.origin}/pros/${cp.handle}`
              : null;
            const cs = {
              borderColor: "var(--gk-accent-primary)",
              boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
              position: "relative" as const,
              overflow: "hidden" as const,
            };
            const ds = { borderColor: "var(--gk-accent-secondary)", opacity: 0.6 };
            return (
              <Card key={cp.id} withBorder radius="md" p="sm" style={cs}>

                {/* Watermark */}
                <Text style={{
                  position: "absolute",
                  top: "42%", left: "50%",
                  transform: "translate(-50%, -50%) rotate(-22deg)",
                  fontSize: 22, fontWeight: 900,
                  color: "var(--gk-accent-primary)",
                  opacity: 0.06,
                  userSelect: "none", pointerEvents: "none",
                  whiteSpace: "nowrap", letterSpacing: 3, zIndex: 0,
                }}>
                  gigKraft.com
                </Text>

                {/* ID card: photo left, info right */}
                <Group gap="sm" align="flex-start" wrap="nowrap" mb={5} style={{ position: "relative", zIndex: 1 }}>
                  <Avatar src={cp.avatar_url} radius="sm" size={80} color="teal"
                    style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)" }}>
                    {cp.display_name[0]?.toUpperCase()}
                  </Avatar>

                  <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap={4} justify="space-between" wrap="nowrap">
                      <Stack gap={0} style={{ minWidth: 0 }}>
                        <Group gap={4} wrap="nowrap">
                          <Text fw={700} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cp.display_name}
                          </Text>
                          {cp.is_off_platform && (
                            <Badge color={cp.status === "claimed" ? "green" : "gray"} variant="outline" size="xs" style={{ flexShrink: 0 }}>
                              {cp.status === "claimed" ? "On Gigkraft" : "Pending"}
                            </Badge>
                          )}
                        </Group>
                        {cp.primary_trade && <Text size="xs" c="dimmed">{cp.primary_trade}</Text>}
                        {profileUrl && (
                          <Anchor href={profileUrl} target="_blank" rel="noopener noreferrer" size="xs" c="dimmed"
                            style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            @{cp.handle}<IconExternalLink size={10} />
                          </Anchor>
                        )}
                      </Stack>
                      <Button size="xs" color="red" variant="subtle" loading={busy === `remove-${cp.id}`}
                        onClick={() => removePro(cp.id)} style={{ flexShrink: 0, alignSelf: "flex-start" }}>
                        ×
                      </Button>
                    </Group>

                    <Stack gap={1} mt={2}>
                      <Group gap={4}><IconPhone size={11} color="var(--gk-accent-primary)" /><Text size="xs" c={cp.phone ? undefined : "dimmed"}>{cp.phone ?? "—"}</Text></Group>
                      <Group gap={4}><IconMail size={11} color="var(--gk-accent-primary)" /><Text size="xs" c={cp.email ? undefined : "dimmed"}>{cp.email ?? "—"}</Text></Group>
                      <Group gap={4}><IconMapPin size={11} color="var(--gk-accent-primary)" /><Text size="xs" c={cp.zip_code ? undefined : "dimmed"}>{cp.zip_code ?? "—"}</Text></Group>
                    </Stack>
                  </Stack>
                </Group>

                {/* Bio */}
                {cp.bio && <Text size="xs" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>{cp.bio}</Text>}

                {/* Skill tags */}
                {cp.skill_tags.length > 0 && (
                  <Group gap={4} mb={4} style={{ position: "relative", zIndex: 1 }}>
                    {cp.skill_tags.slice(0, 4).map((s) => <Badge key={s} size="xs" variant="outline" color="gray">{s}</Badge>)}
                  </Group>
                )}

                <Divider my={4} style={ds} />

                {/* Endorsement */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  {editingId === cp.id ? (
                    <Stack gap={4} mb={4}>
                      <TextInput size="xs" maxLength={160} value={editText}
                        onChange={(e) => setEditText(e.currentTarget.value)}
                        placeholder="1-sentence endorsement…" />
                      <Group gap="xs">
                        <Button size="xs" radius="xl" loading={busy === `edit-${cp.id}`}
                          onClick={() => saveEndorsement(cp.id)}
                          style={{ background: "var(--gk-brand-gradient)", paddingInline: 14 }}>
                          Save
                        </Button>
                        <Button size="xs" variant="subtle" onClick={() => setEditingId(null)}>Cancel</Button>
                      </Group>
                    </Stack>
                  ) : cp.endorsement ? (
                    <Group gap={4} align="flex-start" mb={4}>
                      <Text size="xs" fs="italic" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
                        "{cp.endorsement}" — {circle?.curator_name}
                      </Text>
                      <Tooltip label="Edit endorsement" withArrow position="top">
                        <ActionIcon size="xs" variant="subtle"
                          style={{ color: "var(--gk-accent-primary)", flexShrink: 0 }}
                          onClick={() => { setEditingId(cp.id); setEditText(cp.endorsement ?? ""); }}>
                          <IconPencil size={13} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ) : (
                    <Group mb={4}>
                      <Tooltip label="Add endorsement" withArrow position="top">
                        <ActionIcon size="sm" variant="subtle"
                          style={{ color: "var(--gk-accent-primary)" }}
                          onClick={() => { setEditingId(cp.id); setEditText(""); }}>
                          <IconMessagePlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
                </div>

                <Divider my={4} style={ds} />

                {/* Stats — last row */}
                <Group gap={0} justify="space-around" pt={2} style={{ position: "relative", zIndex: 1 }}>
                  <Stack gap={1} align="center">
                    <IconBolt size={20} color="var(--gk-accent-primary)" />
                    <Text size="xs" fw={700} lh={1}>{cp.krafts_verified}</Text>
                    <Text size="xs" c="dimmed">Krafts</Text>
                  </Stack>
                  <Divider orientation="vertical" style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.5, alignSelf: "stretch" }} />
                  <Stack gap={1} align="center">
                    <IconStar size={20} color="var(--mantine-color-yellow-5)" />
                    <Text size="xs" fw={700} lh={1}>{cp.recs_approved}</Text>
                    <Text size="xs" c="dimmed">Recs</Text>
                  </Stack>
                  <Divider orientation="vertical" style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.5, alignSelf: "stretch" }} />
                  <Stack gap={1} align="center">
                    <IconUsers size={20} color="var(--mantine-color-blue-5)" />
                    <Text size="xs" fw={700} lh={1}>{cp.circles_count}</Text>
                    <Text size="xs" c="dimmed">Circles</Text>
                  </Stack>
                </Group>

                <Text
                  ta="center"
                  style={{ fontSize: 9, color: "var(--gk-accent-primary)", opacity: 0.5, letterSpacing: 0.5, position: "relative", zIndex: 1, marginTop: 6 }}
                >
                  powered by gigKraft.com
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
