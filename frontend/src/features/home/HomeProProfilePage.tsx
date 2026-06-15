import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import { GkBeforeAfter } from "../../components/GkBeforeAfter";
import { GkProofBadge } from "../../components/GkProofBadge";

const MOCK_PRO = {
  id: 1, name: "John Smith", trade: "Plumber", verified: true,
  recs: 12, krafts: 8, avgResponse: "2h",
  bio: "Licensed and insured plumber with 10 years of residential and commercial experience. I specialize in leak repairs, water heater installation, and drain cleaning.",
  invoiceAmount: 280,
  reviews: [
    { author: "Sarah J.", rating: 5, text: "Fixed our kitchen faucet quickly and professionally." },
    { author: "Mark R.", rating: 5, text: "Excellent work. Very clean and on time." },
  ],
};

export function HomeProProfilePage() {
  useParams(); // id used for future fetch
  const navigate = useNavigate();
  const pro = MOCK_PRO;

  return (
    <Stack>
      <Group>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} size="sm" onClick={() => navigate("/home/discover")}>
          Back
        </Button>
      </Group>

      <Card withBorder radius="md" padding="lg">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Title order={3}>{pro.name}</Title>
              {pro.verified && <Badge color="green">Verified</Badge>}
            </Group>
            <Text c="dimmed">{pro.trade}</Text>
            <Text size="sm">{pro.bio}</Text>
          </Stack>
        </Group>
        <Divider my="md" />
        <Group gap="xl">
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{pro.recs}</Text>
            <Text size="xs" c="dimmed">Reviews</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{pro.krafts}</Text>
            <Text size="xs" c="dimmed">Krafts</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text fw={800} size="xl">{pro.avgResponse}</Text>
            <Text size="xs" c="dimmed">Avg response</Text>
          </Stack>
        </Group>
      </Card>

      <Title order={4}>Recent Krafts</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} withBorder radius="md" padding="sm">
            <GkBeforeAfter height={90} />
            <Group mt="xs" gap="xs">
              <GkProofBadge amount={pro.invoiceAmount} confirmed={pro.verified} />
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Title order={4}>Reviews</Title>
      <Stack gap="sm">
        {pro.reviews.map((r, i) => (
          <Card key={i} withBorder radius="md" padding="md">
            <Group justify="space-between">
              <Text fw={600}>{r.author}</Text>
              <Badge color="yellow">★ {r.rating}/5</Badge>
            </Group>
            <Text size="sm" mt="xs">"{r.text}"</Text>
          </Card>
        ))}
      </Stack>

      <Box
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--gk-bg-surface)",
          borderTop: "1px solid var(--gk-border)",
          padding: "12px 0",
        }}
      >
        <Group>
          <Button flex={1} variant="light" onClick={() => navigate(`/home/messages`)}>
            Message
          </Button>
          <Button flex={1} onClick={() => navigate(`/home/messages`)}>
            Request quote
          </Button>
        </Group>
      </Box>
    </Stack>
  );
}
