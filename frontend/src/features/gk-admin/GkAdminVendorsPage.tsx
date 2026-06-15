import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Group,
  Loader,
  Menu,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconChevronDown,
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconHistory,
  IconMail,
  IconPlus,
  IconSearch,
  IconSend,
  IconTemplate,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  ApiError,
  bulkUpdateVendorStatus,
  createTemplate,
  createVendor,
  deleteCommunication,
  deleteTemplate,
  deleteVendor,
  listCommunications,
  listTemplates,
  listVendors,
  logCommunication,
  previewTemplate,
  updateTemplate,
  updateVendor,
  type CommunicationIn,
  type EmailTemplate,
  type TemplateIn,
  type VendorCommunication,
  type VendorContact,
  type VendorIn,
} from "../../api/endpoints";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_conversation", label: "In Conversation" },
  { value: "follow_up", label: "Follow-up Needed" },
  { value: "onboarded", label: "Onboarded" },
  { value: "not_interested", label: "Not Interested" },
];

const SOURCE_OPTIONS = [
  { value: "nextdoor", label: "Nextdoor" },
  { value: "whatsapp_friends", label: "WhatsApp (Friends)" },
  { value: "whatsapp_family", label: "WhatsApp (Family)" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "nextdoor_dm", label: "Nextdoor DM" },
  { value: "phone", label: "Phone Call" },
  { value: "other", label: "Other" },
];

const TEMPLATE_KIND_OPTIONS = [
  { value: "intro", label: "Intro" },
  { value: "reminder", label: "Reminder" },
  { value: "onboarding", label: "Onboarding" },
  { value: "other", label: "Other" },
];

const CATEGORY_SUGGESTIONS = [
  "Plumber", "Handyman", "Electrician", "Cleaner", "Painter",
  "Landscaper", "HVAC", "Roofer", "Carpenter", "Other",
];

const STATUS_COLORS: Record<string, string> = {
  new: "blue",
  contacted: "cyan",
  in_conversation: "yellow",
  follow_up: "orange",
  onboarded: "green",
  not_interested: "gray",
};

const KIND_COLORS: Record<string, string> = {
  intro: "blue",
  reminder: "orange",
  onboarding: "green",
  other: "gray",
};

const PLACEHOLDER_HINT = "Available: {{contact_person}}, {{business_name}}, {{category}}, {{vendor_id}}";

const DEFAULT_INTRO_BODY = `Hi {{contact_person}},

I'm reaching out from GigKraft — a platform that connects skilled professionals with local homeowners in your area.

I came across your work as a {{category}} and think you'd be a great fit for our network. We help pros like you get more local jobs with zero advertising spend.

Would you be open to a quick 10-minute chat about joining?

Best,
GigKraft Team`;

const DEFAULT_REMINDER_BODY = `Hi {{contact_person}},

Just following up on my earlier message about GigKraft. I know things get busy!

We're still building out our network of top {{category}} professionals in your area and would love to have you on board.

Let me know if you have any questions — happy to answer them quickly.

Best,
GigKraft Team`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function sourceLabel(s: string) {
  return SOURCE_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function channelLabel(s: string) {
  return CHANNEL_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text);
}

// ── Template Manager Modal ────────────────────────────────────────────────────

interface TemplateManagerProps {
  opened: boolean;
  onClose: () => void;
}

