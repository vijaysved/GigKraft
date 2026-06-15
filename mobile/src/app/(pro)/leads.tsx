import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  claimBroadcast,
  listOpenBroadcasts,
  type BroadcastOut,
} from '../../api/m5';
import { GkBadge } from '../../components/GkBadge';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function LeadsScreen() {
  const { scheme } = useTheme();
  const [broadcasts, setBroadcasts] = useState<BroadcastOut[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    try {
      setBroadcasts(await listOpenBroadcasts());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load leads.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function claim(id: number) {
    setBusyId(id);
    setMessage(null);
    try {
      const next = await claimBroadcast(id);
      setMessage(`Claimed emergency. Lead #${next.lead_id} opened.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Claim failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PhoneScaffold title="Leads">
      <GkCard style={styles.card}>
        <GkBadge label="Polling MVP" tone="yellow" />
        <Text style={[styles.body, { color: scheme.text2 }]}>
          Open emergencies are fetched by polling. The first pro to claim opens
          the homeowner lead and chat.
        </Text>
      </GkCard>
      {message ? (
        <Text style={[styles.message, { color: scheme.text2 }]}>{message}</Text>
      ) : null}
      {broadcasts.length === 0 ? (
        <Text style={[styles.body, { color: scheme.text3 }]}>
          No open emergencies are available right now.
        </Text>
      ) : null}
      {broadcasts.map((broadcast) => (
        <GkCard key={broadcast.id} style={styles.card}>
          <GkBadge label={broadcast.kind} tone="red" />
          <Text style={[styles.title, { color: scheme.text }]}>
            ${broadcast.budget_ceiling} emergency
          </Text>
          <Text style={[styles.body, { color: scheme.text2 }]}>
            {broadcast.description}
          </Text>
          <Text style={[styles.body, { color: scheme.text3 }]}>
            {broadcast.address} · {broadcast.zip}
          </Text>
          <GkButton
            title="Claim emergency"
            loading={busyId === broadcast.id}
            onPress={() => claim(broadcast.id)}
          />
        </GkCard>
      ))}
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
  message: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.sm,
  },
});
