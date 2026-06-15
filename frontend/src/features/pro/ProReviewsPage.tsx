import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  CopyButton,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowsSort,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconMail,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSend,
  IconSortAscending,
  IconSortDescending,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  approveRecommendation,
  decodeRecText,
  hideRecommendation,
  listRecommendations,
  loadMessages,
  REC_METRICS,
  requestRecommendation,
  saveMessage,
  type RecommendationOut,
} from "../../api/recommendations";
import { useAuth } from "../../auth/AuthContext";

function toHandle(firstName?: string, lastName?: string): string | null {
  if (!firstName) return null;
  const slug = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return lastName ? `${slug(firstName)}-${slug(lastName)}` : slug(firstName);
}

function recLink(proHandle: string | null, token: string) {
  return `${window.location.origin}/review/${proHandle ?? "pro"}/${token}`;
}

function displayName(name: string) {
  return name.slice(0, 5);
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

function statusColor(s: string) {
  if (s === "approved")  return "green";
  if (s === "submitted") return "orange";
  if (s === "hidden")    return "red";
  if (s === "opened")    return "blue";
  return "gray";
}

function statusLabel(s: string) {
  if (s === "sent")      return "Created";
  if (s === "opened")    return "Opened";
  if (s === "submitted") return "Pending approval";
  if (s === "approved")  return "Approved";
  if (s === "hidden")    return "Declined";
  return s;
}

// ── Created links table ────────────────────────────────────────────────────────
type SortKey = "name" | "created" | "expires" | "status";
type SortDir = "asc" | "desc";

function SortTh({ label, sortKey, active, dir, onSort }: {
  label: string; sortKey: SortKey; active: SortKey; dir: SortDir; onSort: (k: SortKey) => void;
}) {
  const isActive = active === sortKey;
  const Icon = isActive ? (dir === "asc" ? IconSortAscending : IconSortDescending) : IconArrowsSort;
  return (
    <Table.Th style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}>
      <UnstyledButton
        onClick={() => onSort(sortKey)}
        style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "2px 0" }}
      >
        <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em", color: isActive ? "var(--gk-accent-primary)" : undefined }}>
          {label}
        </Text>
        <Icon size={13} color={isActive ? "var(--gk-accent-primary)" : "var(--gk-text-muted, #888)"} />
      </UnstyledButton>
    </Table.Th>
  );
}

