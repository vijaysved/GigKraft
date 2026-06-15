import { Badge } from "@mantine/core";

interface GkProofBadgeProps {
  amount?: number;
  confirmed?: boolean;
  label?: string;
}

export function GkProofBadge({ amount, confirmed = true, label }: GkProofBadgeProps) {
  const text = label ?? (amount != null ? `Verified invoice $${amount}` : "Invoice");
  return (
    <Badge
      size="sm"
      color={confirmed ? "green" : "red"}
      variant="light"
      style={{ fontFamily: "var(--mantine-font-family-monospace)" }}
    >
      {confirmed ? "✓ " : "✗ "}{text}
    </Badge>
  );
}
