import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { GkLogo } from "../brand/GkLogo";
import { useTheme } from "../theme/ThemeProvider";
import { THEMES, THEME_IDS } from "../theme/themes";
import { ThemePickerCards } from "./themes/ThemePickerCards";
import { ThemeComponentGallery } from "./themes/ThemeComponentGallery";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Title order={3}>{title}</Title>
      {children}
    </Stack>
  );
}

function AppShellPreview() {
  const { themeId } = useTheme();
  const brand = THEMES[themeId].brand;
  const nav = ["Dashboard", "Leads", "Krafts", "Settings"];

  return (
    <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
      <Group align="stretch" gap={0} wrap="nowrap">
        <Box
          w={200}
          p="md"
          style={{
            background: brand.bgSidebar,
            minHeight: 280,
          }}
        >
          <Text
            size="xs"
            fw={800}
            tt="uppercase"
            c={brand.textOnSidebar}
            mb="lg"
            style={{ letterSpacing: 1 }}
          >
            GigKraft
          </Text>
          <Stack gap={6}>
            {nav.map((item, i) => (
              <Box
                key={item}
                px="sm"
                py={8}
                style={{
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: brand.textOnSidebar,
                  background:
                    i === 1
                      ? brand.bgSidebarActive
                      : "rgba(255,255,255,0.08)",
                }}
              >
                {item}
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack gap="md" p="md" style={{ flex: 1, background: brand.bgCanvas }}>
          <Group justify="space-between">
            <Title order={4}>Leads</Title>
            <Badge variant="filled">3 active</Badge>
          </Group>
          <SimpleGrid cols={2}>
            <Card padding="sm">
              <Text size="sm" fw={600}>
                Pipe repair — Taylor H.
              </Text>
              <Text size="xs" c="dimmed">
                2h left to respond
              </Text>
              <Progress value={65} mt="sm" size="sm" />
            </Card>
            <Card padding="sm" style={{ borderColor: brand.accentSecondary, borderWidth: 2 }}>
              <Text size="sm" fw={600}>
                Selected lead
              </Text>
              <Text size="xs" c="dimmed">
                Quote sent · $420
              </Text>
              <Group mt="sm" gap="xs">
                <Button size="xs">Reply</Button>
                <Button size="xs" variant="light" color="gray">
                  Archive
                </Button>
              </Group>
            </Card>
          </SimpleGrid>
        </Stack>
      </Group>
    </Paper>
  );
}

export function ThemesPage() {
  const { themeId, setThemeId } = useTheme();
  const def = THEMES[themeId];
  const [segment, setSegment] = useState("active");

  return (
    <Box
      mih="100vh"
      style={{
        background: def.brand.bgCanvas,
        transition: "background 0.25s ease",
      }}
    >
      <Box
        px="xl"
        py="lg"
        style={{
          background: def.brand.brandGradient,
          color: "#fff",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" mb="lg">
          <Stack gap={4}>
            <Title order={1} c="white" style={{ textTransform: "none" }}>
              Theme Playground
            </Title>
            <Text c="rgba(255,255,255,0.9)" maw={560}>
              Pick a theme — every element below updates to that color pattern.
              Scroll for forms, uploads, reviews, chat, quotes, and admin actions.
            </Text>
          </Stack>
          <Button component={Link} to="/login" variant="default" c="dark">
            Sign in
          </Button>
        </Group>

        <ThemePickerCards activeId={themeId} onSelect={setThemeId} />
      </Box>

      <Box px="xl" py="xl" maw={1200} mx="auto">
        <Stack gap="xl">
          <Paper
            p="md"
            radius="lg"
            withBorder
            style={{ borderColor: def.brand.border }}
          >
            <Group justify="space-between" wrap="wrap">
              <Stack gap={2}>
                <Text size="xl" fw={800} tt="uppercase">
                  {def.label}
                </Text>
                <Text size="sm" c="dimmed">
                  {def.tagline} — {def.description}
                </Text>
              </Stack>
              <Group gap={6}>
                {def.swatchColors.map((c) => (
                  <Box key={c} ta="center">
                    <Box
                      w={48}
                      h={48}
                      style={{
                        background: c,
                        borderRadius: 12,
                        border: "2px solid rgba(0,0,0,.08)",
                      }}
                    />
                    <Text size="xs" ff="monospace" mt={4}>
                      {c}
                    </Text>
                  </Box>
                ))}
              </Group>
            </Group>
          </Paper>

          <Grid gap="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Section title="Typography">
                <Stack gap="xs">
                  <Title order={1}>Display H1</Title>
                  <Title order={2}>Section H2</Title>
                  <Title order={3}>Card H3</Title>
                  <Text>Body text — discover verified pros with proof, not reviews.</Text>
                  <Text c="dimmed" size="sm">
                    Muted secondary copy for hints and metadata.
                  </Text>
                  <Text ff="monospace" fw={600} c="teal">
                    $3,200.00 · SLA 3h 48m · ZIP 78701
                  </Text>
                </Stack>
              </Section>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Section title="Buttons">
                <Group gap="sm">
                  <Button>Primary</Button>
                  <Button
                    style={{
                      background: def.brand.accentSecondary,
                    }}
                  >
                    Secondary
                  </Button>
                  <Button variant="light">Light</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="subtle">Subtle</Button>
                  <Button color="red">Danger</Button>
                </Group>
              </Section>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Section title="Badges & alerts">
                <Group gap="sm">
                  <Badge color="green">Verified</Badge>
                  <Badge color="yellow">Pending</Badge>
                  <Badge color="red">Urgent</Badge>
                  <Badge variant="filled">Pro</Badge>
                </Group>
                <Alert color="blue" title="Info" variant="light">
                  Kraft submitted for review.
                </Alert>
                <Alert color="green" title="Success" variant="light">
                  Emergency dispatched to 8 local pros.
                </Alert>
              </Section>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Section title="Inputs">
                <Stack gap="sm">
                  <TextInput label="Search" placeholder="Trade or ZIP…" />
                  <Textarea
                    label="Job description"
                    placeholder="Describe the work…"
                    minRows={2}
                  />
                  <Switch label="SMS dispatch alerts" defaultChecked />
                </Stack>
              </Section>
            </Grid.Col>

            <Grid.Col span={12}>
              <Section title="Cards & proof">
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                  <Card>
                    <Box
                      h={80}
                      mb="sm"
                      style={{
                        background: def.brand.brandGradient,
                        borderRadius: 12,
                      }}
                    />
                    <Badge size="sm" mb="xs">
                      Verified invoice
                    </Badge>
                    <Text fw={700}>200A panel upgrade</Text>
                    <Text size="sm" c="dimmed">
                      Sparks Electric · 1.2 mi
                    </Text>
                    <Text ff="monospace" fw={700} c="green" mt="xs">
                      $3,200
                    </Text>
                  </Card>
                  <Card>
                    <Text fw={700} mb="xs">
                      Lead card
                    </Text>
                    <Text size="sm" c="dimmed">
                      Bathroom pipe replacement
                    </Text>
                    <SegmentedControl
                      mt="md"
                      size="xs"
                      value={segment}
                      onChange={setSegment}
                      data={[
                        { label: "Active", value: "active" },
                        { label: "In progress", value: "progress" },
                        { label: "Archived", value: "archived" },
                      ]}
                    />
                  </Card>
                  <Card style={{ background: def.brand.bgSurface }}>
                    <Text fw={700}>Progress</Text>
                    <Progress value={72} mt="md" />
                    <Text size="xs" c="dimmed" mt="xs">
                      Response SLA 72%
                    </Text>
                  </Card>
                </SimpleGrid>
              </Section>
            </Grid.Col>

            <Grid.Col span={12}>
              <Section title="Table">
                <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Pro</Table.Th>
                        <Table.Th>Trade</Table.Th>
                        <Table.Th>SLA</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td>Waters Plumbing</Table.Td>
                        <Table.Td>Plumbing</Table.Td>
                        <Table.Td ff="monospace">1h 52m</Table.Td>
                        <Table.Td>
                          <Badge color="green">Active</Badge>
                        </Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td>Sparks Electric</Table.Td>
                        <Table.Td>Electrical</Table.Td>
                        <Table.Td ff="monospace">3h 10m</Table.Td>
                        <Table.Td>
                          <Badge color="yellow">At risk</Badge>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Paper>
              </Section>
            </Grid.Col>

            <Grid.Col span={12}>
              <Section title="App shell preview (sidebar + split content)">
                <AppShellPreview />
              </Section>
            </Grid.Col>

            <Grid.Col span={12}>
              <ThemeComponentGallery />
            </Grid.Col>

            <Grid.Col span={12}>
              <Section title="Brand logo on canvas">
                <Group align="center" gap="xl">
                  <GkLogo height={64} showTagline />
                  <Box
                    component="img"
                    src="/brand/theme-cards-reference.png"
                    alt="Five theme card reference"
                    style={{
                      maxWidth: 320,
                      borderRadius: 16,
                      boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                    }}
                  />
                </Group>
              </Section>
            </Grid.Col>
          </Grid>

          <Text size="sm" c="dimmed" ta="center">
            Active theme: <strong>{def.label}</strong> · persisted in browser ·{" "}
            {THEME_IDS.length} patterns
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
