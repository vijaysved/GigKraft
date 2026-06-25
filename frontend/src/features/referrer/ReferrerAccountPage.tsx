import {
  Alert,
  Avatar,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";
import type { ReferrerProfileOut } from "./types";
import { InviteFriendModal } from "./components/InviteFriendModal";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function ReferrerAccountPage() {
  const [profile, setProfile] = useState<ReferrerProfileOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [defaultZip, setDefaultZip] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inviteFriendOpen, setInviteFriendOpen] = useState(false);

  async function load() {
    const r = await fetch(`${API_BASE_URL}/api/referrer/me`, { headers: authHeaders() });
    if (r.ok) {
      const data = await r.json() as { profile: ReferrerProfileOut };
      setProfile(data.profile);
      setSlug(data.profile.slug);
      setBio(data.profile.bio);
      setDefaultZip(data.profile.default_zip);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ slug: slug.trim() || undefined, bio: bio.trim(), default_zip: defaultZip.trim() }),
      });
      const data = await r.json() as { detail?: string; suggestion?: string };
      if (r.status === 409) {
        setSaveError(`That slug is taken. Try: ${data.suggestion ?? ""}`);
        return;
      }
      if (!r.ok) throw new Error(data.detail ?? "Failed to save.");
      setSaveSuccess(true);
      load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Center h="60vh"><Loader /></Center>;

  return (
    <Stack gap="lg" p="md" maw={560}>
      <Title order={3}>Account settings</Title>

      <Stack gap="sm">
        <Title order={5}>Page settings</Title>
        <TextInput
          label="Your page URL slug"
          description={`gigkraft.com/us/${slug || "your-name"}/refer`}
          placeholder="your-name"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        />
        <Textarea
          label="Bio"
          placeholder="I've lived in Austin for 15 years and know every reliable trade in town…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          minRows={3}
        />
        <TextInput
          label="Default ZIP code"
          placeholder="78701"
          value={defaultZip}
          onChange={(e) => setDefaultZip(e.target.value)}
        />
        {saveError && <Alert color="red" variant="light">{saveError}</Alert>}
        {saveSuccess && <Alert color="teal" variant="light">Saved!</Alert>}
        <Button radius="xl" loading={saving} onClick={handleSave}>Save changes</Button>
      </Stack>

      <Divider />

      <Stack gap="sm">
        <Title order={5}>Invite friends</Title>
        <Text size="sm" c="dimmed">
          Send friends a link to your referral page so they can follow you and request referrals.
        </Text>
        <Button
          radius="xl"
          variant="outline"
          onClick={() => setInviteFriendOpen(true)}
        >
          Invite friends
        </Button>
      </Stack>

      <InviteFriendModal opened={inviteFriendOpen} onClose={() => setInviteFriendOpen(false)} />
    </Stack>
  );
}
