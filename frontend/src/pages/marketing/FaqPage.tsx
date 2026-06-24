import { Box, Container, Stack, Title } from "@mantine/core";
import { FaqContent } from "../../components/marketing/FaqContent";

export function FaqPage() {
  return (
    <Box py={64} px="md">
      <Container size="md">
        <Stack gap="xl">
          <Title order={1} style={{ color: "var(--gk-accent-primary)" }}>
            Frequently Asked Questions
          </Title>
          <FaqContent />
        </Stack>
      </Container>
    </Box>
  );
}
