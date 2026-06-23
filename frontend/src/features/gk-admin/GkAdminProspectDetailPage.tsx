import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addOutreachLog,
  ApiError,
  getProspect,
  listOutreachLogs,
  listTemplates,
  updateProspect,
} from "../../api/endpoints";
import type {
  MessageTemplate,
  OutreachLog,
  Prospect,
} from "../../api/endpoints";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "on_hold", label: "On Hold" },
  { value: "abandoned", label: "Abandoned" },
];

const SOURCE_COLORS: Record<string, string> = {
  nextdoor: "teal",
  craigslist: "violet",
  whatsapp: "green",
  direct: "blue",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderTemplate(body: string, p: Prospect): string {
  return body
    .replace(/\{\{name\}\}/g, p.name)
    .replace(/\{\{source\}\}/g, p.source)
    .replace(/\{\{neighborhood\}\}/g, p.neighborhood || p.primary_zip || "")
    .replace(/\{\{primaryZip\}\}/g, p.primary_zip || "")
    .replace(/\{\{signup_link\}\}/g, "https://www.gigkraft.com/for-pros")
    .replace(/\{\{contact_person\}\}/g, "Vijay")
    .replace(/\{\{business_name\}\}/g, "GigKraft")
    .replace(/\{\{prospect_id\}\}/g, p.prospect_id);
}

// ── Timeline item types ───────────────────────────────────────────────────────

type TLKind = "created" | "wa_step" | "log";

interface TLItem {
  key: string;
  kind: TLKind;
  ts: Date;
  // for "log"
  log?: OutreachLog;
  // for "wa_step"
  waStep?: number;
  waText?: string;
}

function buildTimeline(
  prospect: Prospect,
  logs: OutreachLog[],
  waTemplates: MessageTemplate[],
): TLItem[] {
  const items: TLItem[] = [];

  // Outreach logs (email, manual notes, etc.)
  for (const log of logs) {
    items.push({ key: `log-${log.id}`, kind: "log", ts: new Date(log.sent_at), log });
  }

  // WhatsApp journey steps — synthesised (advanceProspectStep doesn't create a log)
  for (const step of prospect.journey ?? []) {
    if (step.channel === "whatsapp" && step.sent_at) {
      const tmpl = waTemplates.find((t) => t.kind === `sequence_${step.step}`);
      const waText = tmpl ? renderTemplate(tmpl.body, prospect) : undefined;
      items.push({
        key: `wa-${step.step}`,
        kind: "wa_step",
        ts: new Date(step.sent_at),
        waStep: step.step,
        waText,
      });
    }
  }

  // "Created" entry — always oldest
  items.push({
    key: "created",
    kind: "created",
    ts: new Date(prospect.created_at),
  });

  return items.sort((a, b) => b.ts.getTime() - a.ts.getTime());
}

// ── Dot column helper ─────────────────────────────────────────────────────────

const DOT_COLORS: Record<TLKind | "note_input", string> = {
  created: "var(--mantine-color-gray-4)",
  wa_step: "var(--mantine-color-teal-5)",
  log: "var(--mantine-color-blue-5)",
  note_input: "var(--mantine-color-yellow-5)",
};

function dotColorForLog(channel: string) {
  if (channel === "whatsapp") return "var(--mantine-color-teal-5)";
  if (channel === "email") return "var(--mantine-color-blue-5)";
  return "var(--mantine-color-gray-4)";
}

function DotCol({
  color,
  isLast,
  minLineHeight = 32,
}: {
  color: string;
  isLast: boolean;
  minLineHeight?: number;
}) {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 20,
        flexShrink: 0,
        paddingTop: 3,
      }}
    >
      <Box
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {!isLast && (
        <Box
          style={{
            width: 2,
            flex: 1,
            minHeight: minLineHeight,
            background: "var(--mantine-color-default-border)",
            marginTop: 4,
          }}
        />
      )}
    </Box>
  );
}

// ── Note input row (inline in timeline) ───────────────────────────────────────

