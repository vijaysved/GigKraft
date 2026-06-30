import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  FileButton,
  Group,
  Loader,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconBrandGoogle,
  IconCamera,
  IconCheck,
  IconExternalLink,
  IconFileText,
  IconHelp,
  IconLock,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconSettings,
  IconUpload,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";
import { FaqContent } from "../../components/marketing/FaqContent";
import { TermsContent } from "../../components/marketing/TermsContent";
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

/** Auto-formats digits into (XXX) XXX-XXXX as user types */
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

function rolePill(active: boolean, clickable: boolean): React.CSSProperties {
  return {
    background: active ? "var(--gk-accent-primary)" : "rgba(0,0,0,0.04)",
    color: active ? "#fff" : "var(--gk-text-muted)",
    border: active ? "none" : "1.5px solid var(--gk-border)",
    borderRadius: 99,
    padding: "3px 13px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: clickable ? "pointer" : "default",
    outline: "none",
    lineHeight: "1.5",
    boxShadow: active
      ? "0 2px 8px -1px var(--gk-accent-primary), inset 0 1px 0 rgba(255,255,255,0.2)"
      : "0 1px 3px rgba(0,0,0,0.06)",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  };
}

export function HomeAccountPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

  const avatarSrc = useProAvatar();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [defaultZip, setDefaultZip] = useState("");
  const [bio, setBio] = useState("");

  // Saved (server) copies used to restore on cancel
  const savedPhone = useRef("");
  const savedZip = useRef("");
  const savedBio = useRef("");

  // Referrer is always on; isHomeowner = optional add-on role
  const [isHomeowner, setIsHomeowner] = useState(
    user?.role === "homeowner",
  );

  const [publicPageUrl, setPublicPageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const savedSlug = useRef("");
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const resetRef = useRef<() => void>(null);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Member";
  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "M").toUpperCase();
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || avatarSrc || googlePicUrl) ?? undefined;
  const isPro = user?.role === "pro";

  useEffect(() => {
    if (user) {
      setFirstName((p) => p || user.first_name || "");
      setLastName((p) => p || user.last_name || "");
      setContactEmail((p) => p || user.email || "");
      setContactPhone((p) => p || formatPhone(user.phone ?? ""));
      setIsHomeowner(user.role === "homeowner");
    }
  }, [user]);

  function loadNotifFromStorage() {
    const saved = localStorage.getItem("gk.home.notif");
    if (!saved) return;
    try {
      const p = JSON.parse(saved) as { email?: boolean; sms?: boolean; inApp?: boolean };
      if (p.email !== undefined) setNotifyEmail(p.email);
      if (p.sms !== undefined) setNotifySms(p.sms);
      if (p.inApp !== undefined) setNotifyInApp(p.inApp);
    } catch {}
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home/account`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data: Record<string, unknown> | null) => {
        if (!data) return;
        if (data.phone) {
          const f = formatPhone(data.phone as string);
          setContactPhone((p) => p || f);
          savedPhone.current = f;
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/referrer/me`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { profile?: { slug?: string; bio?: string; default_zip?: string; slug_locked?: boolean } } | null) => {
        const p = data?.profile;
        if (!p) return;
        if (p.slug) {
          setSlug(p.slug);
          savedSlug.current = p.slug;
          setPublicPageUrl(`https://gigkraft.com/us/${p.slug}/refer`);
        }
        setSlugLocked(p.slug_locked ?? false);
        if (p.bio) { setBio(p.bio); savedBio.current = p.bio; }
        if (p.default_zip) { setDefaultZip(p.default_zip); savedZip.current = p.default_zip; }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/me/notif-prefs`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data: Record<string, boolean> | null) => {
        if (data) {
          if (data.email_alerts !== undefined) setNotifyEmail(data.email_alerts);
          if (data.sms_alerts !== undefined) setNotifySms(data.sms_alerts);
          if (data.in_app_alerts !== undefined) setNotifyInApp(data.in_app_alerts);
        } else {
          loadNotifFromStorage();
        }
      })
      .catch(() => loadNotifFromStorage());
  }, []);

  function cancelEdit() {
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setContactEmail(user?.email ?? "");
    setContactPhone(savedPhone.current || formatPhone(user?.phone ?? ""));
    setBio(savedBio.current);
    setDefaultZip(savedZip.current);
    setSlug(savedSlug.current);
    setSlugError(null);
    setIsHomeowner(user?.role === "homeowner");
    setEmailError(null);
    setPhoneError(null);
    setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setPhotoError(null);
    setShowPhotoPanel(false);
    setIsEditing(false);
  }

  function handleSlugChange(raw: string) {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugError(null);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (clean.length < 3 || clean === savedSlug.current) { setSlugChecking(false); return; }
    setSlugChecking(true);
    slugTimer.current = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/referrer/check-slug?slug=${encodeURIComponent(clean)}`)
        .then((r) => r.json())
        .then((d: { available: boolean; suggestion: string | null }) => {
          if (!d.available) setSlugError(`Taken${d.suggestion ? ` — try "${d.suggestion}"` : ""}`);
        })
        .catch(() => {})
        .finally(() => setSlugChecking(false));
    }, 600);
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
    // Validate
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
    try {
      const newRole = isHomeowner ? "homeowner" : "referrer";
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: contactPhone.replace(/\D/g, "") || null,
          ...(newRole !== user?.role ? { role: newRole } : {}),
        }),
      });
      if (res.ok) {
        updateUser({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: contactPhone.replace(/\D/g, "") || null,
          ...(newRole !== user?.role ? { role: newRole } : {}),
        });
      }

      const profBody: Record<string, string> = { bio: bio.trim(), default_zip: defaultZip.trim() };
      if (slug.trim() && slug.trim() !== savedSlug.current) profBody.slug = slug.trim();
      const profRes = await fetch(`${API_BASE_URL}/api/referrer/me/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(profBody),
      });
      if (profRes.status === 409) {
        const err = await profRes.json() as { detail?: string; suggestion?: string };
        setSlugError(`Taken${err.suggestion ? ` — try "${err.suggestion}"` : ""}`);
        setSaving(false);
        return;
      }
      if (!profRes.ok) {
        setSaving(false);
        return;
      }
      const profData = await profRes.json() as {
        slug?: string; slug_locked?: boolean; bio?: string; default_zip?: string;
      };
      if (profData.slug) {
        setSlug(profData.slug);
        savedSlug.current = profData.slug;
        setPublicPageUrl(`https://gigkraft.com/us/${profData.slug}/refer`);
      }
      if (profData.slug_locked) setSlugLocked(true);
      const savedB = profData.bio ?? bio.trim();
      const savedZ = profData.default_zip ?? defaultZip.trim();
      setBio(savedB); savedBio.current = savedB;
      setDefaultZip(savedZ); savedZip.current = savedZ;

      const urlTrimmed = photoUrl.trim();
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
        }
      } else if (photoPreview && !photoFile) {
        // photoPreview is already a server URL (from Google photo upload)
        await fetch(`${API_BASE_URL}/api/home/profile`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ avatar_url: photoPreview }),
        });
      } else if (urlTrimmed) {
        saveAvatar(urlTrimmed);
        await fetch(`${API_BASE_URL}/api/home/profile`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ avatar_url: urlTrimmed }),
        });
      }

      savedPhone.current = formatPhone(contactPhone);

      setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setShowPhotoPanel(false);
      setIsEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    localStorage.setItem("gk.home.notif", JSON.stringify({ email: notifyEmail, sms: notifySms, inApp: notifyInApp }));
    try {
      await fetch(`${API_BASE_URL}/api/me/notif-prefs`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ email_alerts: notifyEmail, sms_alerts: notifySms, in_app_alerts: notifyInApp }),
      });
    } catch {}
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  }

  return (
    <Stack maw={860}>
      <Tabs value={activeTab} onChange={(v) => setSearchParams(v ? { tab: v } : {})} color="var(--gk-accent-primary)">
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab value="profile" leftSection={<IconUser size={15} />}>Profile</Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={15} />}>Settings</Tabs.Tab>
          <Tabs.Tab value="terms" leftSection={<IconFileText size={15} />}>Terms</Tabs.Tab>
          <Tabs.Tab value="faq" leftSection={<IconHelp size={15} />}>FAQ</Tabs.Tab>
        </Tabs.List>

        {/* ══════════════════ PROFILE TAB ══════════════════ */}
        <Tabs.Panel value="profile" pt="md">
          <Card withBorder radius="md" p={isEditing ? "lg" : "sm"} style={{ ...cardStyle, maxWidth: "50%" }}>
            {!isEditing ? (
              /* ── Pro card view — mirrors ReferrerProCard layout ── */
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Avatar size={80} src={liveAvatarSrc} color="teal" radius="xl"
                  style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)", borderRadius: "50%" }}>
                  {!liveAvatarSrc && initials}
                </Avatar>

                <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={4} justify="space-between" wrap="nowrap" align="flex-start">
                    <Group gap={4} align="center" style={{ minWidth: 0, overflow: "hidden" }}>
                      <Text fw={700} size="sm"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                      </Text>
                      {publicPageUrl && (
                        <Tooltip label="View public page" withArrow>
                          <ActionIcon
                            component="a"
                            href={publicPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="subtle"
                            size="xs"
                            style={{ color: "var(--gk-accent-primary)", flexShrink: 0 }}
                          >
                            <IconExternalLink size={13} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                    <Group gap={4} style={{ flexShrink: 0 }} align="center">
                      {isPro
                        ? <Badge size="xs" variant="light" color="blue">Pro</Badge>
                        : (
                          <Group gap={4}>
                            <span style={rolePill(true, false)}>Referrer</span>
                            {isHomeowner && <span style={rolePill(true, false)}>Homeowner</span>}
                          </Group>
                        )
                      }
                      {saveOk && <Text size="xs" c="green" fw={600}>✓</Text>}
                      <Tooltip label="Edit profile" withArrow>
                        <ActionIcon variant="light" size="xs" radius="xl"
                          style={{ color: "var(--gk-accent-primary)", borderColor: "var(--gk-border)" }}
                          onClick={() => setIsEditing(true)}>
                          <IconPencil size={11} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {bio && (
                    <Text size="xs" fs="italic" c="dimmed" lineClamp={1}>{bio}</Text>
                  )}

                  <Stack gap={1} mt={2}>
                    <Group gap={4}>
                      <IconPhone size={11} style={iconColor} />
                      <Text size="xs">{contactPhone || (user?.phone ? formatPhone(user.phone) : "—")}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconMail size={11} style={iconColor} />
                      <Text size="xs">{contactEmail || user?.email || "—"}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconMapPin size={11} style={iconColor} />
                      <Text size="xs">{defaultZip || "—"}</Text>
                    </Group>
                    {publicPageUrl && (
                      <Group gap={4}>
                        <IconExternalLink size={11} style={iconColor} />
                        <Text
                          size="xs"
                          component="a"
                          href={publicPageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--gk-accent-primary)", textDecoration: "none" }}
                        >
                          gigkraft.com/us/{slug}/refer
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Stack>
              </Group>
            ) : (
              /* ── Edit form ── */
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                      onClick={() => setShowPhotoPanel((v) => !v)}>
                      <Avatar size={72} src={liveAvatarSrc} color="teal" radius="md"
                        style={{ border: "2px solid var(--gk-border)" }}>
                        {!liveAvatarSrc && initials}
                      </Avatar>
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: 12,
                        background: "rgba(0,0,0,0.42)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: "opacity 0.15s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}>
                        <IconCamera size={18} color="#fff" />
                      </div>
                    </div>
                    <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" wrap="nowrap">
                        <TextInput size="xs" placeholder="First name" value={firstName}
                          onChange={(e) => setFirstName(e.currentTarget.value)} style={{ flex: 1 }} />
                        <TextInput size="xs" placeholder="Last name" value={lastName}
                          onChange={(e) => setLastName(e.currentTarget.value)} style={{ flex: 1 }} />
                      </Group>
                      <Textarea size="xs" placeholder="Add a short bio…" value={bio}
                        onChange={(e) => setBio(e.currentTarget.value)}
                        maxLength={300} minRows={2} autosize styles={{ input: { fontSize: 12 } }} />

                      {/* Slug row */}
                      {slugLocked ? (
                        <Group gap={5} align="center">
                          <IconLock size={11} style={iconColor} />
                          <Text
                            size="xs"
                            component="a"
                            href={publicPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--gk-accent-primary)" }}
                          >
                            gigkraft.com/us/{slug}/refer
                          </Text>
                          <Text size="xs" c="dimmed">(locked)</Text>
                        </Group>
                      ) : (
                        <TextInput
                          size="xs"
                          placeholder="your-page-slug"
                          description={slug.length >= 3 && !slugError ? `gigkraft.com/us/${slug}/refer` : undefined}
                          value={slug}
                          onChange={(e) => handleSlugChange(e.currentTarget.value)}
                          error={slugError}
                          rightSection={slugChecking ? <Loader size={10} /> : (slug.length >= 3 && !slugError && !slugChecking ? <IconCheck size={11} color="green" /> : null)}
                        />
                      )}

                      {!isPro && (
                        <Group gap={5}>
                          <span style={rolePill(true, false)}>Referrer</span>
                          <button onClick={() => setIsHomeowner((v) => !v)} style={rolePill(isHomeowner, true)}>
                            Homeowner
                          </button>
                        </Group>
                      )}
                    </Stack>
                  </Group>
                  <ActionIcon variant="subtle" size="sm" radius="xl"
                    style={{ flexShrink: 0, marginTop: 2 }} onClick={cancelEdit}>
                    <IconX size={13} />
                  </ActionIcon>
                </Group>

                {showPhotoPanel && (
                  <Card withBorder shadow="xs" radius="md" padding="sm"
                    style={{ ...cardStyle, background: "var(--gk-bg-surface)" }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Update photo</Text>
                        <ActionIcon size="xs" variant="subtle" onClick={() => setShowPhotoPanel(false)}><IconX size={12} /></ActionIcon>
                      </Group>
                      <Group gap="xs">
                        <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp">
                          {(props) => (
                            <Button {...props} size="xs" radius="xl" variant="light" leftSection={<IconUpload size={13} />}>Upload</Button>
                          )}
                        </FileButton>
                        {googlePicUrl ? (
                          <Button size="xs" radius="xl" variant="light" color="gray"
                            leftSection={<IconBrandGoogle size={13} />}
                            onClick={() => void handleUseGooglePhoto()}>Use Google photo</Button>
                        ) : (
                          <Tooltip label="Sign in with Google to use your Google profile photo" withArrow>
                            <Button size="xs" radius="xl" variant="light" color="gray"
                              leftSection={<IconBrandGoogle size={13} />} disabled>Use Google photo</Button>
                          </Tooltip>
                        )}
                        {(photoPreview || existingAvatar) && (
                          <Button size="xs" radius="xl" variant="subtle" color="red" onClick={() => {
                            setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); resetRef.current?.(); clearAvatar();
                          }}>Remove</Button>
                        )}
                      </Group>
                      {photoError && <Text size="xs" c="red">{photoError}</Text>}
                      {photoPreview && <Text size="xs" c="green">✓ {photoFile?.name ?? "Photo ready"} — click Save to apply</Text>}
                    </Stack>
                  </Card>
                )}

                <Divider style={{ borderColor: "var(--gk-border)" }} />

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

                <Group justify="flex-end" gap="xs">
                  <button onClick={cancelEdit} style={nativeBtn({})}>Cancel</button>
                  <button onClick={() => void saveProfile()} disabled={saving}
                    style={nativeBtn({ primary: true, disabled: saving })}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </Group>
              </Stack>
            )}
          </Card>
        </Tabs.Panel>

        {/* ══════════════════ SETTINGS TAB ══════════════════ */}
        <Tabs.Panel value="settings" pt="md">
          <Stack>
            <Card withBorder shadow="sm" radius="md" padding="lg" style={cardStyle}>
              <Group gap="md">
                <Avatar size={56} src={avatarSrc ?? undefined} color="teal" radius="xl">
                  {!avatarSrc && initials}
                </Avatar>
                <Stack gap={2}>
                  <Text fw={700} size="lg">{displayName}</Text>
                  {(contactEmail || user?.email) && (
                    <Group gap={8}>
                      <IconMail size={13} style={iconColor} />
                      <Text size="sm" c="dimmed">{contactEmail || user?.email}</Text>
                    </Group>
                  )}
                  {(contactPhone || user?.phone) && (
                    <Group gap={8}>
                      <IconPhone size={13} style={iconColor} />
                      <Text size="sm" c="dimmed">{contactPhone || formatPhone(user?.phone ?? "")}</Text>
                    </Group>
                  )}
                </Stack>
              </Group>
            </Card>

            <ThemeSettingsCard />

            {/* Notification preferences */}
            <Card withBorder radius="md" padding="lg" style={cardStyle}>
              <Stack gap="md">
                <Group gap="xs">
                  <IconBell size={18} style={iconColor} />
                  <Title order={5}>Notification Preferences</Title>
                </Group>

                <Group justify="space-between" align="center" p="sm" style={notifRowStyle}>
                  <Group gap="sm">
                    <IconMail size={16} style={iconColor} />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>Email</Text>
                      <Text size="xs" c="dimmed">Quote updates and messages</Text>
                    </Stack>
                  </Group>
                  <Switch checked={notifyEmail} onChange={(e) => setNotifyEmail(e.currentTarget.checked)} />
                </Group>

                <Group justify="space-between" align="center" p="sm" style={notifRowStyle}>
                  <Group gap="sm">
                    <IconPhone size={16} style={iconColor} />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>Phone (SMS)</Text>
                      <Text size="xs" c="dimmed">Text when a pro responds</Text>
                    </Stack>
                  </Group>
                  <Switch checked={notifySms} onChange={(e) => setNotifySms(e.currentTarget.checked)} />
                </Group>

                <Group justify="space-between" align="center" p="sm" style={notifRowStyle}>
                  <Group gap="sm">
                    <IconBell size={16} style={iconColor} />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>In-app</Text>
                      <Text size="xs" c="dimmed">Notifications within GigKraft</Text>
                    </Stack>
                  </Group>
                  <Switch checked={notifyInApp} onChange={(e) => setNotifyInApp(e.currentTarget.checked)} />
                </Group>

                <button
                  onClick={() => void saveNotifications()}
                  disabled={notifSaved}
                  style={nativeBtn({ primary: true, disabled: notifSaved })}
                >
                  {notifSaved ? "✓ Saved!" : "Save preferences"}
                </button>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" padding="lg" style={cardStyle}>
              <Stack>
                <Title order={5}>Danger zone</Title>
                <Text size="sm" c="dimmed">Permanently delete your account and all associated data.</Text>
                <Button color="red" variant="light" w="fit-content">Delete account</Button>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* ══════════════════ TERMS TAB ══════════════════ */}
        <Tabs.Panel value="terms" pt="md">
          <TermsContent />
        </Tabs.Panel>

        {/* ══════════════════ FAQ TAB ══════════════════ */}
        <Tabs.Panel value="faq" pt="md">
          <FaqContent />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
