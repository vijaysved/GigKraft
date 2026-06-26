import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  FileButton,
  Group,
  Loader,
  Stack,
  Switch,
  Tabs,
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
  IconExternalLink,
  IconInbox,
  IconLock,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconUpload,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  return v.replace(/\D/g, "").length === 10;
}

const cardStyle: React.CSSProperties = {
  borderColor: "var(--gk-border)",
  boxShadow: "0 4px 14px -4px var(--gk-accent-secondary)",
};

const notifRowStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1.5px solid var(--gk-border)",
  boxShadow: "0 2px 8px -3px var(--gk-accent-secondary)",
};

const iconColor = { color: "var(--gk-accent-primary)" } satisfies React.CSSProperties;

function nativeBtn(opts: { primary?: boolean; small?: boolean; disabled?: boolean }): React.CSSProperties {
  const { primary = false, small = false, disabled = false } = opts;
  return {
    background: disabled ? "var(--gk-border)" : primary ? "var(--gk-accent-primary)" : "transparent",
    color: primary ? "#fff" : "var(--gk-accent-primary)",
    border: primary ? "none" : "1.5px solid var(--gk-accent-primary)",
    borderRadius: 99,
    padding: small ? "3px 12px" : "6px 20px",
    fontSize: small ? 11 : 13,
    fontWeight: 700,
    letterSpacing: "0.03em",
    cursor: disabled ? "default" : "pointer",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: "1.5",
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled || !primary
      ? "0 1px 3px rgba(0,0,0,0.06)"
      : "0 3px 10px -2px var(--gk-accent-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
    transition: "all 0.15s ease",
  };
}

