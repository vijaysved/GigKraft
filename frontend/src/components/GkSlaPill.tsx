import { Badge } from "@mantine/core";
import { useEffect, useState } from "react";

interface GkSlaPillProps {
  respondBy: string; // ISO datetime
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function GkSlaPill({ respondBy }: GkSlaPillProps) {
  const [ms, setMs] = useState(() => new Date(respondBy).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setMs(new Date(respondBy).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [respondBy]);

  const isUrgent = ms < 3600000; // < 1h
  const isOverdue = ms <= 0;

  return (
    <Badge
      size="sm"
      color={isOverdue ? "red" : isUrgent ? "orange" : "green"}
      variant="light"
      style={{ fontFamily: "var(--mantine-font-family-monospace)" }}
    >
      {formatTimeLeft(ms)}
    </Badge>
  );
}
