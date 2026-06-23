import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

// ── types ──────────────────────────────────────────────────────────────────

interface ExtraUrl {
  label: string;
  url: string;
}

interface SiteConfig {
  template_pro_url_local: string;
  template_pro_url_prod: string;
  template_member_url_local: string;
  template_member_url_prod: string;
  extra_template_urls: ExtraUrl[];
  updated_at: string | null;
}

// ── API ────────────────────────────────────────────────────────────────────

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
      ...(init?.headers ?? {}),
    },
  });
}

async function fetchConfig(): Promise<SiteConfig> {
  const res = await authFetch("/api/gk-admin/site-config");
  if (!res.ok) throw new Error("Failed to load site configuration");
  return res.json() as Promise<SiteConfig>;
}

async function saveConfig(cfg: Omit<SiteConfig, "updated_at">): Promise<SiteConfig> {
  const res = await authFetch("/api/gk-admin/site-config", {
    method: "PUT",
    body: JSON.stringify(cfg),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? "Failed to save");
  }
  return res.json() as Promise<SiteConfig>;
}

// ── helpers ────────────────────────────────────────────────────────────────

function OpenLink({ url }: { url: string }) {
  if (!url) return null;
  return (
    <Tooltip label="Open in new tab">
      <ActionIcon
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        variant="subtle"
        color="dimmed"
        size="sm"
      >
        <IconExternalLink size={14} />
      </ActionIcon>
    </Tooltip>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function GkAdminSiteConfigPage() {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState<Omit<SiteConfig, "updated_at"> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoadError(null);
    try {
      const data = await fetchConfig();
      setCfg(data);
      setForm({
        template_pro_url_local: data.template_pro_url_local,
        template_pro_url_prod: data.template_pro_url_prod,
        template_member_url_local: data.template_member_url_local,
        template_member_url_prod: data.template_member_url_prod,
        extra_template_urls: data.extra_template_urls,
      });
    } catch {
      setLoadError("Could not load site configuration from the server.");
    }
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSavedAt(null);
    try {
      const updated = await saveConfig(form);
      setCfg(updated);
      setForm({
        template_pro_url_local: updated.template_pro_url_local,
        template_pro_url_prod: updated.template_pro_url_prod,
        template_member_url_local: updated.template_member_url_local,
        template_member_url_prod: updated.template_member_url_prod,
        extra_template_urls: updated.extra_template_urls,
      });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function addExtra() {
    setForm((f) => f ? { ...f, extra_template_urls: [...f.extra_template_urls, { label: "", url: "" }] } : f);
  }

  function removeExtra(index: number) {
    setForm((f) => f ? { ...f, extra_template_urls: f.extra_template_urls.filter((_, i) => i !== index) } : f);
  }

  function updateExtra(index: number, field: "label" | "url", value: string) {
    setForm((f) => {
      if (!f) return f;
      const updated = f.extra_template_urls.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...f, extra_template_urls: updated };
    });
  }

  if (loadError) return <Alert color="red" icon={<IconAlertCircle size={16} />}>{loadError}</Alert>;
  if (!form || !cfg) return <Loader size="sm" />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Site Config</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      <Text size="sm" c="dimmed" maw={600}>
        Template pro profile URLs used in marketing material and onboarding references. Set the
        correct handle for local dev and production. Changes take effect immediately after saving.
      </Text>

      <Stack maw={680} gap="md">

        {/* Template pro URLs */}
        <Card withBorder radius="md" padding="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={6}>Template Pro Profile URL</Title>
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconRefresh size={14} />}
                onClick={() => void load()}
              >
                Refresh
              </Button>
            </Group>

            <Text size="xs" c="dimmed">
              The "template" pro is the demo profile marketing pages link to. Set the local URL for
              development previews and the prod URL for the live site.
            </Text>

            {cfg.updated_at && (
              <Text size="xs" c="dimmed">Last saved: {new Date(cfg.updated_at).toLocaleString()}</Text>
            )}

            <Divider />

            <Group align="flex-end" gap="xs">
              <TextInput
                label="Local / dev URL"
                description="Used when running the frontend locally (localhost)"
                placeholder="http://localhost:5173/pros/handle"
                value={form.template_pro_url_local}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setForm((f) => f ? { ...f, template_pro_url_local: v } : f);
                }}
                style={{ flex: 1 }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <OpenLink url={form.template_pro_url_local} />
            </Group>

            <Group align="flex-end" gap="xs">
              <TextInput
                label="Production URL"
                description="Used on the live site (gigkraft.com)"
                placeholder="https://www.gigkraft.com/pros/handle"
                value={form.template_pro_url_prod}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setForm((f) => f ? { ...f, template_pro_url_prod: v } : f);
                }}
                style={{ flex: 1 }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <OpenLink url={form.template_pro_url_prod} />
            </Group>
          </Stack>
        </Card>

        {/* Template member URLs */}
        <Card withBorder radius="md" padding="md">
          <Stack gap="md">
            <Title order={6}>Template Free Member Profile URL</Title>

            <Text size="xs" c="dimmed">
              The "template" free member is the demo free-tier profile used in marketing and onboarding.
            </Text>

            <Group align="flex-end" gap="xs">
              <TextInput
                label="Local / dev URL"
                description="Used when running the frontend locally (localhost)"
                placeholder="http://localhost:5173/pros/handle"
                value={form.template_member_url_local}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setForm((f) => f ? { ...f, template_member_url_local: v } : f);
                }}
                style={{ flex: 1 }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <OpenLink url={form.template_member_url_local} />
            </Group>

            <Group align="flex-end" gap="xs">
              <TextInput
                label="Production URL"
                description="Used on the live site (gigkraft.com)"
                placeholder="https://www.gigkraft.com/pros/handle"
                value={form.template_member_url_prod}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setForm((f) => f ? { ...f, template_member_url_prod: v } : f);
                }}
                style={{ flex: 1 }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <OpenLink url={form.template_member_url_prod} />
            </Group>
          </Stack>
        </Card>

        {/* Extra template URLs */}
        <Card withBorder radius="md" padding="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={6}>Additional Template URLs</Title>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={addExtra}
              >
                Add URL
              </Button>
            </Group>

            <Text size="xs" c="dimmed">
              Any other named pages you want to track as marketing reference points (e.g. a demo
              homeowner profile, a specific landing page, etc.).
            </Text>

            {form.extra_template_urls.length === 0 && (
              <Text size="sm" c="dimmed">No additional URLs configured.</Text>
            )}

            {form.extra_template_urls.map((item, i) => (
              <Group key={i} align="flex-end" gap="xs">
                <TextInput
                  label={i === 0 ? "Label" : undefined}
                  placeholder="e.g. Home demo"
                  value={item.label}
                  onChange={(e) => updateExtra(i, "label", e.currentTarget.value)}
                  style={{ flex: "0 0 160px" }}
                />
                <TextInput
                  label={i === 0 ? "URL" : undefined}
                  placeholder="https://..."
                  value={item.url}
                  onChange={(e) => updateExtra(i, "url", e.currentTarget.value)}
                  style={{ flex: 1 }}
                  styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
                />
                <OpenLink url={item.url} />
                <Tooltip label="Remove">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeExtra(i)}
                    mb={i === 0 ? 0 : undefined}
                  >
                    <IconTrash size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ))}
          </Stack>
        </Card>

        <Group>
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            leftSection={<IconCheck size={16} />}
          >
            Save configuration
          </Button>
        </Group>

        {saveError && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />}>
            {saveError}
          </Alert>
        )}
        {savedAt && (
          <Alert color="green" variant="light" icon={<IconCheck size={14} />}>
            Saved at {savedAt}
          </Alert>
        )}
      </Stack>
    </Stack>
  );
}
