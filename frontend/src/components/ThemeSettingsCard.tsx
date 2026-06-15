import { Badge, Card, Group, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { THEMES, THEME_IDS } from "../theme/themes";
import { useTheme } from "../theme/ThemeProvider";

export function ThemeSettingsCard() {
  const { themeId, setThemeId } = useTheme();

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack>
        <Group justify="space-between">
          <Title order={5}>Appearance</Title>
          <Badge size="sm" variant="light">{THEMES[themeId].label}</Badge>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 3 }}>
          {THEME_IDS.map((id) => {
            const def = THEMES[id];
            const isActive = themeId === id;
            return (
              <UnstyledButton key={id} onClick={() => setThemeId(id)}>
                <Stack gap={6} align="center">
                  <div
                    style={{
                      width: "100%",
                      height: 52,
                      borderRadius: 10,
                      background: def.brand.brandGradient,
                      border: isActive
                        ? "2.5px solid var(--gk-accent-primary)"
                        : "2px solid var(--gk-border)",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {/* mini sidebar strip */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "28%",
                        background: def.brand.bgSidebar,
                        opacity: 0.9,
                      }}
                    />
                    {/* mini canvas */}
                    <div
                      style={{
                        position: "absolute",
                        left: "30%",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        background: def.brand.bgCanvas,
                        opacity: 0.8,
                      }}
                    />
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: def.brand.accentPrimary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconCheck size={11} color="#fff" />
                      </div>
                    )}
                  </div>
                  <Text size="xs" fw={isActive ? 700 : 400} ta="center">
                    {def.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
