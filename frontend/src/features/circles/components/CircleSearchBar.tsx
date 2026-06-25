import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  onSearch: (q: string) => void;
  loading: boolean;
}

export function CircleSearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        size="lg"
        radius="xl"
        placeholder="Describe what you need, e.g. 'fix leaking garbage disposal'"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        disabled={loading}
        rightSection={
          <ActionIcon
            type="submit"
            radius="xl"
            variant="filled"
            size="lg"
            loading={loading}
            style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
          >
            <IconSearch size={16} />
          </ActionIcon>
        }
        rightSectionWidth={48}
      />
    </form>
  );
}
