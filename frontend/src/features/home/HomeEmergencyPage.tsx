import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Chip,
  Group,
  Loader,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertOctagon, IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const EMERGENCY_TYPES = [
  "Burst pipe", "No power", "Gas leak", "AC failure",
  "Flooded basement", "Broken furnace", "Sewage backup", "Other",
];

interface Claim {
  id: number;
  pro: string;
  trade: string;
  eta: string;
}

export function HomeEmergencyPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState(200);
  const [submitting, setSubmitting] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (step !== "success") return;
    const timer = setInterval(() => {
      setClaims((c) =>
        c.length < 3
          ? [
              ...c,
              {
                id: c.length + 1,
                pro: ["John Smith", "Dave Torres", "Maria Garcia"][c.length],
                trade: ["Plumber", "Electrician", "HVAC"][c.length],
                eta: `${10 + c.length * 5} min`,
              },
            ]
          : c,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [step]);

  async function handleSubmit() {
    if (!type || !description || !address) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setStep("success");
    setSubmitting(false);
  }

  if (step === "success") {
    return (
      <Center>
        <Stack maw={480} align="center" gap="lg">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#22C55E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconCheck size={40} color="#fff" />
          </div>
          <Title order={3} ta="center">Emergency broadcast sent!</Title>
          <Text size="sm" c="dimmed" ta="center">
            We're alerting nearby pros. They'll respond in minutes.
          </Text>

          <Card withBorder radius="md" padding="lg" w="100%">
            <Stack>
              <Text fw={600}>{type} · ${budget} budget</Text>
              <Text size="sm">{description}</Text>
              <Text size="xs" c="dimmed">{address}</Text>
            </Stack>
          </Card>

          <Stack w="100%" gap="sm">
            <Text fw={600}>
              {claims.length > 0 ? `${claims.length} pro${claims.length > 1 ? "s" : ""} responding` : "Waiting for responses…"}
            </Text>
            {claims.length === 0 && <Loader size="sm" />}
            {claims.map((c) => (
              <Card key={c.id} withBorder radius="md" padding="sm">
                <Badge color="green" variant="dot" mb="xs">En route</Badge>
                <Text fw={600}>{c.pro}</Text>
                <Text size="sm" c="dimmed">{c.trade} · ETA {c.eta}</Text>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack maw={520}>
      <Group gap="xs">
        <IconAlertOctagon size={24} color="#E74C3C" />
        <Title order={3} style={{ color: "#E74C3C" }}>Emergency Request</Title>
      </Group>

      <Alert color="red" variant="light">
        Only for genuine emergencies. Pros are on-call 24/7 and will respond within minutes.
      </Alert>

      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Text fw={600}>What's the emergency?</Text>
          <Chip.Group value={type} onChange={(v) => setType(v as string)}>
            <Box style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EMERGENCY_TYPES.map((t) => <Chip key={t} value={t} size="sm">{t}</Chip>)}
            </Box>
          </Chip.Group>

          <Textarea
            label="Describe the problem"
            placeholder="Give details so pros can come prepared…"
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
          />

          <TextInput
            label="Address"
            placeholder="123 Main St, Austin TX 78701"
            value={address}
            onChange={(e) => setAddress(e.currentTarget.value)}
            required
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Max budget:{" "}
              <strong style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>${budget}</strong>
            </Text>
            <Slider
              min={50}
              max={1000}
              step={50}
              value={budget}
              onChange={setBudget}
              marks={[
                { value: 200, label: "$200" },
                { value: 500, label: "$500" },
                { value: 1000, label: "$1000" },
              ]}
            />
          </Stack>

          <Button
            size="md"
            color="red"
            loading={submitting}
            disabled={!type || !description || !address}
            onClick={handleSubmit}
            leftSection={<IconAlertOctagon size={18} />}
            mt="sm"
          >
            Broadcast Emergency
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
