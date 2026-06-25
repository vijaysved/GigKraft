import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  FileButton,
  Grid,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBell,
  IconBrandGoogle,
  IconCamera,
  IconCheck,
  IconMapPin,
  IconMessage,
  IconPencil,
  IconSearch,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";
import { client } from "../../api/client";
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

export function HomeAccountPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarSrc = useProAvatar();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const [dispatchSms, setDispatchSms] = useState(true);
  const [dispatchEmail, setDispatchEmail] = useState(false);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? user?.phone?.[0] ?? "H").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Homeowner";
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || avatarSrc) ?? undefined;

  useEffect(() => {
    if (user && !editing) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
    }
  }, [user, editing]);

  const LINKS = [
    { label: "Discover pros", icon: IconSearch, to: "/home/discover" },
    { label: "My messages", icon: IconMessage, to: "/home/messages" },
    { label: "Saved addresses", icon: IconMapPin, to: "/home/account/addresses" },
  ];

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
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(googlePicUrl);
    setPhotoError(null);
    resetRef.current?.();
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

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken() ?? ""}`,
        },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });
      if (res.ok) updateUser({ first_name: firstName.trim(), last_name: lastName.trim() });

      const urlTrimmed = photoUrl.trim();
      if (photoPreview) {
        saveAvatar(photoPreview);
      } else if (urlTrimmed) {
        saveAvatar(urlTrimmed);
        const token = getAccessToken();
        await fetch(`${API_BASE_URL}/api/home/profile`, {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
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

  return (
    <Stack>
      {/* Themed title */}
      <Group gap="xs" align="center">
        <IconUser size={22} style={{ color: "var(--gk-accent-primary)" }} />
        <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Your Account</Title>
      </Group>

      {/* Account card — inline editable */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        {!editing ? (
          /* ── View mode ── */
          <Group justify="space-between" wrap="nowrap" align="center">
            <Group gap="md">
              <Avatar size={64} src={avatarSrc ?? undefined} color="teal" radius="xl">
                {!avatarSrc && initials}
              </Avatar>
              <Stack gap={2}>
                <Text fw={700} size="lg">{displayName}</Text>
                <Text size="sm" c="dimmed">{user?.email ?? user?.phone ?? "—"}</Text>
                <Badge size="sm" variant="light" color="teal">Homeowner</Badge>
              </Stack>
            </Group>
            <Tooltip label="Edit profile" withArrow>
              <ActionIcon variant="subtle" onClick={() => setEditing(true)}>
                <IconPencil size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : (
          /* ── Edit mode ── */
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              {/* Avatar with camera hint */}
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

              {/* Name inputs + email */}
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
                <Text size="sm" c="dimmed">{user?.email ?? user?.phone ?? "—"}</Text>
              </Stack>

              {/* Done / cancel */}
              <Group gap={4} style={{ flexShrink: 0 }}>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  loading={saving}
                  leftSection={saved ? <IconCheck size={13} /> : undefined}
                  onClick={() => void handleSave()}
                >
                  {saved ? "Saved!" : "Done"}
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={handleCancelEdit}>
                  Cancel
                </Button>
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
                    <Button
                      size="sm"
                      radius="xl"
                      variant="light"
                      color="gray"
                      leftSection={<IconBrandGoogle size={15} />}
                      onClick={handleUseGooglePhoto}
                    >
                      Use Google photo
                    </Button>
                  )}
                </Group>
                {photoError && <Text size="xs" c="red">{photoError}</Text>}
                {(photoPreview || photoUrl) && (
                  <Text size="xs" c="green">
                    ✓ {photoFile ? photoFile.name : "Google photo"} — will save on Done
                  </Text>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </Card>

      {/* Quick-nav links */}
      <Grid>
        {LINKS.map(({ label, icon: Icon, to }) => (
          <Grid.Col key={to} span={{ base: 12, sm: 6, md: 4 }}>
            <UnstyledButton w="100%" onClick={() => navigate(to)}>
              <Card withBorder shadow="sm" radius="md" padding="md" style={{ cursor: "pointer" }}>
                <Group gap="sm">
                  <Avatar radius="md" color="teal" size="md">
                    <Icon size={20} />
                  </Avatar>
                  <Text fw={600} size="sm">{label}</Text>
                </Group>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>

      {/* Notifications */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        <Stack>
          <Group gap="xs">
            <IconBell size={18} style={{ color: "var(--gk-accent-primary)" }} />
            <Title order={5}>Dispatch notifications</Title>
          </Group>
          <Switch
            label="SMS alerts"
            description="Get text when a pro responds to your emergency"
            checked={dispatchSms}
            onChange={(e) => setDispatchSms(e.currentTarget.checked)}
          />
          <Switch
            label="Email alerts"
            description="Get email for quote updates and messages"
            checked={dispatchEmail}
            onChange={(e) => setDispatchEmail(e.currentTarget.checked)}
          />
        </Stack>
      </Card>

      <ThemeSettingsCard />
    </Stack>
  );
}
