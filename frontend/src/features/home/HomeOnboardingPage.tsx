import {
  Alert,
  Box,
  Button,
  Center,
  Chip,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconHome } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError, patchHomeProfile } from "../../api/endpoints";
import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";

const TRADES = ["Plumber", "Electrician", "HVAC", "Carpenter", "Painter"];

const ZIP_RE = /^\d{5}(-\d{4})?$/;

export function HomeOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [trade, setTrade] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleZipNext() {
    if (!ZIP_RE.test(zip.trim())) {
      setZipError("Enter a valid 5-digit ZIP code.");
      return;
    }
    setZipError(null);
    setStep(2);
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      await patchHomeProfile({
        default_zip: zip.trim(),
        preferred_trade: trade ?? "",
      });
      navigate("/home/discover", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={420} maw="100%">
          <Group justify="center">
            <GkLogo height={40} />
          </Group>
          <Paper withBorder shadow="md" p="lg" radius="lg" bg="var(--gk-bg-surface)">
            <Stack gap="md">
              <Group gap="xs">
                <IconHome size={20} color="var(--gk-accent-secondary)" />
                <Title order={4}>
                  {step === 1 ? "Where are you located?" : "What do you need help with?"}
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                {step === 1
                  ? "We'll show you pros in your area."
                  : "Pick a trade to get started — you can always change this later."}
              </Text>

              {error && <Alert color="red" variant="light">{error}</Alert>}

              {step === 1 && (
                <>
                  <TextInput
                    label="ZIP code"
                    placeholder="e.g. 90210"
                    value={zip}
                    onChange={(e) => setZip(e.currentTarget.value)}
                    error={zipError}
                    maxLength={10}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleZipNext()}
                  />
                  <Button
                    rightSection={<IconArrowRight size={16} />}
                    onClick={handleZipNext}
                    fullWidth
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Chip.Group value={trade ?? ""} onChange={(v) => setTrade(v as string)}>
                    <Group gap="sm" wrap="wrap">
                      {TRADES.map((t) => (
                        <Chip key={t} value={t} size="md">
                          {t}
                        </Chip>
                      ))}
                    </Group>
                  </Chip.Group>
                  <Text size="xs" c="dimmed">
                    Not sure? Skip and browse all trades.
                  </Text>
                  <Button
                    onClick={handleFinish}
                    loading={submitting}
                    fullWidth
                  >
                    {trade ? `Find a ${trade}` : "Browse all pros"}
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
