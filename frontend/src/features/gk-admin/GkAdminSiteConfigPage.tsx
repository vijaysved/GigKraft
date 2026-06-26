import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Loader,
  NumberInput,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
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

import { getSiteConfig, updateSiteConfig, getTemplateProfile, updateTemplateProfile, type SiteConfigData, type TemplateProfileData } from "../../api/endpoints";

// ── types ──────────────────────────────────────────────────────────────────

type SiteConfig = SiteConfigData;

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

// ── Template profile editor ────────────────────────────────────────────────

function TemplateProfileEditor({ handle, label }: { handle: string; label: string }) {
  const [profile, setProfile] = useState<TemplateProfileData | null>(null);
  const [form, setForm] = useState<Partial<TemplateProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, [handle]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTemplateProfile(handle);
      setProfile(data);
      setForm(data);
    } catch {
      setError("Could not load template profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSavedAt(null);
    setError(null);
    try {
      const updated = await updateTemplateProfile(handle, form);
      setProfile(updated);
      setForm(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof TemplateProfileData>(key: K, value: TemplateProfileData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (loading) return <Loader size="sm" />;
  if (error && !profile) return <Alert color="red" icon={<IconAlertCircle size={14} />}>{error}</Alert>;
  if (!profile) return null;

  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={6}>{label}</Title>
            <Badge size="xs" variant="outline" color="violet">/pros/{handle}</Badge>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="dimmed" size="sm" onClick={() => void load()}>
              <IconRefresh size={14} />
            </ActionIcon>
            <ActionIcon
              component="a"
              href={`/pros/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="dimmed"
              size="sm"
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <SimpleGrid cols={2} spacing="sm">
          <TextInput
            label="Business name"
            value={form.business_name ?? ""}
            onChange={(e) => set("business_name", e.currentTarget.value)}
          />
          <TextInput
            label="Primary trade"
            value={form.primary_trade ?? ""}
            onChange={(e) => set("primary_trade", e.currentTarget.value)}
          />
        </SimpleGrid>

        <Textarea
          label="Bio"
          maxLength={500}
          autosize
          minRows={2}
          value={form.bio ?? ""}
          onChange={(e) => set("bio", e.currentTarget.value)}
          description={`${(form.bio ?? "").length}/500`}
        />

        <TagsInput
          label="Skill tags"
          value={form.skill_tags ?? []}
          onChange={(v) => set("skill_tags", v)}
          placeholder="Add a skill and press Enter"
          clearable
        />

        <SimpleGrid cols={3} spacing="sm">
          <NumberInput
            label="Response hours"
            value={form.response_hours ?? 4}
            min={1}
            max={72}
            onChange={(v) => set("response_hours", Number(v) || 4)}
          />
          <NumberInput
            label="Wallpaper ID"
            value={form.wallpaper_id ?? 0}
            min={0}
            onChange={(v) => set("wallpaper_id", Number(v) || 0)}
          />
        </SimpleGrid>

        <Group gap="xl">
          <Checkbox
            label="Licensed"
            checked={form.licensed ?? false}
            onChange={(e) => set("licensed", e.currentTarget.checked)}
          />
          <Checkbox
            label="Insured"
            checked={form.insured ?? false}
            onChange={(e) => set("insured", e.currentTarget.checked)}
          />
          <Checkbox
            label="Verified badge"
            checked={form.is_verified ?? false}
            onChange={(e) => set("is_verified", e.currentTarget.checked)}
          />
        </Group>

        {form.licensed && (
          <TextInput
            label="License number"
            value={form.license_number ?? ""}
            onChange={(e) => set("license_number", e.currentTarget.value)}
          />
        )}

        <Group>
          <Button size="xs" onClick={() => void handleSave()} loading={saving} leftSection={<IconCheck size={13} />}>
            Save
          </Button>
          {savedAt && <Text size="xs" c="green">Saved at {savedAt}</Text>}
          {error && <Text size="xs" c="red">{error}</Text>}
        </Group>
      </Stack>
    </Card>
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
      const data = await getSiteConfig();
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
      const updated = await updateSiteConfig(form);
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

      <Stack maw={720} gap="md">

        {/* Template profile editors */}
        <Title order={5}>Template Profile Content</Title>
        <Text size="xs" c="dimmed" mt={-8}>
          Edit the demo profiles that appear on the marketing comparison section. Seed them first
          with <code>python manage.py seed_template_profiles</code> if they don't exist yet.
        </Text>

        <TemplateProfileEditor handle="template-pro" label="Pro Demo Profile" />
        <TemplateProfileEditor handle="template-member" label="Member Demo Profile" />

        <Divider my="xs" />

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
