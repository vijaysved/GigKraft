import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {
  IconBrandWhatsapp,
  IconEdit,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  ApiError,
  createTemplate,
  createVendor,
  deleteTemplate,
  deleteCommunication,
  deleteVendor,
  listCommunications,
  listTemplates,
  listVendors,
  logCommunication,
  updateTemplate,
  updateVendor,
} from "../../api/endpoints";
import type {
  EmailTemplate,
  TemplateIn,
  VendorCommunication,
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

// ── Vendor Form Drawer ────────────────────────────────────────────────────────

function VendorDrawer({
  opened,
  onClose,
  vendor,
  onSaved,
}: {
  opened: boolean;
  onClose: () => void;
  vendor: VendorContact | null;
  onSaved: (v: VendorContact) => void;
}) {
  const [form, setForm] = useState<Partial<VendorIn>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setForm(
        vendor
          ? {
              contact_person: vendor.contact_person,
              business_name: vendor.business_name,
              category: vendor.category,
              lead_source: vendor.lead_source,
              phone: vendor.phone,
              email: vendor.email,
              nextdoor_profile_url: vendor.nextdoor_profile_url,
              status: vendor.status,
              preferred_channel: vendor.preferred_channel,
              notes: vendor.notes,
            }
          : { lead_source: "nextdoor", preferred_channel: "whatsapp", status: "new" }
      );
      setError(null);
    }
  }, [opened, vendor]);

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
      const saved = vendor
        ? await updateVendor(vendor.id, form)
        : await createVendor(form as VendorIn);
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={vendor ? `Edit ${vendor.vendor_id}` : "Add Vendor"}
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
        <Select
          label="Lead Source"
          data={LEAD_SOURCE_OPTIONS}
          value={form.lead_source ?? "nextdoor"}
          onChange={set("lead_source")}
        />
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
        <Select
          label="Status"
          data={STATUS_OPTIONS}
          value={form.status ?? "new"}
          onChange={set("status")}
        />
        <Select
          label="Preferred Channel"
          data={CHANNEL_OPTIONS}
          value={form.preferred_channel ?? "whatsapp"}
          onChange={set("preferred_channel")}
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
            {vendor ? "Save" : "Add Vendor"}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

// ── Communications Modal ──────────────────────────────────────────────────────

