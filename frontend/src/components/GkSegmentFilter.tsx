import { SegmentedControl } from "@mantine/core";

interface GkSegmentFilterProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
}

export function GkSegmentFilter<T extends string>({ value, onChange, options }: GkSegmentFilterProps<T>) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as T)}
      data={options}
      size="sm"
    />
  );
}
