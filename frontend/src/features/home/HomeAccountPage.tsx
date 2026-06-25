import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  FileButton,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBell,
  IconBrandGoogle,
  IconCamera,
  IconCheck,
  IconMail,
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

const gradientBtn: React.CSSProperties = {
  background: "var(--gk-brand-gradient)",
  border: "none",
  color: "#fff",
};

type EditSection = "name" | "contact" | "zip" | null;

function SectionHeader({
  label,
  editing,
  onEdit,
  onDone,
}: {
  label: string;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  return (
    <Group justify="space-between" align="center">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>{label}</Text>
      {editing ? (
        <Button size="xs" style={gradientBtn} onClick={onDone}>Done</Button>
      ) : (
        <Tooltip label={`Edit ${label.toLowerCase()}`} withArrow>
          <ActionIcon size="xs" variant="subtle" onClick={onEdit}><IconPencil size={12} /></ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

export function HomeAccountPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

  const avatarSrc = useProAvatar();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [defaultZip, setDefaultZip] = useState("");
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const resetRef = useRef<() => void>(null);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Homeowner";
  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "H").toUpperCase();
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || avatarSrc) ?? undefined;

  useEffect(() => {
    if (user) {
      setFirstName((p) => p || user.first_name || "");
      setLastName((p) => p || user.last_name || "");
      setContactEmail((p) => p || user.email || "");
      setContactPhone((p) => p || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home/account`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.default_zip) setDefaultZip(data.default_zip);
      })
      .catch(() => {});

    const saved = localStorage.getItem("gk.home.notif");
    if (saved) {
      try {
        const p = JSON.parse(saved) as { email: boolean; sms: boolean };
        setNotifyEmail(p.email);
        setNotifySms(p.sms);
      } catch {}
    }
  }, []);

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

  function handleUseGooglePhoto() {
    if (!googlePicUrl) return;
    saveAvatar(googlePicUrl);
    setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setPhotoError(null); resetRef.current?.();
    setShowPhotoPanel(false);
    void fetch(`${API_BASE_URL}/api/home/profile`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ avatar_url: googlePicUrl }),
    });
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: contactPhone.trim() || null,
        }),
      });
      if (res.ok) updateUser({ first_name: firstName.trim(), last_name: lastName.trim(), phone: contactPhone.trim() || null });

      if (defaultZip.trim()) {
        await fetch(`${API_BASE_URL}/api/home/profile`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ default_zip: defaultZip.trim() }),
        });
      }

      const urlTrimmed = photoUrl.trim();
      if (photoPreview) {
        saveAvatar(photoPreview);
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

      setEditSection(null);
      setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setShowPhotoPanel(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function saveNotifications() {
    localStorage.setItem("gk.home.notif", JSON.stringify({ email: notifyEmail, sms: notifySms }));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  }

  return (
    <Stack maw={860}>
      <Tabs value={activeTab} onChange={(v) => setSearchParams(v ? { tab: v } : {})} color="var(--gk-accent-primary)">
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab value="profile" style={{ color: activeTab === "profile" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>Profile</Tabs.Tab>
          <Tabs.Tab value="settings" style={{ color: activeTab === "settings" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>Settings</Tabs.Tab>
          <Tabs.Tab value="terms" style={{ color: activeTab === "terms" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>Terms</Tabs.Tab>
          <Tabs.Tab value="faq" style={{ color: activeTab === "faq" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>FAQ</Tabs.Tab>
        </Tabs.List>

        {/* ══════════════════ PROFILE TAB ══════════════════ */}
        <Tabs.Panel value="profile" pt="md">
          <Stack>
            <Card withBorder shadow="sm" radius="md" padding={0} style={{ overflow: "hidden" }}>
              {/* Banner */}
              <div style={{ height: 110, background: "var(--gk-brand-gradient)" }} />

              <div style={{ position: "relative", padding: "0 20px 20px" }}>
                {/* Avatar overlapping banner */}
                <div
                  style={{ position: "absolute", top: -44, left: 20, cursor: "pointer" }}
                  onClick={() => setShowPhotoPanel((v) => !v)}
                >
                  <Avatar
                    size={88}
                    src={liveAvatarSrc}
                    color="teal"
                    radius="xl"
                    style={{ fontSize: 32, border: "3px solid var(--mantine-color-body)" }}
                  >
                    {!liveAvatarSrc && initials}
                  </Avatar>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 12,
                    background: "rgba(0,0,0,0.4)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.15s",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}>
                    <IconCamera size={20} color="#fff" />
                  </div>
                </div>

                {/* Name + badge row */}
                <Group justify="space-between" align="center" pt={8} pl={104} wrap="nowrap">
                  <Stack gap={2}>
                    {editSection === "name" ? (
                      <Group gap="xs" wrap="wrap" align="flex-end">
                        <TextInput size="sm" placeholder="First name" value={firstName}
                          onChange={(e) => setFirstName(e.currentTarget.value)} style={{ flex: 1, minWidth: 100 }} autoFocus />
                        <TextInput size="sm" placeholder="Last name" value={lastName}
                          onChange={(e) => setLastName(e.currentTarget.value)} style={{ flex: 1, minWidth: 100 }} />
                      </Group>
                    ) : (
                      <Group gap={6} align="center">
                        <Title order={2} style={{ lineHeight: 1.1 }}>{displayName}</Title>
                        <Tooltip label="Edit name" withArrow>
                          <ActionIcon size="xs" variant="subtle" onClick={() => setEditSection("name")}>
                            <IconPencil size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    )}
                    <Badge size="sm" variant="light" color="teal">Homeowner</Badge>
                  </Stack>

                  <Group gap={4}>
                    <Button
                      size="sm"
                      loading={saving}
                      leftSection={saveOk ? <IconCheck size={14} /> : undefined}
                      onClick={() => void saveProfile()}
                      style={gradientBtn}
                    >
                      {saveOk ? "Saved!" : "Save"}
                    </Button>
                  </Group>
                </Group>

                {/* Photo panel */}
                {showPhotoPanel && (
                  <Card withBorder shadow="xs" radius="md" padding="sm" mt="md" style={{ background: "var(--gk-bg-surface)" }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>Update photo</Text>
                        <ActionIcon size="xs" variant="subtle" onClick={() => setShowPhotoPanel(false)}><IconX size={12} /></ActionIcon>
                      </Group>
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
                        {(photoPreview || photoUrl || existingAvatar) && (
                          <Button size="sm" radius="xl" variant="subtle" color="red" onClick={() => {
                            setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); resetRef.current?.(); clearAvatar();
                          }}>
                            Remove
                          </Button>
                        )}
                      </Group>
                      {photoError && <Text size="xs" c="red">{photoError}</Text>}
                      {(photoPreview || photoUrl) && (
                        <Text size="xs" c="green">✓ {photoFile ? photoFile.name : "Photo ready"} — click Save to apply</Text>
                      )}
                    </Stack>
                  </Card>
                )}

                <Divider my="md" />

                {/* 2-col cards */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ alignItems: "stretch" }}>

                  {/* Contact card */}
                  <Card withBorder shadow="sm" radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="md" style={{ flex: 1 }}>
                      <SectionHeader
                        label="Contact"
                        editing={editSection === "contact"}
                        onEdit={() => setEditSection("contact")}
                        onDone={() => setEditSection(null)}
                      />
                      {editSection === "contact" ? (
                        <Stack gap="xs">
                          <TextInput size="xs" label="Email" leftSection={<IconMail size={13} />}
                            value={contactEmail} onChange={(e) => setContactEmail(e.currentTarget.value)} />
                          <TextInput size="xs" label="Phone" leftSection={<IconPhone size={13} />}
                            value={contactPhone} onChange={(e) => setContactPhone(e.currentTarget.value)} />
                        </Stack>
                      ) : (
                        <Stack gap={4}>
                          <Group gap={6}>
                            <IconMail size={14} color="var(--gk-accent-primary)" />
                            <Text size="sm">{contactEmail || user?.email || "—"}</Text>
                          </Group>
                          <Group gap={6}>
                            <IconPhone size={14} color="var(--gk-accent-primary)" />
                            <Text size="sm">{contactPhone || user?.phone || "—"}</Text>
                          </Group>
                        </Stack>
                      )}
                    </Stack>
                  </Card>

                  {/* Preferences card */}
                  <Card withBorder shadow="sm" radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="md" style={{ flex: 1 }}>
                      <SectionHeader
                        label="Preferences"
                        editing={editSection === "zip"}
                        onEdit={() => setEditSection("zip")}
                        onDone={() => setEditSection(null)}
                      />
                      {editSection === "zip" ? (
                        <TextInput size="xs" label="Default ZIP code" placeholder="78701"
                          value={defaultZip} onChange={(e) => setDefaultZip(e.currentTarget.value)} />
                      ) : (
                        <Stack gap={4}>
                          <Group gap={6}>
                            <IconUser size={14} color="var(--gk-accent-primary)" />
                            <Text size="sm">{defaultZip || "No ZIP set"}</Text>
                          </Group>
                        </Stack>
                      )}
                    </Stack>
                  </Card>

                </SimpleGrid>
              </div>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* ══════════════════ SETTINGS TAB ══════════════════ */}
        <Tabs.Panel value="settings" pt="md">
          <Stack>
            {/* Compact identity card */}
            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Group gap="md">
                <Avatar size={56} src={avatarSrc ?? undefined} color="teal" radius="xl">
                  {!avatarSrc && initials}
                </Avatar>
                <Stack gap={2}>
                  <Text fw={700} size="lg">{displayName}</Text>
                  {(contactEmail || user?.email) && (
                    <Group gap={6}>
                      <IconMail size={13} color="var(--gk-accent-primary)" />
                      <Text size="sm" c="dimmed">{contactEmail || user?.email}</Text>
                    </Group>
                  )}
                  {(contactPhone || user?.phone) && (
                    <Group gap={6}>
                      <IconPhone size={13} color="var(--gk-accent-primary)" />
                      <Text size="sm" c="dimmed">{contactPhone || user?.phone}</Text>
                    </Group>
                  )}
                </Stack>
              </Group>
            </Card>

            <ThemeSettingsCard />

            <Card withBorder shadow="sm" radius="md" padding="lg">
              <Stack>
                <Group gap="xs">
                  <IconBell size={18} style={{ color: "var(--gk-accent-primary)" }} />
                  <Title order={5}>Notifications</Title>
                </Group>
                <Switch
                  label="Email alerts"
                  description="Get email for quote updates and messages"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.currentTarget.checked)}
                />
                <Switch
                  label="SMS alerts"
                  description="Get a text when a pro responds to your request"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.currentTarget.checked)}
                />
                <Group>
                  <Button
                    size="sm"
                    radius="xl"
                    leftSection={notifSaved ? <IconCheck size={14} /> : undefined}
                    onClick={saveNotifications}
                    style={gradientBtn}
                  >
                    {notifSaved ? "Saved!" : "Save preferences"}
                  </Button>
                </Group>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" padding="lg">
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
