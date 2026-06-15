import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Slider,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useState } from "react";

import { client } from "../../api/client";

export interface ProServiceAreaHandle {
  save: () => Promise<void>;
}

export const ProServiceAreaPage = forwardRef<ProServiceAreaHandle>(function ProServiceAreaPage(_props, ref) {
  const [mode, setMode] = useState<"zips" | "radius">("zips");
  const [zips, setZips] = useState<string[]>([]);
  const [zipInput, setZipInput] = useState("");
  const [centerZip, setCenterZip] = useState("");
  const [radius, setRadius] = useState(25);
  const [saved, setSaved] = useState(false);

  function addZip() {
    const z = zipInput.trim();
    if (!z || zips.includes(z) || zips.length >= 3) return;
    setZips([...zips, z]);
    setZipInput("");
  }

  function removeZip(z: string) {
    setZips(zips.filter((x) => x !== z));
  }

  async function save() {
    await client.PATCH("/api/pros/me/service-area", {
      body: {
        service_mode: mode === "radius" ? "radial" : "explicit",
        service_zips: mode === "zips" ? zips : undefined,
        service_center_zip: mode === "radius" ? centerZip : undefined,
        service_radius_miles: mode === "radius" ? radius : undefined,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  useImperativeHandle(ref, () => ({ save }));

  return (
    <Stack maw={560}>
      <Title order={3}>Service Area</Title>

      <Group gap="xs">
        <Button
          size="xs"
          variant={mode === "zips" ? "filled" : "light"}
          onClick={() => setMode("zips")}
        >
          ZIP codes (max 3)
        </Button>
        <Button
          size="xs"
          variant={mode === "radius" ? "filled" : "light"}
          onClick={() => setMode("radius")}
        >
          Center ZIP + radius
        </Button>
      </Group>

      <Card withBorder radius="md" padding="lg">
        {mode === "zips" ? (
          <Stack>
            <Text size="sm" c="dimmed">Add up to 3 ZIP codes you serve.</Text>
            <Group gap="xs">
              {zips.map((z) => (
                <Badge
                  key={z}
                  size="md"
                  rightSection={
                    <ActionIcon size="xs" color="gray" variant="transparent" onClick={() => removeZip(z)}>
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  {z}
                </Badge>
              ))}
            </Group>
            {zips.length < 3 && (
              <Group gap="xs">
                <TextInput
                  placeholder="ZIP code"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addZip(); }}
                  w={140}
                />
                <Button size="sm" variant="light" onClick={addZip}>Add</Button>
              </Group>
            )}
          </Stack>
        ) : (
          <Stack>
            <TextInput
              label="Center ZIP"
              value={centerZip}
              onChange={(e) => setCenterZip(e.currentTarget.value)}
              w={160}
            />
            <Stack gap="xs">
              <Text size="sm">Radius: <strong>{radius} mi</strong></Text>
              <Slider min={1} max={100} value={radius} onChange={setRadius} marks={[{ value: 25 }, { value: 50 }, { value: 75 }]} />
            </Stack>
          </Stack>
        )}
      </Card>

      <Button onClick={() => void save()} color={saved ? "green" : undefined}>
        {saved ? "Saved!" : "Save service area"}
      </Button>
    </Stack>
  );
});