function CreatedTable({ recs, proHandle, onRowClick }: {
  recs: RecommendationOut[]; proHandle: string | null; onRowClick: (r: RecommendationOut) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...recs].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name")    cmp = a.client_name.localeCompare(b.client_name);
    if (sortKey === "created") cmp = a.created_at.localeCompare(b.created_at);
    if (sortKey === "expires") cmp = a.expires_at.localeCompare(b.expires_at);
    if (sortKey === "status")  cmp = a.status.localeCompare(b.status);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const thProps = { active: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <Box style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--gk-border)" }}>
      <Table
        highlightOnHover
        withColumnBorders
        style={{ background: "var(--gk-bg-surface)" }}
      >
        <Table.Thead>
          <Table.Tr>
            <SortTh label="Name"    sortKey="name"    {...thProps} />
            <SortTh label="Created" sortKey="created" {...thProps} />
            <SortTh label="Expires" sortKey="expires" {...thProps} />
            <SortTh label="Status"  sortKey="status"  {...thProps} />
            <Table.Th style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}>
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em" }}>Link</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sorted.map((rec) => {
            const link = recLink(proHandle, rec.token);
            const expired = isExpired(rec.expires_at);
            return (
              <Table.Tr
                key={rec.id}
                style={{
                  cursor: "pointer",
                  opacity: expired ? 0.55 : 1,
                  background: expired ? "color-mix(in srgb, red 4%, var(--gk-bg-surface))" : undefined,
                }}
                onClick={() => onRowClick(rec)}
              >
                <Table.Td>
                  <Stack gap={1}>
                    <Text size="sm" fw={600} c="var(--gk-accent-primary)">{displayName(rec.client_name)}</Text>
                    {rec.client_contact && (
                      <Group gap={4}>
                        {rec.client_contact.includes("@")
                          ? <IconMail size={11} color="var(--gk-accent-primary)" />
                          : <IconPhone size={11} color="var(--gk-accent-primary)" />}
                        <Text size="xs" c="dimmed">{rec.client_contact}</Text>
                      </Group>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td><Text size="sm">{fmt(rec.created_at)}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm" fw={expired ? 600 : undefined} c={expired ? "red" : "dimmed"}>
                    {fmt(rec.expires_at)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="xs" color={statusColor(rec.status)} variant="light">
                    {statusLabel(rec.status)}
                  </Badge>
                </Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Group gap={6} wrap="nowrap">
                    <Text
                      size="xs"
                      style={{
                        fontFamily: "var(--mantine-font-family-monospace)",
                        color: "var(--gk-accent-primary)",
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {link}
                    </Text>
                    <CopyButton value={link}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied!" : "Copy"} withArrow>
                          <ActionIcon size="sm" variant="light" color={copied ? "green" : undefined} onClick={copy}
                            style={!copied ? { color: "var(--gk-accent-primary)", borderColor: "var(--gk-accent-primary)" } : undefined}>
                            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    <Tooltip label="Open" withArrow>
                      <ActionIcon size="sm" variant="light" component="a" href={link} target="_blank"
                        style={{ color: "var(--gk-accent-primary)", borderColor: "var(--gk-accent-primary)" }}>
                        <IconExternalLink size={12} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

// ── Pending/approved list card ─────────────────────────────────────────────────
function RecListCard({ rec, onClick }: { rec: RecommendationOut; onClick: () => void }) {
  const { metrics, text } = decodeRecText(rec.text);
  const yesMetrics = metrics ? REC_METRICS.filter(({ key }) => metrics[key]) : [];

  return (
    <Card
      withBorder radius="md" padding={0}
      style={{ cursor: "pointer", overflow: "hidden", borderColor: "var(--gk-border)" }}
      onClick={onClick}
    >
      {/* gradient top bar */}
      <Box style={{ height: 3, background: "var(--gk-brand-gradient)" }} />

      <Stack gap="xs" p="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="xs" align="center">
            <ThemeIcon
              size="sm" radius="xl" variant="light"
              style={{ background: rec.status === "approved" ? "color-mix(in srgb, green 12%, transparent)" : "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)" }}
            >
              {rec.status === "approved"
                ? <IconCircleCheck size={12} color="green" />
                : <IconClock size={12} color="var(--gk-accent-primary)" />}
            </ThemeIcon>
            <Text fw={700} size="sm" style={{ color: "var(--gk-accent-primary)" }}>
              {displayName(rec.client_name) || "—"}
            </Text>
            <Text size="xs" c="dimmed">
              {rec.submitted_at
                ? new Date(rec.submitted_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
                : new Date(rec.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </Text>
          </Group>

          {/* Stars */}
          {rec.stars != null && rec.stars > 0 && (
            <Group gap={2}>
              {[1,2,3,4,5].map((n) => (
                <IconStar
                  key={n} size={13}
                  fill={n <= rec.stars! ? "var(--gk-accent-primary)" : "none"}
                  color={n <= rec.stars! ? "var(--gk-accent-primary)" : "var(--gk-border)"}
                />
              ))}
            </Group>
          )}
        </Group>

        {/* Yes-metric spheres */}
        {yesMetrics.length > 0 && (
          <Group gap={6} wrap="wrap">
            {yesMetrics.map(({ key, label }) => (
              <Tooltip key={key} label={label} withArrow fz="xs">
                <Box
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)",
                    border: "1.5px solid color-mix(in srgb, var(--gk-accent-primary) 30%, transparent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px color-mix(in srgb, var(--gk-accent-primary) 15%, transparent)",
                  }}
                >
                  <Text size="xs" fw={700} style={{ color: "var(--gk-accent-primary)", fontSize: 10, lineHeight: 1 }}>
                    {label.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </Text>
                </Box>
              </Tooltip>
            ))}
          </Group>
        )}

        {/* Review text */}
        {text && (
          <Text
            size="xs" fs="italic" lineClamp={2}
            style={{
              color: "var(--gk-text-muted, #888)",
              borderLeft: "2px solid var(--gk-accent-primary)",
              paddingLeft: 8,
            }}
          >
            "{text}"
          </Text>
        )}
      </Stack>
    </Card>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────
function RecDetail({
  rec, proHandle, onBack, onUpdated,
}: {
  rec: RecommendationOut;
  proHandle: string | null;
  onBack: () => void;
  onUpdated: (updated: RecommendationOut) => void;
}) {
  const { metrics, text } = decodeRecText(rec.text);
  const link = recLink(proHandle, rec.token);
  const [messages, setMessages] = useState(() => loadMessages(rec.id));
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState<string | null>(null);

  function sendRevision() {
    if (!revisionText.trim()) return;
    setMessages(saveMessage(rec.id, { from: "pro", text: revisionText.trim(), sentAt: new Date().toISOString() }));
    setRevisionText("");
    setRevisionOpen(false);
  }

  async function handleApprove() {
    setActing(true); setActError(null);
    try { onUpdated(await approveRecommendation(rec.id)); }
    catch (e: unknown) { setActError(e instanceof Error ? e.message : "Action failed."); }
    finally { setActing(false); }
  }

  async function handleDecline() {
    setActing(true); setActError(null);
    try { await hideRecommendation(rec.id); onUpdated({ ...rec, status: "hidden" }); }
    catch (e: unknown) { setActError(e instanceof Error ? e.message : "Action failed."); }
    finally { setActing(false); }
  }

  return (
    <Stack gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={onBack}><IconArrowLeft size={18} /></ActionIcon>
        <Title order={4}>Review detail</Title>
      </Group>

      <Card withBorder radius="md" padding="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Stack gap={2}>
              <Text fw={700} size="lg">{rec.client_name}</Text>
              {rec.client_contact && (
                <Group gap={4}>
                  {rec.client_contact.includes("@") ? <IconMail size={13} color="var(--gk-accent-primary)" /> : <IconPhone size={13} color="var(--gk-accent-primary)" />}
                  <Text size="xs" c="dimmed">{rec.client_contact}</Text>
                </Group>
              )}
            </Stack>
            <Badge color={statusColor(rec.status)} variant="light">
              {statusLabel(rec.status)}
            </Badge>
          </Group>

          <Group gap="xs">
            <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {link}
            </Text>
            <CopyButton value={link}>
              {({ copied, copy }) => (
                <ActionIcon size="sm" variant="subtle" color={copied ? "green" : undefined} onClick={copy}>
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                </ActionIcon>
              )}
            </CopyButton>
            <ActionIcon size="sm" variant="subtle" component="a" href={link} target="_blank">
              <IconExternalLink size={12} />
            </ActionIcon>
          </Group>
        </Stack>
      </Card>

      {rec.stars != null && rec.stars > 0 && (
        <Card withBorder radius="md" padding="md">
          <Group gap={4}>
            {[1,2,3,4,5].map((n) => (
              <IconStar key={n} size={22}
                fill={n <= rec.stars! ? "var(--gk-accent-primary)" : "none"}
                color={n <= rec.stars! ? "var(--gk-accent-primary)" : "var(--gk-border)"}
              />
            ))}
            <Text size="sm" c="dimmed" ml={6}>
              {["","Poor","Fair","Good","Great","Excellent"][rec.stars]}
            </Text>
          </Group>
        </Card>
      )}

      {metrics && (
        <Card withBorder radius="md" padding="md">
          <Stack gap="sm">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Metrics</Text>
            <Stack gap="xs">
              {REC_METRICS.map(({ key, label }) => (
                <Group key={key} justify="space-between" align="center"
                  style={{ padding: "8px 12px", borderRadius: 8, background: metrics[key] ? "color-mix(in srgb, var(--gk-accent-primary) 8%, transparent)" : "var(--gk-bg-canvas)" }}>
                  <Text size="sm">{label}</Text>
                  <Badge size="sm" color={metrics[key] ? "green" : "red"} variant="light">
                    {metrics[key] ? "Yes" : "No"}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}

      {text && (
        <Card withBorder radius="md" padding="md">
          <Stack gap="xs">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Written review</Text>
            <Text size="sm" style={{ lineHeight: 1.7 }}>"{text}"</Text>
          </Stack>
        </Card>
      )}

      {messages.length > 0 && (
        <Card withBorder radius="md" padding="md">
          <Stack gap="sm">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Revision thread</Text>
            {messages.map((m, i) => (
              <Box key={i} style={{
                padding: "10px 14px", borderRadius: 10,
                background: m.from === "pro" ? "color-mix(in srgb, var(--gk-accent-primary) 10%, transparent)" : "var(--gk-bg-canvas)",
                border: "1px solid var(--gk-border)",
              }}>
                <Text size="xs" c="dimmed" mb={4}>{m.from === "pro" ? "You" : "Reviewer"} · {new Date(m.sentAt).toLocaleString()}</Text>
                <Text size="sm">{m.text}</Text>
              </Box>
            ))}
          </Stack>
        </Card>
      )}

      {actError && <Alert color="red" variant="light">{actError}</Alert>}

      {rec.status === "submitted" && (
        <Group gap="sm">
          <Button color="green" leftSection={<IconCheck size={15} />} loading={acting} onClick={() => void handleApprove()} style={{ flex: 1 }}>
            Approve
          </Button>
          <Button variant="light" color="blue" leftSection={<IconRefresh size={15} />} onClick={() => setRevisionOpen(true)} style={{ flex: 1 }}>
            Request revision
          </Button>
          <Button variant="light" color="red" leftSection={<IconX size={15} />} loading={acting} onClick={() => void handleDecline()} style={{ flex: 1 }}>
            Decline
          </Button>
        </Group>
      )}

      {rec.status === "approved" && (
        <Button variant="light" color="red" leftSection={<IconX size={15} />} loading={acting} onClick={() => void handleDecline()} w="fit-content">
          Remove from profile
        </Button>
      )}

      <Modal opened={revisionOpen} onClose={() => setRevisionOpen(false)} title="Request revision" size="sm">
        <Stack>
          <Text size="sm" c="dimmed">
            Write a note to {rec.client_name}. They'll see this when they revisit the review link.
          </Text>
          <Textarea
            placeholder="e.g. Could you mention the specific work on the kitchen?"
            minRows={3} autosize
            value={revisionText}
            onChange={(e) => setRevisionText(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button disabled={!revisionText.trim()} onClick={sendRevision} style={{ background: "var(--gk-brand-gradient)" }}>
              Send note
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProReviewsPage() {
  const { user } = useAuth();
  const handle = toHandle(user?.first_name, user?.last_name);
  const navigate = useNavigate();
  const { id: detailId } = useParams<{ id: string }>();

  const [recs,    setRecs]    = useState<RecommendationOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // New request modal
  const [modalOpen,     setModalOpen]     = useState(false);
  const [clientName,    setClientName]    = useState("");
  const [clientContact, setClientContact] = useState("");
  const [requesting,    setRequesting]    = useState(false);
  const [reqError,      setReqError]      = useState<string | null>(null);
  const [newRec,        setNewRec]        = useState<RecommendationOut | null>(null);

  useEffect(() => {
    listRecommendations()
      .then(setRecs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  function refreshRecs() {
    listRecommendations().then(setRecs).catch(() => {});
  }

  async function handleRequest() {
    if (!clientName.trim()) return;
    setRequesting(true); setReqError(null); setNewRec(null);
    try {
      const rec = await requestRecommendation({
        client_name:    clientName.trim(),
        client_contact: clientContact.trim(),
        channel:        clientContact.includes("@") ? "email" : "sms",
      });
      setNewRec(rec);
      setRecs((prev) => [rec, ...prev]); // show immediately without waiting for refresh
      setClientName("");
      setClientContact("");
      refreshRecs(); // then reconcile with backend
    } catch (e: unknown) {
      setReqError(e instanceof Error ? e.message : "Failed to generate link.");
    } finally {
      setRequesting(false);
    }
  }

  // "sent" = link generated, "opened" = client clicked but not yet submitted
  const created  = recs.filter((r) => r.status === "sent" || r.status === "opened");
  const pending  = recs.filter((r) => r.status === "submitted");
  const approved = recs.filter((r) => r.status === "approved");

  // ── Detail view ──
  if (detailId) {
    const rec = recs.find((r) => String(r.id) === detailId);
    if (loading) return <Center py="xl"><Loader /></Center>;
    if (!rec) return (
      <Stack>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/pro/reviews")} w="fit-content">Back</Button>
        <Alert color="red">Review not found.</Alert>
      </Stack>
    );
    return (
      <RecDetail
        rec={rec} proHandle={handle}
        onBack={() => navigate("/pro/reviews")}
        onUpdated={(updated) => {
          setRecs((prev) => prev.map((r) => r.id === updated.id ? updated : r));
          navigate("/pro/reviews");
        }}
      />
    );
  }

  // ── List view ──
  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={3}>Reviews</Title>
        <Button
          leftSection={<IconPlus size={15} />}
          onClick={() => { setModalOpen(true); setNewRec(null); setReqError(null); }}
          style={{ background: "var(--gk-brand-gradient)" }}
        >
          Request review
        </Button>
      </Group>

      {error && <Alert color="red">{error}</Alert>}

      <Tabs defaultValue="created">
        <Tabs.List>
          <Tabs.Tab
            value="created"
            leftSection={<IconSend size={14} color={created.length > 0 ? "var(--gk-accent-primary)" : undefined} />}
            rightSection={created.length > 0 ? <Badge size="xs" color="blue" variant="light">{created.length}</Badge> : undefined}
          >
            Created
          </Tabs.Tab>
          <Tabs.Tab
            value="pending"
            leftSection={<IconClock size={14} color={pending.length > 0 ? "orange" : undefined} />}
            rightSection={pending.length > 0 ? <Badge size="xs" color="orange" variant="light">{pending.length}</Badge> : undefined}
          >
            Pending
          </Tabs.Tab>
          <Tabs.Tab
            value="approved"
            leftSection={<IconCircleCheck size={14} color={approved.length > 0 ? "green" : undefined} />}
            rightSection={approved.length > 0 ? <Badge size="xs" color="green" variant="light">{approved.length}</Badge> : undefined}
          >
            Approved
          </Tabs.Tab>
        </Tabs.List>

        {/* ── CREATED TAB ── */}
        <Tabs.Panel value="created" pt="md">
          {loading ? (
            <Center py="xl"><Loader /></Center>
          ) : created.length === 0 ? (
            <Card withBorder radius="md" padding="xl" ta="center">
              <Stack align="center" gap="sm">
                <ThemeIcon size="xl" radius="xl" variant="light" style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 10%, transparent)" }}>
                  <IconSend size={22} color="var(--gk-accent-primary)" />
                </ThemeIcon>
                <Text fw={600}>No links created yet</Text>
                <Text size="sm" c="dimmed">Generate a review link to share with a client.</Text>
                <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setModalOpen(true)} style={{ background: "var(--gk-brand-gradient)" }}>
                  Request review
                </Button>
              </Stack>
            </Card>
          ) : (
            <CreatedTable recs={created} proHandle={handle} onRowClick={(r) => navigate(`/pro/reviews/${r.id}`)} />
          )}
        </Tabs.Panel>

        {/* ── PENDING TAB ── */}
        <Tabs.Panel value="pending" pt="md">
          {loading ? (
            <Center py="xl"><Loader /></Center>
          ) : pending.length === 0 ? (
            <Card withBorder radius="md" padding="xl" ta="center">
              <Stack align="center" gap="sm">
                <ThemeIcon size="xl" radius="xl" variant="light" color="orange" style={{ background: "color-mix(in srgb, orange 10%, transparent)" }}>
                  <IconClock size={22} color="orange" />
                </ThemeIcon>
                <Text fw={600}>No reviews pending</Text>
                <Text size="sm" c="dimmed">Submitted reviews waiting for your approval show up here.</Text>
              </Stack>
            </Card>
          ) : (
            <Stack gap="sm">
              {pending.map((r) => (
                <RecListCard key={r.id} rec={r} onClick={() => navigate(`/pro/reviews/${r.id}`)} />
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        {/* ── APPROVED TAB ── */}
        <Tabs.Panel value="approved" pt="md">
          {loading ? (
            <Center py="xl"><Loader /></Center>
          ) : approved.length === 0 ? (
            <Card withBorder radius="md" padding="xl" ta="center">
              <Stack align="center" gap="sm">
                <ThemeIcon size="xl" radius="xl" variant="light" color="green" style={{ background: "color-mix(in srgb, green 10%, transparent)" }}>
                  <IconCircleCheck size={22} color="green" />
                </ThemeIcon>
                <Text fw={600}>No approved reviews yet</Text>
                <Text size="sm" c="dimmed">Approved reviews appear on your public profile.</Text>
              </Stack>
            </Card>
          ) : (
            <Stack gap="sm">
              {approved.map((r) => (
                <RecListCard key={r.id} rec={r} onClick={() => navigate(`/pro/reviews/${r.id}`)} />
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* ── Request review modal ── */}
      <Modal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setNewRec(null); setReqError(null); }}
        title="Request a review"
        size="sm"
      >
        <Stack>
          {newRec ? (
            /* Success state — show generated link */
            <Stack gap="md">
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="green" variant="light" style={{ background: "color-mix(in srgb, green 12%, transparent)" }}>
                  <IconCheck size={14} color="green" />
                </ThemeIcon>
                <Text size="sm" fw={600}>Link generated for {newRec.client_name}</Text>
              </Group>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">Share this link — it expires in 30 days:</Text>
                <Group gap="xs" wrap="nowrap">
                  <Text
                    size="xs"
                    style={{ fontFamily: "var(--mantine-font-family-monospace)", flex: 1, wordBreak: "break-all" }}
                  >
                    {recLink(handle, newRec.token)}
                  </Text>
                  <CopyButton value={recLink(handle, newRec.token)}>
                    {({ copied, copy }) => (
                      <Button size="xs" variant="light" leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                        color={copied ? "green" : undefined} onClick={copy} style={{ flexShrink: 0 }}>
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
              </Stack>
              <Group>
                <Button
                  variant="default"
                  onClick={() => { setModalOpen(false); setNewRec(null); }}
                >
                  Done
                </Button>
                <Button
                  variant="subtle"
                  onClick={() => { setNewRec(null); setReqError(null); }}
                >
                  Generate another
                </Button>
              </Group>
            </Stack>
          ) : (
            /* Form */
            <>
              <Text size="sm" c="dimmed">
                Enter the client's name and contact. A unique link is generated — valid for 30 days.
                Only the first 5 characters of the name appear publicly.
              </Text>
              <TextInput
                label="Client name"
                description="Full name OK — only first 5 chars shown publicly"
                placeholder="Sarah Johnson"
                value={clientName}
                onChange={(e) => setClientName(e.currentTarget.value)}
                required
              />
              <TextInput
                label="Email or phone"
                description="Not shown publicly"
                placeholder="sarah@email.com or +1 555 000 0000"
                value={clientContact}
                onChange={(e) => setClientContact(e.currentTarget.value)}
              />
              {reqError && <Alert color="red" variant="light">{reqError}</Alert>}
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button
                  loading={requesting}
                  disabled={!clientName.trim()}
                  onClick={() => void handleRequest()}
                  style={clientName.trim() ? { background: "var(--gk-brand-gradient)" } : undefined}
                >
                  Generate link
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
