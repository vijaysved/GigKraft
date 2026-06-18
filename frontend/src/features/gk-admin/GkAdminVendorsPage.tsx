import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  CopyButton,
  Divider,
  Drawer,
  Group,
  Loader,
  Modal,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconEdit,
  IconEye,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  ApiError,
  bulkSendIntroEmails,
  createTemplate,
  createVendor,
  deleteOutreachLog,
  deleteTemplate,
  deleteVendor,
  getProspectStats,
  listOutreachLogs,
  listTemplates,
  listVendors,
  addOutreachLog,
  sendEmail,
  updateTemplate,
  updateVendor,
} from "../../api/endpoints";
import type {
  BulkIntroResult,
  MessageTemplate,
  OutreachLog,
  ProspectStats,
  TemplateIn,
  VendorContact,
  VendorIn,
} from "../../api/endpoints";

const STATUS_COLORS: Record<string, string> = {
  new: "blue",
  contacted: "cyan",
  in_conversation: "yellow",
  follow_up: "orange",
  onboarded: "green",
  not_interested: "gray",
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_conversation", label: "In Conversation" },
  { value: "follow_up", label: "Follow-up Needed" },
  { value: "onboarded", label: "Onboarded" },
  { value: "not_interested", label: "Not Interested" },
];

const LEAD_SOURCE_OPTIONS = [
  { value: "nextdoor", label: "Nextdoor" },
  { value: "whatsapp_friends", label: "WhatsApp (Friends)" },
  { value: "whatsapp_family", label: "WhatsApp (Family)" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const CHANNEL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "nextdoor_dm", label: "Nextdoor DM" },
  { value: "phone", label: "Phone Call" },
  { value: "other", label: "Other" },
];

const KIND_OPTIONS = [
  { value: "intro", label: "Intro" },
  { value: "reminder", label: "Reminder" },
  { value: "onboarding", label: "Onboarding" },
  { value: "other", label: "Other" },
];

const DEFAULT_CC = "oddlynicellc@gmail.com";

// ── Summary Tab ───────────────────────────────────────────────────────────────

