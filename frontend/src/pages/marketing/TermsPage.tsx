import { Box, Container, Stack, Title } from "@mantine/core";
import { TermsContent } from "../../components/marketing/TermsContent";

export function TermsPage() {
  return (
    <Box py={64} px="md">
      <Container size="md">
        <Stack gap="xl">
          <Title order={1} style={{ color: "var(--gk-accent-primary)" }}>
            Terms & Conditions
          </Title>
          <TermsContent />
        </Stack>
      </Container>
    </Box>
  );
}
