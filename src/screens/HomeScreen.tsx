import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { AlarmCard, HomeModeArt, ModeCard, TravelModeArt } from '../components/AlarmCard';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { colors, type } from '../theme';
import { formatTime } from '../data/mock';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ringsIn(hour: number, minute: number) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const mins = Math.round((next.getTime() - now.getTime()) / 60000);
  return `Rings in ${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function HomeScreen() {
  const { userName, alarm, travel, homeMapped, go, resetPrototype } = useApp();
  const t = alarm ? formatTime(alarm.hour, alarm.minute) : null;

  const startHome = () => go(homeMapped ? 'arSetup' : 'homeIntro');

  return (
    <Screen
      scroll
      footer={<Button label="Create Alarm" icon="add" onPress={() => go('create')} />}
    >
      <View style={styles.topBar}>
        <Text style={styles.brand}>earlybird</Text>
        <View style={styles.avatar}>
          <Text style={[type.label, { color: colors.ink }]}>{userName[0]}</Text>
        </View>
      </View>

      <FadeIn>
        <Text style={[type.display, styles.greeting]}>
          {greeting()},{'\n'}
          <Text style={{ color: colors.ink3 }}>{userName}</Text>
        </Text>
      </FadeIn>

      {travel?.active ? (
        <FadeIn delay={60}>
          <Pressable onPress={() => go('travelActive')} style={styles.travelStrip}>
            <View style={styles.liveDot} />
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.ink }]}>Travel alarm active</Text>
              <Text style={[type.caption, { color: colors.ink2 }]}>
                {travel.place.name} · {travel.radius >= 1000 ? '1km' : `${travel.radius}m`} radius
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.ink2} />
          </Pressable>
        </FadeIn>
      ) : null}

      {t && alarm ? (
        <FadeIn delay={80}>
          <AlarmCard
            time={t.time.padStart(5, '0')}
            period={t.period}
            title="Find a character"
            subtitle={`${ringsIn(alarm.hour, alarm.minute)} · No snooze`}
            onPress={startHome}
            onSimulate={() => go('homeAlarm')}
          />
        </FadeIn>
      ) : null}

      <FadeIn delay={160}>
        <Text style={[type.eyebrow, styles.section]}>Two ways to wake up</Text>
        <View style={styles.modes}>
          <ModeCard tone="home" eyebrow="Home AR" title="Find a surprise character" onPress={startHome} art={<HomeModeArt />} />
          <ModeCard tone="travel" eyebrow="Travel" title="Wake me when I arrive" onPress={() => go('travelMap')} art={<TravelModeArt />} />
        </View>
      </FadeIn>

      <Pressable onPress={resetPrototype} style={styles.reset}>
        <Text style={[type.caption, { color: colors.ink3 }]}>
          Prototype · sensors simulated · <Text style={{ textDecorationLine: 'underline' }}>Reset</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48 },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: colors.ink },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { color: colors.ink, marginTop: 20, marginBottom: 24 },
  travelStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral },
  section: { color: colors.ink3, marginTop: 32, marginBottom: 12 },
  modes: { flexDirection: 'row', gap: 12 },
  reset: { alignItems: 'center', marginTop: 28 },
});