function TemplateManagerModal({ opened, onClose }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<TemplateIn>({
    name: "", kind: "intro", subject: "", body: "", is_default: false,
  });

  async function load() {
    try {
      const rows = await listTemplates();
      setTemplates(rows);
    } catch {
      setError("Failed to load templates.");
    }
  }

  useEffect(() => {
    if (opened) { void load(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  function startNew(kind = "intro") {
    setEditing(null);
    setIsNew(true);
    setError(null);
    setForm({
      name: "",
      kind,
      subject: kind === "intro" ? "Partnership with GigKraft" : "Following up — GigKraft Partnership",
      body: kind === "intro" ? DEFAULT_INTRO_BODY : DEFAULT_REMINDER_BODY,
      is_default: false,
    });
  }

  function startEdit(t: EmailTemplate) {
    setEditing(t);
    setIsNew(false);
    setError(null);
    setForm({ name: t.name, kind: t.kind, subject: t.subject, body: t.body, is_default: t.is_default });
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      setError("Name, subject, and body are all required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const t = await createTemplate(form);
        setTemplates((prev) => [...prev, t]);
      } else if (editing) {
        const t = await updateTemplate(editing.id, form);
        setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (editing?.id === id) cancelEdit();
    } catch {
      setError("Delete failed.");
    }
  }

  const showForm = isNew || !!editing;

  return (
    <Modal opened={opened} onClose={onClose} title="Email Templates" size="xl">
      <Stack gap="sm">
        {error && <Alert color="red" variant="light">{error}</Alert>}

        {!showForm && (
          <Group gap="xs">
            <Button size="xs" leftSection={<IconPlus size={12} />} onClick={() => startNew("intro")}>
              New Intro Template
            </Button>
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => startNew("reminder")}>
              New Reminder Template
            </Button>
          </Group>
        )}

        {!showForm && (
          templates.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No templates yet. Create an Intro and a Reminder to get started.
            </Text>
          ) : (
            <Stack gap="xs">
              {templates.map((t) => (
                <Card key={t.id} withBorder padding="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Group gap="xs">
                        <Badge color={KIND_COLORS[t.kind]} size="xs" variant="light">{t.kind}</Badge>
                        {t.is_default && <Badge color="violet" size="xs" variant="dot">default</Badge>}
                        <Text size="sm" fw={600} truncate>{t.name}</Text>
                      </Group>
                      <Text size="xs" c="dimmed" truncate>{t.subject}</Text>
                    </Stack>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon size="sm" variant="subtle" onClick={() => startEdit(t)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon size="sm" variant="subtle" color="red" onClick={() => void handleDelete(t.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )
        )}

        {showForm && (
          <Stack gap="sm">
            <Group grow>
              <TextInput
                label="Template Name *"
                placeholder="Friendly Intro"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.currentTarget.value }))}
              />
              <Select
                label="Type"
                data={TEMPLATE_KIND_OPTIONS}
                value={form.kind}
                onChange={(v) => setForm((p) => ({ ...p, kind: v ?? "intro" }))}
              />
            </Group>

            <TextInput
              label="Subject Line *"
              placeholder="Partnership with GigKraft"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.currentTarget.value }))}
            />

            <Textarea
              label="Body *"
              description={PLACEHOLDER_HINT}
              rows={10}
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.currentTarget.value }))}
              styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
            />

            <Checkbox
              label="Mark as default for this type (used for quick-send)"
              checked={form.is_default}
              onChange={(e) => setForm((p) => ({ ...p, is_default: e.currentTarget.checked }))}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={() => void handleSave()} loading={saving}>
                {isNew ? "Create Template" : "Save Changes"}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}

// ── Send Email Modal ──────────────────────────────────────────────────────────

interface SendEmailProps {
  opened: boolean;
  onClose: () => void;
  vendor: VendorContact;
  onSent: (updatedVendor: VendorContact) => void;
}