function NoteInputRow({
  onAdd,
  isLast,
}: {
  onAdd: (text: string) => Promise<void>;
  isLast: boolean;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await onAdd(text.trim());
    setText("");
    setSaving(false);
  };

  const now = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      <DotCol color={DOT_COLORS.note_input} isLast={isLast} minLineHeight={60} />

      <Text
        size="xs"
        c="dimmed"
        style={{
          width: 130,
          flexShrink: 0,
          paddingTop: 1,
          paddingLeft: 8,
          paddingRight: 12,
          lineHeight: 1.4,
        }}
      >
        {now}
      </Text>

      <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <Textarea
          ref={textareaRef}
          placeholder="Add a note or update…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          minRows={2}
          autosize
          size="xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <Group justify="flex-end" mt={4}>
          <Button
            size="xs"
            onClick={submit}
            loading={saving}
            disabled={!text.trim()}
            radius="xl"
            style={{ background: "var(--gk-accent-primary)", color: "#000" }}
          >
            Add
          </Button>
        </Group>
      </Box>
    </Box>
  );
}

// ── Regular timeline row ──────────────────────────────────────────────────────

function TLRow({ item, isLast }: { item: TLItem; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (item.kind === "created") {
    return (
      <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
        <DotCol color={DOT_COLORS.created} isLast={isLast} />
        <Text
          size="xs"
          c="dimmed"
          style={{ width: 130, flexShrink: 0, paddingTop: 1, paddingLeft: 8, paddingRight: 12, lineHeight: 1.4 }}
        >
          {fmtDateTime(item.ts.toISOString())}
        </Text>
        <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
          <Text size="xs" c="dimmed">Prospect added</Text>
        </Box>
      </Box>
    );
  }

  if (item.kind === "wa_step") {
    const bodyText = item.waText ?? "";
    const truncatable = bodyText.length > 220;
    return (
      <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
        <DotCol color={DOT_COLORS.wa_step} isLast={isLast} />
        <Text
          size="xs"
          c="dimmed"
          style={{ width: 130, flexShrink: 0, paddingTop: 1, paddingLeft: 8, paddingRight: 12, lineHeight: 1.4 }}
        >
          {fmtDateTime(item.ts.toISOString())}
        </Text>
        <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
          <Badge size="xs" color="teal" variant="light" mb={4}>WhatsApp step {item.waStep}</Badge>
          {bodyText ? (
            <>
              <Text
                size="xs"
                c="dimmed"
                style={{
                  whiteSpace: "pre-wrap",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: expanded ? undefined : 3,
                  WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                }}
              >
                {bodyText}
              </Text>
              {truncatable && (
                <Text
                  size="xs"
                  mt={2}
                  style={{ cursor: "pointer", color: "var(--gk-accent-primary)" }}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Show less" : "Show more"}
                </Text>
              )}
            </>
          ) : (
            <Text size="xs" c="dimmed">WhatsApp message sent</Text>
          )}
        </Box>
      </Box>
    );
  }

  // kind === "log"
  const log = item.log!;
  const isWa = log.channel === "whatsapp";
  const isNote = log.channel === "other";
  const dotColor = dotColorForLog(log.channel);
  const channelLabel = isWa ? "WhatsApp" : isNote ? "Note" : log.channel === "email" ? "Email" : log.channel;
  const bodyText = log.body_sent || log.notes || "";
  const truncatable = bodyText.length > 220;

  return (
    <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      <DotCol color={dotColor} isLast={isLast} />
      <Text
        size="xs"
        c="dimmed"
        style={{ width: 130, flexShrink: 0, paddingTop: 1, paddingLeft: 8, paddingRight: 12, lineHeight: 1.4 }}
      >
        {fmtDateTime(log.sent_at)}
      </Text>
      <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <Group gap={6} mb={4} wrap="nowrap">
          <Badge
            size="xs"
            color={isWa ? "teal" : isNote ? "gray" : "blue"}
            variant="light"
          >
            {channelLabel}
          </Badge>
          {log.template_name && !isNote && (
            <Text size="xs" c="dimmed" truncate>{log.template_name}</Text>
          )}
        </Group>
        {log.subject_sent && (
          <Text size="xs" fw={600} mb={2}>{log.subject_sent}</Text>
        )}
        {bodyText && (
          <>
            <Text
              size="xs"
              c="dimmed"
              style={{
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: expanded ? undefined : 3,
                WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
              }}
            >
              {bodyText}
            </Text>
            {truncatable && (
              <Text
                size="xs"
                mt={2}
                style={{ cursor: "pointer", color: "var(--gk-accent-primary)" }}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function GkAdminProspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [logs, setLogs] = useState<OutreachLog[]>([]);
  const [waTemplates, setWaTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    setLoading(true);

    Promise.all([
      getProspect(numId),
      listOutreachLogs(numId),
      listTemplates({ channel: "whatsapp" }),
    ])
      .then(([p, l, tmpl]) => {
        setProspect(p);
        setLogs(l);
        setWaTemplates(tmpl);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string | null) => {
    if (!prospect || !status) return;
    setStatusSaving(true);
    try {
      const updated = await updateProspect(prospect.id, { status });
      setProspect(updated);
    } catch {
      /* ignore */
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddNote = async (text: string) => {
    if (!prospect) return;
    const log = await addOutreachLog(prospect.id, {
      channel: "other",
      body_sent: text,
    });
    setLogs((prev) => [log, ...prev]);
  };

  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="sm" />
      </Stack>
    );
  }

  if (error || !prospect) {
    return (
      <Stack>
        <Alert color="red">{error ?? "Prospect not found."}</Alert>
        <Button variant="subtle" onClick={() => navigate("/gk-admin/prospects?tab=prospects")}>
          ← Back to Prospects
        </Button>
      </Stack>
    );
  }

  const infoParts = [prospect.primary_zip, prospect.neighborhood, prospect.role]
    .filter(Boolean)
    .join(" · ");

  const tlItems = buildTimeline(prospect, logs, waTemplates);
  // note-input row is always rendered first, so "isLast" for it is only true if no other items
  const totalRows = 1 + tlItems.length; // +1 for note input

  return (
    <Stack gap="md">
      {/* Back */}
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate("/gk-admin/prospects?tab=prospects")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text size="sm" c="dimmed">Prospects</Text>
      </Group>

      {/* Compact info + status card */}
      <Card withBorder padding="md" radius="md" style={{ background: "var(--gk-bg-surface)" }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Title order={4}>{prospect.name}</Title>
            <Group gap={6} wrap="wrap">
              <Text size="xs" c="dimmed" ff="monospace">{prospect.prospect_id}</Text>
              <Badge color={SOURCE_COLORS[prospect.source] ?? "gray"} size="xs" variant="light">
                {prospect.source}
              </Badge>
              {infoParts && <Text size="xs" c="dimmed">{infoParts}</Text>}
              {prospect.email && <Text size="xs">{prospect.email}</Text>}
              {prospect.phone && <Text size="xs" c="dimmed">{prospect.phone}</Text>}
            </Group>
            <Group gap="md" wrap="wrap">
              <Text size="xs" c="dimmed">Added {fmtDate(prospect.created_at)}</Text>
              <Text size="xs" c="dimmed">Last contact {fmtDate(prospect.last_contacted_at)}</Text>
              {prospect.link_clicked_at && (
                <Text size="xs" c="dimmed">Link clicked {fmtDate(prospect.link_clicked_at)}</Text>
              )}
            </Group>
          </Stack>

          <Box style={{ minWidth: 160, flexShrink: 0 }}>
            <Text size="xs" c="dimmed" fw={500} mb={4}>Status</Text>
            <Select
              data={STATUS_OPTIONS}
              value={prospect.status}
              onChange={handleStatusChange}
              disabled={statusSaving}
              size="sm"
            />
          </Box>
        </Group>
      </Card>

      {/* Timeline */}
      <Box>
        {/* Note input always at top */}
        <NoteInputRow onAdd={handleAddNote} isLast={totalRows === 1} />

        {/* All activity entries */}
        {tlItems.map((item, i) => (
          <TLRow key={item.key} item={item} isLast={i === tlItems.length - 1} />
        ))}
      </Box>
    </Stack>
  );
}
