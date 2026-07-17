import { Stack, Text, Tooltip } from "@mantine/core";

interface Props {
  value: number | null; // 0-100, or null = "not enough data"
  label: string;
  size?: number; // px — arc width/height (the arc is a semicircle, so height is ~size/2)
}

const EMPTY_COLOR = "var(--gk-border)";

/** Red -> amber -> green across the 0-100 range. */
function gaugeColor(value: number): string {
  const stops: [number, [number, number, number]][] = [
    [0, [225, 75, 75]],
    [50, [235, 165, 60]],
    [100, [70, 175, 95]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i][0] && value <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const t = (value - lo[0]) / span;
  const rgb = lo[1].map((c, i) => Math.round(c + (hi[1][i] - c) * t));
  return `rgb(${rgb.join(",")})`;
}

/** Semicircle 0-100 gauge — no existing Mantine chart primitive fits (donut/
 * radial-bar/composite only), so this is a small purpose-built SVG arc. */
export function SpeedometerGauge({ value, label, size = 30 }: Props) {
  const strokeWidth = Math.max(3, Math.round(size / 8));
  const r = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const arcLength = Math.PI * r;
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * arcLength;
  const color = value == null ? EMPTY_COLOR : gaugeColor(pct);

  const gauge = (
    <svg width={size} height={size / 2 + strokeWidth / 2} viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={EMPTY_COLOR}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.35}
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${arcLength}`}
        style={{ transition: "stroke-dasharray 0.3s ease, stroke 0.3s ease" }}
      />
    </svg>
  );

  return (
    <Tooltip label={value == null ? "Not enough reviews yet" : `${label}: ${pct}`} withArrow position="top">
      <Stack gap={1} align="center" style={{ cursor: "default" }}>
        {gauge}
        <Text size="xs" fw={700} lh={1} style={{ color }}>
          {value == null ? "—" : pct}
        </Text>
        <Text c="dimmed" lh={1} ta="center" style={{ maxWidth: size + 20, fontSize: 9 }}>
          {label}
        </Text>
      </Stack>
    </Tooltip>
  );
}
