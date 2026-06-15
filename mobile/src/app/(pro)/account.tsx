import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccountPanel } from '../../components/AccountPanel';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { GkSelect } from '../../components/GkSelect';
import {
  getMyProProfile,
  updateServiceArea,
  type ProOut,
} from '../../api/m5';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

export default function AccountScreen() {
  const { scheme } = useTheme();
  const [profile, setProfile] = useState<ProOut | null>(null);
  const [mode, setMode] = useState<'explicit' | 'radial'>('explicit');
  const [baseZip, setBaseZip] = useState('');
  const [zips, setZips] = useState('');
  const [centerZip, setCenterZip] = useState('');
  const [radius, setRadius] = useState('25');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProProfile()
      .then((next) => {
        setProfile(next);
        setMode(next.service_mode === 'radial' ? 'radial' : 'explicit');
        setBaseZip(next.base_zip);
        setZips(next.service_zips.join(', '));
        setCenterZip(next.service_center_zip || next.base_zip);
        setRadius(String(next.service_radius_miles));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load profile.'),
      );
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const next = await updateServiceArea({
        base_zip: baseZip,
        service_mode: mode,
        service_zips: zips
          .split(',')
          .map((zip) => zip.trim())
          .filter(Boolean),
        service_center_zip: centerZip,
        service_radius_miles: Number(radius),
      });
      setProfile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountPanel>
      <GkCard style={styles.card}>
        <Text style={[styles.title, { color: scheme.text }]}>Service area</Text>
        <Text style={[styles.body, { color: scheme.text2 }]}>
          MVP service coverage uses ZIPs and radius only. There is no map UI.
        </Text>
        {profile ? (
          <Text style={[styles.body, { color: scheme.text3 }]}>
            Current: {profile.service_mode} ·{' '}
            {profile.service_mode === 'radial'
              ? `${profile.service_center_zip} + ${profile.service_radius_miles}mi`
              : profile.service_zips.join(', ') || 'no ZIPs'}
          </Text>
        ) : null}
        {error ? <Text style={[styles.error, { color: scheme.red }]}>{error}</Text> : null}
        <GkField label="Base ZIP" value={baseZip} onChangeText={setBaseZip} keyboardType="number-pad" />
        <GkSelect
          label="Coverage mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'explicit', label: 'Specific ZIP list' },
            { value: 'radial', label: 'Center ZIP + radius' },
          ]}
        />
        {mode === 'explicit' ? (
          <GkField
            label="Service ZIPs"
            value={zips}
            onChangeText={setZips}
            placeholder="78701, 78702, 78703"
          />
        ) : (
          <View style={styles.row}>
            <GkField
              label="Center ZIP"
              value={centerZip}
              onChangeText={setCenterZip}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
            <GkField
              label="Radius miles"
              value={radius}
              onChangeText={setRadius}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
          </View>
        )}
        <GkButton title="Save service area" onPress={save} loading={saving} />
      </GkCard>
    </AccountPanel>
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
