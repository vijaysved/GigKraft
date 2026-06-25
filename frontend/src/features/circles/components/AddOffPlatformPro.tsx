import { Button, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";

export interface OffPlatformProPayload {
  name: string;
  skill: string;
  phone: string;
  email: string;
  endorsement: string;
}

interface Props {
  onAdd: (payload: OffPlatformProPayload) => Promise<void>;
  busy: boolean;
}

export function AddOffPlatformPro({ onAdd, busy }: Props) {
  const [form, setForm] = useState<OffPlatformProPayload>({
    name: "",
    skill: "",
    phone: "",
    email: "",
    endorsement: "",
  });
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof OffPlatformProPayload, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.skill.trim()) { setError("Skill / trade is required."); return; }
    if (!form.phone.trim() && !form.email.trim()) {
      setError("Provide a phone number or email so we can contact them.");
      return;
    }
    setError(null);
    await onAdd(form);
    setForm({ name: "", skill: "", phone: "", email: "", endorsement: "" });
  }

  return (
    <Stack gap="sm">
      {error && <Text c="red" size="xs">{error}</Text>}
      <TextInput
        label="Full name"
        placeholder="Dave Smith"
        required
        size="sm"
        value={form.name}
        onChange={(e) => set("name", e.currentTarget.value)}
      />
      <TextInput
        label="Skill / trade"
        placeholder="Algebra Tutor, Plumber, Painter…"
        required
        size="sm"
        value={form.skill}
        onChange={(e) => set("skill", e.currentTarget.value)}
      />
      <TextInput
        label="Mobile number"
        placeholder="+1 555 000 0000"
        size="sm"
        value={form.phone}
        onChange={(e) => set("phone", e.currentTarget.value)}
      />
      <TextInput
        label="Email (if no mobile)"
        placeholder="dave@example.com"
        size="sm"
        value={form.email}
        onChange={(e) => set("email", e.currentTarget.value)}
      />
      <TextInput
        label="Endorsement (optional)"
        placeholder="Dave tutored my son for 2 years, remarkable results."
        maxLength={160}
        size="sm"
        value={form.endorsement}
        onChange={(e) => set("endorsement", e.currentTarget.value)}
      />
      <Button
        loading={busy}
        onClick={handleAdd}
        style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
      >
        Add to Circle
      </Button>
    </Stack>
  );
}
