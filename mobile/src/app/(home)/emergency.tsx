import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { createBroadcast, type BroadcastOut } from '../../api/m5';
import { GkBadge } from '../../components/GkBadge';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { GkSelect } from '../../components/GkSelect';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function EmergencyScreen() {
  const { scheme } = useTheme();
  const [kind, setKind] = useState<'burst' | 'power' | 'hvac' | 'lock' | 'other'>(
    'burst',
  );
  const [description, setDescription] = useState('Water is leaking under the sink');
  const [address, setAddress] = useState('100 Congress Ave');
  const [zip, setZip] = useState('78701');
  const [budget, setBudget] = useState('250');
  const [broadcast, setBroadcast] = useState<BroadcastOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const next = await createBroadcast({
        kind,
        description,
        address,
        zip,
        budget_ceiling: Number(budget),
      });
      setBroadcast(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create emergency.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PhoneScaffold title="Emergency">
      <GkCard style={styles.card}>
        <GkBadge label="Mock dispatch" tone="yellow" />
        <Text style={[styles.body, { color: scheme.text2 }]}>
          Local/dev creates SMS and WhatsApp dispatch rows only. No live Twilio
          or WhatsApp messages are sent in M5.
        </Text>
      </GkCard>

      {error ? (
        <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
      ) : null}

      {broadcast ? (
        <GkCard style={styles.card}>
          <GkBadge label={broadcast.status} tone="green" />
          <Text style={[styles.title, { color: scheme.text }]}>
            Broadcast #{broadcast.id}
          </Text>
          <Text style={[styles.body, { color: scheme.text2 }]}>
            {broadcast.dispatches.length} mock dispatches created.
          </Text>
          {broadcast.dispatches.slice(0, 6).map((dispatch) => (
            <Text
              key={dispatch.id}
              style={[styles.body, { color: scheme.text3 }]}
            >
              {dispatch.channel}: {dispatch.pro_name} ({dispatch.status})
            </Text>
          ))}
          {broadcast.lead_id ? (
            <Text style={[styles.body, { color: scheme.green }]}>
              Claimed. Lead #{broadcast.lead_id} is open.
            </Text>
          ) : null}
        </GkCard>
      ) : null}

      <GkCard style={styles.card}>
        <GkSelect
          label="Emergency type"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'burst', label: 'Burst pipe' },
            { value: 'power', label: 'Power out' },
            { value: 'hvac', label: 'HVAC down' },
            { value: 'lock', label: 'Lockout' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <GkField
          label="What happened?"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <GkField label="Address" value={address} onChangeText={setAddress} />
        <GkField
          label="ZIP"
          value={zip}
          onChangeText={setZip}
          keyboardType="number-pad"
        />
        <GkField
          label="Budget ceiling"
          value={budget}
          onChangeText={setBudget}
          keyboardType="decimal-pad"
        />
        <GkButton title="Broadcast emergency" loading={saving} onPress={submit} />
      </GkCard>
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: font.uiBold,
    fontSize: fontSize.lg,
  },
  body: {
    fontFamily: font.ui,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  error: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.sm,
  },
});
