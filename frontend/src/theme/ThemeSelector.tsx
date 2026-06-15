import { Group, Select, Tooltip } from "@mantine/core";

import { resolveThemeId, THEMES } from "./themes";
import { useTheme } from "./ThemeProvider";

const OPTIONS = Object.values(THEMES).map((t) => ({
  value: t.id,
  label: t.label,
}));

function SwatchPreview({ themeId }: { themeId: string }) {
  const def = THEMES[resolveThemeId(themeId)];
  return (
    <Group gap={2} wrap="nowrap">
      {def.swatchColors.slice(0, 4).map((color) => (
        <span
          key={color}
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: color,
            border: "1px solid rgba(0,0,0,.12)",
            flexShrink: 0,
          }}
        />
      ))}
    </Group>
  );
}

export function ThemeSelector({ width = 200 }: { width?: number }) {
  const { themeId, setThemeId } = useTheme();

  return (
    <Select
      aria-label="Theme"
      data={OPTIONS}
      value={themeId}
      onChange={(value) => {
        if (value) {
          setThemeId(resolveThemeId(value));
        }
      }}
      allowDeselect={false}
      w={width}
      size="xs"
      leftSection={<SwatchPreview themeId={themeId} />}
      renderOption={({ option }) => {
        const def = THEMES[resolveThemeId(option.value)];
        return (
          <Tooltip label={def.description} multiline w={220} withArrow>
            <Group gap="xs" wrap="nowrap">
              <SwatchPreview themeId={option.value} />
              <span>{option.label}</span>
            </Group>
          </Tooltip>
        );
      }}
    />
  );
}
