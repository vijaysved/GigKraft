import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Group,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAt, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { WallpaperBackground } from "../../../brand/WallpaperBackground";
import { ProServiceAreaPage } from "../ProServiceAreaPage";
import { ProProfilePage } from "../ProProfilePage";
import { useAuth } from "../../../auth/AuthContext";
import {
  generateDefaultHandle,
  isValidHandle,
  sanitizeHandle,
  useProHandle,
} from "../../../hooks/useProHandle";

const STEPS = [
  { label: "Your handle", description: "Public profile URL" },
  { label: "Service area", description: "Where you work" },
  { label: "Credentials", description: "License & insurance" },
  { label: "Trade & skills", description: "Your expertise" },
  { label: "Profile photo", description: "Look professional" },
];

export function ProOnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setHandle } = useProHandle({
    firstName: user?.first_name,
    lastName: user?.last_name,
  });

  const [active, setActive] = useState(0);
  const [handleInput, setHandleInput] = useState(
    () => generateDefaultHandle(user?.first_name, user?.last_name),
  );

  const handleSanitized = sanitizeHandle(handleInput);
  const handleValid = isValidHandle(handleSanitized);

  function next() {
    if (active === 0 && handleValid) {
      void setHandle(handleSanitized);
    }
    if (active < STEPS.length - 1) setActive(active + 1);
    else navigate("/pro/leads");
  }

  function skip() {
    navigate("/pro/leads");
  }

  const canAdvance = active !== 0 || handleValid;

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Card withBorder shadow="lg" radius="lg" p="xl" w="100%" maw={640} bg="var(--gk-bg-surface)">
          <Stack gap="lg">
            <Stack gap={4} align="center">
              <Title order={3}>Set up your profile</Title>
              <Text size="sm" c="dimmed">Step {active + 1} of {STEPS.length}</Text>
            </Stack>

            <Stepper active={active} size="xs">
              {STEPS.map((step) => (
                <Stepper.Step key={step.label} label={step.label} description={step.description} />
              ))}
            </Stepper>

            <Box>
              {/* Step 0 — Handle picker */}
              {active === 0 && (
                <Stack gap="md" py="sm">
                  <Stack gap={4}>
                    <Title order={4}>Choose your public handle</Title>
                    <Text size="sm" c="dimmed">
                      This becomes your public profile URL. You can change it later in your profile.
                    </Text>
                  </Stack>

                  <TextInput
                    leftSection={<IconAt size={16} />}
                    placeholder="john-smith"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.currentTarget.value)}
                    description={
                      handleInput
                        ? `gigkraft.com/pros/${handleSanitized}`
                        : "Letters, numbers, and hyphens only. 3–30 characters."
                    }
                    error={
                      handleInput && !handleValid
                        ? "Must be 3–30 characters, letters/numbers/hyphens only"
                        : undefined
                    }
                    rightSection={handleValid ? <IconCheck size={16} color="green" /> : undefined}
                  />

                  {handleValid && (
                    <Alert color="green" variant="light" icon={<IconCheck size={14} />}>
                      Your profile will be live at{" "}
                      <strong style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        /pros/{handleSanitized}
                      </strong>
                    </Alert>
                  )}

                  <Text size="xs" c="dimmed">
                    We suggested a handle based on your name. Feel free to change it — pick something memorable.
                  </Text>
                </Stack>
              )}

              {active === 1 && <ProServiceAreaPage />}
              {(active === 2 || active === 3 || active === 4) && <ProProfilePage />}
            </Box>

            <Group justify="space-between">
              <Button variant="subtle" size="sm" onClick={skip}>Skip for now</Button>
              <Group gap="xs">
                {active > 0 && (
                  <Button variant="light" size="sm" onClick={() => setActive(active - 1)}>Back</Button>
                )}
                <Button size="sm" onClick={next} disabled={!canAdvance}>
                  {active === STEPS.length - 1 ? "Finish setup" : "Continue"}
                </Button>
              </Group>
            </Group>
          </Stack>
        </Card>
      </Center>
    </Box>
  );
}
