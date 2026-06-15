import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { listPros, savePro, type ProOut } from '../../api/m5';
import { GkBadge } from '../../components/GkBadge';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function DiscoverScreen() {
  const { scheme } = useTheme();
  const [pros, setPros] = useState<ProOut[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    listPros()
      .then(setPros)
      .catch((err: unknown) =>
        setMessage(err instanceof Error ? err.message : 'Failed to load pros.'),
      );
  }, []);

  const filtered = pros.filter((pro) => {
    const haystack = `${pro.name} ${pro.primary_trade} ${pro.skill_tags.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <PhoneScaffold title="Discover">
      <GkField
        label="Search by trade or name"
        value={query}
        onChangeText={setQuery}
        placeholder="plumbing, painting, Waters..."
      />
      {message ? (
        <Text style={[styles.message, { color: scheme.text2 }]}>{message}</Text>
      ) : null}
      {filtered.map((pro) => (
        <GkCard key={pro.id} style={styles.card}>
          <GkBadge
            label={pro.is_verified ? 'verified' : 'pending'}
            tone={pro.is_verified ? 'green' : 'yellow'}
          />
          <Text style={[styles.title, { color: scheme.text }]}>{pro.name}</Text>
          <Text style={[styles.body, { color: scheme.text2 }]}>
            {pro.primary_trade || 'General services'} · responds in{' '}
            {pro.response_hours}h
          </Text>
          <Text style={[styles.body, { color: scheme.text2 }]}>{pro.bio}</Text>
          <Text style={[styles.body, { color: scheme.text3 }]}>
            ZIPs: {pro.service_zips.join(', ') || pro.base_zip || 'not set'}
          </Text>
          <GkButton
            title="Save pro"
            variant="light"
            onPress={async () => {
              try {
                await savePro(pro.id);
                setMessage(`${pro.name} saved to your account.`);
              } catch (err) {
                setMessage(err instanceof Error ? err.message : 'Save failed.');
              }
            }}
          />
        </GkCard>
      ))}
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
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
