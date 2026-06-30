import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  FileButton,
  Grid,
  Group,
  Loader,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  Paper,
  PinInput,
  Radio,
  Rating,
  Select,
  SimpleGrid,
  Skeleton,
  Slider,
  Stack,
  Stepper,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSend, IconStar } from "@tabler/icons-react";
import { useRef, useState, type ReactNode } from "react";

import { useTheme } from "../../theme/ThemeProvider";
import { THEMES } from "../../theme/themes";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Stack gap={2}>
        <Title order={3}>{title}</Title>
        {subtitle && (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
      {children}
    </Stack>
  );
}

function PhotoSlot({
  label,
  required,
  filled,
}: {
  label: string;
  required?: boolean;
  filled?: boolean;
}) {
  const { themeId } = useTheme();
  const brand = THEMES[themeId].brand;

  return (
    <Box
      h={100}
      style={{
        borderRadius: 12,
        border: required
          ? `2px dashed ${brand.accentPrimary}`
          : `2px dashed ${brand.border}`,
        background: filled ? brand.bgSurface : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {filled ? (
        <Text size="xs" fw={600} c="green">
          ✦ After photo
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            + Upload
          </Text>
          <Text size="xs" c={required ? "blue" : "dimmed"} fw={600}>
            {label}
            {required ? " *" : ""}
          </Text>
        </>
      )}
    </Box>
  );
}

function BeforeAfterBanner() {
  return (
    <SimpleGrid cols={2} spacing={0}>
      <Box
        h={72}
        style={{
          background: "#94A3B8",
          borderRadius: "12px 0 0 12px",
          display: "flex",
          alignItems: "flex-end",
          padding: 8,
        }}
      >
        <Badge size="sm" color="gray">
          Before
        </Badge>
      </Box>
      <Box
        h={72}
        style={{
          background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
          borderRadius: "0 12px 12px 0",
          display: "flex",
          alignItems: "flex-end",
          padding: 8,
        }}
      >
        <Badge size="sm" color="green" variant="filled">
          ✦ After
        </Badge>
      </Box>
    </SimpleGrid>
  );
}

function ChatBubble({
  mine,
  children,
}: {
  mine?: boolean;
  children: ReactNode;
}) {
  const { themeId } = useTheme();
  const brand = THEMES[themeId].brand;

  return (
    <Box
      maw="75%"
      ml={mine ? "auto" : 0}
      mr={mine ? 0 : "auto"}
      px="md"
      py="sm"
      style={{
        borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: mine ? brand.accentPrimary : brand.bgSurface,
        color: mine ? "#fff" : undefined,
        border: mine ? "none" : `1px solid ${brand.border}`,
      }}
    >
      <Text size="sm">{children}</Text>
    </Box>
  );
}

export function ThemeComponentGallery() {
  const { themeId } = useTheme();
  const brand = THEMES[themeId].brand;

  const [activeStep, setActiveStep] = useState(1);
  const [rating, setRating] = useState(4);
  const [budget, setBudget] = useState(350);
  const [skills, setSkills] = useState<string[]>(["Plumbing", "Emergency"]);
  const [trade, setTrade] = useState<string | null>("plumbing");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const resetRef = useRef<() => void>(null);

  const skillOptions = ["Plumbing", "Electrical", "HVAC", "Emergency", "Painting"];

  function toggleSkill(tag: string) {
    setSkills((prev) =>
      prev.includes(tag) ? prev.filter((s) => s !== tag) : [...prev, tag],
    );
  }

  return (
    <Stack gap="xl">
      {/* ── Forms & data entry ── */}
      <Section
        title="Forms & data entry"
        subtitle="Registration, onboarding, lead intake, node settings"
      >
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="sm">
              <TextInput
                label="Email"
                placeholder="pro@example.com"
                required
                description="Required for account creation"
              />
              <TextInput
                label="Phone"
                placeholder="+1 (555) 000-0001"
                error="Enter a valid E.164 number"
              />
              <Select
                label="Primary trade"
                placeholder="Choose trade"
                value={trade}
                onChange={setTrade}
                data={[
                  { value: "plumbing", label: "Plumbing" },
                  { value: "electrical", label: "Electrical" },
                  { value: "painting", label: "Painting" },
                ]}
              />
              <NumberInput
                label="Final job cost ($)"
                placeholder="3200"
                thousandSeparator=","
                min={0}
              />
              <Radio.Group label="Availability" defaultValue="full">
                <Group mt="xs">
                  <Radio value="full" label="Full-time" />
                  <Radio value="part" label="Part-time" />
                </Group>
              </Radio.Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Skill tags
              </Text>
              <Group gap="xs">
                {skillOptions.map((tag) => (
                  <Chip
                    key={tag}
                    checked={skills.includes(tag)}
                    onChange={() => toggleSkill(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </Group>
              <Checkbox label="Licensed — show license number field" defaultChecked />
              <Checkbox label="Insured — COI on file" />
              <Slider
                label={`Emergency budget: $${budget}`}
                value={budget}
                onChange={setBudget}
                min={50}
                max={1000}
                step={25}
                marks={[
                  { value: 50, label: "$50" },
                  { value: 500, label: "$500" },
                  { value: 1000, label: "$1k" },
                ]}
              />
            </Stack>
          </Grid.Col>
        </Grid>
      </Section>

      {/* ── File upload ── */}
      <Section
        title="File & photo upload"
        subtitle="Kraft before/after, license PDF, COI, chat attachments"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Stack gap="sm">
            <Paper
              withBorder
              radius="lg"
              p="xl"
              ta="center"
              style={{
                borderStyle: "dashed",
                borderColor: brand.accentPrimary,
                borderWidth: 2,
                cursor: "pointer",
              }}
            >
              <Text fw={600} mb={4}>
                Drop files here
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                JPG, PNG, PDF · max 10 MB each
              </Text>
              <FileButton
                resetRef={resetRef}
                onChange={(files) => setUploadedFiles(files)}
                accept="image/png,image/jpeg,application/pdf"
                multiple
              >
                {(props) => (
                  <Button {...props} variant="light">
                    Browse files
                  </Button>
                )}
              </FileButton>
            </Paper>
            {uploadedFiles.length > 0 && (
              <Stack gap={4}>
                {uploadedFiles.map((f) => (
                  <Group key={f.name} gap="xs">
                    <Badge variant="light">{f.type.split("/")[1]?.toUpperCase()}</Badge>
                    <Text size="sm">{f.name}</Text>
                    <Text size="xs" c="dimmed" ff="monospace">
                      {(f.size / 1024).toFixed(0)} KB
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>

          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Kraft photo grid (After required to publish)
            </Text>
            <Text size="xs" c="dimmed">
              Before (optional)
            </Text>
            <SimpleGrid cols={2}>
              <PhotoSlot label="Before 1" />
              <PhotoSlot label="Before 2" />
            </SimpleGrid>
            <Text size="xs" c="blue" fw={600}>
              After (required)
            </Text>
            <SimpleGrid cols={2}>
              <PhotoSlot label="After 1" required filled />
              <PhotoSlot label="After 2" required />
            </SimpleGrid>
            <Group justify="space-between">
              <Badge color="yellow">Proof incomplete</Badge>
              <Button disabled>Add an After photo to publish</Button>
            </Group>
          </Stack>
        </SimpleGrid>
      </Section>

      {/* ── Reviews & recommendations ── */}
      <Section
        title="Reviews & recommendations"
        subtitle="Magic-link review, star rating, moderation queue"
      >
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Text fw={700} mb="xs">
                Leave a recommendation
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Bathroom pipe replacement · Waters Plumbing
              </Text>
              <Text size="sm" fw={600} mb={4}>
                Your rating
              </Text>
              <Rating value={rating} onChange={setRating} size="lg" mb="md" />
              <Textarea
                placeholder="What went well? Would you hire again?"
                minRows={3}
                mb="md"
              />
              <SimpleGrid cols={2} mb="md">
                <PhotoSlot label="Your photo (optional)" />
                <PhotoSlot label="Your photo (optional)" />
              </SimpleGrid>
              <Button fullWidth>Publish recommendation</Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Avatar radius="xl" color="blue">
                    TH
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>
                      Taylor Home
                    </Text>
                    <Text size="xs" c="dimmed">
                      Neighbor · 2 days ago
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" />
              </Group>
              <Text size="sm" fs="italic" mb="md">
                "Fixed our leak same day. Invoice matched the quote exactly."
              </Text>
              <BeforeAfterBanner />
              <Group mt="md" gap="sm">
                <Button size="sm" variant="light">
                  Reply
                </Button>
                <Button size="sm">Approve & publish</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </Section>

      {/* ── Quote & invoice ── */}
      <Section
        title="Quotes & invoices"
        subtitle="Chat-embedded quote cards, accept / counter"
      >
        <Card maw={420} withBorder>
          <Group justify="space-between" mb="sm">
            <Badge variant="filled">Quote</Badge>
            <Text size="xs" c="dimmed" ff="monospace">
              #Q-1042
            </Text>
          </Group>
          <Stack gap={6} mb="md">
            {[
              ["Labor — pipe replacement", "$120"],
              ["Parts — P-trap kit", "$28"],
            ].map(([item, price]) => (
              <Group key={item} justify="space-between">
                <Text size="sm">{item}</Text>
                <Text size="sm" ff="monospace">
                  {price}
                </Text>
              </Group>
            ))}
            <Box pt="xs" style={{ borderTop: `1px solid ${brand.border}` }}>
              <Group justify="space-between">
                <Text fw={700}>Total</Text>
                <Text fw={700} ff="monospace" c="green">
                  $148.00
                </Text>
              </Group>
            </Box>
          </Stack>
          <Group grow>
            <Button variant="outline">Counter</Button>
            <Button>Accept quote</Button>
          </Group>
        </Card>
      </Section>

      {/* ── Chat ── */}
      <Section title="Chat & messaging" subtitle="Lead threads, photo bubbles, quick actions">
        <Paper withBorder radius="lg" p="md">
          <Stack gap="sm">
            <Text size="xs" c="dimmed" ta="center">
              Today
            </Text>
            <ChatBubble>Hi — can you come look at a leak under the sink?</ChatBubble>
            <ChatBubble mine>Sure, I can be there by 4pm. Sending a quote now.</ChatBubble>
            <Box
              maw="60%"
              ml="auto"
              p="xs"
              style={{
                borderRadius: 12,
                border: `1px solid ${brand.border}`,
                overflow: "hidden",
              }}
            >
              <BeforeAfterBanner />
              <Text size="xs" c="dimmed" p="xs">
                Photo attachment
              </Text>
            </Box>
          </Stack>
          <Group mt="md" gap="xs" wrap="wrap">
            {["Send quote", "Send invoice", "Mark complete", "Request review"].map(
              (action) => (
                <Chip key={action} variant="light" defaultChecked={false}>
                  {action}
                </Chip>
              ),
            )}
          </Group>
          <Group mt="md" align="flex-end">
            <FileButton onChange={() => undefined} accept="image/*">
              {(props) => (
                <ActionIcon {...props} variant="light" size="lg" aria-label="Attach">
                  📎
                </ActionIcon>
              )}
            </FileButton>
            <TextInput
              placeholder="Type a message…"
              style={{ flex: 1 }}
              radius="xl"
            />
            <Button radius="xl">Send</Button>
          </Group>
        </Paper>
      </Section>

      {/* ── Auth & OTP ── */}
      <Section title="Auth & verification" subtitle="OTP, PIN entry, session">
        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="sm" align="flex-start">
              <Text size="sm" fw={600}>
                SMS verification code
              </Text>
              <PinInput length={6} type="number" placeholder="" size="md" />
              <Text size="xs" c="dimmed">
                Dev mock code: <Text span ff="monospace">123456</Text>
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder>
              <Group gap="sm">
                <Avatar size="lg" radius="xl" color="teal">
                  WM
                </Avatar>
                <Stack gap={2}>
                  <Text fw={700}>Waters Plumbing</Text>
                  <Group gap={6}>
                    <Badge color="green" size="sm">
                      Verified
                    </Badge>
                    <Badge color="blue" size="sm">
                      Insured
                    </Badge>
                  </Group>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </Section>

      {/* ── Navigation patterns ── */}
      <Section title="Navigation & layout patterns" subtitle="Tabs, stepper, accordion, breadcrumbs">
        <Stack gap="lg">
          <Breadcrumbs>
            <Text size="sm">Home</Text>
            <Text size="sm">Leads</Text>
            <Text size="sm" fw={600}>
              Pipe repair
            </Text>
          </Breadcrumbs>

          <Tabs defaultValue="outbound">
            <Tabs.List>
              <Tabs.Tab value="outbound" leftSection={<IconSend size={15} />}>Send review link</Tabs.Tab>
              <Tabs.Tab value="inbound" leftSection={<IconStar size={15} />}>
                Moderation
                <Badge size="xs" circle ml={6}>
                  2
                </Badge>
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="outbound" pt="md">
              <Text size="sm" c="dimmed">
                Request a magic-link review from a past client.
              </Text>
            </Tabs.Panel>
            <Tabs.Panel value="inbound" pt="md">
              <Text size="sm" c="dimmed">
                Approve incoming recommendations before they go public.
              </Text>
            </Tabs.Panel>
          </Tabs>

          <Stepper active={activeStep} onStepClick={setActiveStep} size="sm">
            <Stepper.Step label="Auth" description="Sign up" />
            <Stepper.Step label="Service area" description="ZIP + radius" />
            <Stepper.Step label="Visual" description="Photo + wallpaper" />
            <Stepper.Step label="Credentials" description="License & insurance" />
            <Stepper.Step label="Go live" description="Trade & bio" />
          </Stepper>

          <Accordion variant="separated" radius="md">
            <Accordion.Item value="dispatch">
              <Accordion.Control>Dispatch alerts</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Checkbox label="SMS alerts" defaultChecked />
                  <Checkbox label="WhatsApp dispatch" defaultChecked />
                  <Checkbox label="Weekly node digest" />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="addresses">
              <Accordion.Control>Saved addresses (2 properties)</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed">
                  78701 · 78704
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Section>

      {/* ── Admin & triage ── */}
      <Section
        title="Admin & triage actions"
        subtitle="Verify Kraft, blast emergency, suspend pro"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <BeforeAfterBanner />
            <Group mt="sm" mb="xs">
              <Text size="sm" fw={600}>
                Full interior repaint
              </Text>
              <Badge size="sm">Brush & Roll</Badge>
            </Group>
            <Group gap="xs" mb="md">
              <Badge color="green" variant="light">
                After photo ✓
              </Badge>
              <Badge color="green" variant="light">
                Invoice ✓
              </Badge>
            </Group>
            <Group gap="sm">
              <Button size="sm">Verify Kraft</Button>
              <Button size="sm" variant="outline" color="red">
                Reject
              </Button>
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Emergency #E-8821</Text>
              <Badge color="red">Unrouted</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="xs">
              Burst pipe · 78704 · Budget $400
            </Text>
            <Group gap="sm">
              <Button size="sm" color="green">
                WhatsApp blast
              </Button>
              <Button size="sm" variant="light">
                SMS pin
              </Button>
            </Group>
          </Card>
        </SimpleGrid>
      </Section>

      {/* ── Feedback & states ── */}
      <Section
        title="Loading, empty & feedback states"
        subtitle="Skeletons, loaders, modals, pagination, toasts"
      >
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="lg">
              <Text size="sm" fw={600} mb="sm">
                Loading skeleton
              </Text>
              <Skeleton height={8} radius="xl" mb="sm" />
              <Skeleton height={8} width="70%" radius="xl" mb="sm" />
              <Skeleton height={100} radius="md" />
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="lg" ta="center">
              <Loader size="md" mb="sm" />
              <Text size="sm" c="dimmed">
                Submitting Kraft…
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper
              withBorder
              p="xl"
              radius="lg"
              ta="center"
              style={{ borderStyle: "dashed" }}
            >
              <Text fw={600} mb={4}>
                No leads yet
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                When homeowners request quotes, they appear here.
              </Text>
              <Button variant="light" size="sm">
                Share profile link
              </Button>
            </Paper>
          </Grid.Col>
        </Grid>

        <Group gap="sm" mt="md">
          <Button onClick={openModal}>Open modal</Button>
          <Button variant="outline" color="red" onClick={openConfirm}>
            Confirm destructive action
          </Button>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="default">Row actions ▾</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>View profile</Menu.Item>
              <Menu.Item>Send message</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red">Suspend pro</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Tooltip label="Node live · austin-tx">
            <ActionIcon variant="light" size="lg" aria-label="Status">
              ●
            </ActionIcon>
          </Tooltip>
        </Group>

        <Pagination total={8} value={2} mt="md" />

        <Modal opened={modalOpen} onClose={closeModal} title="Invite pro" centered>
          <Stack gap="sm">
            <TextInput label="Email" placeholder="pro@example.com" />
            <Select
              label="Trade"
              data={["Plumbing", "Electrical", "Painting"]}
              placeholder="Select"
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={closeModal}>Send invite</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={confirmOpen}
          onClose={closeConfirm}
          title="Suspend pro?"
          centered
        >
          <Text size="sm" mb="lg">
            Waters Plumbing will be hidden from discovery until reinstated.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button color="red" onClick={closeConfirm}>
              Suspend
            </Button>
          </Group>
        </Modal>
      </Section>

      {/* ── Activity feed ── */}
      <Section title="Activity timeline" subtitle="Node manager dashboard feed">
        <Timeline active={2} bulletSize={24} lineWidth={2}>
          <Timeline.Item title="Kraft verified" bullet={<Badge size="xs">✓</Badge>}>
            <Text size="xs" c="dimmed">
              200A panel upgrade · Sparks Electric · 12m ago
            </Text>
          </Timeline.Item>
          <Timeline.Item title="Emergency claimed">
            <Text size="xs" c="dimmed">
              E-8820 · Waters Plumbing · 34m ago
            </Text>
          </Timeline.Item>
          <Timeline.Item title="New pro registered">
            <Text size="xs" c="dimmed">
              Brush & Roll Painting · 2h ago
            </Text>
          </Timeline.Item>
        </Timeline>
      </Section>
    </Stack>
  );
}
