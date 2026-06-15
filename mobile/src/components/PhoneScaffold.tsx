// Screen scaffold: SafeAreaView + app bar + scrollable body + sticky footer.
// Tab bars are owned by the route group layouts, not by this scaffold.

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, spacing } from '../theme/tokens';

export interface PhoneScaffoldProps {
  title?: string;
  /** Right-aligned app bar content (e.g. an action button). */
  headerRight?: React.ReactNode;
  /** Left-aligned app bar content (e.g. a back button). */
  headerLeft?: React.ReactNode;
  children: React.ReactNode;
  /** Sticky footer rendered below the scroll body. */
  footer?: React.ReactNode;
  /** Disable the ScrollView wrapper (for screens that manage their own lists). */
  scroll?: boolean;
  bodyStyle?: ViewStyle;
}

export function PhoneScaffold({
  title,
  headerLeft,
  headerRight,
  children,
  footer,
  scroll = true,
  bodyStyle,
}: PhoneScaffoldProps) {
  const { scheme } = useTheme();

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.body, bodyStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.body, bodyStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: scheme.bg }]}
    >
      {title || headerLeft || headerRight ? (
        <View
          style={[
            styles.appBar,
            { backgroundColor: scheme.bg, borderBottomColor: scheme.border },
          ]}
        >
          <View style={styles.appBarSide}>{headerLeft}</View>
          <Text
            numberOfLines={1}
            style={[styles.appBarTitle, { color: scheme.text }]}
          >
            {title}
          </Text>
          <View style={[styles.appBarSide, styles.appBarRight]}>
            {headerRight}
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {footer ? (
          <View
            style={[
              styles.footer,
              { backgroundColor: scheme.bg, borderTopColor: scheme.border },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  appBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  appBarSide: {
    width: 72,
    flexDirection: 'row',
  },
  appBarRight: {
    justifyContent: 'flex-end',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.uiBold,
    fontSize: fontSize.lg,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
