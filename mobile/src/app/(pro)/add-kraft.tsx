import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { createKraft, publishKraft, type KraftOut } from '../../api/m5';
import { GkBadge } from '../../components/GkBadge';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { GkSelect } from '../../components/GkSelect';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function AddKraftScreen() {
  const { scheme } = useTheme();
  const [title, setTitle] = useState('Completed emergency repair');
  const [description, setDescription] = useState('');
  const [invoiceCost, setInvoiceCost] = useState('');
  const [invoiceConfirmed, setInvoiceConfirmed] = useState<'yes' | 'no'>('no');
  const [afterUrl, setAfterUrl] = useState('');
  const [beforeUrl, setBeforeUrl] = useState('');
  const [created, setCreated] = useState<KraftOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    setCreated(null);
    try {
      const photos = [
        beforeUrl ? { kind: 'before', image_url: beforeUrl, order: 0 } : null,
        afterUrl ? { kind: 'after', image_url: afterUrl, order: 1 } : null,
      ].filter(Boolean) as NonNullable<
        Parameters<typeof createKraft>[0]['photos']
      >;
      const kraft = await createKraft({
        title,
        description,
        invoice_cost: invoiceCost ? Number(invoiceCost) : null,
        invoice_confirmed: invoiceConfirmed === 'yes',
        photos,
      });
      setCreated(kraft);
      const published = await publishKraft(kraft.id);
      setCreated(published);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kraft was not published.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PhoneScaffold title="Add Kraft">
      <GkCard style={styles.card}>
        <GkBadge label="Guardrail" tone="yellow" />
        <Text style={[styles.title, { color: scheme.text }]}>
          After photo + confirmed invoice required
        </Text>
        <Text style={[styles.body, { color: scheme.text2 }]}>
          The backend will keep this Kraft in draft unless both proof conditions
          are present, then publishing sends it to admin verification.
        </Text>
      </GkCard>

      {error ? (
        <GkCard style={styles.card}>
          <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
        </GkCard>
      ) : null}

      {created ? (
        <GkCard style={styles.card}>
          <GkBadge
            label={created.status}
            tone={created.status === 'pending' ? 'yellow' : 'blue'}
          />
          <Text style={[styles.title, { color: scheme.text }]}>
            {created.title}
          </Text>
          <Text style={[styles.body, { color: scheme.text2 }]}>
            Has After: {created.has_after ? 'yes' : 'no'} · Invoice:{' '}
            {created.invoice_confirmed ? 'confirmed' : 'missing'}
          </Text>
        </GkCard>
      ) : null}

      <GkCard style={styles.card}>
        <GkField label="Title" value={title} onChangeText={setTitle} />
        <GkField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="What was fixed, replaced, or improved?"
        />
        <GkField
          label="Before photo URL"
          value={beforeUrl}
          onChangeText={setBeforeUrl}
          autoCapitalize="none"
          placeholder="Optional in MVP"
        />
        <GkField
          label="After photo URL"
          value={afterUrl}
          onChangeText={setAfterUrl}
          autoCapitalize="none"
          placeholder="Required to publish"
        />
        <GkField
          label="Invoice cost"
          value={invoiceCost}
          onChangeText={setInvoiceCost}
          keyboardType="decimal-pad"
          placeholder="3200"
        />
        <GkSelect
          label="Invoice confirmed?"
          value={invoiceConfirmed}
          onChange={setInvoiceConfirmed}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
        <GkButton title="Create and publish" loading={saving} onPress={submit} />
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
    lineHeight: 20,
  },
});