function SendEmailModal({ opened, onClose, vendor, onSent }: SendEmailProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string; body: string; mailto_link: string } | null>(null);
  const [channel, setChannel] = useState("email");
  const [notes, setNotes] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (opened) {
      setSelectedTemplateId(null);
      setPreview(null);
      setNotes("");
      setError(null);
      setCopied(false);
      void listTemplates().then(setTemplates).catch(() => setError("Failed to load templates."));
    }
  }, [opened]);

  async function handleSelectTemplate(id: string | null) {
    setSelectedTemplateId(id);
    setPreview(null);
    if (!id) return;
    setLoadingPreview(true);
    try {
      const p = await previewTemplate(Number(id), vendor.id);
      setPreview(p);
    } catch {
      setError("Failed to preview template.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleLogSent() {
    setLogging(true);
    setError(null);
    try {
      const payload: CommunicationIn = {
        template_id: selectedTemplateId ? Number(selectedTemplateId) : null,
        channel,
        subject_sent: preview?.subject ?? "",
        body_sent: preview?.body ?? "",
        notes,
        advance_status: true,
      };
      await logCommunication(vendor.id, payload);
      // Fetch updated vendor to refresh last_contact_date + status
      const rows = await listVendors();
      const updated = rows.find((v) => v.id === vendor.id) ?? { ...vendor };
      onSent(updated as VendorContact);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log communication.");
    } finally {
      setLogging(false);
    }
  }

  function handleCopy() {
    if (preview) {
      copyToClipboard(`Subject: ${preview.subject}\n\n${preview.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const templateOptions = templates.map((t) => ({
    value: String(t.id),
    label: `[${t.kind}] ${t.name}`,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={`Reach out — ${vendor.contact_person}`} size="lg">
      <Stack gap="sm">
        {error && <Alert color="red" variant="light">{error}</Alert>}

        <Group grow>
          <Select
            label="Email Template"
            placeholder="Choose a template…"
            data={templateOptions}
            value={selectedTemplateId}
            onChange={(v) => void handleSelectTemplate(v)}
            clearable
          />
          <Select
            label="Channel"
            data={CHANNEL_OPTIONS}
            value={channel}
            onChange={(v) => setChannel(v ?? "email")}
          />
        </Group>

        {loadingPreview && <Loader size="sm" />}

        {preview && (
          <Card withBorder radius="md" padding="sm" style={{ background: "var(--mantine-color-gray-0)" }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" fw={700} c="dimmed">PREVIEW</Text>
                <Group gap={4}>
                  <Tooltip label={copied ? "Copied!" : "Copy to clipboard"}>
                    <ActionIcon size="sm" variant="subtle" onClick={handleCopy}>
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                  {vendor.email && (
                    <Tooltip label="Open in email client">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        component="a"
                        href={preview.mailto_link}
                      >
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
              <Text size="xs" c="dimmed">To: {vendor.email || "(no email on file)"}</Text>
              <Text size="sm" fw={600}>Subject: {preview.subject}</Text>
              <Divider />
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{preview.body}</Text>
            </Stack>
          </Card>
        )}

        {!selectedTemplateId && !preview && (
          <Text size="sm" c="dimmed">
            Select a template above to preview the rendered email. No templates yet?{" "}
            <Text component="span" c="blue" style={{ cursor: "pointer" }} onClick={onClose}>
              Set them up in the Templates panel.
            </Text>
          </Text>
        )}

        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Sent via Gmail on mobile…"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        <Alert color="blue" variant="light" title="How this works">
          Click the ↗ icon above to open the draft in your email client, then send it manually.
          Come back and click "Mark as Sent" to log it and update the Last Contact date automatically.
        </Alert>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            leftSection={<IconSend size={14} />}
            onClick={() => void handleLogSent()}
            loading={logging}
          >
            Mark as Sent
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Communication History Drawer ──────────────────────────────────────────────

interface HistoryDrawerProps {
  opened: boolean;
  onClose: () => void;
  vendor: VendorContact | null;
  onDeleted: (vendorId: number) => void;
}

function HistoryDrawer({ opened, onClose, vendor, onDeleted }: HistoryDrawerProps) {
  const [comms, setComms] = useState<VendorCommunication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened && vendor) {
      setLoading(true);
      setError(null);
      listCommunications(vendor.id)
        .then(setComms)
        .catch(() => setError("Failed to load history."))
        .finally(() => setLoading(false));
    }
  }, [opened, vendor]);

  async function handleDelete(commId: number) {
    if (!vendor) return;
    try {
      await deleteCommunication(vendor.id, commId);
      setComms((prev) => prev.filter((c) => c.id !== commId));
      onDeleted(vendor.id);
    } catch {
      setError("Failed to delete entry.");
    }
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={vendor ? `Communication History — ${vendor.contact_person}` : "History"}
      position="right"
      size="lg"
    >
      {vendor && (
        <Stack gap="xs" mb="md">
          <Group gap="xs">
            <Badge color={STATUS_COLORS[vendor.status] ?? "gray"} size="sm" variant="light">
              {statusLabel(vendor.status)}
            </Badge>
            <Text size="xs" c="dimmed">
              Last contact: {vendor.last_contact_date ?? "never"}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {vendor.email || "no email"} · {vendor.phone || "no phone"}
          </Text>
        </Stack>
      )}

      {error && <Alert color="red" variant="light" mb="sm">{error}</Alert>}

      {loading && <Loader size="sm" />}

      {!loading && comms.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="lg">
          No outreach logged yet. Use "Send Email" to record your first contact.
        </Text>
      )}

      <ScrollArea>
        <Stack gap="sm">
          {comms.map((c) => (
            <Card key={c.id} withBorder padding="sm" radius="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs">
                    <Badge size="xs" variant="light">{channelLabel(c.channel)}</Badge>
                    {c.template_name && (
                      <Badge size="xs" variant="outline" color="blue">{c.template_name}</Badge>
                    )}
                    <Text size="xs" c="dimmed">{fmtDate(c.sent_at)}</Text>
                  </Group>
                  {c.subject_sent && (
                    <Text size="sm" fw={600} truncate>Subject: {c.subject_sent}</Text>
                  )}
                  {c.body_sent && (
                    <Text
                      size="xs"
                      c="dimmed"
                      lineClamp={3}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {c.body_sent}
                    </Text>
                  )}
                  {c.notes && (
                    <Text size="xs" c="blue">Note: {c.notes}</Text>
                  )}
                </Stack>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  style={{ flexShrink: 0 }}
                  onClick={() => void handleDelete(c.id)}
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}

// ── Vendor Form Modal ─────────────────────────────────────────────────────────

interface VendorFormProps {
  opened: boolean;
  onClose: () => void;
  initial?: VendorContact | null;
  onSaved: (v: VendorContact) => void;
}

function VendorFormModal({ opened, onClose, initial, onSaved }: VendorFormProps) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<VendorIn>({
    contact_person: "", business_name: "", category: "",
    lead_source: "nextdoor", phone: "", email: "",
    nextdoor_profile_url: "", status: "new",
    preferred_channel: "whatsapp", last_contact_date: null, notes: "",
  });

  useEffect(() => {
    if (opened) {
      setError(null);
      setSaving(false);
      setForm(initial ? {
        contact_person: initial.contact_person, business_name: initial.business_name,
        category: initial.category, lead_source: initial.lead_source,
        phone: initial.phone, email: initial.email,
        nextdoor_profile_url: initial.nextdoor_profile_url, status: initial.status,
        preferred_channel: initial.preferred_channel,
        last_contact_date: initial.last_contact_date, notes: initial.notes,
      } : {
        contact_person: "", business_name: "", category: "",
        lead_source: "nextdoor", phone: "", email: "",
        nextdoor_profile_url: "", status: "new",
        preferred_channel: "whatsapp", last_contact_date: null, notes: "",
      });
    }
  }, [opened, initial]);

  function set(field: keyof VendorIn, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.contact_person.trim()) { setError("Contact person name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = isEdit ? await updateVendor(initial!.id, form) : await createVendor(form);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Edit Vendor" : "Add Vendor"} size="lg">
      <Stack gap="sm">
        {error && <Alert color="red" variant="light">{error}</Alert>}
        <Group grow>
          <TextInput label="Contact Person *" placeholder="Jane Smith" value={form.contact_person}
            onChange={(e) => set("contact_person", e.currentTarget.value)} />
          <TextInput label="Business Name" placeholder="Smith Plumbing Co." value={form.business_name}
            onChange={(e) => set("business_name", e.currentTarget.value)} />
        </Group>
        <Group grow>
          <Select label="Category" placeholder="Pick a trade…" searchable data={CATEGORY_SUGGESTIONS}
            value={form.category || null} onChange={(v) => set("category", v ?? "")} />
          <Select label="Lead Source" data={SOURCE_OPTIONS} value={form.lead_source}
            onChange={(v) => set("lead_source", v ?? "nextdoor")} />
        </Group>
        <Group grow>
          <TextInput label="Phone" placeholder="+1 555 000 0000" value={form.phone}
            onChange={(e) => set("phone", e.currentTarget.value)} />
          <TextInput label="Email" placeholder="jane@example.com" value={form.email}
            onChange={(e) => set("email", e.currentTarget.value)} />
        </Group>
        <TextInput label="Nextdoor Profile URL" placeholder="https://nextdoor.com/…"
          value={form.nextdoor_profile_url}
          onChange={(e) => set("nextdoor_profile_url", e.currentTarget.value)} />
        <Group grow>
          <Select label="Status" data={STATUS_OPTIONS} value={form.status}
            onChange={(v) => set("status", v ?? "new")} />
          <Select label="Preferred Channel" data={CHANNEL_OPTIONS} value={form.preferred_channel}
            onChange={(v) => set("preferred_channel", v ?? "whatsapp")} />
        </Group>
        <TextInput label="Last Contact Date" type="date" value={form.last_contact_date ?? ""}
          onChange={(e) => set("last_contact_date", e.currentTarget.value || null)} />
        <Textarea label="Notes / Context"
          placeholder="Recommended by John for roof work. Prefers texting after 5 PM…"
          rows={3} value={form.notes} onChange={(e) => set("notes", e.currentTarget.value)} />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} loading={saving}>
            {isEdit ? "Save Changes" : "Add Vendor"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function GkAdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorContact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Modal states
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VendorContact | null>(null);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [sendEmailTarget, setSendEmailTarget] = useState<VendorContact | null>(null);
  const [historyTarget, setHistoryTarget] = useState<VendorContact | null>(null);

  async function load() {
    try {
      const rows = await listVendors({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        search: search || undefined,
      });
      setVendors(rows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load vendors.");
    }
  }

  useEffect(() => { void load(); }, [statusFilter, sourceFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  function upsertVendor(v: VendorContact) {
    setVendors((prev) => {
      if (!prev) return [v];
      const idx = prev.findIndex((x) => x.id === v.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = v; return next; }
      return [v, ...prev];
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this vendor contact?")) return;
    try {
      await deleteVendor(id);
      setVendors((prev) => prev?.filter((v) => v.id !== id) ?? null);
      setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function handleBulkStatus(status: string) {
    const ids = [...selected];
    if (!ids.length) return;
    try {
      const updated = await bulkUpdateVendorStatus(ids, status);
      setVendors((prev) => {
        if (!prev) return prev;
        const map = new Map(updated.map((v) => [v.id, v]));
        return prev.map((v) => map.get(v.id) ?? v);
      });
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Bulk update failed.");
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (!vendors) return;
    setSelected(selected.size === vendors.length ? new Set() : new Set(vendors.map((v) => v.id)));
  }

  const counts = vendors
    ? STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
        acc[s.value] = vendors.filter((v) => v.status === s.value).length;
        return acc;
      }, {})
    : {};

  // Days-since-last-contact helper for follow-up detection
  function daysSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / 86400000);
  }

  return (
    <Stack>
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Title order={3}>Vendor CRM</Title>
          <Text size="sm" c="dimmed">
            Track outreach to prospective pros from Nextdoor &amp; WhatsApp
          </Text>
        </Stack>
        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconTemplate size={16} />}
            onClick={() => setTemplateManagerOpen(true)}
          >
            Email Templates
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => { setEditTarget(null); setAddEditOpen(true); }}
          >
            Add Vendor
          </Button>
        </Group>
      </Group>

      {/* Pipeline badges */}
      {vendors && (
        <Group gap="xs">
          {STATUS_OPTIONS.map((s) => (
            <Badge
              key={s.value}
              color={STATUS_COLORS[s.value]}
              variant={statusFilter === s.value ? "filled" : "light"}
              size="sm"
              style={{ cursor: "pointer" }}
              onClick={() => setStatusFilter(statusFilter === s.value ? "" : s.value)}
            >
              {s.label}: {counts[s.value] ?? 0}
            </Badge>
          ))}
        </Group>
      )}

      {error && (
        <Alert color="red" variant="light" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search name or business…"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select placeholder="All statuses" clearable data={STATUS_OPTIONS}
          value={statusFilter || null} onChange={(v) => setStatusFilter(v ?? "")} w={180} />
        <Select placeholder="All sources" clearable data={SOURCE_OPTIONS}
          value={sourceFilter || null} onChange={(v) => setSourceFilter(v ?? "")} w={180} />
      </Group>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <Card withBorder padding="xs" radius="md" style={{ background: "var(--mantine-color-blue-0)" }}>
          <Group justify="space-between">
            <Text size="sm" fw={600}>{selected.size} selected</Text>
            <Group gap="xs">
              <Menu shadow="md">
                <Menu.Target>
                  <Button size="xs" variant="light" rightSection={<IconChevronDown size={12} />}>
                    Move to…
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {STATUS_OPTIONS.map((s) => (
                    <Menu.Item key={s.value} onClick={() => void handleBulkStatus(s.value)}>
                      {s.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <Button size="xs" variant="subtle" color="red" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </Group>
          </Group>
        </Card>
      )}

      {/* Table */}
      <Card withBorder radius="md" padding={0}>
        {vendors ? (
          <Table striped highlightOnHover style={{ fontSize: 13 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    checked={vendors.length > 0 && selected.size === vendors.length}
                    indeterminate={selected.size > 0 && selected.size < vendors.length}
                    onChange={toggleAll}
                  />
                </Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Contact / Business</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Source</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Last Contact</Table.Th>
                <Table.Th>Reach Out</Table.Th>
                <Table.Th w={100}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {vendors.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No vendors match. Add your first contact to get started.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {vendors.map((v) => {
                const days = daysSince(v.last_contact_date);
                const stale = days !== null && days >= 5 && v.status === "contacted";
                return (
                  <Table.Tr key={v.id} style={selected.has(v.id) ? { background: "var(--mantine-color-blue-0)" } : undefined}>
                    <Table.Td>
                      <Checkbox checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)} />
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" c="dimmed" ff="monospace">{v.vendor_id}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={600}>{v.contact_person}</Text>
                        {v.business_name && <Text size="xs" c="dimmed">{v.business_name}</Text>}
                        {v.nextdoor_profile_url && (
                          <Text size="xs" c="blue" component="a" href={v.nextdoor_profile_url}
                            target="_blank" rel="noopener noreferrer">
                            Nextdoor ↗
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs">{v.category || "—"}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs">{sourceLabel(v.lead_source)}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge color={STATUS_COLORS[v.status] ?? "gray"} size="xs" variant="light">
                        {statusLabel(v.status)}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="xs" c={v.last_contact_date ? undefined : "dimmed"}>
                          {v.last_contact_date ?? "Never"}
                        </Text>
                        {stale && (
                          <Badge color="orange" size="xs" variant="dot">Follow-up due</Badge>
                        )}
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        {v.email && (
                          <Tooltip label="Send email from template">
                            <ActionIcon size="sm" color="blue" variant="light"
                              onClick={() => setSendEmailTarget(v)}>
                              <IconMail size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {v.whatsapp_link && (
                          <Tooltip label="Open WhatsApp chat">
                            <ActionIcon size="sm" color="green" variant="light"
                              component="a" href={v.whatsapp_link} target="_blank" rel="noopener noreferrer">
                              <IconBrandWhatsapp size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {!v.email && !v.whatsapp_link && (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <Tooltip label="Communication history">
                          <ActionIcon size="sm" variant="subtle" color="violet"
                            onClick={() => setHistoryTarget(v)}>
                            <IconHistory size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon size="sm" variant="subtle"
                            onClick={() => { setEditTarget(v); setAddEditOpen(true); }}>
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon size="sm" variant="subtle" color="red"
                            onClick={() => void handleDelete(v.id)}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        ) : (
          <Group justify="center" p="xl"><Loader size="sm" /></Group>
        )}
      </Card>

      {/* Modals & Drawer */}
      <VendorFormModal
        opened={addEditOpen}
        onClose={() => setAddEditOpen(false)}
        initial={editTarget}
        onSaved={upsertVendor}
      />

      <TemplateManagerModal
        opened={templateManagerOpen}
        onClose={() => setTemplateManagerOpen(false)}
      />

      {sendEmailTarget && (
        <SendEmailModal
          opened={!!sendEmailTarget}
          onClose={() => setSendEmailTarget(null)}
          vendor={sendEmailTarget}
          onSent={(updated) => { upsertVendor(updated); setSendEmailTarget(null); }}
        />
      )}

      <HistoryDrawer
        opened={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        vendor={historyTarget}
        onDeleted={() => void load()}
      />
    </Stack>
  );
}
