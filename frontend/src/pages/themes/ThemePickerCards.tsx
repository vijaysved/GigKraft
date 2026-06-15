import { Box, SimpleGrid, Text, UnstyledButton } from "@mantine/core";

import { THEMES, THEME_IDS, type ThemeId } from "../../theme/themes";

interface ThemePickerCardsProps {
  activeId: ThemeId;
  onSelect: (id: ThemeId) => void;
}

export function ThemePickerCards({ activeId, onSelect }: ThemePickerCardsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
      {THEME_IDS.map((id) => {
        const def = THEMES[id];
        const isActive = id === activeId;

        return (
          <UnstyledButton key={id} onClick={() => onSelect(id)} style={{ width: "100%" }}>
            <Box
              p="md"
              style={{
                borderRadius: 20,
                background: def.brand.cardHero,
                minHeight: 140,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: isActive
                  ? "0 0 0 3px #fff, 0 0 0 6px rgba(255,255,255,0.5)"
                  : "0 8px 20px rgba(0,0,0,.2)",
                transform: isActive ? "scale(1.03)" : "scale(1)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
            >
              <Text
                fw={800}
                size="sm"
                tt="uppercase"
                c="white"
                style={{ letterSpacing: 0.5, lineHeight: 1.2 }}
              >
                {def.label}
              </Text>
              <Text size="xs" c="rgba(255,255,255,0.85)" lineClamp={2}>
                {def.tagline}
              </Text>
              <Box mt="sm">
                <Box
                  style={{
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {def.swatchColors.slice(0, 4).map((c) => (
                    <Box
                      key={c}
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        background: c,
                        border: "1px solid rgba(255,255,255,.3)",
                      }}
                    />
                  ))}
                </Box>
                {isActive && (
                  <Text size="xs" c="white" fw={700} mt={6}>
                    ✓ Applied
                  </Text>
                )}
              </Box>
            </Box>
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}
