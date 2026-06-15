import { Badge, Box, Group, Image, Text } from "@mantine/core";

interface GkBeforeAfterProps {
  beforeUrl?: string;
  afterUrl?: string;
  height?: number;
}

export function GkBeforeAfter({ beforeUrl, afterUrl, height = 120 }: GkBeforeAfterProps) {
  return (
    <Group gap={4} wrap="nowrap">
      <Box style={{ flex: 1, position: "relative" }}>
        {beforeUrl ? (
          <Image src={beforeUrl} h={height} fit="cover" radius="sm" style={{ filter: "grayscale(0.4)" }} />
        ) : (
          <Box h={height} style={{ background: "#E2E8F0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Text size="xs" c="dimmed">Before</Text>
          </Box>
        )}
        <Badge size="xs" style={{ position: "absolute", top: 4, left: 4 }} color="gray">Before</Badge>
      </Box>
      <Box style={{ flex: 1, position: "relative" }}>
        {afterUrl ? (
          <Image src={afterUrl} h={height} fit="cover" radius="sm" />
        ) : (
          <Box h={height} style={{ background: "#DCFCE7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Text size="xs" c="dimmed">After</Text>
          </Box>
        )}
        <Badge size="xs" color="green" style={{ position: "absolute", top: 4, left: 4 }}>✦ After</Badge>
      </Box>
    </Group>
  );
}
