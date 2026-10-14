import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accent, accentSoft, colors, Tone, type } from '../theme';
import { Character } from './Character';

type AlarmCardProps = {
  time: string;
  period: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  onSimulate?: () => void;
};

// The hero "Next alarm" card on the home screen.
export function AlarmCard({ time, period, title, subtitle, onPress, onSimulate }: AlarmCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.alarm, pressed && { opacity: 0.92 }]}>
      <View style={styles.alarmTop}>
        <Text style={[type.eyebrow, { color: colors.nightText3 }]}>Next alarm</Text>
        <View style={styles.badge}>
          <View style={[styles.badgeDot, { backgroundColor: colors.lime }]} />
          <Text style={[type.caption, { color: colors.lime, fontWeight: '700' }]}>Home AR</Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
      <View style={styles.alarmBottom}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type.heading, { color: colors.white }]}>{title}</Text>
          <Text style={[type.caption, { color: colors.nightText2 }]}>{subtitle}</Text>
        </View>
        {onSimulate ? (
          <Pressable onPress={onSimulate} hitSlop={8} style={({ pressed }) => [styles.sim, pressed && { opacity: 0.8 }]}>
            <Ionicons name="play" size={13} color={colors.ink} />
            <Text style={[type.caption, { color: colors.ink, fontWeight: '700' }]}>Simulate</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

type ModeCardProps = {
  tone: Tone;
  eyebrow: string;
  title: string;
  onPress: () => void;
  art: React.ReactNode;
};

export function ModeCard({ tone, eyebrow, title, onPress, art }: ModeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.mode, { backgroundColor: accentSoft(tone) }, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.modeArt}>{art}</View>
      <View style={{ gap: 4 }}>
        <Text style={[type.eyebrow, { color: tone === 'home' ? '#5E7A08' : colors.coral }]}>{eyebrow}</Text>
        <Text style={[type.heading, { color: colors.ink, fontSize: 18 }]}>{title}</Text>
      </View>
      <View style={[styles.arrow, { backgroundColor: tone === 'home' ? colors.ink : accent(tone) }]}>
        <Ionicons name="arrow-forward" size={16} color={colors.white} />
      </View>
    </Pressable>
  );
}

export function HomeModeArt() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Character size={46} float shadow={false} />
      <View style={{ marginLeft: -10, marginBottom: 14 }}>
        <Character character={{ id: 'alien', name: 'Alien', emoji: '👽', color: colors.lime, line: '' }} size={36} shadow={false} />
      </View>
    </View>
  );
}

export function TravelModeArt() {
  return (
    <View style={styles.travelArt}>
      <View style={styles.travelRoad} />
      <View style={styles.travelPin}>
        <Ionicons name="location" size={30} color={colors.coral} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alarm: {
    backgroundColor: colors.night,
    borderRadius: 28,
    padding: 22,
    gap: 6,
  },
  alarmTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(200,245,60,0.12)',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  time: { color: colors.white, fontSize: 72, fontWeight: '800', letterSpacing: -3, fontVariant: ['tabular-nums'] },
  period: { color: colors.nightText2, fontSize: 18, fontWeight: '700', marginTop: 14, marginLeft: 6 },
  alarmBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  sim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.lime,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
  },
  mode: { flex: 1, borderRadius: 24, padding: 16, gap: 14, minHeight: 200, justifyContent: 'space-between' },
  modeArt: { height: 64, justifyContent: 'flex-end' },
  arrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  travelArt: { height: 56, width: 90, justifyContent: 'flex-end' },
  travelRoad: {
    height: 6,
    width: 80,
    borderRadius: 3,
    backgroundColor: 'rgba(255,90,54,0.25)',
  },
  travelPin: { position: 'absolute', left: 50, bottom: 2 },
});
