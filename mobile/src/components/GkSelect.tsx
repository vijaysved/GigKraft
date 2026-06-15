// Lightweight select: a field-shaped trigger that opens a modal option list.
// No external picker dependency (mock-first M4; can swap for a bottom sheet later).

import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, radius, shadow, spacing } from '../theme/tokens';

export interface GkSelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface GkSelectProps<T extends string = string> {
  label?: string;
  placeholder?: string;
  value: T | null;
  options: GkSelectOption<T>[];
  onChange: (value: T) => void;
  containerStyle?: ViewStyle;
}

export function GkSelect<T extends string = string>({
  label,
  placeholder = 'Select...',
  value,
  options,
  onChange,
  containerStyle,
}: GkSelectProps<T>) {
  const { scheme } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: scheme.text2 }]}>{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          { backgroundColor: scheme.surface2, borderColor: scheme.border2 },
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selected ? scheme.text : scheme.text3 },
          ]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={[styles.chevron, { color: scheme.text3 }]}>v</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: scheme.surface, borderColor: scheme.border },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      active && { backgroundColor: scheme.tint },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: active ? scheme.tintText : scheme.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: font.uiSemibold,
    fontSize: fontSize.sm,
    marginBottom: 6,
  },
  trigger: {
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontFamily: font.ui,
    fontSize: fontSize.md,
  },
  chevron: {
    fontFamily: font.uiBold,
    fontSize: fontSize.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,17,19,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderRadius: radius.lg,
    borderWidth: 1,
    maxHeight: 360,
    overflow: 'hidden',
    ...shadow.lg,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  optionText: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.md,
  },
});
