import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

type Props = {
  progress: number; // 0..1
  label?: string;
  color?: string;
  dark?: boolean;
};

export function ProgressIndicator({ progress, label, color = colors.lime, dark = true }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const fg = dark ? colors.white : colors.ink;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {label ? <Text style={[type.label, { color: fg, flex: 1 }]}>{label}</Text> : <View style={{ flex: 1 }} />}
        <Text style={[styles.pct, { color: pct === 100 ? color : fg }]}>{pct}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: dark ? colors.nightLine : colors.line }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  pct: { fontSize: 32, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
