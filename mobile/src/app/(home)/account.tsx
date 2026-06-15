import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  getHomeAccount,
  getNotifPrefs,
  listHomeJobs,
  listSavedPros,
  updateNotifPrefs,
  type HomeAccountOut,
  type HomeJobOut,
  type NotifPrefOut,
  type ProOut,
} from '../../api/m5';
import { AccountPanel } from '../../components/AccountPanel';
import { GkBadge } from '../../components/GkBadge';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function AccountScreen() {
  const { scheme } = useTheme();
  const [account, setAccount] = useState<HomeAccountOut | null>(null);
  const [jobs, setJobs] = useState<HomeJobOut[]>([]);
  const [saved, setSaved] = useState<ProOut[]>([]);
  const [prefs, setPrefs] = useState<NotifPrefOut | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getHomeAccount(),
      listHomeJobs(),
      listSavedPros(),
      getNotifPrefs(),
    ])
      .then(([nextAccount, nextJobs, nextSaved, nextPrefs]) => {
        setAccount(nextAccount);
        setJobs(nextJobs);
        setSaved(nextSaved);
        setPrefs(nextPrefs);
      })
      .catch((err: unknown) =>
        setMessage(err instanceof Error ? err.message : 'Failed to load account.'),
      );
  }, []);

  async function togglePref(key: keyof NotifPrefOut) {
    if (!prefs) return;
    try {
      const next = await updateNotifPrefs({ [key]: !prefs[key] });
      setPrefs(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed.');
    }
  }

  return (
    <AccountPanel>
      {message ? (
        <Text style={[styles.message, { color: scheme.text2 }]}>{message}</Text>
      ) : null}

      <GkCard style={styles.card}>
        <Text style={[styles.title, { color: scheme.text }]}>
          Homeowner hub
        </Text>
        <Text style={[styles.body, { color: scheme.text2 }]}>
          ZIP {account?.default_zip || '-'} · {account?.stats.jobs_hired ?? 0}{' '}
          hired jobs · {account?.stats.saved_pros ?? 0} saved pros
        </Text>
        <Text style={[styles.body, { color: scheme.text3 }]}>
          Homeowner quote and invoice payment is intentionally not exposed in
          the MVP.
        </Text>
      </GkCard>

      <GkCard style={styles.card}>
        <Text style={[styles.title, { color: scheme.text }]}>Dispatch alerts</Text>
        <GkButton
          title={`SMS alerts: ${prefs?.sms_alerts ? 'on' : 'off'}`}
          variant={prefs?.sms_alerts ? 'light' : 'default'}
          onPress={() => togglePref('sms_alerts')}
        />
        <GkButton
          title={`WhatsApp dispatch: ${prefs?.whatsapp_dispatch ? 'on' : 'off'}`}
          variant={prefs?.whatsapp_dispatch ? 'light' : 'default'}
          onPress={() => togglePref('whatsapp_dispatch')}
        />
      </GkCard>

      <GkCard style={styles.card}>
        <Text style={[styles.title, { color: scheme.text }]}>Saved pros</Text>
        {saved.length === 0 ? (
          <Text style={[styles.body, { color: scheme.text3 }]}>
            Save pros from Discover to keep them here.
          </Text>
        ) : null}
        {saved.map((pro) => (
          <Text key={pro.id} style={[styles.body, { color: scheme.text2 }]}>
            {pro.name} · {pro.primary_trade || 'services'}
          </Text>
        ))}
      </GkCard>

      <GkCard style={styles.card}>
        <Text style={[styles.title, { color: scheme.text }]}>Past jobs</Text>
        {jobs.length === 0 ? (
          <Text style={[styles.body, { color: scheme.text3 }]}>
            Completed and scheduled jobs will appear here.
          </Text>
        ) : null}
        {jobs.map((job) => (
          <GkCard key={job.lead_id} style={styles.job}>
            <GkBadge label={job.status} tone="gray" />
            <Text style={[styles.body, { color: scheme.text }]}>
              {job.job_title}
            </Text>
            <Text style={[styles.body, { color: scheme.text3 }]}>
              {job.pro_name ?? 'No pro'} · invoice{' '}
              {job.invoice_total ? `$${job.invoice_total}` : 'not available'}
            </Text>
          </GkCard>
        ))}
      </GkCard>
    </AccountPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  job: {
    gap: spacing.xs,
    padding: spacing.sm,
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
