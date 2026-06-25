import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  FileButton,
  Grid,
  Group,
  Loader,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconBrandGoogle,
  IconCamera,
  IconCheck,
  IconExternalLink,
  IconLock,
  IconPencil,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";
import { getAccessToken } from "../../api/tokens";
import { API_BASE_URL } from "../../config";
import {
  clearAvatar,
  compressToDataUrl,
  loadAvatar,
  loadGooglePictureUrl,
  saveAvatar,
  useProAvatar,
} from "../../hooks/useProAvatar";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const gradientBtn: React.CSSProperties = {
  background: "var(--gk-brand-gradient)",
  border: "none",
  color: "#fff",
};

export function ReferrerAccountPage() {
  const { user, updateUser } = useAuth();
  const avatarSrc = useProAvatar();

  // Identity edit state
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  // Profile Info (formerly "Referrer page")
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [bio, setBio] = useState("");
  const [defaultZip, setDefaultZip] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Notifications — email on by default
  const [dispatchEmail, setDispatchEmail] = useState(true);
  const [dispatchSms, setDispatchSms] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();
  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? user?.phone?.[0] ?? "R").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Referrer";
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || avatarSrc) ?? undefined;

  useEffect(() => {
    if (user && !editing) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
    }
  }, [user, editing]);

  async function loadProfile() {
    setProfileLoading(true);
    const r = await fetch(`${API_BASE_URL}/api/referrer/me`, { headers: authHeaders() });
    if (r.ok) {
      const data = await r.json() as {
        profile: {
          slug: string;
          bio: string;
          default_zip: string;
          page_url: string;
          slug_locked: boolean;
          notify_email: boolean;
          notify_sms: boolean;
        };
      };
      setSlug(data.profile.slug);
      setBio(data.profile.bio);
      setDefaultZip(data.profile.default_zip);
      setPageUrl(data.profile.page_url);
      setSlugLocked(data.profile.slug_locked);
      setDispatchEmail(data.profile.notify_email);
      setDispatchSms(data.profile.notify_sms);
    }
    setProfileLoading(false);
  }

  useEffect(() => { loadProfile(); }, []);

  function handleFileChange(file: File | null) {
    setPhotoError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File too large — max 5 MB.");
      resetRef.current?.();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a JPEG, PNG, or WebP image.");
      resetRef.current?.();
      return;
    }
    setPhotoFile(file);
    setPhotoUrl("");
    compressToDataUrl(file)
      .then((d) => setPhotoPreview(d))
      .catch(() => setPhotoError("Could not read image — try another file."));
  }

  function handleUseGooglePhoto() {
    if (!googlePicUrl) return;
    saveAvatar(googlePicUrl);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    setPhotoError(null);
    resetRef.current?.();
    setEditing(false);
    void fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ avatar_url: googlePicUrl }),
    });
  }

  function handleCancelEdit() {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    setPhotoError(null);
    resetRef.current?.();
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
  }

  async function handleSaveIdentity() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken() ?? ""}` },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });
      if (res.ok) updateUser({ first_name: firstName.trim(), last_name: lastName.trim() });

      const urlTrimmed = photoUrl.trim();
      if (photoPreview) {
        saveAvatar(photoPreview);
      } else if (urlTrimmed) {
        saveAvatar(urlTrimmed);
        await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ avatar_url: urlTrimmed }),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoUrl("");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          slug: slug.trim() || undefined,
          bio: bio.trim(),
          default_zip: defaultZip.trim(),
        }),
      });
      const data = await r.json() as { detail?: string; suggestion?: string; page_url?: string; slug_locked?: boolean };
      if (r.status === 409) {
        setProfileError(`Slug already taken. Try: ${data.suggestion ?? ""}`);
        return;
      }
      if (!r.ok) throw new Error(data.detail ?? "Failed to save.");
      if (data.page_url) setPageUrl(data.page_url);
      if (data.slug_locked) setSlugLocked(true);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Error saving profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveNotifications() {
    setNotifSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ notify_email: dispatchEmail, notify_sms: dispatchSms }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } finally {
      setNotifSaving(false);
    }
  }

  return (
    <Stack>
      <Group gap="xs" align="center">
        <IconUser size={22} style={{ color: "var(--gk-accent-primary)" }} />
        <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Your Account</Title>
      </Group>

      {/* Identity card — contact info always visible */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        {!editing ? (
          <Group justify="space-between" wrap="nowrap" align="center">
            <Group gap="md">
              <Avatar size={64} src={avatarSrc ?? undefined} color="teal" radius="xl">
                {!avatarSrc && initials}
              </Avatar>
              <Stack gap={2}>
                <Text fw={700} size="lg">{displayName}</Text>
                {user?.email && <Text size="sm" c="dimmed">{user.email}</Text>}
                {user?.phone && <Text size="sm" c="dimmed">{user.phone}</Text>}
                <Badge size="sm" variant="light" color="teal">Referrer</Badge>
              </Stack>
            </Group>
            <Tooltip label="Edit profile" withArrow>
              <ActionIcon variant="subtle" onClick={() => setEditing(true)}>
                <IconPencil size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : (
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              {/* Avatar with camera overlay */}
              <Stack align="center" gap={4} style={{ flexShrink: 0 }}>
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <Avatar size={80} src={liveAvatarSrc} color="teal" radius="xl">
                    {!liveAvatarSrc && initials}
                  </Avatar>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "var(--mantine-radius-xl)",
                    background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center",
                    justifyContent: "center", pointerEvents: "none",
                  }}>
                    <IconCamera size={18} color="#fff" />
                  </div>
                </div>
                {(photoPreview || photoUrl || existingAvatar) && (
                  <Button size="xs" variant="subtle" color="red" onClick={() => {
                    setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); resetRef.current?.(); clearAvatar();
                  }}>
                    Remove
                  </Button>
                )}
              </Stack>

              {/* Name inputs + contact info */}
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group gap="xs" wrap="nowrap">
                  <TextInput
                    size="sm"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <TextInput
                    size="sm"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                </Group>
                {user?.email && <Text size="sm" c="dimmed">{user.email}</Text>}
                {user?.phone && <Text size="sm" c="dimmed">{user.phone}</Text>}
              </Stack>

              <Group gap={4} style={{ flexShrink: 0 }}>
                <Button
                  size="xs"
                  loading={saving}
                  leftSection={saved ? <IconCheck size={13} /> : undefined}
                  onClick={() => void handleSaveIdentity()}
                  style={gradientBtn}
                >
                  {saved ? "Saved!" : "Done"}
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={handleCancelEdit}>Cancel</Button>
              </Group>
            </Group>

            {/* Photo options */}
            <Card withBorder shadow="xs" radius="md" padding="sm" style={{ background: "var(--gk-bg-surface)" }}>
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                  Update photo
                </Text>
                <Group gap="xs">
                  <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp">
                    {(props) => (
                      <Button {...props} size="sm" radius="xl" variant="light" leftSection={<IconUpload size={15} />}>
                        Upload from device
                      </Button>
                    )}
                  </FileButton>
                  {googlePicUrl && (
                    <Button size="sm" radius="xl" variant="light" color="gray" leftSection={<IconBrandGoogle size={15} />} onClick={handleUseGooglePhoto}>
                      Use Google photo
                    </Button>
                  )}
                </Group>
                {photoError && <Text size="xs" c="red">{photoError}</Text>}
                {(photoPreview || photoUrl) && (
                  <Text size="xs" c="green">✓ {photoFile ? photoFile.name : "Google photo"} — will save on Done</Text>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </Card>

      {/* Referrer page URL — prominent standalone row */}
      {!profileLoading && slug && (
        <Card withBorder shadow="sm" radius="md" padding="md">
          <Group justify="space-between" wrap="nowrap" align="center">
            <Stack gap={2}>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Your referrer page</Text>
              <Group gap={6} align="center">
                <Text size="sm" fw={500}>gigkraft.com/us/{slug}/refer</Text>
                {slugLocked && <IconLock size={13} style={{ color: "var(--gk-accent-primary)" }} />}
              </Group>
            </Stack>
            <Button
              size="sm"
              radius="xl"
              component="a"
              href={`https://gigkraft.com/us/${slug}/refer`}
              target="_blank"
              leftSection={<IconExternalLink size={14} />}
              style={gradientBtn}
            >
              Visit page
            </Button>
          </Group>
        </Card>
      )}

      {/* Profile Info (half-width) */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" radius="md" padding="lg" h="100%">
            <Stack gap="md">
              <Group gap="xs">
                <IconUser size={18} style={{ color: "var(--gk-accent-primary)" }} />
                <Title order={5}>Profile Info</Title>
              </Group>

              {profileLoading ? (
                <Center py="md"><Loader size="sm" /></Center>
              ) : (
                <>
                  <TextInput
                    label="Your page slug"
                    description={slugLocked ? "Slug is locked — cannot be changed" : "gigkraft.com/us/YOUR-SLUG/refer — editable once"}
                    placeholder="your-name"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    disabled={slugLocked}
                    rightSection={slugLocked ? <IconLock size={14} style={{ color: "var(--gk-accent-primary)" }} /> : undefined}
                  />
                  <Textarea
                    label="Bio"
                    description="Shown at the top of your referrer page"
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
                  {profileError && <Alert color="red" variant="light">{profileError}</Alert>}
                  <Button
                    radius="xl"
                    loading={profileSaving}
                    leftSection={profileSaved ? <IconCheck size={14} /> : undefined}
                    onClick={() => void handleSaveProfile()}
                    style={gradientBtn}
                  >
                    {profileSaved ? "Saved!" : "Save profile"}
                  </Button>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Notifications */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        <Stack>
          <Group gap="xs">
            <IconBell size={18} style={{ color: "var(--gk-accent-primary)" }} />
            <Title order={5}>Notifications</Title>
          </Group>
          <Switch
            label="Email alerts"
            description="Get email for referral updates"
            checked={dispatchEmail}
            onChange={(e) => setDispatchEmail(e.currentTarget.checked)}
          />
          <Switch
            label="SMS alerts"
            description="Get a text when someone follows your page or requests a referral"
            checked={dispatchSms}
            onChange={(e) => setDispatchSms(e.currentTarget.checked)}
          />
          <Group>
            <Button
              radius="xl"
              size="sm"
              loading={notifSaving}
              leftSection={notifSaved ? <IconCheck size={14} /> : undefined}
              onClick={() => void handleSaveNotifications()}
              style={gradientBtn}
            >
              {notifSaved ? "Saved!" : "Save preferences"}
            </Button>
          </Group>
        </Stack>
      </Card>

      <ThemeSettingsCard />
    </Stack>
  );
}
