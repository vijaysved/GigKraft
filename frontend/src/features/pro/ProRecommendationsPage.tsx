import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";

import { GkEmptyState } from "../../components/GkEmptyState";

const MOCK_INBOUND = [
  { id: 1, client: "Sarah J.", text: "John fixed my faucet in under an hour. Highly recommend!", rating: 5, status: "pending" },
  { id: 2, client: "Mark R.", text: "Excellent work on our circuit panel.", rating: 4, status: "pending" },
];

export function ProRecommendationsPage() {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [sent, setSent] = useState(false);

  function sendRequest() {
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <Stack>
      <Title order={3}>Recommendations</Title>

      <Tabs defaultValue="outbound">
        <Tabs.List>
          <Tabs.Tab value="outbound">Request review</Tabs.Tab>
          <Tabs.Tab value="inbound" rightSection={<Badge size="xs">{MOCK_INBOUND.length}</Badge>}>
            Pending moderation
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="outbound" pt="md">
          <Card withBorder radius="md" padding="lg" maw={480}>
            <Stack>
              <Text size="sm" c="dimmed">
                Send a magic-link review request to a past client. They'll rate and write a recommendation that you can approve.
              </Text>
              <TextInput
                label="Client name"
                placeholder="Sarah Johnson"
                value={clientName}
                onChange={(e) => setClientName(e.currentTarget.value)}
              />
              <TextInput
                label="Phone / email"
                placeholder="+1 555 000 0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.currentTarget.value)}
              />
              <Group gap="xs">
                <Button
                  size="xs"
                  variant={channel === "sms" ? "filled" : "light"}
                  onClick={() => setChannel("sms")}
                >
                  SMS
                </Button>
                <Button
                  size="xs"
                  variant={channel === "whatsapp" ? "filled" : "light"}
                  onClick={() => setChannel("whatsapp")}
                >
                  WhatsApp
                </Button>
              </Group>
              <Button
                loading={sent}
                disabled={!clientName || !clientPhone}
                onClick={sendRequest}
              >
                {sent ? "Sent!" : "Send review request"}
              </Button>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="inbound" pt="md">
          {MOCK_INBOUND.length === 0 ? (
            <GkEmptyState title="No pending recommendations" />
          ) : (
            <Stack gap="sm">
              {MOCK_INBOUND.map((rec) => (
                <Card key={rec.id} withBorder radius="md" padding="md">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={700}>{rec.client}</Text>
                      <Badge color="yellow">★ {rec.rating}/5</Badge>
                    </Group>
                    <Text size="sm">"{rec.text}"</Text>
                    <Group gap="xs">
                      <Button size="xs" color="green">Approve</Button>
                      <Button size="xs" variant="light" color="red">Decline</Button>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
