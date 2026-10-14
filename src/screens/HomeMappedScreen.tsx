import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { useScreenWidth } from '../components/useScreenWidth';
import { FloorPlan } from '../components/FloorPlan';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { ROOMS } from '../data/mock';
import { colors, type } from '../theme';

export function HomeMappedScreen() {
  const { goHome, reset } = useApp();
  const width = useScreenWidth();
  const spots = ROOMS.reduce((n, r) => n + r.spots.length, 0) * 3;

  return (
    <Screen dark footer={<Button label="Create my alarm" variant="lime" icon="alarm" onPress={() => reset(['home', 'arSetup'])} />}>
      <Header onBack={goHome} backIcon="close" dark />
      <FadeIn>
        <Text style={[type.eyebrow, { color: colors.lime }]}>Home mapped ✓</Text>
        <Text style={[type.display, { color: colors.white, marginTop: 10 }]}>Your home{'\n'}is ready.</Text>
      </FadeIn>

      <FadeIn delay={150} style={styles.plan}>
        <FloorPlan width={width - 56} />
      </FadeIn>

      <FadeIn delay={250} style={styles.stats}>
        {[
          ['5', 'rooms'],
          ['68', 'm²'],
          [String(spots), 'hiding spots'],
        ].map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={styles.statN}>{n}</Text>
            <Text style={[type.caption, { color: colors.nightText2 }]}>{l}</Text>
          </View>
        ))}
      </FadeIn>
      <Text style={[type.caption, { color: colors.nightText3, marginTop: 14 }]}>
        Each morning, one character hides in one of these rooms. Even we don't know where until it rings.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: {
    marginTop: 24,
    padding: 8,
    borderRadius: 24,
    backgroundColor: '#0E1014',
    alignItems: 'center',
  },
  stats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  stat: { flex: 1, backgroundColor: colors.night2, borderRadius: 18, padding: 14, gap: 2 },
  statN: { color: colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.8 },
});
