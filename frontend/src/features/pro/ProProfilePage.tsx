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
import { IconBrandGoogle, IconCamera, IconUpload } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import { loadAvatar, saveAvatar, clearAvatar, compressToDataUrl, loadGooglePictureUrl } from "../../hooks/useProAvatar";
import { client } from "../../api/client";

const TRADES = ["Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "Roofer", "General contractor", "Other"];

const TRADE_SKILLS: Record<string, string[]> = {
  "Plumber":            ["Leak repair", "Drain cleaning", "Water heater", "Pipe installation", "Fixture install", "Emergency response"],
  "Electrician":        ["Wiring", "Panel upgrade", "Outlet install", "Lighting", "Circuit breaker", "EV charger"],
  "HVAC":               ["AC repair", "Furnace service", "Duct cleaning", "Installation", "Thermostat", "Refrigerant"],
  "Carpenter":          ["Framing", "Trim work", "Cabinet install", "Door & window", "Decking", "Flooring"],
  "Painter":            ["Interior", "Exterior", "Staining", "Wallpaper removal", "Drywall repair", "Cabinet painting"],
  "Roofer":             ["Shingle repair", "Flat roof", "Gutter install", "Inspection", "Skylight", "Flashing"],
  "General contractor": ["Renovation", "New build", "Project mgmt", "Permits", "Subcontractor coord", "Budgeting"],
  "Other":              ["Handyman", "Assembly", "Mounting", "Repair", "Installation", "Maintenance"],
};

const PHOTO_MAX_MB = 5;
const PHOTO_RECOMMENDED_PX = 400;

export interface ProProfileHandle {
  save: () => Promise<void>;
}

export const ProProfilePage = forwardRef<ProProfileHandle>(function ProProfilePage(_props, ref) {
  const { user } = useAuth();
  const [licensed, setLicensed] = useState(false);
  const [insured, setInsured] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [responseTime, setResponseTime] = useState<string | null>("4");
  const [trade, setTrade] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const existingAvatar = loadAvatar();
  const googlePicUrl = loadGooglePictureUrl();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "P").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your Name";

  function handleTradeChange(newTrade: string | null) {
    setTrade(newTrade);
    if (newTrade) {
      const valid = TRADE_SKILLS[newTrade] ?? [];
      setSkills((prev) => prev.filter((s) => valid.includes(s)));
    }
  }

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
    compressToDataUrl(file)
      .then((dataUrl) => setPhotoPreview(dataUrl))
      .catch(() => setPhotoError("Could not read image — please try another file."));
  }

  function handleUseGooglePhoto() {
    if (!googlePicUrl) return;
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(googlePicUrl);
    setPhotoError(null);
    resetRef.current?.();
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
      saveAvatar(photoPreview);
    } else if (urlTrimmed) {
      saveAvatar(urlTrimmed);
    }

    await client.PATCH("/api/pros/me", {
      body: {
        primary_trade: trade ?? undefined,
        bio: bio || undefined,
        response_hours: responseTime ? Number(responseTime) : undefined,
        licensed,
        insured,
        license_number: licenseNumber || undefined,
        skill_tags: skills,
        ...(urlTrimmed ? { avatar_url: urlTrimmed } : {}),
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  useImperativeHandle(ref, () => ({ save }));

  const avatarSrc = photoPreview ?? (photoUrl.trim() || existingAvatar) ?? undefined;

  return (
    <Stack maw={640}>
      <Title order={3}>Profile</Title>

      <Tabs defaultValue="credentials">
        <Tabs.List>
          <Tabs.Tab value="credentials">Credentials</Tabs.Tab>
          <Tabs.Tab value="trade">Trade & skills</Tabs.Tab>
          <Tabs.Tab value="visual">Profile photo</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="credentials" pt="md">
          <Card withBorder shadow="sm" radius="md" padding="lg">
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
              {licensed && (
                <TextInput
                  label="License number"
                  placeholder="TX-PLB-000000"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.currentTarget.value)}
                />
              )}
              <Select
                label="Default response time"
                value={responseTime}
                onChange={setResponseTime}
                data={[
                  { value: "1", label: "1 hour" },
                  { value: "2", label: "2 hours" },
                  { value: "4", label: "4 hours (default)" },
                  { value: "8", label: "8 hours" },
                ]}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="trade" pt="md">
          <Card withBorder shadow="sm" radius="md" padding="lg">
            <Stack>
              <Select
                label="Primary trade"
                placeholder="Select trade"
                data={TRADES}
                value={trade}
                onChange={handleTradeChange}
              />
              {trade && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Skills</Text>
                  <Chip.Group multiple value={skills} onChange={setSkills}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(TRADE_SKILLS[trade] ?? []).map((s) => <Chip key={s} value={s} size="sm">{s}</Chip>)}
                    </div>
                  </Chip.Group>
                </div>
              )}
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

        <Tabs.Panel value="visual" pt="md">
          <Card withBorder shadow="sm" radius="md" padding="lg">
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
                        size="sm"
                        radius="xl"
                        variant="light"
                        leftSection={<IconUpload size={15} />}
                        fullWidth
                      >
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
                      fullWidth
                      onClick={handleUseGooglePhoto}
                    >
                      Use Google photo
                    </Button>
                  )}

                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      <strong>Recommended:</strong> {PHOTO_RECOMMENDED_PX}×{PHOTO_RECOMMENDED_PX} px or larger, square crop
                    </Text>
                    <Text size="xs" c="dimmed">
                      <strong>Max size:</strong> {PHOTO_MAX_MB} MB · JPEG, PNG, or WebP
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
              />

              <Stack gap={4}>
                <Text size="sm" fw={500}>Preview</Text>
                <Card withBorder shadow="xs" radius="md" padding="sm" style={{ background: "var(--gk-bg-surface)" }}>
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
      </Tabs>

      <Button onClick={() => void save()} color={saved ? "green" : undefined}>
        {saved ? "Saved!" : "Save profile"}
      </Button>
    </Stack>
  );
});
