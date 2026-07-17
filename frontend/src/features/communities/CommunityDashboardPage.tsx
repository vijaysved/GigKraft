import { Alert, Anchor, Avatar, Badge, Button, Center, FileButton, Group, Loader, Stack, Tabs, Text, Textarea, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBriefcase,
  IconChartBar,
  IconCheck,
  IconCreditCard,
  IconExternalLink,
  IconSettings,
  IconStar,
  IconUpload,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";
import { compressToDataUrl } from "../../hooks/useProAvatar";
import { resolveThemeId, type ThemeId } from "../../theme/themes";
import { AddMembersModal } from "./components/AddMembersModal";
import { CommunityAnalyticsPanel } from "./components/CommunityAnalyticsPanel";
import { CommunityBillingTab } from "./components/CommunityBillingTab";
import { CommunityProToggle } from "./components/CommunityProToggle";
import { MemberRosterTable } from "./components/MemberRosterTable";
import { PendingProRecommendationsPanel } from "./components/PendingProRecommendationsPanel";
import { PendingRatingsPanel } from "./components/PendingRatingsPanel";
import { communityFetch, useMyCommunity } from "./hooks/useCommunity";
import { useCommunityMembers } from "./hooks/useCommunityMembers";
import type { ManagedCommunityOut } from "./types";

/** Live availability check against GET /api/communities/check-slug — mirrors
 * the "editable, must stay unique" behavior of the backend's own re-check on save. */
function useSlugAvailability(slug: string, currentSlug: string) {
  const [debounced] = useDebouncedValue(slug, 400);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (!debounced || debounced === currentSlug) { setStatus("idle"); return; }
    let cancelled = false;
    setStatus("checking");
    communityFetch(`/api/communities/check-slug?slug=${encodeURIComponent(debounced)}`)
      .then((r) => r.json() as Promise<{ available: boolean }>)
      .then((data) => { if (!cancelled) setStatus(data.available ? "available" : "taken"); })
      .catch(() => { if (!cancelled) setStatus("idle"); });
    return () => { cancelled = true; };
  }, [debounced, currentSlug]);

  return status;
}

function SettingsTab({ community, onSaved }: { community: ManagedCommunityOut; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", description: "", cover_image_url: "", slug: "", theme: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const slugStatus = useSlugAvailability(form.slug, community.slug);

  useEffect(() => {
    setForm({
      name: community.name,
      description: community.description,
      cover_image_url: community.cover_image_url,
      slug: community.slug,
      theme: community.theme,
    });
  }, [community]);

  async function handleCoverFile(file: File | null) {
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) { setUploadError("Image files only (JPEG, PNG, WebP)."); return; }
    try {
      const dataUrl = await compressToDataUrl(file);
      setForm((f) => ({ ...f, cover_image_url: dataUrl }));
    } catch {
      setUploadError("Could not read image — try another file.");
    }
  }

  async function save() {
    if (slugStatus === "taken") return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await communityFetch("/api/me/community", { method: "PATCH", body: JSON.stringify(form) });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Could not save.");
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack gap="sm" maw={480}>
      <TextInput label="Community name" value={form.name}
        onChange={(e) => { const name = e.currentTarget.value; setForm((f) => ({ ...f, name })); }} />
      <Textarea label="Description" maxLength={200} value={form.description}
        onChange={(e) => { const description = e.currentTarget.value; setForm((f) => ({ ...f, description })); }} minRows={2} />

      <Stack gap={4}>
        <Text size="sm" fw={500}>Cover image</Text>
        <Group align="center" gap="sm">
          <Avatar src={form.cover_image_url || undefined} radius="md" size={48}>
            {!form.cover_image_url && <IconUpload size={18} />}
          </Avatar>
          <Stack gap={4} style={{ flex: 1 }}>
            <TextInput
              size="xs"
              placeholder="Paste an image URL…"
              value={form.cover_image_url}
              onChange={(e) => { const cover_image_url = e.currentTarget.value; setForm((f) => ({ ...f, cover_image_url })); }}
            />
            <FileButton onChange={(f) => void handleCoverFile(f)} accept="image/jpeg,image/png,image/webp">
              {(props) => (
                <Button {...props} size="xs" radius="xl" variant="light" leftSection={<IconUpload size={13} />} style={{ alignSelf: "flex-start" }}>
                  Upload From Device
                </Button>
              )}
            </FileButton>
          </Stack>
        </Group>
        {uploadError && <Text size="xs" c="red">{uploadError}</Text>}
      </Stack>

      <Text size="xs" c="dimmed" mt={-8}>
        Sets the color scheme visitors see on your Community's public page.
      </Text>
      <ThemeSettingsCard
        title="Community Theme"
        activeId={resolveThemeId(form.theme)}
        onSelect={(id: ThemeId) => setForm((f) => ({ ...f, theme: id }))}
      />

      <TextInput
        label={<Text size="sm">gigkraft.com/community/<b>{form.slug || "your-slug"}</b></Text>}
        description="Must be unique — change it whenever you like."
        value={form.slug}
        onChange={(e) => {
          const slug = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
          setForm((f) => ({ ...f, slug }));
        }}
        error={slugStatus === "taken" ? "That slug is already taken." : undefined}
        rightSection={
          slugStatus === "checking" ? <Loader size={13} />
          : slugStatus === "available" ? <IconCheck size={14} color="var(--mantine-color-green-6)" />
          : slugStatus === "taken" ? <IconX size={14} color="var(--mantine-color-red-6)" />
          : undefined
        }
      />
      <Text size="xs" c="dimmed">
        Share link: gigkraft.com/g/{community.short_code} ({community.short_link_click_count} clicks)
      </Text>
      {error && <Alert color="red" variant="light">{error}</Alert>}
      {saved && <Alert color="green" variant="light">Saved!</Alert>}
      <Button loading={saving} disabled={slugStatus === "taken"} size="xs" radius="xl"
        style={{ background: "var(--gk-accent-secondary)", color: "#fff", alignSelf: "flex-start" }} onClick={() => void save()}>
        Save Changes
      </Button>
    </Stack>
  );
}

