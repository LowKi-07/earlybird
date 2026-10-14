import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { FloorPlan } from '../components/FloorPlan';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { colors, type } from '../theme';

const STEPS: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'walk-outline', text: 'Walk slowly through every room' },
  { icon: 'scan-outline', text: 'Point your camera at floors and walls' },
  { icon: 'time-outline', text: 'Takes about two minutes, once' },
];

export function HomeIntroScreen() {
  const { back, go } = useApp();
  return (
    <Screen
      dark
      footer={
        <>
          <Button label="Start scanning" icon="scan" variant="lime" onPress={() => go('scan')} />
          <Text style={[type.caption, styles.privacy]}>
            <Ionicons name="lock-closed" size={11} /> Your home map never leaves this device.
          </Text>
        </>
      }
    >
      <Header onBack={back} dark />
      <FadeIn style={styles.art}>
        <View style={{ opacity: 0.5 }}>
          <FloorPlan width={260} showLabels={false} />
        </View>
      </FadeIn>
      <FadeIn delay={100}>
        <Text style={[type.eyebrow, { color: colors.lime }]}>Home AR · Setup</Text>
        <Text style={[type.display, { color: colors.white, marginTop: 10 }]}>Let's map{'\n'}your home</Text>
        <Text style={[type.body, { color: colors.nightText2, marginTop: 14 }]}>
          Walk around your home and scan your rooms. We'll use this map to randomly hide a character every morning.
        </Text>
      </FadeIn>
      <FadeIn delay={200} style={styles.steps}>
        {STEPS.map((s) => (
          <View key={s.text} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={s.icon} size={18} color={colors.lime} />
            </View>
            <Text style={[type.label, { color: colors.white, flex: 1 }]}>{s.text}</Text>
          </View>
        ))}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', marginVertical: 8 },
  steps: { gap: 12, marginTop: 24 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.night3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacy: { color: colors.nightText3, textAlign: 'center' },
});