function CommModal({
  vendor,
  opened,
  onClose,
  templates,
}: {
  vendor: VendorContact | null;
  opened: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
}) {
  const [comms, setComms] = useState<VendorCommunication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("whatsapp");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (opened && vendor) {
      setComms(null);
      setError(null);
      listCommunications(vendor.id)
        .then(setComms)
        .catch(() => setError("Failed to load communications."));
    }
  }, [opened, vendor]);

  async function handleLog() {
    if (!vendor) return;
    setLogging(true);
    try {
      const comm = await logCommunication(vendor.id, {
        channel,
        template_id: templateId ? Number(templateId) : null,
        notes,
        advance_status: true,
      });
      setComms((prev) => (prev ? [comm, ...prev] : [comm]));
      setNotes("");
      setTemplateId(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to log.");
    } finally {
      setLogging(false);
    }
  }

  async function handleDeleteComm(commId: number) {
    if (!vendor) return;
    try {
      await deleteCommunication(vendor.id, commId);
      setComms((prev) => prev?.filter((c) => c.id !== commId) ?? null);
    } catch {
      setError("Failed to delete log entry.");
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={vendor ? `Communications — ${vendor.vendor_id} ${vendor.contact_person}` : ""}
      size="lg"
    >
      <Stack>
        {error && <Alert color="red">{error}</Alert>}

        <Card withBorder radius="sm" p="sm">
          <Stack gap="xs">
            <Text size="sm" fw={600}>Log Outreach</Text>
            <Group grow>
              <Select
                label="Channel"
                data={CHANNEL_OPTIONS}
                value={channel}
                onChange={(v) => setChannel(v ?? "whatsapp")}
              />
              <Select
                label="Template"
                placeholder="None"
                clearable
                data={templates.map((t) => ({ value: String(t.id), label: `[${t.kind}] ${t.name}` }))}
                value={templateId}
                onChange={setTemplateId}
              />
            </Group>
            <TextInput
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Group justify="flex-end">
              <Button size="xs" loading={logging} onClick={() => void handleLog()}>
                Log Contact
              </Button>
            </Group>
          </Stack>
        </Card>

        <Divider label="History" />

        {comms === null ? (
          <Loader size="sm" />
        ) : comms.length === 0 ? (
          <Text size="sm" c="dimmed">No outreach logged yet.</Text>
        ) : (
          <Stack gap="xs">
            {comms.map((c) => (
              <Card key={c.id} withBorder radius="sm" p="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Badge size="xs" color="blue">{c.channel}</Badge>
                      {c.template_name && (
                        <Text size="xs" c="dimmed">{c.template_name}</Text>
                      )}
                      <Text size="xs" c="dimmed">{new Date(c.sent_at).toLocaleDateString()}</Text>
                    </Group>
                    {c.notes && <Text size="xs">{c.notes}</Text>}
                  </Stack>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => void handleDeleteComm(c.id)}
                  >
                    <IconTrash size={12} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}

// ── Template Manager ──────────────────────────────────────────────────────────

function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [formOpen, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [form, setForm] = useState<Partial<TemplateIn>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setError("Failed to load templates."));
  }, []);

  function startNew() {
    setEditing(null);
    setForm({ kind: "intro", is_default: false });
    openForm();
  }

  function startEdit(t: EmailTemplate) {
    setEditing(t);
    setForm({ name: t.name, kind: t.kind, subject: t.subject, body: t.body, is_default: t.is_default });
    openForm();
  }

  async function handleSave() {
    if (!form.name?.trim() || !form.subject?.trim() || !form.body?.trim()) {
      setError("Name, subject, and body are required.");
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

  async function handleDelete(t: EmailTemplate) {
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

      <Group justify="flex-end">
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={startNew}>
          New Template
        </Button>
      </Group>

      {templates === null ? (
        <Loader size="sm" />
      ) : templates.length === 0 ? (
        <Text size="sm" c="dimmed">No templates yet.</Text>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Kind</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Default</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {templates.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td><Text size="sm" fw={500}>{t.name}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light">{t.kind}</Badge></Table.Td>
                <Table.Td><Text size="sm" lineClamp={1}>{t.subject}</Text></Table.Td>
                <Table.Td>
                  {t.is_default && <Badge size="xs" color="green">default</Badge>}
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon size="sm" variant="subtle" onClick={() => startEdit(t)}>
                      <IconEdit size={13} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => void handleDelete(t)}>
                      <IconTrash size={13} />
                    </ActionIcon>
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
        title={editing ? `Edit — ${editing.name}` : "New Template"}
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
          <TextInput
            label="Subject"
            required
            placeholder="Supports {{contact_person}}, {{business_name}}, {{category}}, {{vendor_id}}"
            value={form.subject ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <Textarea
            label="Body"
            required
            rows={8}
            placeholder="Use {{contact_person}}, {{business_name}}, etc."
            value={form.body ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeForm}>Cancel</Button>
            <Button loading={saving} onClick={() => void handleSave()}>
              {editing ? "Save" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// ── Main Vendors Page ─────────────────────────────────────────────────────────

export function GkAdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorContact[] | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editingVendor, setEditingVendor] = useState<VendorContact | null>(null);
  const [commVendor, setCommVendor] = useState<VendorContact | null>(null);
  const [commOpen, { open: openComm, close: closeComm }] = useDisclosure(false);

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setVendors(null);
    listVendors({
      status: statusFilter || undefined,
      source: sourceFilter || undefined,
      search: debouncedSearch || undefined,
    })
      .then((data) => { if (!cancelled) { setVendors(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load vendors."); });
    return () => { cancelled = true; };
  }, [statusFilter, sourceFilter, debouncedSearch]);

  function handleVendorSaved(v: VendorContact) {
    setVendors((prev) => {
      if (!prev) return [v];
      const idx = prev.findIndex((x) => x.id === v.id);
      return idx >= 0 ? prev.map((x) => (x.id === v.id ? v : x)) : [v, ...prev];
    });
  }

  async function handleDelete(v: VendorContact) {
    if (!confirm(`Delete ${v.vendor_id} ${v.contact_person}?`)) return;
    try {
      await deleteVendor(v.id);
      setVendors((prev) => prev?.filter((x) => x.id !== v.id) ?? null);
    } catch {
      setError("Failed to delete vendor.");
    }
  }

  function openEdit(v: VendorContact) {
    setEditingVendor(v);
    openDrawer();
  }

  function openNewVendor() {
    setEditingVendor(null);
    openDrawer();
  }

  function openCommLog(v: VendorContact) {
    setCommVendor(v);
    openComm();
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Vendor CRM</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      <Tabs defaultValue="vendors">
        <Tabs.List>
          <Tabs.Tab value="vendors">Vendors</Tabs.Tab>
          <Tabs.Tab value="templates">Email Templates</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vendors" pt="md">
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

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
                w={180}
              />
              <Button leftSection={<IconPlus size={14} />} onClick={openNewVendor}>
                Add Vendor
              </Button>
            </Group>

            <Card withBorder radius="md" padding="lg">
              {vendors === null ? (
                <Loader size="sm" />
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>ID</Table.Th>
                      <Table.Th>Contact / Business</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Contact</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {vendors.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <Text size="sm" c="dimmed">No vendors found.</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {vendors.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td>
                          <Text size="xs" c="dimmed" ff="monospace">{v.vendor_id}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm" fw={600}>{v.contact_person}</Text>
                            {v.business_name && (
                              <Text size="xs" c="dimmed">{v.business_name}</Text>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{v.category || "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" variant="outline">{v.lead_source}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" color={STATUS_COLORS[v.status] ?? "gray"}>
                            {v.status.replace(/_/g, " ")}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {v.last_contact_date ?? "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            {v.whatsapp_link && (
                              <Tooltip label="WhatsApp" withArrow>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="green"
                                  component="a"
                                  href={v.whatsapp_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconBrandWhatsapp size={14} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            {v.email_link && (
                              <Tooltip label="Email" withArrow>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="blue"
                                  component="a"
                                  href={v.email_link}
                                >
                                  <IconMail size={14} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Log communication" withArrow>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="violet"
                                onClick={() => openCommLog(v)}
                              >
                                <IconMessageCircle size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Edit" withArrow>
                              <ActionIcon size="sm" variant="subtle" onClick={() => openEdit(v)}>
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete" withArrow>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => void handleDelete(v)}
                              >
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
      </Tabs>

      <VendorDrawer
        opened={drawerOpen}
        onClose={closeDrawer}
        vendor={editingVendor}
        onSaved={handleVendorSaved}
      />

      <CommModal
        vendor={commVendor}
        opened={commOpen}
        onClose={closeComm}
        templates={templates}
      />
    </Stack>
  );
}
