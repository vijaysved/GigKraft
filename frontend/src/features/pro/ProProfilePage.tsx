import {
  Avatar,
  Button,
  Card,
  Chip,
  FileButton,
  Group,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCamera, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import { loadAvatar, saveAvatar, clearAvatar, compressToDataUrl } from "../../hooks/useProAvatar";
import { client } from "../../api/client";

const TRADES = ["Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "Roofer"];
const SKILLS = ["Leak repair", "Drain cleaning", "Water heater", "Pipe installation", "Fixture install", "Emergency response"];

const PHOTO_MAX_MB = 5;
const PHOTO_RECOMMENDED_PX = 400;

export function ProProfilePage() {
  const { user } = useAuth();
  const [licensed, setLicensed] = useState(false);
  const [insured, setInsured] = useState(false);
  const [responseTime, setResponseTime] = useState<string | null>("4h");
  const [trade, setTrade] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  // Photo state — seed from localStorage on mount
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  // Show existing saved avatar as initial preview
  const existingAvatar = loadAvatar();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "P").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your Name";

  function handleFileChange(file: File | null) {
    setPhotoError(null);
    if (!file) return;
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
      setPhotoError(`File too large — maximum ${PHOTO_MAX_MB} MB.`);
      resetRef.current?.();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file (JPEG, PNG, WebP).");
      resetRef.current?.();
      return;
    }
    setPhotoFile(file);
    setPhotoUrl("");
    // Compress + preview immediately — same data URL will be stored on save
    compressToDataUrl(file)
      .then((dataUrl) => setPhotoPreview(dataUrl))
      .catch(() => setPhotoError("Could not read image — please try another file."));
  }

  function handleClearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    setPhotoError(null);
    resetRef.current?.();
    clearAvatar();
  }

  async function save() {
    const urlTrimmed = photoUrl.trim();
    if (photoPreview) {
      // File upload: already compressed — store in localStorage
      saveAvatar(photoPreview);
    } else if (urlTrimmed) {
      // URL: store locally + persist to backend
      saveAvatar(urlTrimmed);
      await client.PATCH("/api/pros/me", { body: { avatar_url: urlTrimmed } });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // What to show in the avatar preview
  const avatarSrc = photoPreview ?? (photoUrl.trim() || existingAvatar) ?? undefined;

  return (
    <Stack maw={640}>
      <Title order={3}>Profile</Title>

      <Tabs defaultValue="visual">
        <Tabs.List>
          <Tabs.Tab value="visual">Visual</Tabs.Tab>
          <Tabs.Tab value="credentials">Credentials</Tabs.Tab>
          <Tabs.Tab value="trade">Trade & skills</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="visual" pt="md">
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Title order={5}>Profile photo</Title>

              <Group align="flex-start" gap="lg">
                <Stack align="center" gap="xs">
                  <Avatar src={avatarSrc} size={100} radius="xl" color="blue">
                    {!avatarSrc && initials}
                  </Avatar>
                  {(photoFile || existingAvatar) && (
                    <Button size="xs" variant="subtle" color="red" onClick={handleClearPhoto}>
                      Remove
                    </Button>
                  )}
                </Stack>

                <Stack gap="xs" style={{ flex: 1 }}>
                  <FileButton
                    resetRef={resetRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                  >
                    {(props) => (
                      <Button
                        {...props}
                        variant="light"
                        leftSection={<IconUpload size={16} />}
                        fullWidth
                      >
                        Upload from device
                      </Button>
                    )}
                  </FileButton>

                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      <strong>Recommended:</strong> {PHOTO_RECOMMENDED_PX}×{PHOTO_RECOMMENDED_PX} px or larger, square crop
                    </Text>
                    <Text size="xs" c="dimmed">
                      <strong>Max size:</strong> {PHOTO_MAX_MB} MB · JPEG, PNG, or WebP
                    </Text>
                    <Text size="xs" c="dimmed">
                      <strong>Tip:</strong> A clear headshot or professional photo builds trust with homeowners.
                    </Text>
                  </Stack>

                  {photoError && <Text size="xs" c="red">{photoError}</Text>}

                  {photoFile && (
                    <Text size="xs" c="green">
                      ✓ {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB) — ready to save
                    </Text>
                  )}
                </Stack>
              </Group>

              <TextInput
                label="Or paste a photo URL"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.currentTarget.value);
                  if (e.currentTarget.value) {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    resetRef.current?.();
                  }
                }}
                leftSection={<IconCamera size={16} />}
                description="Direct link to a publicly accessible image"
              />

              {/* Live preview card */}
              <Stack gap={4}>
                <Text size="sm" fw={500}>Preview</Text>
                <Card withBorder radius="md" padding="sm" style={{ background: "var(--gk-bg-surface)" }}>
                  <Group gap="sm">
                    <Avatar src={avatarSrc} size={56} radius="xl" color="blue">
                      {!avatarSrc && initials}
                    </Avatar>
                    <Stack gap={2}>
                      <Text fw={700} size="sm">{displayName}</Text>
                      <Text size="xs" c="dimmed">{trade ?? "Your trade"}</Text>
                    </Stack>
                  </Group>
                </Card>
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="credentials" pt="md">
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Switch
                label="Licensed"
                description="I hold a valid contractor license"
                checked={licensed}
                onChange={(e) => setLicensed(e.currentTarget.checked)}
              />
              <Switch
                label="Insured"
                description="I carry general liability insurance"
                checked={insured}
                onChange={(e) => setInsured(e.currentTarget.checked)}
              />
              {licensed && <TextInput label="License number / URL" placeholder="License #" />}
              {insured && <TextInput label="Insurance certificate URL" placeholder="https://…" />}
              <Select
                label="Default response time"
                value={responseTime}
                onChange={setResponseTime}
                data={[
                  { value: "1h", label: "1 hour" },
                  { value: "2h", label: "2 hours" },
                  { value: "4h", label: "4 hours (default)" },
                  { value: "8h", label: "8 hours" },
                ]}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="trade" pt="md">
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Select
                label="Primary trade"
                placeholder="Select trade"
                data={TRADES}
                value={trade}
                onChange={setTrade}
              />
              <div>
                <Text size="sm" fw={500} mb="xs">Skills</Text>
                <Chip.Group multiple value={skills} onChange={setSkills}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SKILLS.map((s) => <Chip key={s} value={s} size="sm">{s}</Chip>)}
                  </div>
                </Chip.Group>
              </div>
              <Textarea
                label="Bio"
                placeholder="Tell homeowners about your background and what makes you great…"
                maxLength={500}
                minRows={4}
                value={bio}
                onChange={(e) => setBio(e.currentTarget.value)}
                description={`${bio.length}/500`}
              />
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      <Button onClick={() => void save()} color={saved ? "green" : undefined}>
        {saved ? "Saved!" : "Save profile"}
      </Button>
    </Stack>
  );
}