function SummaryTab() {
  const [stats, setStats] = useState<ProspectStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProspectStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats."));
  }, []);

  if (error) return <Alert color="red">{error}</Alert>;
  if (!stats) return <Loader size="sm" />;

  const cards = [
    { label: "Total Prospects", value: stats.total, color: "blue" },
    { label: "New (last 7 days)", value: stats.new_7_days, color: "teal" },
    { label: "Emails Sent", value: stats.total_emails_sent, color: "violet" },
    { label: "Page Views (all pros)", value: stats.total_page_views, color: "orange" },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {cards.map((c) => (
        <Card key={c.label} withBorder radius="md" p="lg">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>{c.label}</Text>
          <Text size="xl" fw={700} c={c.color}>{c.value}</Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

// ── Bulk Intro Results Modal ──────────────────────────────────────────────────

function BulkIntroResultModal({
  results,
  opened,
  onClose,
}: {
  results: BulkIntroResult[];
  opened: boolean;
  onClose: () => void;
}) {
  const sent = results.filter((r) => r.sent).length;
  const failed = results.filter((r) => !r.sent).length;

  return (
    <Modal opened={opened} onClose={onClose} title="Bulk Intro Email Results" size="md">
      <Stack>
        <Group>
          <Badge color="green">{sent} sent</Badge>
          {failed > 0 && <Badge color="red">{failed} failed / skipped</Badge>}
        </Group>
        <Stack gap="xs">
          {results.map((r) => (
            <Group key={r.prospect_id} gap="xs" wrap="nowrap">
              {r.sent ? <IconCheck size={14} color="green" /> : <IconMail size={14} color="red" />}
              <Text size="sm" fw={500}>{r.vendor_id}</Text>
              <Text size="sm" c="dimmed">{r.email || "—"}</Text>
              {!r.sent && <Text size="xs" c="red">{r.error}</Text>}
            </Group>
          ))}
        </Stack>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Prospect Form Drawer ──────────────────────────────────────────────────────

function ProspectDrawer({
  opened,
  onClose,
  prospect,
  onSaved,
  allTags,
}: {
  opened: boolean;
  onClose: () => void;
  prospect: VendorContact | null;
  onSaved: (v: VendorContact) => void;
  allTags: string[];
}) {
  const [form, setForm] = useState<Partial<VendorIn>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setForm(
        prospect
          ? {
              contact_person: prospect.contact_person,
              business_name: prospect.business_name,
              category: prospect.category,
              lead_source: prospect.lead_source,
              phone: prospect.phone,
              email: prospect.email,
              nextdoor_profile_url: prospect.nextdoor_profile_url,
              status: prospect.status,
              preferred_channel: prospect.preferred_channel,
              tags: prospect.tags ?? [],
              notes: prospect.notes,
            }
          : { lead_source: "nextdoor", preferred_channel: "whatsapp", status: "new", tags: [] }
      );
      setError(null);
    }
  }, [opened, prospect]);

  const set = (k: keyof VendorIn) => (val: string | null) =>
    setForm((f) => ({ ...f, [k]: val ?? "" }));

  async function handleSave() {
    if (!form.contact_person?.trim()) {
      setError("Contact person is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = prospect
        ? await updateVendor(prospect.id, form)
        : await createVendor(form as VendorIn);
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const tagSuggestions = Array.from(new Set([...allTags, ...(form.tags ?? [])]));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={prospect ? `Edit ${prospect.vendor_id}` : "Add Prospect"}
      size="md"
      position="right"
    >
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput
          label="Contact Person"
          required
          value={form.contact_person ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
        />
        <TextInput
          label="Business Name"
          value={form.business_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
        />
        <TextInput
          label="Category"
          placeholder="e.g. Plumber, Electrician"
          value={form.category ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        <Select label="Lead Source" data={LEAD_SOURCE_OPTIONS} value={form.lead_source ?? "nextdoor"} onChange={set("lead_source")} />
        <TextInput
          label="Phone"
          value={form.phone ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <TextInput
          label="Email"
          value={form.email ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <TextInput
          label="Nextdoor Profile URL"
          value={form.nextdoor_profile_url ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, nextdoor_profile_url: e.target.value }))}
        />
        <Select label="Status" data={STATUS_OPTIONS} value={form.status ?? "new"} onChange={set("status")} />
        <Select label="Preferred Channel" data={CHANNEL_OPTIONS} value={form.preferred_channel ?? "whatsapp"} onChange={set("preferred_channel")} />
        <TagsInput
          label="Tags"
          placeholder="Type and press Enter to add…"
          data={tagSuggestions}
          value={form.tags ?? []}
          onChange={(val) => setForm((f) => ({ ...f, tags: val }))}
        />
        <Textarea
          label="Notes"
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={() => void handleSave()}>
            {prospect ? "Save" : "Add Prospect"}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

// ── Email Compose Modal ───────────────────────────────────────────────────────

function EmailComposeModal({
  prospect,
  opened,
  onClose,
  templates,
  onContacted,
}: {
  prospect: VendorContact | null;
  opened: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onContacted?: (prospectId: number) => void;
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState(DEFAULT_CC);
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const emailTemplates = templates.filter((t) => t.channel === "email");

  function renderVars(s: string, p: VendorContact) {
    const vars: Record<string, string> = {
      contact_person: p.contact_person,
      business_name: p.business_name || p.contact_person,
      category: p.category || "professional",
      prospect_id: p.vendor_id,
    };
    return Object.entries(vars).reduce((acc, [k, val]) => acc.replace(new RegExp(`{{${k}}}`, "g"), val), s);
  }

  useEffect(() => {
    if (opened && prospect) {
      setTo(prospect.email ?? "");
      setCc(DEFAULT_CC);
      setBcc("");
      setError(null);
      setSent(false);
      const def = emailTemplates.find((t) => t.is_default) ?? emailTemplates[0] ?? null;
      if (def) {
        setTemplateId(String(def.id));
        setSubject(renderVars(def.subject, prospect));
        setBody(renderVars(def.body, prospect));
      } else {
        setTemplateId(null);
        setSubject("");
        setBody("");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, prospect]);

  function applyTemplate(id: string | null) {
    setTemplateId(id);
    if (!id || !prospect) { setSubject(""); setBody(""); return; }
    const t = emailTemplates.find((x) => String(x.id) === id);
    if (!t) return;
    setSubject(renderVars(t.subject, prospect));
    setBody(renderVars(t.body, prospect));
  }

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError("To, subject, and body are required.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendEmail({
        to,
        cc: cc.split(",").map((s) => s.trim()).filter(Boolean),
        bcc: bcc.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        body,
        prospect_id: prospect?.id,
        template_id: templateId ? Number(templateId) : undefined,
      });
      setSent(true);
      if (prospect) onContacted?.(prospect.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={prospect ? `Email — ${prospect.contact_person}` : "Compose Email"}
      size="lg"
    >
      {sent ? (
        <Stack align="center" py="xl" gap="sm">
          <IconCheck size={40} color="green" />
          <Text fw={600}>Email sent!</Text>
          <Text size="sm">To: <strong>{to}</strong></Text>
          <Text size="xs" c="dimmed">CC: {cc || DEFAULT_CC}</Text>
          <Button variant="default" onClick={onClose}>Close</Button>
        </Stack>
      ) : (
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <Select
            label="Load template"
            placeholder="Choose a template…"
            clearable
            data={emailTemplates.map((t) => ({ value: String(t.id), label: `[${t.kind}] ${t.name}` }))}
            value={templateId}
            onChange={applyTemplate}
          />
          <Divider />
          <TextInput label="To" required value={to} onChange={(e) => setTo(e.target.value)} />
          <TextInput label="CC" value={cc} onChange={(e) => setCc(e.target.value)} description="Separate multiple addresses with commas" />
          <TextInput label="BCC" value={bcc} onChange={(e) => setBcc(e.target.value)} description="Separate multiple addresses with commas" />
          <TextInput label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Body" required autosize minRows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button leftSection={<IconMail size={14} />} loading={sending} onClick={() => void handleSend()}>
              Send Email
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

// ── WhatsApp Compose Modal ────────────────────────────────────────────────────

function WhatsAppComposeModal({
  prospect,
  opened,
  onClose,
  templates,
  onContacted,
}: {
  prospect: VendorContact | null;
  opened: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onContacted?: (prospectId: number) => void;
}) {
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  const waTemplates = templates.filter((t) => t.channel === "whatsapp");

  function renderVars(s: string, p: VendorContact) {
    const vars: Record<string, string> = {
      contact_person: p.contact_person,
      business_name: p.business_name || p.contact_person,
      category: p.category || "professional",
      prospect_id: p.vendor_id,
    };
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v), s);
  }

  useEffect(() => {
    if (opened && prospect) {
      setLogged(false);
      const def = waTemplates.find((t) => t.is_default) ?? waTemplates[0] ?? null;
      if (def) {
        setTemplateId(String(def.id));
        setBody(renderVars(def.body, prospect));
      } else {
        setTemplateId(null);
        setBody("");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, prospect]);

  function applyTemplate(id: string | null) {
    setTemplateId(id);
    if (!id || !prospect) { setBody(""); return; }
    const t = waTemplates.find((x) => String(x.id) === id);
    if (t) setBody(renderVars(t.body, prospect));
  }

  const phone = prospect?.phone ?? "";
  const digits = phone.replace(/\D/g, "");
  const waHref = `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;

  async function handleLogAndOpen() {
    if (!prospect) return;
    setLogging(true);
    try {
      await addOutreachLog(prospect.id, {
        channel: "whatsapp",
        to_address: phone,
        body_sent: body,
        template_id: templateId ? Number(templateId) : null,
      });
      setLogged(true);
      if (prospect) onContacted?.(prospect.id);
    } catch {
      // log failure is non-fatal — still open WhatsApp
    } finally {
      setLogging(false);
    }
    window.open(waHref, "_blank", "noopener,noreferrer");
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={prospect ? `WhatsApp — ${prospect.contact_person}` : "WhatsApp Message"}
      size="lg"
    >
      <Stack>
        <Select
          label="Template"
          placeholder="Choose a template…"
          clearable
          data={waTemplates.map((t) => ({ value: String(t.id), label: `[${t.kind}] ${t.name}` }))}
          value={templateId}
          onChange={applyTemplate}
        />
        <Divider />
        <TextInput label="To (phone)" value={phone} readOnly description={digits ? `wa.me/${digits}` : "No phone on record"} />
        <Textarea label="Message" autosize minRows={5} value={body} onChange={(e) => setBody(e.target.value)} />
        {logged && (
          <Alert color="green" icon={<IconCheck size={14} />}>Outreach logged.</Alert>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <CopyButton value={body}>
            {({ copied, copy }) => (
              <Button
                variant="light"
                leftSection={copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                color={copied ? "green" : "blue"}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy text"}
              </Button>
            )}
          </CopyButton>
          <Button
            leftSection={<IconBrandWhatsapp size={13} />}
            color="green"
            disabled={!digits || !body.trim()}
            loading={logging}
            onClick={() => void handleLogAndOpen()}
          >
            Open in WhatsApp
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Outreach Log Modal ────────────────────────────────────────────────────────

function OutreachLogModal({
  prospect,
  opened,
  onClose,
  templates,
}: {
  prospect: VendorContact | null;
  opened: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
}) {
  const [logs, setLogs] = useState<OutreachLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("whatsapp");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (opened && prospect) {
      setLogs(null);
      setError(null);
      listOutreachLogs(prospect.id)
        .then(setLogs)
        .catch(() => setError("Failed to load outreach history."));
    }
  }, [opened, prospect]);

  async function handleLog() {
    if (!prospect) return;
    setLogging(true);
    try {
      const log = await addOutreachLog(prospect.id, {
        channel,
        template_id: templateId ? Number(templateId) : null,
        notes,
      });
      setLogs((prev) => (prev ? [log, ...prev] : [log]));
      setNotes("");
      setTemplateId(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to log.");
    } finally {
      setLogging(false);
    }
  }

  async function handleDelete(logId: number) {
    try {
      await deleteOutreachLog(logId);
      setLogs((prev) => prev?.filter((l) => l.id !== logId) ?? null);
    } catch {
      setError("Failed to delete log entry.");
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={prospect ? `Outreach History — ${prospect.vendor_id} ${prospect.contact_person}` : ""}
      size="lg"
    >
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <Card withBorder radius="sm" p="sm">
          <Stack gap="xs">
            <Text size="sm" fw={600}>Log Manual Outreach</Text>
            <Group grow>
              <Select label="Channel" data={CHANNEL_OPTIONS} value={channel} onChange={(v) => setChannel(v ?? "whatsapp")} />
              <Select
                label="Template"
                placeholder="None"
                clearable
                data={templates.map((t) => ({ value: String(t.id), label: `[${t.channel}][${t.kind}] ${t.name}` }))}
                value={templateId}
                onChange={setTemplateId}
              />
            </Group>
            <TextInput label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Group justify="flex-end">
              <Button size="xs" loading={logging} onClick={() => void handleLog()}>Log Outreach</Button>
            </Group>
          </Stack>
        </Card>
        <Divider label="History" />
        {logs === null ? (
          <Loader size="sm" />
        ) : logs.length === 0 ? (
          <Text size="sm" c="dimmed">No outreach logged yet.</Text>
        ) : (
          <Stack gap="xs">
            {logs.map((l) => {
              const isEmail = l.channel === "email";
              const isWa = l.channel === "whatsapp";
              return (
                <Card key={l.id} withBorder radius="sm" p="sm">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs">
                        {isEmail && <IconMail size={13} color="var(--mantine-color-blue-6)" />}
                        {isWa && <IconBrandWhatsapp size={13} color="var(--mantine-color-green-6)" />}
                        {!isEmail && !isWa && <IconMessageCircle size={13} />}
                        <Badge size="xs" color={isEmail ? "blue" : isWa ? "green" : "gray"} variant="light">
                          {l.channel}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {new Date(l.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Text>
                        {l.template_name && <Badge size="xs" variant="dot" color="gray">{l.template_name}</Badge>}
                      </Group>
                      {l.to_address && <Text size="xs" c="dimmed">To: {l.to_address}</Text>}
                      {isEmail && l.subject_sent && <Text size="xs" fw={500} lineClamp={1}>{l.subject_sent}</Text>}
                      {l.body_sent && <Text size="xs" c="dimmed" lineClamp={2} style={{ fontStyle: "italic" }}>{l.body_sent}</Text>}
                      {l.notes && <Text size="xs">{l.notes}</Text>}
                    </Stack>
                    <ActionIcon size="xs" variant="subtle" color="red" onClick={() => void handleDelete(l.id)}>
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}

// ── Template Manager ──────────────────────────────────────────────────────────

function TemplateManager() {
  const [templates, setTemplates] = useState<MessageTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [formOpen, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [form, setForm] = useState<Partial<TemplateIn>>({});
  const [saving, setSaving] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"email" | "whatsapp">("email");

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setError("Failed to load templates."));
  }, []);

  const filtered = (templates ?? []).filter((t) => t.channel === activeChannel);

  function startNew() {
    setEditing(null);
    setForm({ channel: activeChannel, kind: "intro", is_default: false });
    openForm();
  }

  function startEdit(t: MessageTemplate) {
    setEditing(t);
    setForm({ name: t.name, channel: t.channel, kind: t.kind, subject: t.subject, body: t.body, is_default: t.is_default });
    openForm();
  }

  async function handleSave() {
    if (!form.name?.trim() || !form.body?.trim()) {
      setError("Name and body are required.");
      return;
    }
    if (form.channel === "email" && !form.subject?.trim()) {
      setError("Subject is required for email templates.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = editing
        ? await updateTemplate(editing.id, form)
        : await createTemplate(form as TemplateIn);
      if (editing) {
        setTemplates((prev) => prev?.map((t) => (t.id === saved.id ? saved : t)) ?? null);
      } else {
        setTemplates((prev) => [...(prev ?? []), saved]);
      }
      closeForm();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: MessageTemplate) {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await deleteTemplate(t.id);
      setTemplates((prev) => prev?.filter((x) => x.id !== t.id) ?? null);
    } catch {
      setError("Failed to delete template.");
    }
  }

  return (
    <Stack>
      {error && <Alert color="red">{error}</Alert>}
      <Group justify="space-between">
        <SegmentedControl
          value={activeChannel}
          onChange={(v) => setActiveChannel(v as "email" | "whatsapp")}
          data={[
            { label: "Email Templates", value: "email" },
            { label: "WhatsApp Templates", value: "whatsapp" },
          ]}
        />
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={startNew}>New Template</Button>
      </Group>
      {templates === null ? (
        <Loader size="sm" />
      ) : filtered.length === 0 ? (
        <Text size="sm" c="dimmed">No {activeChannel} templates yet.</Text>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Kind</Table.Th>
              {activeChannel === "email" && <Table.Th>Subject</Table.Th>}
              <Table.Th>Default</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.name}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light">{t.kind}</Badge></Table.Td>
                {activeChannel === "email" && <Table.Td><Text size="sm" lineClamp={1}>{t.subject}</Text></Table.Td>}
                <Table.Td>{t.is_default && <Badge size="xs" color="green">default</Badge>}</Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon size="sm" variant="subtle" onClick={() => startEdit(t)}><IconEdit size={13} /></ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => void handleDelete(t)}><IconTrash size={13} /></ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <Modal
        opened={formOpen}
        onClose={closeForm}
        title={editing ? `Edit — ${editing.name}` : `New ${form.channel === "whatsapp" ? "WhatsApp" : "Email"} Template`}
        size="lg"
      >
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <Group grow>
            <TextInput
              label="Name"
              required
              value={form.name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Select
              label="Kind"
              data={KIND_OPTIONS}
              value={form.kind ?? "intro"}
              onChange={(v) => setForm((f) => ({ ...f, kind: v ?? "intro" }))}
            />
          </Group>
          {form.channel === "email" && (
            <TextInput
              label="Subject"
              required
              placeholder="Supports {{contact_person}}, {{business_name}}, {{category}}, {{prospect_id}}"
              value={form.subject ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
          )}
          <Textarea
            label="Body"
            required
            rows={8}
            placeholder="Use {{contact_person}}, {{business_name}}, {{category}}, {{prospect_id}}"
            value={form.body ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeForm}>Cancel</Button>
            <Button loading={saving} onClick={() => void handleSave()}>{editing ? "Save" : "Create"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Outreach Tool ─────────────────────────────────────────────────────────────

const SITE_URL = "https://gigkraft.com";
const SAMPLE_PROFILE = `${SITE_URL}/pros/stephan-carry`;
const SIGNUP_URL = `${SITE_URL}/register`;
const CONTACT_EMAIL = "vijaysarkarvedula@gmail.com";
const CONTACT_WHATSAPP_DISPLAY = "(341) 356-1982";

function buildEmailBody(name: string) {
  return `Hi ${name},

I came across your work and wanted to share something I think you'd find valuable.

GigKraft is a platform built for pros like you — a place to store, showcase, and share your project portfolio without depending on Instagram, Houzz, or any other platform you don't own.

Your own page. Your own projects. No algorithm, no distractions — just your craft.

Here's what a GigKraft profile looks like:
${SAMPLE_PROFILE}

Plans:
• $19.99/month or $199.99/year
• Optional: We'll set up your page and add up to 5 projects for just $50 more

Ready to get started? Sign up here:
${SIGNUP_URL}

Questions? Reach out:
• Email: ${CONTACT_EMAIL}
• WhatsApp Vijay: ${CONTACT_WHATSAPP_DISPLAY}

Would love to have you on GigKraft!

Vijay
GigKraft`;
}

function buildWhatsAppBody(name: string) {
  return `Hi ${name}! Check out GigKraft — a platform where pros like you can store and share your projects without needing a website or depending on other platforms. No algorithms, just your work. Sign up at ${SIGNUP_URL} (starts at $19.99/mo). Questions? WhatsApp Vijay at ${CONTACT_WHATSAPP_DISPLAY} or email ${CONTACT_EMAIL}`;
}

function OutreachTool() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [toAddr, setToAddr] = useState("");
  const [cc, setCc] = useState(DEFAULT_CC);
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("Your work deserves its own space — GigKraft");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const trimmedName = name.trim() || "there";
  const emailBody = buildEmailBody(trimmedName);
  const smsBody = buildWhatsAppBody(trimmedName);
  const whatsappHref = `https://wa.me/${toAddr.replace(/\D/g, "")}?text=${encodeURIComponent(smsBody)}`;

  const ready = name.trim() !== "" && toAddr.trim() !== "";

  function resetSent() { setSent(false); setError(null); }

  async function handleSend() {
    if (!toAddr.trim() || !subject.trim() || !emailBody.trim()) {
      setError("To, subject, and body are required.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendEmail({
        to: toAddr,
        cc: cc.split(",").map((s) => s.trim()).filter(Boolean),
        bcc: bcc.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        body: emailBody,
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Stack maw={700}>
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Text fw={600} size="sm">Compose outreach message</Text>
          <TextInput
            label="Prospect name"
            placeholder="e.g. John Smith"
            value={name}
            onChange={(e) => { setName(e.target.value); resetSent(); }}
          />
          <Stack gap={6}>
            <Text size="sm" fw={500}>Contact via</Text>
            <SegmentedControl
              value={channel}
              onChange={(v) => { setChannel(v as "email" | "phone"); setToAddr(""); resetSent(); }}
              data={[
                { label: "Email", value: "email" },
                { label: "Phone / WhatsApp", value: "phone" },
              ]}
              w={260}
            />
          </Stack>
          {channel === "email" ? (
            <TextInput
              label="Email address"
              placeholder="prospect@example.com"
              type="email"
              value={toAddr}
              onChange={(e) => { setToAddr(e.target.value); resetSent(); }}
            />
          ) : (
            <TextInput
              label="Phone number"
              placeholder="e.g. 5551234567"
              value={toAddr}
              onChange={(e) => { setToAddr(e.target.value); resetSent(); }}
            />
          )}
        </Stack>
      </Card>

      {ready && channel === "email" && (
        <Card withBorder radius="md" p="lg">
          <Stack gap="sm">
            <Text fw={600} size="sm">Email compose</Text>
            <Divider />
            <TextInput label="To" value={toAddr} onChange={(e) => setToAddr(e.target.value)} required />
            <TextInput label="CC" value={cc} onChange={(e) => setCc(e.target.value)} description="Separate multiple with commas" />
            <TextInput label="BCC" value={bcc} onChange={(e) => setBcc(e.target.value)} />
            <TextInput label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <Textarea label="Body" value={emailBody} readOnly autosize minRows={10} styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
            {error && <Alert color="red">{error}</Alert>}
            {sent && <Alert color="green" icon={<IconCheck size={14} />}>Email sent to <strong>{toAddr}</strong></Alert>}
            <Group justify="flex-end">
              <CopyButton value={emailBody}>
                {({ copied, copy }) => (
                  <Button size="sm" variant="light" leftSection={copied ? <IconCheck size={13} /> : <IconCopy size={13} />} color={copied ? "green" : "blue"} onClick={copy}>
                    {copied ? "Copied" : "Copy body"}
                  </Button>
                )}
              </CopyButton>
              <Button size="sm" leftSection={<IconMail size={13} />} loading={sending} onClick={() => void handleSend()}>Send Email</Button>
            </Group>
          </Stack>
        </Card>
      )}

      {ready && channel === "phone" && (
        <Card withBorder radius="md" p="lg">
          <Stack gap="sm">
            <Text fw={600} size="sm">WhatsApp / Text message</Text>
            <Divider />
            <Textarea value={smsBody} readOnly autosize minRows={4} styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
            <Group justify="flex-end">
              <CopyButton value={smsBody}>
                {({ copied, copy }) => (
                  <Button size="sm" variant="light" leftSection={copied ? <IconCheck size={13} /> : <IconCopy size={13} />} color={copied ? "green" : "blue"} onClick={copy}>
                    {copied ? "Copied" : "Copy text"}
                  </Button>
                )}
              </CopyButton>
              <Button size="sm" leftSection={<IconBrandWhatsapp size={13} />} color="green" component="a" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Open in WhatsApp
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

// ── Main Prospects Page ───────────────────────────────────────────────────────

export function GkAdminVendorsPage() {
  const [prospects, setProspects] = useState<VendorContact[] | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkIntroResult[] | null>(null);
  const [bulkResultsOpen, { open: openBulkResults, close: closeBulkResults }] = useDisclosure(false);

  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editingProspect, setEditingProspect] = useState<VendorContact | null>(null);

  const [emailOpen, { open: openEmail, close: closeEmail }] = useDisclosure(false);
  const [emailProspect, setEmailProspect] = useState<VendorContact | null>(null);

  const [waOpen, { open: openWa, close: closeWa }] = useDisclosure(false);
  const [waProspect, setWaProspect] = useState<VendorContact | null>(null);

  const [logOpen, { open: openLog, close: closeLog }] = useDisclosure(false);
  const [logProspect, setLogProspect] = useState<VendorContact | null>(null);

  useEffect(() => {
    listTemplates().then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProspects(null);
    setSelectedIds(new Set());
    listVendors({
      status: statusFilter || undefined,
      source: sourceFilter || undefined,
      search: debouncedSearch || undefined,
      tag: tagFilter || undefined,
    })
      .then((data) => { if (!cancelled) { setProspects(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load prospects."); });
    return () => { cancelled = true; };
  }, [statusFilter, sourceFilter, debouncedSearch, tagFilter]);

  // Collect all unique tags across loaded prospects for the filter dropdown
  const allTags = Array.from(
    new Set((prospects ?? []).flatMap((p) => p.tags ?? []))
  ).sort();

  function handleProspectSaved(v: VendorContact) {
    setProspects((prev) => {
      if (!prev) return [v];
      const idx = prev.findIndex((x) => x.id === v.id);
      return idx >= 0 ? prev.map((x) => (x.id === v.id ? v : x)) : [v, ...prev];
    });
  }

  async function handleDelete(v: VendorContact) {
    if (!confirm(`Delete ${v.vendor_id} ${v.contact_person}?`)) return;
    try {
      await deleteVendor(v.id);
      setProspects((prev) => prev?.filter((x) => x.id !== v.id) ?? null);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(v.id); return next; });
    } catch {
      setError("Failed to delete prospect.");
    }
  }

  function openEdit(v: VendorContact) { setEditingProspect(v); openDrawer(); }
  function openNew() { setEditingProspect(null); openDrawer(); }
  function openEmailModal(v: VendorContact) { setEmailProspect(v); openEmail(); }
  function openWaModal(v: VendorContact) { setWaProspect(v); openWa(); }
  function openLogModal(v: VendorContact) { setLogProspect(v); openLog(); }

  function handleContacted(prospectId: number) {
    const today = new Date().toISOString().slice(0, 10);
    setProspects((prev) =>
      prev?.map((p) =>
        p.id === prospectId
          ? { ...p, last_contact_date: today, status: p.status === "new" ? "contacted" : p.status }
          : p
      ) ?? null
    );
  }

  // Selection helpers
  const allIds = (prospects ?? []).map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleBulkSendIntro() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Send intro email to ${selectedIds.size} selected prospect(s)?`)) return;
    setBulkSending(true);
    try {
      const results = await bulkSendIntroEmails(Array.from(selectedIds));
      setBulkResults(results);
      openBulkResults();
      // Update contacted dates for sent ones
      const sentIds = new Set(results.filter((r) => r.sent).map((r) => r.prospect_id));
      const today = new Date().toISOString().slice(0, 10);
      setProspects((prev) =>
        prev?.map((p) =>
          sentIds.has(p.id)
            ? { ...p, last_contact_date: today, status: p.status === "new" ? "contacted" : p.status }
            : p
        ) ?? null
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk send failed.");
    } finally {
      setBulkSending(false);
    }
  }

  async function handleSendIntroSingle(v: VendorContact) {
    if (!v.email) { setError(`${v.vendor_id} has no email address.`); return; }
    if (!confirm(`Send intro email to ${v.contact_person} (${v.email})?`)) return;
    try {
      const results = await bulkSendIntroEmails([v.id]);
      const r = results[0];
      if (r?.sent) {
        const today = new Date().toISOString().slice(0, 10);
        setProspects((prev) =>
          prev?.map((p) =>
            p.id === v.id
              ? { ...p, last_contact_date: today, status: p.status === "new" ? "contacted" : p.status }
              : p
          ) ?? null
        );
      } else {
        setError(r?.error ?? "Send failed.");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Send failed.");
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Prospects</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      <Tabs defaultValue="summary">
        <Tabs.List>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="prospects">Prospects</Tabs.Tab>
          <Tabs.Tab value="templates">Templates</Tabs.Tab>
          <Tabs.Tab value="outreach">Outreach</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary" pt="md">
          <SummaryTab />
        </Tabs.Panel>

        <Tabs.Panel value="prospects" pt="md">
          <Stack>
            {error && <Alert color="red" onClose={() => setError(null)} withCloseButton>{error}</Alert>}

            <Group>
              <TextInput
                placeholder="Search by name…"
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="All statuses"
                clearable
                data={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v ?? "")}
                w={180}
              />
              <Select
                placeholder="All sources"
                clearable
                data={LEAD_SOURCE_OPTIONS}
                value={sourceFilter}
                onChange={(v) => setSourceFilter(v ?? "")}
                w={160}
              />
              <Select
                placeholder="All tags"
                clearable
                data={allTags.map((t) => ({ value: t, label: t }))}
                value={tagFilter}
                onChange={(v) => setTagFilter(v ?? "")}
                w={140}
              />
              <Button leftSection={<IconPlus size={14} />} onClick={openNew}>
                Add Prospect
              </Button>
            </Group>

            {someSelected && (
              <Group>
                <Text size="sm" c="dimmed">{selectedIds.size} selected</Text>
                <Button
                  size="xs"
                  leftSection={<IconSend size={13} />}
                  loading={bulkSending}
                  onClick={() => void handleBulkSendIntro()}
                >
                  Send Intro Mail
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={() => setSelectedIds(new Set())}>
                  Clear selection
                </Button>
              </Group>
            )}

            <Card withBorder radius="md" padding="lg">
              {prospects === null ? (
                <Loader size="sm" />
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </Table.Th>
                      <Table.Th>ID</Table.Th>
                      <Table.Th>Name / Business</Table.Th>
                      <Table.Th>Contact</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Tags</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Contact</Table.Th>
                      <Table.Th>Page Seen</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {prospects.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={10}>
                          <Text size="sm" c="dimmed">No prospects found.</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {prospects.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td>
                          <Checkbox
                            checked={selectedIds.has(v.id)}
                            onChange={() => toggleSelect(v.id)}
                            aria-label={`Select ${v.contact_person}`}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" ff="monospace">{v.vendor_id}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm" fw={600}>{v.contact_person}</Text>
                            {v.business_name && <Text size="xs" c="dimmed">{v.business_name}</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            {v.email && <Text size="xs">{v.email}</Text>}
                            {v.phone && <Text size="xs" c="dimmed">{v.phone}</Text>}
                            {!v.email && !v.phone && <Text size="xs" c="dimmed">—</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td><Text size="sm">{v.category || "—"}</Text></Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="wrap">
                            {(v.tags ?? []).map((tag) => (
                              <Badge key={tag} size="xs" variant="outline" color="grape">{tag}</Badge>
                            ))}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" color={STATUS_COLORS[v.status] ?? "gray"}>
                            {v.status.replace(/_/g, " ")}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{v.last_contact_date ?? "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          {v.page_view_count > 0 ? (
                            <Tooltip
                              label={`Last seen: ${v.last_seen ? new Date(v.last_seen).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "unknown"}`}
                              withArrow
                            >
                              <Badge size="xs" color="teal" leftSection={<IconEye size={10} />}>
                                {v.page_view_count}×
                              </Badge>
                            </Tooltip>
                          ) : (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <Tooltip label={v.phone ? "WhatsApp" : "No phone on record"} withArrow>
                              <ActionIcon size="sm" variant="subtle" color="green" disabled={!v.phone} onClick={() => openWaModal(v)}>
                                <IconBrandWhatsapp size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={v.email ? "Send Email" : "No email on record"} withArrow>
                              <ActionIcon size="sm" variant="subtle" color="blue" disabled={!v.email} onClick={() => openEmailModal(v)}>
                                <IconMail size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={v.email ? "Send Intro Mail" : "No email on record"} withArrow>
                              <ActionIcon size="sm" variant="subtle" color="indigo" disabled={!v.email} onClick={() => void handleSendIntroSingle(v)}>
                                <IconSend size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Outreach history" withArrow>
                              <ActionIcon size="sm" variant="subtle" color="violet" onClick={() => openLogModal(v)}>
                                <IconMessageCircle size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Edit" withArrow>
                              <ActionIcon size="sm" variant="subtle" onClick={() => openEdit(v)}>
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete" withArrow>
                              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => void handleDelete(v)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="templates" pt="md">
          <TemplateManager />
        </Tabs.Panel>

        <Tabs.Panel value="outreach" pt="md">
          <OutreachTool />
        </Tabs.Panel>
      </Tabs>

      <ProspectDrawer
        opened={drawerOpen}
        onClose={closeDrawer}
        prospect={editingProspect}
        onSaved={handleProspectSaved}
        allTags={allTags}
      />

      <EmailComposeModal
        prospect={emailProspect}
        opened={emailOpen}
        onClose={closeEmail}
        templates={templates}
        onContacted={handleContacted}
      />

      <WhatsAppComposeModal
        prospect={waProspect}
        opened={waOpen}
        onClose={closeWa}
        templates={templates}
        onContacted={handleContacted}
      />

      <OutreachLogModal
        prospect={logProspect}
        opened={logOpen}
        onClose={closeLog}
        templates={templates}
      />

      {bulkResults && (
        <BulkIntroResultModal
          results={bulkResults}
          opened={bulkResultsOpen}
          onClose={closeBulkResults}
        />
      )}
    </Stack>
  );
}
