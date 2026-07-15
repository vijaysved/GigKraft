import { Alert, Badge, Box, Button, Card, Center, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { communityFetch } from "./hooks/useCommunity";

const FEATURES = [
  "Unlimited Members and Pro List entries",
  "Your own branded public directory page",
  "Member roster with phone or Google verification",
  "Basic analytics — views, members, requests",
];

export function CommunityCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(selected: "monthly" | "annual") {
    setPlan(selected);
    setLoading(selected);
    setError(null);
    try {
      const res = await communityFetch("/api/communities/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json() as { url?: string; detail?: string };
      if (!res.ok || !data.url) throw new Error(data.detail ?? "Checkout failed.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(null);
    }
  }

  return (
    <Box py="xl">
      <Center>
        <Stack gap="lg" w="100%" maw={520} px="md">
          <Stack gap={4} align="center">
            <Title order={2} ta="center">Start a Community Directory</Title>
            <Text ta="center" size="sm" c="dimmed">
              A branded directory page for your group — roster of Members and a curated Pro List.
            </Text>
          </Stack>

          <Group gap="lg" justify="center" wrap="wrap">
            {FEATURES.map((f) => (
              <Group key={f} gap={6} wrap="nowrap">
                <IconCheck size={14} color="var(--gk-accent-primary)" />
                <Text size="sm">{f}</Text>
              </Group>
            ))}
          </Group>

          <Card withBorder radius="lg" p="xl">
            <Stack gap="md">
              <Group grow>
                <Card
                  withBorder
                  radius="md"
                  p="md"
                  onClick={() => setPlan("monthly")}
                  style={{ cursor: "pointer", borderColor: plan === "monthly" ? "var(--gk-accent-primary)" : undefined, borderWidth: plan === "monthly" ? 2 : 1 }}
                >
                  <Stack gap={0} align="center">
                    <Text fw={700}>Monthly</Text>
                    <Text size="xl" fw={800}>$9.99<Text span size="sm" fw={500}>/mo</Text></Text>
                  </Stack>
                </Card>
                <Card
                  withBorder
                  radius="md"
                  p="md"
                  onClick={() => setPlan("annual")}
                  style={{ cursor: "pointer", borderColor: plan === "annual" ? "var(--gk-accent-primary)" : undefined, borderWidth: plan === "annual" ? 2 : 1 }}
                >
                  <Stack gap={0} align="center">
                    <Group gap={6}>
                      <Text fw={700}>Annual</Text>
                      <Badge size="xs" color="green" variant="light">Save 17%</Badge>
                    </Group>
                    <Text size="xl" fw={800}>$99.99<Text span size="sm" fw={500}>/yr</Text></Text>
                  </Stack>
                </Card>
              </Group>

              {error && <Alert color="red" variant="light">{error}</Alert>}

              <Button
                size="xs"
                radius="xl"
                fullWidth
                loading={!!loading}
                style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
                onClick={() => void startCheckout(plan)}
              >
                {loading ? <Loader size="xs" color="#fff" /> : `Subscribe — ${plan === "monthly" ? "$9.99/mo" : "$99.99/yr"}`}
              </Button>
              <Text size="xs" ta="center" c="dimmed">Cancel anytime. Downgrade to a free, read-only archive whenever you like.</Text>
            </Stack>
          </Card>

          <Button variant="subtle" size="xs" radius="xl" onClick={() => navigate(`/us/${slug}/home`)}>← Back to Dashboard</Button>
        </Stack>
      </Center>
    </Box>
  );
}
