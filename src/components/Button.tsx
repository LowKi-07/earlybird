import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type Variant = 'primary' | 'inverse' | 'secondary' | 'ghost' | 'glass';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.ink, fg: colors.white },
  inverse: { bg: colors.white, fg: colors.ink }, // for dark screens
  secondary: { bg: colors.card, fg: colors.ink, border: colors.line },
  ghost: { bg: 'transparent', fg: colors.ink2 },
  glass: { bg: 'rgba(255,255,255,0.08)', fg: colors.white, border: 'rgba(255,255,255,0.16)' },
};

export function Button({ label, onPress, variant = 'primary', icon, size = 'lg', disabled, style }: Props) {
  const p = palette[variant];
  const h = size === 'lg' ? 60 : size === 'md' ? 48 : 36;
  const fs = size === 'lg' ? 17 : size === 'md' ? 15 : 13;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: h,
          paddingHorizontal: size === 'sm' ? 14 : 22,
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={fs + 3} color={p.fg} /> : null}
        <Text style={[styles.label, { color: p.fg, fontSize: fs }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontWeight: '700', letterSpacing: 0.2 },
});
