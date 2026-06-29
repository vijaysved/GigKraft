import { useState } from "react";
import { ActionIcon, Group, Text, TextInput } from "@mantine/core";
import { IconCheck, IconMapPin, IconPencil, IconX } from "@tabler/icons-react";

interface Props {
  zip: string;
  setZip: (zip: string) => void;
  clearZip: () => void;
}

export function LocationBadge({ zip, setZip, clearZip }: Props) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function startEdit() {
    setInput(zip);
    setError(false);
    setEditing(true);
  }

  function commit() {
    if (/^\d{5}$/.test(input)) {
      setZip(input);
      setEditing(false);
    } else {
      setError(true);
    }
  }

  function cancel() {
    setEditing(false);
    setError(false);
  }

  if (!zip) {
    return (
      <Group gap={6} align="center" style={{ minHeight: 28 }}>
        <IconMapPin size={14} color="#999" />
        <Text size="sm" c="dimmed">Set your location to see nearby pros</Text>
      </Group>
    );
  }

  if (editing) {
    return (
      <Group gap={6} align="center">
        <IconMapPin size={14} color="#666" />
        <TextInput
          value={input}
          onChange={(e) => {
            setInput(e.currentTarget.value.replace(/\D/g, "").slice(0, 5));
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          size="xs"
          style={{ width: 90 }}
          error={error ? "5-digit ZIP required" : undefined}
          autoFocus
          placeholder="ZIP code"
        />
        <ActionIcon size="sm" variant="light" color="green" onClick={commit}>
          <IconCheck size={13} />
        </ActionIcon>
        <ActionIcon size="sm" variant="light" color="gray" onClick={cancel}>
          <IconX size={13} />
        </ActionIcon>
      </Group>
    );
  }

  return (
    <Group gap={6} align="center" style={{ minHeight: 28 }}>
      <IconMapPin size={14} color="#666" />
      <Text size="sm" c="dimmed">
        Showing results near{" "}
        <Text component="span" fw={600} c="dark" size="sm">
          {zip}
        </Text>
      </Text>
      <Text
        size="xs"
        c="blue"
        style={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={startEdit}
      >
        Change
      </Text>
      <Text
        size="xs"
        c="dimmed"
        style={{ cursor: "pointer" }}
        onClick={clearZip}
      >
        · Clear
      </Text>
      <ActionIcon size="xs" variant="subtle" color="gray" onClick={startEdit}>
        <IconPencil size={11} />
      </ActionIcon>
    </Group>
  );
}
