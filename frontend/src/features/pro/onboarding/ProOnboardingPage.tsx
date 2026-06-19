import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAt, IconCheck } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WallpaperBackground } from "../../../brand/WallpaperBackground";
import { ProServiceAreaPage, type ProServiceAreaHandle } from "../ProServiceAreaPage";
import { ProProfilePage, type ProProfileHandle } from "../ProProfilePage";
import { useAuth } from "../../../auth/AuthContext";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import {
  generateDefaultHandle,
  isValidHandle,
  sanitizeHandle,
  useProHandle,
} from "../../../hooks/useProHandle";

const STEPS = [
  { label: "Your name", description: "How pros know you" },
  { label: "Service area", description: "Where you work" },
  { label: "Credentials", description: "License & insurance" },
  { label: "Trade & skills", description: "Your expertise" },
  { label: "Profile photo", description: "Look professional" },
];

export function ProOnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — name + handle
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [handleInput, setHandleInput] = useState(
    () => generateDefaultHandle(user?.first_name, user?.last_name),
  );
  const [handleTouched, setHandleTouched] = useState(false);

  const { setHandle } = useProHandle({ firstName, lastName });

  const handleSanitized = sanitizeHandle(handleInput);
  const handleValid = isValidHandle(handleSanitized);

  // Auto-suggest handle from name unless user has manually edited it
  function onFirstNameChange(v: string) {
    setFirstName(v);
    if (!handleTouched) setHandleInput(generateDefaultHandle(v, lastName));
  }
  function onLastNameChange(v: string) {
    setLastName(v);
    if (!handleTouched) setHandleInput(generateDefaultHandle(firstName, v));
  }

  const serviceAreaRef = useRef<ProServiceAreaHandle>(null);
  const profileRef = useRef<ProProfileHandle>(null);

  async function next() {
    setSaving(true);
    try {
      if (active === 0) {
        // Save name to backend
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken() ?? ""}` },
          body: JSON.stringify({ first_name: firstName, last_name: lastName }),
        });
        if (res.ok) updateUser({ first_name: firstName, last_name: lastName });
        if (handleValid) await setHandle(handleSanitized);
      }
      if (active === 1) {
        await serviceAreaRef.current?.save();
      }
      if (active === STEPS.length - 1) {
        await profileRef.current?.save();
      }
    } finally {
      setSaving(false);
    }
    if (active < STEPS.length - 1) setActive(active + 1);
    else navigate("/pro/leads");
  }

  function skip() {
    navigate("/pro/leads");
  }

  const canAdvance = active !== 0 || (firstName.trim().length > 0 && handleValid);

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
              {/* Step 0 — Name + handle */}
              {active === 0 && (
                <Stack gap="md" py="sm">
                  <Stack gap={4}>
                    <Title order={4}>What's your name?</Title>
                    <Text size="sm" c="dimmed">
                      Pre-filled from Google — edit if needed. This appears on your public profile.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={2} spacing="sm">
                    <TextInput
                      label="First name"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => onFirstNameChange(e.currentTarget.value)}
                      autoFocus
                    />
                    <TextInput
                      label="Last name"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => onLastNameChange(e.currentTarget.value)}
                    />
                  </SimpleGrid>

                  <Divider label="Your public handle" labelPosition="left" />

                  <TextInput
                    leftSection={<IconAt size={16} />}
                    placeholder="jane-smith"
                    value={handleInput}
                    onChange={(e) => { setHandleInput(e.currentTarget.value); setHandleTouched(true); }}
                    description={handleInput ? `gigKraft.com/pros/${handleSanitized}` : "Letters, numbers, and hyphens only. 3–30 characters."}
                    error={handleInput && !handleValid ? "Must be 3–30 characters, letters/numbers/hyphens only" : undefined}
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
                </Stack>
              )}

              {active === 1 && <ProServiceAreaPage ref={serviceAreaRef} />}
              {(active === 2 || active === 3 || active === 4) && <ProProfilePage ref={profileRef} />}
            </Box>

            <Group justify="space-between">
              <Button variant="subtle" size="sm" onClick={skip}>Skip for now</Button>
              <Group gap="xs">
                {active > 0 && (
                  <Button variant="light" size="sm" onClick={() => setActive(active - 1)}>Back</Button>
                )}
                <Button size="sm" onClick={() => void next()} disabled={!canAdvance} loading={saving}>
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
