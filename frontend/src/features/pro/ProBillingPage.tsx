import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";

export function ProBillingPage() {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  return (
    <Stack maw={600}>
      <Title order={3}>Vault Billing</Title>

      <Card withBorder radius="md" padding="lg" style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}>
        <Stack gap="xs">
          <Text size="sm" opacity={0.8}>Current plan</Text>
          <Title order={2} style={{ color: "#fff" }}>Vault Pro</Title>
          <Text size="sm" opacity={0.8}>$49/month · Billed monthly</Text>
          <Badge color="green" variant="filled" size="sm" w="fit-content">Active</Badge>
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Title order={5}>Apply coupon</Title>
          <Group gap="xs">
            <TextInput
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button
              variant="light"
              onClick={() => { if (coupon) setCouponApplied(true); }}
            >
              Apply
            </Button>
          </Group>
          {couponApplied && <Text size="sm" color="green">Coupon applied!</Text>}
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Title order={5}>Payment method</Title>
          <Group gap="xs">
            <Text size="sm">•••• •••• •••• 4242</Text>
            <Badge size="xs">Visa</Badge>
          </Group>
          <Button variant="light" size="sm" w="fit-content">Update card</Button>
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Title order={5}>Billing history</Title>
          <Divider />
          {[
            { date: "Jun 2026", amount: "$49.00", status: "Paid" },
            { date: "May 2026", amount: "$49.00", status: "Paid" },
            { date: "Apr 2026", amount: "$49.00", status: "Paid" },
          ].map((row) => (
            <Group key={row.date} justify="space-between">
              <Text size="sm">{row.date}</Text>
              <Group gap="xs">
                <Text size="sm" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                  {row.amount}
                </Text>
                <Badge size="xs" color="green">{row.status}</Badge>
              </Group>
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
