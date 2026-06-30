import { Stack, Title } from "@mantine/core";

import { ProSearchPanel } from "../components/ProSearchPanel";

export function SearchTab() {
  return (
    <Stack gap="md">
      <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
        Search
      </Title>
      <ProSearchPanel onAdded={() => {}} />
    </Stack>
  );
}