export function CommunityDashboardPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "members";
  const { data: community, loading, notFound, refetch } = useMyCommunity();
  const { members, addMembers, uploadCsv, resendInvite, removeMember, setRole, approveMember, declineMember } = useCommunityMembers();
  const [addOpen, setAddOpen] = useState(false);
  const [pendingProCount, setPendingProCount] = useState(0);
  const pendingCount = members.filter((m) => m.status === "pending").length;

  // Fetched eagerly (independent of the "Pro List" tab being mounted) so the
  // tab's badge count is visible before the owner ever clicks into it —
  // otherwise a pending suggestion is easy to miss, same complaint as the
  // Members tab's badge already solves for pending member requests.
  useEffect(() => {
    if (!community) return;
    communityFetch("/api/me/community/pending-pro-recommendations")
      .then((res) => (res.ok ? res.json() as Promise<unknown[]> : []))
      .then((rows) => setPendingProCount(rows.length))
      .catch(() => {});
  }, [community]);

  // Only show the full-page loader on first load — not on every refetch()
  // after a save, which would otherwise unmount the Tabs and bounce the
  // user back to the first tab, wiping out whatever they were editing.
  if (loading && !community) return <Center h="60vh"><Loader /></Center>;

  const isReferrerRoute = location.pathname.startsWith("/us/");

  if (notFound || !community) {
    if (!isReferrerRoute) {
      return (
        <Center h="60vh">
          <Alert color="red" variant="light">You don't manage a Community.</Alert>
        </Center>
      );
    }
    return (
      <Center h="60vh">
        <Stack align="center" gap="md" maw={420} px="md">
          <Title order={3} ta="center">Start a Community Directory</Title>
          <Text ta="center" c="dimmed">
            A named, branded group directory for your neighborhood, congregation, or team — with its own
            roster of Members and a curated Pro List. $9.99/mo or $99.99/yr.
          </Text>
          <Button
            size="xs"
            radius="xl"
            style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
            onClick={() => navigate(`/us/${routeSlug}/community/checkout`)}
          >
            Start a Community — $9.99/mo
          </Button>
        </Stack>
      </Center>
    );
  }

  const isOwner = community.viewer_role === "owner";

  return (
    <>
      <Group gap="xs" wrap="wrap" mb="md">
        <Title order={3}>{community.name}</Title>
        <Anchor
          href={`/community/${community.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          View Public Page <IconExternalLink size={14} />
        </Anchor>
        {community.status === "archived" && <Badge color="gray">Archived</Badge>}
      </Group>

      <Tabs defaultValue={defaultTab} keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="members"
            leftSection={<IconUsers size={15} />}
            rightSection={pendingCount > 0 ? <Badge size="xs" circle color="yellow">{pendingCount}</Badge> : undefined}
          >
            Members
          </Tabs.Tab>
          <Tabs.Tab
            value="pros"
            leftSection={<IconBriefcase size={15} />}
            rightSection={pendingProCount > 0 ? <Badge size="xs" circle color="yellow">{pendingProCount}</Badge> : undefined}
          >
            Pro List
          </Tabs.Tab>
          <Tabs.Tab value="ratings" leftSection={<IconStar size={15} />}>Ratings</Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={15} />}>Analytics</Tabs.Tab>
          {isOwner && <Tabs.Tab value="settings" leftSection={<IconSettings size={15} />}>Settings</Tabs.Tab>}
          {isOwner && <Tabs.Tab value="billing" leftSection={<IconCreditCard size={15} />}>Billing</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="members">
          <Stack gap="md">
            {!community.is_read_only && (
              <Button size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff", alignSelf: "flex-start" }}
                onClick={() => setAddOpen(true)}>Add Members</Button>
            )}
            <MemberRosterTable
              members={members}
              viewerRole={community.viewer_role}
              onResend={(id) => void resendInvite(id).catch((e: Error) => alert(e.message))}
              onRemove={(id) => { if (confirm("Remove this member?")) void removeMember(id).catch((e: Error) => alert(e.message)); }}
              onSetRole={(id, role) => void setRole(id, role).catch((e: Error) => alert(e.message))}
              onApprove={(id) => void approveMember(id).catch((e: Error) => alert(e.message))}
              onDecline={(id) => void declineMember(id).catch((e: Error) => alert(e.message))}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="pros">
          <Stack gap="xl">
            <Stack gap="xs">
              <Text fw={700} size="sm">Suggested Pros Awaiting Approval</Text>
              <PendingProRecommendationsPanel onCountChange={setPendingProCount} />
            </Stack>
            <CommunityProToggle readOnly={community.is_read_only} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="ratings">
          <Stack gap="xs">
            <Text fw={700} size="sm">Pending Ratings</Text>
            <PendingRatingsPanel />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="analytics">
          <CommunityAnalyticsPanel />
        </Tabs.Panel>

        {isOwner && (
          <Tabs.Panel value="settings">
            <SettingsTab community={community} onSaved={refetch} />
          </Tabs.Panel>
        )}

        {isOwner && (
          <Tabs.Panel value="billing">
            <CommunityBillingTab communityName={community.name} onDowngraded={refetch} />
          </Tabs.Panel>
        )}
      </Tabs>

      <AddMembersModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        onAddManual={addMembers}
        onUploadCsv={uploadCsv}
      />
    </>
  );
}
