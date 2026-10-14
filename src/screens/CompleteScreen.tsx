import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Character } from '../components/Character';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { CHARACTERS, formatTime } from '../data/mock';
import { colors, type } from '../theme';

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={[type.caption, { color: colors.ink2 }]}>{label}</Text>
    </View>
  );
}

export function HomeCompleteScreen() {
  const { alarm, hunt, found, setHunt, goHome } = useApp();
  const done = formatTime((alarm?.hour ?? 7), (alarm?.minute ?? 0) + 6);
  const finish = () => {
    setHunt(null);
    goHome();
  };

  return (
    <Screen scroll footer={<Button label="Back home" onPress={finish} />}>
      <FadeIn style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={[type.display, styles.center, { marginTop: 8 }]}>You're awake!</Text>
        <View style={styles.timeRow}>
          <Text style={[type.mega, { color: colors.ink }]}>{done.time}</Text>
          <Text style={styles.period}>{done.period}</Text>
        </View>
        <Text style={[type.body, { color: colors.ink2 }]}>Alarm completed.</Text>
      </FadeIn>

      <FadeIn delay={120} style={styles.stats}>
        <Stat n="6 min" label="to get up" />
        <Stat n="214" label="steps taken" />
        <Stat n={hunt ? '3' : '–'} label="rooms walked" />
      </FadeIn>

      <FadeIn delay={220} style={styles.collection}>
        <Text style={[type.eyebrow, { color: colors.ink3 }]}>Your collection · {found.length}/{CHARACTERS.length}</Text>
        <Text style={[type.heading, { color: colors.ink, marginTop: 4 }]}>
          {hunt ? `${hunt.character.name} joined your crew` : 'Keep waking up to collect them all'}
        </Text>
        <View style={styles.grid}>
          {CHARACTERS.map((c) => {
            const got = found.includes(c.id);
            return (
              <View key={c.id} style={[styles.slot, !got && { opacity: 0.35 }]}>
                <Character character={got ? c : null} size={44} float={hunt?.character.id === c.id} shadow={false} />
              </View>
            );
          })}
        </View>
      </FadeIn>
    </Screen>
  );
}

export function TravelCompleteScreen() {
  const { travel, setTravel, goHome } = useApp();
  const now = new Date();
  const t = formatTime(now.getHours(), now.getMinutes());
  const finish = () => {
    setTravel(null);
    goHome();
  };
  return (
    <Screen footer={<Button label="Back home" onPress={finish} />}>
      <FadeIn style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 64 }}>📍</Text>
        <Text style={[type.display, styles.center, { marginTop: 8 }]}>You've arrived.</Text>
        <Text style={[type.title, { color: colors.coral, marginTop: 12, textAlign: 'center' }]}>
          {travel?.place.name ?? 'Destination'}
        </Text>
        <Text style={[type.body, { color: colors.ink2, marginTop: 8 }]}>
          Alarm stopped at {t.time} {t.period}
        </Text>
        <View style={[styles.stats, { alignSelf: 'stretch' }]}>
          <Stat n="0" label="missed stops" />
          <Stat n="Low" label="battery used" />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { color: colors.ink, textAlign: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  period: { color: colors.ink2, fontSize: 20, fontWeight: '700', marginTop: 18, marginLeft: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 28 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 14, gap: 2 },
  statN: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: colors.ink },
  collection: { backgroundColor: colors.card, borderRadius: 24, padding: 18, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16, rowGap: 8 },
  slot: { width: '31%', alignItems: 'center', paddingVertical: 4 },
});
