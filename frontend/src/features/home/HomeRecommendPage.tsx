import { Card, Stack, Text, Title } from "@mantine/core";

export function HomeRecommendPage() {
  return (
    <Stack maw={480}>
      <Title order={3}>Recommend a Neighbor</Title>
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Text c="dimmed">
            Neighbor referrals are coming in a future release. You'll be able to
            share verified pro recommendations with friends and neighbors.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
