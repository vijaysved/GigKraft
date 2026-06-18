import { Box, Text, rem } from "@mantine/core";

interface GkLogoProps {
  height?: number;
  showTagline?: boolean;
}

export function GkLogo({ height = 48, showTagline = false }: GkLogoProps) {
  return (
    <Box>
      <Box
        component="img"
        src="/brand/gigKraftLogo.png"
        alt="GigKraft"
        h={height}
        w="auto"
        style={{ display: "block", objectFit: "contain" }}
      />
      {showTagline && (
        <Text
          size="sm"
          c="dimmed"
          mt={4}
          style={{ fontFamily: "var(--gk-font-script)", fontSize: rem(18) }}
        >
          I make it happen
        </Text>
      )}
    </Box>
  );
}
