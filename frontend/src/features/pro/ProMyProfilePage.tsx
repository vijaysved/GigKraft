import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAt,
  IconBuildingStore,
  IconCertificate,
  IconCheck,
  IconLink,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconShieldCheck,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { GkBeforeAfter } from "../../components/GkBeforeAfter";
import { useProAvatar } from "../../hooks/useProAvatar";
import {
  isValidHandle,
  sanitizeHandle,
  useProHandle,
} from "../../hooks/useProHandle";

const TRADES = ["Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "Roofer", "General contractor", "Other"];

// ── Trade categories ──────────────────────────────────────────────────────────
const CATEGORY_DEFS: { key: string; gradient: string; light: string; textColor: string; subcategories: string[] }[] = [
  {
    key: "Remodeling & Build",
    gradient: "linear-gradient(135deg,#7900FF,#FF0055)",
    light: "#F3E8FF",
    textColor: "#7900FF",
    subcategories: ["Additions & Remodels", "Builders (New Homes)", "Architects & Designers", "Decorators & Designers", "Foundations", "Kitchen / Bathroom"],
  },
  {
    key: "Licensed Home Systems",
    gradient: "linear-gradient(135deg,#0055FF,#00E5FF)",
    light: "#E0F2FF",
    textColor: "#0055FF",
    subcategories: ["Plumbing", "Electrical", "HVAC", "Pools, Spas & Hot Tubs"],
  },
  {
    key: "Interior Finishes",
    gradient: "linear-gradient(135deg,#FF6B1A,#FFB800)",
    light: "#FFF4E0",
    textColor: "#C84F00",
    subcategories: ["Drywall & Insulation", "Painting & Staining", "Flooring & Carpet", "Tile & Stone", "Carpentry & Cabinets"],
  },
  {
    key: "Exterior & Hardscape",
    gradient: "linear-gradient(135deg,#16A34A,#00C8A0)",
    light: "#DCFCE7",
    textColor: "#16A34A",
    subcategories: ["Roofing, Siding & Gutters", "Windows & Doors", "Garages & Openers", "Concrete, Brick & Stone", "Decks, Porches & Fences"],
  },
  {
    key: "Maintenance & Handyman",
    gradient: "linear-gradient(135deg,#FF5E00,#FFBA00)",
    light: "#FFF3E0",
    textColor: "#E04500",
    subcategories: ["Handyman Services", "Lawn, Trees & Shrubs", "Cleaning Services"],
  },
];

type TradeCategory = { category: string; subcategories: string[] };

const INITIAL = {
  trade: "Plumber",
  bio: "Licensed and insured plumber with 10 years of residential and commercial experience. I specialize in leak repairs, water heater installation, drain cleaning, and full bathroom remodels. I respond within 2 hours and show up on time — every time.",
  verified: true,
  licensed: true,
  insured: true,
  licenseNumber: "TX-PLB-990123",
  responseTime: "2h",
  serviceArea: { mode: "zips" as const, zips: ["78701", "78702", "78703"] },
  krafts: [
    { id: 1, title: "Kitchen faucet replacement", invoiceAmount: 280 },
    { id: 2, title: "Water heater install", invoiceAmount: 850 },
    { id: 3, title: "Full bathroom replumb", invoiceAmount: 2400 },
    { id: 4, title: "Drain cleaning & inspection", invoiceAmount: 150 },
  ],
  recommendations: [
    { author: "Sarah J.", rating: 5, text: "John fixed our kitchen faucet in under an hour. Came prepared with the right parts. Highly recommend!" },
    { author: "Mark R.", rating: 5, text: "Excellent work on our water heater. Clean, professional, and on time." },
    { author: "Linda P.", rating: 4, text: "Good work, very knowledgeable. Will call again for future plumbing needs." },
  ],
};

type Modal_ = "bio" | "credentials" | "service-area" | "handle" | "categories" | null;

export function ProMyProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { handle, loading: handleLoading, setHandle, profileUrl } = useProHandle({
    firstName: user?.first_name,
    lastName: user?.last_name,
    trade: INITIAL.trade,
  });

  const [copied, setCopied] = useState(false);
  const [openModal, setOpenModal] = useState<Modal_>(null);

  // Editable state
  const [trade, setTrade] = useState(INITIAL.trade);
  const [bio, setBio] = useState(INITIAL.bio);
  const [responseTime, setResponseTime] = useState(INITIAL.responseTime);
  const [licensed, setLicensed] = useState(INITIAL.licensed);
  const [insured, setInsured] = useState(INITIAL.insured);
  const [licenseNumber, setLicenseNumber] = useState(INITIAL.licenseNumber);
  const [tradeCategories, setTradeCategories] = useState<TradeCategory[]>([]);
  const [categoryDraft, setCategoryDraft] = useState<TradeCategory[]>([]);

  const [serviceMode, setServiceMode] = useState<"zips" | "radius">(INITIAL.serviceArea.mode);
  const [zips, setZips] = useState<string[]>(INITIAL.serviceArea.zips);
  const [zipInput, setZipInput] = useState("");
  const [centerZip, setCenterZip] = useState("78701");
  const [radius, setRadius] = useState(25);

  // Handle editing state (local until saved); seed from confirmed backend value
  const [handleInput, setHandleInput] = useState(handle ?? "");
  const handleSanitized = sanitizeHandle(handleInput);
  const handleValid = isValidHandle(handleSanitized);

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your Name";
  const avatarSrc = useProAvatar();

  function shareProfile() {
    if (!profileUrl) return;
    void navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function addZip() {
    const z = zipInput.trim();
    if (!z || zips.includes(z) || zips.length >= 3) return;
    setZips([...zips, z]);
    setZipInput("");
  }

  function saveHandle() {
    if (handleValid) {
      void setHandle(handleSanitized).then(() => setOpenModal(null));
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>My Profile</Title>
        <Button
          size="sm"
          variant="light"
          leftSection={<IconLink size={15} />}
          onClick={shareProfile}
          color={copied ? "green" : undefined}
          disabled={handleLoading || !profileUrl}
          loading={handleLoading}
        >
          {copied ? "Link copied!" : "Share profile"}
        </Button>
      </Group>

      {/* Hero card */}
      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="md" align="flex-start">
            <Avatar size={80} src={avatarSrc ?? undefined} color="blue" radius="xl" style={{ fontSize: 32 }}>
              {!avatarSrc && displayName[0]?.toUpperCase()}
            </Avatar>
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={2}>{displayName}</Title>
                {INITIAL.verified && (
                  <Badge color="green" leftSection={<IconShieldCheck size={12} />}>Verified</Badge>
                )}
              </Group>
              <Group gap="xs">
                <Badge variant="light" leftSection={<IconBuildingStore size={12} />}>{trade}</Badge>
                <Badge variant="light" color="blue">⚡ {responseTime} response</Badge>
              </Group>
              <Text size="sm" c="dimmed" maw={480}>{bio}</Text>
            </Stack>
          </Group>
          <ActionIcon variant="light" size="lg" onClick={() => setOpenModal("bio")} title="Edit bio & trade">
            <IconPencil size={16} />
          </ActionIcon>
        </Group>

        <Divider my="md" />

        {/* Handle row */}
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Group gap={6}>
              <IconAt size={14} color="var(--gk-accent-primary)" />
              <Text size="sm" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                {handleLoading ? "…" : (handle ?? "—")}
              </Text>
            </Group>
            {handle && (
              <Text size="xs" c="dimmed">
                Public URL: <Code style={{ fontSize: 11 }}>/pros/{handle}</Code>
              </Text>
            )}
          </Stack>
          <ActionIcon variant="light" size="sm" disabled={handleLoading || !handle} onClick={() => { setHandleInput(handle ?? ""); setOpenModal("handle"); }}>
            <IconPencil size={13} />
          </ActionIcon>
        </Group>

        <Divider my="md" />

        <Group gap="xl">
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{INITIAL.recommendations.length}</Text>
            <Text size="xs" c="dimmed">Reviews</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{INITIAL.krafts.length}</Text>
            <Text size="xs" c="dimmed">Krafts</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{responseTime}</Text>
            <Text size="xs" c="dimmed">Avg response</Text>
          </Stack>
        </Group>
      </Card>

      {/* Contact info */}
      <Card withBorder radius="md" padding="md">
        <Group justify="space-between" mb="sm">
          <Title order={5}>Contact info</Title>
          <Text size="xs" c="dimmed">Visible to logged-in users only on your public page</Text>
        </Group>
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="sm" fw={500}>Email:</Text>
            <Text size="sm" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>{user?.email ?? "—"}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={500}>Phone:</Text>
            <Text size="sm" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>{user?.phone ?? "—"}</Text>
          </Group>
        </Stack>
      </Card>

      {/* Credentials & service area */}
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder radius="md" padding="md">
          <Group justify="space-between" mb="sm">
            <Title order={5}>Credentials</Title>
            <ActionIcon variant="light" size="md" onClick={() => setOpenModal("credentials")}>
              <IconPencil size={14} />
            </ActionIcon>
          </Group>
          <Stack gap="xs">
            <Group gap="xs">
              <Badge color={licensed ? "green" : "gray"} leftSection={<IconCertificate size={12} />} variant="light">
                {licensed ? "Licensed" : "Not licensed"}
              </Badge>
              <Badge color={insured ? "green" : "gray"} leftSection={<IconShieldCheck size={12} />} variant="light">
                {insured ? "Insured" : "Not insured"}
              </Badge>
            </Group>
            {licensed && (
              <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                License: {licenseNumber}
              </Text>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="md">
          <Group justify="space-between" mb="sm">
            <Group gap="xs">
              <IconMapPin size={16} />
              <Title order={5}>Service area</Title>
            </Group>
            <ActionIcon variant="light" size="md" onClick={() => setOpenModal("service-area")}>
              <IconPencil size={14} />
            </ActionIcon>
          </Group>
          <Group gap="xs">
            {serviceMode === "zips"
              ? zips.map((z) => <Badge key={z} variant="outline" size="sm">{z}</Badge>)
              : <Badge variant="outline" size="sm">{centerZip} · {radius} mi radius</Badge>
            }
          </Group>
        </Card>
      </SimpleGrid>

      {/* Trade categories */}
      <Card withBorder radius="md" padding="md">
        <Group justify="space-between" mb="sm">
          <Title order={5}>Your categories</Title>
          <ActionIcon variant="light" size="md" onClick={() => { setCategoryDraft(tradeCategories.map((c) => ({ ...c, subcategories: [...c.subcategories] }))); setOpenModal("categories"); }}>
            <IconPencil size={14} />
          </ActionIcon>
        </Group>
        {tradeCategories.length === 0 ? (
          <Text size="sm" c="dimmed">
            No categories set.{" "}
            <span
              style={{ color: "var(--mantine-color-blue-6)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setCategoryDraft([]); setOpenModal("categories"); }}
            >
              Add categories
            </span>{" "}
            so homeowners can find you.
          </Text>
        ) : (
          <Stack gap="xs">
            {tradeCategories.map((tc) => {
              const def = CATEGORY_DEFS.find((d) => d.key === tc.category);
              return (
                <Group key={tc.category} gap="xs" wrap="wrap">
                  <Badge
                    size="md"
                    style={{
                      background: def?.gradient ?? "#888",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {tc.category}
                  </Badge>
                  {tc.subcategories.map((s) => (
                    <Badge key={s} size="sm" variant="light">{s}</Badge>
                  ))}
                </Group>
              );
            })}
          </Stack>
        )}
      </Card>

      {/* Krafts */}
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>Work samples (Krafts)</Title>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={() => navigate("/pro/krafts/new")}>
            Add Kraft
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {INITIAL.krafts.map((k) => (
            <Card key={k.id} withBorder radius="md" padding="sm">
              <GkBeforeAfter height={100} />
              <Group mt="xs" justify="space-between">
                <Text size="sm" fw={600}>{k.title}</Text>
                <Group gap="xs">
                  <Text size="xs" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    ${k.invoiceAmount.toLocaleString()}
                  </Text>
                  <ActionIcon size="xs" variant="subtle" color="blue" onClick={() => navigate(`/pro/krafts/${k.id}`)}>
                    <IconPencil size={12} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Recommendations */}
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>Recommendations</Title>
          <Button size="xs" variant="light" onClick={() => navigate("/pro/recommendations")}>
            Request review
          </Button>
        </Group>
        <Stack gap="sm">
          {INITIAL.recommendations.map((r, i) => (
            <Card key={i} withBorder radius="md" padding="md">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{r.author}</Text>
                <Group gap={2}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} size={14} fill={s < r.rating ? "#F39C12" : "none"} color={s < r.rating ? "#F39C12" : "#ccc"} />
                  ))}
                </Group>
              </Group>
              <Text size="sm" c="dimmed">"{r.text}"</Text>
            </Card>
          ))}
        </Stack>
      </Stack>

      {/* ── Edit modals ── */}

      {/* Handle modal */}
      <Modal opened={openModal === "handle"} onClose={() => setOpenModal(null)} title="Edit your handle" size="sm">
        <Stack>
          <Text size="sm" c="dimmed">
            Your handle is your public profile URL. Choose something memorable — letters, numbers, and hyphens only.
          </Text>
          <TextInput
            leftSection={<IconAt size={16} />}
            placeholder="john-smith"
            value={handleInput}
            onChange={(e) => setHandleInput(e.currentTarget.value)}
            description={handleInput ? `gigKraft.com/pros/${handleSanitized}` : "3–30 characters"}
            error={handleInput && !handleValid ? "Must be 3–30 characters, letters/numbers/hyphens only" : undefined}
            rightSection={handleValid ? <IconCheck size={16} color="green" /> : undefined}
          />
          {handleValid && handle && handleSanitized !== handle && (
            <Alert color="yellow" variant="light">
              Your public URL will change from <Code>/pros/{handle}</Code> to <Code>/pros/{handleSanitized}</Code>.
              Old links will stop working.
            </Alert>
          )}
          <Button onClick={saveHandle} disabled={!handleValid || handleSanitized === (handle ?? "")}>
            Save handle
          </Button>
        </Stack>
      </Modal>

      {/* Bio / trade modal */}
      <Modal opened={openModal === "bio"} onClose={() => setOpenModal(null)} title="Edit profile" size="md">
        <Stack>
          <Select label="Trade" data={TRADES} value={trade} onChange={(v) => { if (v) setTrade(v); }} />
          <Select
            label="Response time"
            value={responseTime}
            onChange={(v) => { if (v) setResponseTime(v); }}
            data={[
              { value: "1h", label: "1 hour" },
              { value: "2h", label: "2 hours" },
              { value: "4h", label: "4 hours" },
              { value: "8h", label: "8 hours" },
            ]}
          />
          <Textarea
            label="Bio"
            minRows={5}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.currentTarget.value)}
            description={`${bio.length}/500`}
          />
          <Button onClick={() => setOpenModal(null)}>Save</Button>
        </Stack>
      </Modal>

      {/* Credentials modal */}
      <Modal opened={openModal === "credentials"} onClose={() => setOpenModal(null)} title="Edit credentials" size="sm">
        <Stack>
          <Switch label="Licensed" checked={licensed} onChange={(e) => setLicensed(e.currentTarget.checked)} />
          {licensed && (
            <TextInput label="License number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.currentTarget.value)} />
          )}
          <Switch label="Insured" checked={insured} onChange={(e) => setInsured(e.currentTarget.checked)} />
          <Button onClick={() => setOpenModal(null)}>Save</Button>
        </Stack>
      </Modal>

      {/* Categories modal */}
      <Modal opened={openModal === "categories"} onClose={() => setOpenModal(null)} title="Your trade categories" size="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">Pick up to 2 categories, then up to 2 subcategories within each. This controls how homeowners find you on the search page.</Text>
          {CATEGORY_DEFS.map((def) => {
            const selected = categoryDraft.find((c) => c.category === def.key);
            const isSelected = !!selected;
            const atMax = categoryDraft.length >= 2 && !isSelected;
            return (
              <Card
                key={def.key}
                withBorder
                radius="md"
                padding="sm"
                style={{
                  cursor: atMax ? "not-allowed" : "pointer",
                  opacity: atMax ? 0.5 : 1,
                  borderColor: isSelected ? def.textColor : undefined,
                  background: isSelected ? def.light : undefined,
                }}
                onClick={() => {
                  if (atMax) return;
                  if (isSelected) {
                    setCategoryDraft(categoryDraft.filter((c) => c.category !== def.key));
                  } else {
                    setCategoryDraft([...categoryDraft, { category: def.key, subcategories: [] }]);
                  }
                }}
              >
                <Group gap="sm" mb={isSelected ? "xs" : 0}>
                  <Box style={{ width: 28, height: 28, borderRadius: 8, background: def.gradient, flexShrink: 0 }} />
                  <Text fw={700} size="sm" style={{ color: def.textColor }}>{def.key}</Text>
                  {isSelected && <IconCheck size={14} color={def.textColor} style={{ marginLeft: "auto" }} />}
                </Group>
                {isSelected && (
                  <Group gap="xs" wrap="wrap" mt="xs" onClick={(e) => e.stopPropagation()}>
                    {def.subcategories.map((sub) => {
                      const subSelected = selected.subcategories.includes(sub);
                      const subAtMax = selected.subcategories.length >= 2 && !subSelected;
                      return (
                        <Badge
                          key={sub}
                          size="sm"
                          variant={subSelected ? "filled" : "outline"}
                          style={{ cursor: subAtMax ? "not-allowed" : "pointer", opacity: subAtMax ? 0.5 : 1 }}
                          onClick={() => {
                            if (subAtMax) return;
                            const updatedSubs = subSelected
                              ? selected.subcategories.filter((s) => s !== sub)
                              : [...selected.subcategories, sub];
                            setCategoryDraft(categoryDraft.map((c) =>
                              c.category === def.key ? { ...c, subcategories: updatedSubs } : c
                            ));
                          }}
                        >
                          {sub}
                        </Badge>
                      );
                    })}
                  </Group>
                )}
              </Card>
            );
          })}
          <Text size="xs" c="dimmed">{categoryDraft.length}/2 categories selected</Text>
          <Button
            onClick={() => { setTradeCategories(categoryDraft); setOpenModal(null); }}
          >
            Save categories
          </Button>
        </Stack>
      </Modal>

      {/* Service area modal */}
      <Modal opened={openModal === "service-area"} onClose={() => setOpenModal(null)} title="Edit service area" size="sm">
        <Stack>
          <Group gap="xs">
            <Button size="xs" variant={serviceMode === "zips" ? "filled" : "light"} onClick={() => setServiceMode("zips")}>
              ZIP codes (max 3)
            </Button>
            <Button size="xs" variant={serviceMode === "radius" ? "filled" : "light"} onClick={() => setServiceMode("radius")}>
              Center + radius
            </Button>
          </Group>

          {serviceMode === "zips" ? (
            <Stack gap="xs">
              <Group gap="xs" wrap="wrap">
                {zips.map((z) => (
                  <Badge
                    key={z}
                    size="md"
                    rightSection={
                      <ActionIcon size="xs" variant="transparent" onClick={() => setZips(zips.filter((x) => x !== z))}>
                        <IconTrash size={10} />
                      </ActionIcon>
                    }
                  >
                    {z}
                  </Badge>
                ))}
              </Group>
              {zips.length < 3 && (
                <Group gap="xs">
                  <TextInput
                    placeholder="ZIP code"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addZip(); }}
                    w={120}
                  />
                  <Button size="sm" variant="light" onClick={addZip}>Add</Button>
                </Group>
              )}
            </Stack>
          ) : (
            <Stack gap="xs">
              <TextInput label="Center ZIP" value={centerZip} onChange={(e) => setCenterZip(e.currentTarget.value)} w={140} />
              <Text size="sm">Radius: <strong>{radius} mi</strong></Text>
              <Slider min={1} max={100} value={radius} onChange={setRadius} />
            </Stack>
          )}

          <Button onClick={() => setOpenModal(null)}>Save</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
