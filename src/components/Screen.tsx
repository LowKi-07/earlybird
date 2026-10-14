import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '../theme';

type Props = {
  dark?: boolean;
  scroll?: boolean;
  padded?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

// Page shell: background, safe areas, optional scroll and pinned footer.
export function Screen({ dark, scroll, padded = true, children, footer, style }: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? colors.night : colors.paper;
  const pad = padded ? { paddingHorizontal: 20 } : null;
  const top = { paddingTop: Math.max(insets.top, 20) };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[top, pad, { paddingBottom: 32 }, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, top, pad, style]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>{footer}</View>
      ) : null}
    </View>
  );
}

type HeaderProps = {
  title?: string;
  onBack?: () => void;
  backIcon?: 'back' | 'close';
  right?: React.ReactNode;
  dark?: boolean;
};

export function Header({ title, onBack, backIcon = 'back', right, dark }: HeaderProps) {
  const fg = dark ? colors.white : colors.ink;
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={[styles.iconBtn, { backgroundColor: dark ? colors.night3 : colors.card }]}
          >
            <Ionicons name={backIcon === 'back' ? 'chevron-back' : 'close'} size={20} color={fg} />
          </Pressable>
        ) : null}
      </View>
      {title ? <Text style={[type.label, { color: fg }]}>{title}</Text> : null}
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerSide: { width: 80 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
