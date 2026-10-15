import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accent, colors, ND, Tone, type } from '../theme';
import { Screen } from './Screen';
import { Button } from './Button';
import { PulseRings } from './Motion';

type Props = {
  tone: Tone;
  modeLabel: string;
  time: string;
  period?: string;
  title: string;
  message: string;
  emphasis?: string;
  ctaLabel: string;
  ctaIcon?: React.ComponentProps<typeof Button>['icon'];
  onCta: () => void;
  // Home alarms can't be snoozed — show a decoy snooze that refuses.
  noSnooze?: boolean;
};

// Full-screen ringing state shared by Home AR and Travel so both modes feel like one product.
export function AlarmScreen({ tone, modeLabel, time, period, title, message, emphasis, ctaLabel, ctaIcon, onCta, noSnooze }: Props) {
  const c = accent(tone);
  const ring = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const [snoozeMsg, setSnoozeMsg] = useState<string | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 70, useNativeDriver: ND }),
        Animated.timing(ring, { toValue: -1, duration: 70, useNativeDriver: ND }),
        Animated.timing(ring, { toValue: 1, duration: 70, useNativeDriver: ND }),
        Animated.timing(ring, { toValue: -1, duration: 70, useNativeDriver: ND }),
        Animated.timing(ring, { toValue: 0, duration: 70, useNativeDriver: ND }),
        Animated.delay(700),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ring]);

  const refuseSnooze = () => {
    const lines = ['Nice try.', 'Snooze is disabled.', 'Still no.', 'Your feet. The floor. Now.'];
    setSnoozeMsg((m) => lines[(m ? lines.indexOf(m) + 1 : 0) % lines.length]);
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 420, easing: Easing.linear, useNativeDriver: ND }).start();
  };

  const shakeX = shake.interpolate({
    inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
    outputRange: [0, -10, 10, -8, 8, -4, 0],
  });

  return (
    <Screen
      dark
      footer={
        <>
          <Button label={ctaLabel} icon={ctaIcon} variant="inverse" onPress={onCta} />
          {noSnooze ? (
            <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
              <Pressable onPress={refuseSnooze} style={styles.snooze}>
                <Text style={[type.label, { color: snoozeMsg ? c : colors.nightText3 }]}>
                  {snoozeMsg ?? 'Snooze'}
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </>
      }
    >
      <View style={styles.top}>
        <View style={[styles.pill, { borderColor: c }]}>
          <View style={[styles.dot, { backgroundColor: c }]} />
          <Text style={[type.eyebrow, { color: c }]}>{modeLabel}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <PulseRings color={c} size={340} count={3} duration={2400} style={styles.rings} />
        <Animated.View
          style={{
            transform: [{ rotate: ring.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] }) }],
          }}
        >
          <Ionicons name="alarm" size={34} color={c} />
        </Animated.View>
        <View style={styles.timeRow}>
          <Text style={[type.mega, { color: colors.white }]}>{time}</Text>
          {period ? <Text style={[styles.period]}>{period}</Text> : null}
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={[type.display, { color: colors.white }]}>{title}</Text>
        <Text style={[type.body, { color: colors.nightText2, fontSize: 18, lineHeight: 26 }]}>{message}</Text>
        {emphasis ? <Text style={[styles.emphasis, { color: c }]}>{emphasis}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', marginTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  rings: { position: 'absolute' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  period: { color: colors.nightText2, fontSize: 20, fontWeight: '700', marginTop: 18, marginLeft: 6 },
  copy: { gap: 12, paddingBottom: 8 },
  emphasis: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  snooze: { height: 44, alignItems: 'center', justifyContent: 'center' },
});