export function ReferrerAccountPage() {
  const { user, updateUser } = useAuth();
  const avatarSrc = useProAvatar();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "account";

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(formatPhone(user?.phone ?? ""));
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const resetRef = useRef<() => void>(null);

  // Referrer profile
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [bio, setBio] = useState("");
  const [defaultZip, setDefaultZip] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Notifications
  const [dispatchEmail, setDispatchEmail] = useState(true);
  const [dispatchSms, setDispatchSms] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();
  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "R").toUpperCase();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Referrer";
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || avatarSrc) ?? undefined;

  useEffect(() => {
    if (user) {
      setFirstName((p) => p || user.first_name || "");
      setLastName((p) => p || user.last_name || "");
      setContactEmail((p) => p || user.email || "");
      setContactPhone((p) => p || formatPhone(user.phone ?? ""));
    }
  }, [user]);

  async function loadProfile() {
    setProfileLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me`, { headers: authHeaders() });
      if (r.ok) {
        const data = await r.json() as {
          profile: {
            slug: string; bio: string; default_zip: string;
            page_url: string; slug_locked: boolean;
            notify_email: boolean; notify_sms: boolean;
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
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => { void loadProfile(); }, []);

  function cancelEdit() {
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setContactEmail(user?.email ?? "");
    setContactPhone(formatPhone(user?.phone ?? ""));
    setEmailError(null);
    setPhoneError(null);
    setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setPhotoError(null);
    setShowPhotoPanel(false);
    setProfileError(null);
    setIsEditing(false);
  }

  function handleFileChange(file: File | null) {
    setPhotoError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setPhotoError("File too large — max 5 MB."); resetRef.current?.(); return; }
    if (!file.type.startsWith("image/")) { setPhotoError("JPEG, PNG, or WebP only."); resetRef.current?.(); return; }
    setPhotoFile(file);
    setPhotoUrl("");
    compressToDataUrl(file)
      .then((d) => setPhotoPreview(d))
      .catch(() => setPhotoError("Could not read image."));
  }

  async function handleUseGooglePhoto() {
    if (!googlePicUrl) return;
    setPhotoError(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/me/avatar-from-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: googlePicUrl }),
      });
      if (!res.ok) throw new Error("upload failed");
      const { avatar_url } = await res.json() as { avatar_url: string };
      saveAvatar(avatar_url);
      setPhotoPreview(avatar_url);
    } catch {
      saveAvatar(googlePicUrl);
    }
    setPhotoFile(null); setPhotoUrl(""); setPhotoError(null);
    resetRef.current?.();
    setShowPhotoPanel(false);
  }

  async function saveProfile() {
    let valid = true;
    if (contactEmail.trim() && !isValidEmail(contactEmail)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }
    if (contactPhone.trim() && !isValidPhone(contactPhone)) {
      setPhoneError("Enter a 10-digit phone number");
      valid = false;
    } else {
      setPhoneError(null);
    }
    if (!valid) return;

    setSaving(true);
    setProfileError(null);
    try {
      // Identity: name + phone
      const idRes = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: contactPhone.replace(/\D/g, "") || null,
        }),
      });
      if (idRes.ok) {
        updateUser({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: contactPhone.replace(/\D/g, "") || null,
        });
      }

      // Referrer profile: slug + bio + zip
      const profRes = await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          slug: slug.trim() || undefined,
          bio: bio.trim(),
          default_zip: defaultZip.trim(),
        }),
      });
      const profData = await profRes.json() as {
        detail?: string; suggestion?: string; page_url?: string; slug_locked?: boolean;
      };
      if (profRes.status === 409) {
        setProfileError(`Slug taken. Try: ${profData.suggestion ?? ""}`);
        return;
      }
      if (!profRes.ok) throw new Error(profData.detail ?? "Failed to save.");
      if (profData.page_url) setPageUrl(profData.page_url);
      if (profData.slug_locked) setSlugLocked(true);

      // Photo — upload file to server, get back a stable public URL
      if (photoFile) {
        const form = new FormData();
        form.append("file", photoFile);
        const token = getAccessToken();
        const uploadRes = await fetch(`${API_BASE_URL}/api/me/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (uploadRes.ok) {
          const { avatar_url } = await uploadRes.json() as { avatar_url: string };
          saveAvatar(avatar_url);
          // avatar_url already persisted server-side by the upload endpoint
        }
      } else if (photoPreview && !photoFile) {
        // photoPreview was already uploaded (e.g. Google photo — already a server URL)
        await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
          method: "PATCH", headers: authHeaders(),
          body: JSON.stringify({ avatar_url: photoPreview }),
        });
      }

      setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setShowPhotoPanel(false);
      setIsEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Error saving.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setNotifSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ notify_email: dispatchEmail, notify_sms: dispatchSms }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } finally {
      setNotifSaving(false);
    }
  }

  // ── Pro card view ────────────────────────────────────────────────────────
  function ProCardView() {
    return (
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="lg" align="flex-start">
            <Avatar
              size={88}
              src={liveAvatarSrc}
              color="teal"
              radius="md"
              style={{ border: "2.5px solid var(--gk-border)", flexShrink: 0 }}
            >
              {!liveAvatarSrc && initials}
            </Avatar>
            <Stack gap={5}>
              <Title order={3} style={{ lineHeight: 1.15 }}>{displayName}</Title>
              {bio ? (
                <Text size="sm" c="dimmed" fs="italic" style={{ maxWidth: 340, lineHeight: 1.5 }}>{bio}</Text>
              ) : (
                <Text size="sm" c="dimmed" fs="italic" style={{ opacity: 0.5 }}>No bio yet</Text>
              )}
              <Group gap={5} mt={2}>
                <Badge
                  size="sm"
                  variant="filled"
                  style={{
                    background: "var(--gk-accent-primary)", color: "#fff",
                    boxShadow: "0 2px 8px -1px var(--gk-accent-primary)",
                  }}
                >
                  Referrer
                </Badge>
              </Group>
            </Stack>
          </Group>

          <Tooltip label="Edit profile" withArrow>
            <ActionIcon
              variant="light"
              size="sm"
              radius="xl"
              style={{ color: "var(--gk-accent-primary)", borderColor: "var(--gk-border)", flexShrink: 0, marginTop: 2 }}
              onClick={() => setIsEditing(true)}
            >
              <IconPencil size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider style={{ borderColor: "var(--gk-border)" }} />

        <Stack gap={8}>
          <Group gap={10}>
            <IconMail size={14} style={iconColor} />
            <Text size="sm">{contactEmail || user?.email || "—"}</Text>
          </Group>
          <Group gap={10}>
            <IconPhone size={14} style={iconColor} />
            <Text size="sm">{contactPhone || (user?.phone ? formatPhone(user.phone) : "—")}</Text>
          </Group>
          <Group gap={10}>
            <IconMapPin size={14} style={iconColor} />
            <Text size="sm">{defaultZip || "No ZIP set"}</Text>
          </Group>
          {pageUrl && (
            <Group gap={10}>
              <IconExternalLink size={14} style={iconColor} />
              <Text
                size="sm"
                component="a"
                href={`https://gigkraft.com/us/${slug}/refer`}
                target="_blank"
                style={{ color: "var(--gk-accent-primary)", textDecoration: "none" }}
              >
                gigkraft.com/us/{slug}/refer
              </Text>
            </Group>
          )}
        </Stack>

        {saveOk && <Text size="xs" c="green" fw={600}>✓ Profile saved</Text>}
      </Stack>
    );
  }

  // ── Edit form ────────────────────────────────────────────────────────────
  function EditForm() {
    return (
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="md" align="flex-start" style={{ flex: 1 }}>

            {/* Avatar */}
            <div
              style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
              onClick={() => setShowPhotoPanel((v) => !v)}
            >
              <Avatar size={72} src={liveAvatarSrc} color="teal" radius="md"
                style={{ border: "2px solid var(--gk-border)" }}>
                {!liveAvatarSrc && initials}
              </Avatar>
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: 12,
                  background: "rgba(0,0,0,0.42)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
              >
                <IconCamera size={18} color="#fff" />
              </div>
            </div>

            <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
              {/* Name */}
              <Group gap="xs" wrap="nowrap">
                <TextInput size="xs" placeholder="First name" value={firstName}
                  onChange={(e) => setFirstName(e.currentTarget.value)} style={{ flex: 1 }} />
                <TextInput size="xs" placeholder="Last name" value={lastName}
                  onChange={(e) => setLastName(e.currentTarget.value)} style={{ flex: 1 }} />
              </Group>

              {/* Bio */}
              <Textarea size="xs" placeholder="Add a short bio…" value={bio}
                onChange={(e) => setBio(e.currentTarget.value)}
                minRows={2} autosize styles={{ input: { fontSize: 12 } }} />

              {/* Slug */}
              <TextInput
                size="xs"
                placeholder="your-slug"
                label={
                  <Text size="xs" c="dimmed">
                    gigkraft.com/us/<b>{slug || "YOUR-SLUG"}</b>/refer
                    {!slugLocked && <Text span size="xs" c="dimmed"> — editable once</Text>}
                  </Text>
                }
                value={slug}
                onChange={(e) => setSlug(e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={slugLocked}
                rightSection={slugLocked ? <IconLock size={12} style={iconColor} /> : undefined}
              />
            </Stack>
          </Group>

          <ActionIcon variant="subtle" size="sm" radius="xl" style={{ flexShrink: 0, marginTop: 2 }} onClick={cancelEdit}>
            <IconX size={13} />
          </ActionIcon>
        </Group>

        {/* Photo panel */}
        {showPhotoPanel && (
          <Card withBorder shadow="xs" radius="md" padding="sm" style={{ ...cardStyle, background: "var(--gk-bg-surface)" }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Update photo</Text>
                <ActionIcon size="xs" variant="subtle" onClick={() => setShowPhotoPanel(false)}>
                  <IconX size={12} />
                </ActionIcon>
              </Group>
              <Group gap="xs">
                <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp">
                  {(props) => (
                    <Button {...props} size="xs" radius="xl" variant="light" leftSection={<IconUpload size={13} />}>
                      Upload
                    </Button>
                  )}
                </FileButton>
                {googlePicUrl ? (
                  <Button size="xs" radius="xl" variant="light" color="gray"
                    leftSection={<IconBrandGoogle size={13} />}
                    onClick={() => void handleUseGooglePhoto()}>
                    Use Google photo
                  </Button>
                ) : (
                  <Tooltip label="Sign in with Google to use your Google profile photo" withArrow>
                    <Button size="xs" radius="xl" variant="light" color="gray"
                      leftSection={<IconBrandGoogle size={13} />} disabled>
                      Use Google photo
                    </Button>
                  </Tooltip>
                )}
                {(photoPreview || existingAvatar) && (
                  <Button size="xs" radius="xl" variant="subtle" color="red" onClick={() => {
                    setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); resetRef.current?.(); clearAvatar();
                  }}>
                    Remove
                  </Button>
                )}
              </Group>
              {photoError && <Text size="xs" c="red">{photoError}</Text>}
              {photoPreview && <Text size="xs" c="green">✓ {photoFile?.name ?? "Photo ready"} — click Save to apply</Text>}
            </Stack>
          </Card>
        )}

        <Divider style={{ borderColor: "var(--gk-border)" }} />

        {/* Contact fields */}
        <Stack gap="xs">
          <TextInput size="xs" leftSection={<IconMail size={13} style={iconColor} />}
            placeholder="Email address" value={contactEmail}
            onChange={(e) => { setContactEmail(e.currentTarget.value); setEmailError(null); }}
            error={emailError} />
          <TextInput size="xs" leftSection={<IconPhone size={13} style={iconColor} />}
            placeholder="(555) 123-4567" value={contactPhone}
            onChange={(e) => { setContactPhone(formatPhone(e.currentTarget.value)); setPhoneError(null); }}
            error={phoneError} />
          <TextInput size="xs" leftSection={<IconMapPin size={13} style={iconColor} />}
            placeholder="ZIP code" value={defaultZip}
            onChange={(e) => setDefaultZip(e.currentTarget.value)} />
        </Stack>

        {profileError && <Alert color="red" variant="light" py="xs">{profileError}</Alert>}

        <Group justify="flex-end" gap="xs">
          <button onClick={cancelEdit} style={nativeBtn({})}>Cancel</button>
          <button onClick={() => void saveProfile()} disabled={saving} style={nativeBtn({ primary: true, disabled: saving })}>
            {saving ? "Saving…" : "Save"}
          </button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md" maw={860}>
      <Group gap="xs" align="center">
        <IconUser size={22} style={{ color: "var(--gk-accent-primary)" }} />
        <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Account</Title>
      </Group>
      <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} mb="xs" />

      <Tabs value={activeTab} onChange={(v) => setSearchParams(v ? { tab: v } : {})} color="var(--gk-accent-primary)">
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab value="inbox" leftSection={<IconInbox size={15} />}
            style={{ color: activeTab === "inbox" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Inbox
          </Tabs.Tab>
          <Tabs.Tab value="account" leftSection={<IconUser size={15} />}
            style={{ color: activeTab === "account" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Account
          </Tabs.Tab>
        </Tabs.List>

        {/* ══ INBOX TAB ══ */}
        <Tabs.Panel value="inbox" pt="md">
          <Text size="sm" c="dimmed">No messages yet.</Text>
        </Tabs.Panel>

        {/* ══ ACCOUNT TAB ══ */}
        <Tabs.Panel value="account" pt="md">
          <Stack>
            {/* Business card */}
            {profileLoading ? (
              <Card withBorder radius="md" padding="lg" style={cardStyle}>
                <Center py="xl"><Loader size="sm" /></Center>
              </Card>
            ) : (
              <Card withBorder radius="md" padding="lg" style={cardStyle}>
                {isEditing ? EditForm() : ProCardView()}
              </Card>
            )}

            {/* Notifications */}
            <Card withBorder radius="md" padding="lg" style={cardStyle}>
              <Stack gap="md">
                <Group gap="xs">
                  <IconBell size={18} style={iconColor} />
                  <Title order={5}>Notifications</Title>
                </Group>

                <Group justify="space-between" align="center" p="sm" style={notifRowStyle}>
                  <Group gap="sm">
                    <IconMail size={16} style={iconColor} />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>Email alerts</Text>
                      <Text size="xs" c="dimmed">Get email for referral updates</Text>
                    </Stack>
                  </Group>
                  <Switch checked={dispatchEmail} onChange={(e) => setDispatchEmail(e.currentTarget.checked)} />
                </Group>

                <Group justify="space-between" align="center" p="sm" style={notifRowStyle}>
                  <Group gap="sm">
                    <IconPhone size={16} style={iconColor} />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>SMS alerts</Text>
                      <Text size="xs" c="dimmed">Text when someone follows or requests a referral</Text>
                    </Stack>
                  </Group>
                  <Switch checked={dispatchSms} onChange={(e) => setDispatchSms(e.currentTarget.checked)} />
                </Group>

                <button
                  onClick={() => void saveNotifications()}
                  disabled={notifSaving || notifSaved}
                  style={nativeBtn({ primary: true, disabled: notifSaving || notifSaved })}
                >
                  {notifSaved ? "✓ Saved!" : notifSaving ? "Saving…" : "Save preferences"}
                </button>
              </Stack>
            </Card>

            <ThemeSettingsCard />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
