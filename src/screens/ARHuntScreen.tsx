import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ARMock } from '../components/ARMock';
import { Button } from '../components/Button';
import { Character } from '../components/Character';
import { PulseRings, useLoop } from '../components/Motion';
import { useApp } from '../state/AppState';
import { formatTime, rollHunt } from '../data/mock';
import { colors, ND, type } from '../theme';

const DISTANCES = [12.4, 8.2, 4.5, 1.8];
const ARROW_DEG = [-38, 24, -12, 0];

type Phase = 'searching' | 'tracking' | 'found';

export function ARHuntScreen() {
  const { hunt: maybeHunt, setHunt, alarm, replace, markFound } = useApp();
  const insets = useSafeAreaInsets();
  const [hunt] = useState(() => maybeHunt ?? rollHunt());
  const [phase, setPhase] = useState<Phase>('searching');
  const [step, setStep] = useState(0);
  const [walk, setWalk] = useState(0);
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [moving, setMoving] = useState(false);
  const raf = useRef<number | null>(null);
  const spin = useLoop(1600);
  const blink = useLoop(900, { reverse: true });
  const arrow = useRef(new Animated.Value(ARROW_DEG[0])).current;

  useEffect(() => {
    if (!maybeHunt) setHunt(hunt);
    const id = setTimeout(() => setPhase('tracking'), 2200);
    return () => {
      clearTimeout(id);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveCloser = () => {
    if (moving) return;
    const next = step + 1;
    if (next >= DISTANCES.length) return;
    setMoving(true);
    const fromWalk = walk;
    const fromD = DISTANCES[step];
    const toD = DISTANCES[next];
    const start = Date.now();
    const dur = 1100;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setWalk(fromWalk + e * 1.4);
      setDistance(fromD + (toD - fromD) * e);
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else {
        setStep(next);
        setMoving(false);
      }
    };
    raf.current = requestAnimationFrame(tick);
    Animated.spring(arrow, { toValue: ARROW_DEG[next], useNativeDriver: ND }).start();
  };

  const find = () => {
    markFound(hunt.character.id);
    setPhase('found');
  };

  const close = step === DISTANCES.length - 1;
  const hint = [
    'Signal detected. Get out of bed and start walking.',
    `Getting warmer… head toward the ${hunt.room.name}.`,
    `You're close. Look around the ${hunt.room.name}.`,
    `It's right here, ${hunt.spot}!`,
  ][step];

  const start = alarm ?? { hour: 7, minute: 0 };
  const now = formatTime(start.hour, start.minute + 1 + step);
  const sway = Math.sin(walk * 2.2) * 0.6;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ARMock walk={walk} sway={sway}>
        {/* character peeking once you're close */}
        {close && phase === 'tracking' ? (
          <View style={styles.peek} pointerEvents="box-none">
            <PulseRings color={colors.lime} size={200} count={2} style={{ position: 'absolute' }} />
            <Pressable onPress={find}>
              <Character character={hunt.character} size={84} />
            </Pressable>
          </View>
        ) : null}
      </ARMock>

      {/* HUD — top */}
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 20) + 6 }]}>
        <View style={styles.ringing}>
          <Animated.View style={[styles.recDot, { opacity: blink }]} />
          <Text style={[type.caption, { color: colors.white, fontWeight: '700' }]}>
            Alarm still ringing · {now.time} {now.period}
          </Text>
          <Ionicons name="volume-high" size={14} color={colors.white} />
        </View>
      </View>

      {/* reticle */}
      {phase === 'searching' ? (
        <View style={styles.reticleWrap} pointerEvents="none">
          <Animated.View
            style={[styles.reticle, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}
          />
          <Text style={[type.heading, { color: colors.white, marginTop: 24 }]}>Searching…</Text>
          <Text style={[type.caption, { color: colors.nightText2, marginTop: 6 }]}>Mapping your surroundings</Text>
        </View>
      ) : null}

      {/* HUD — bottom */}
      {phase === 'tracking' ? (
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.panel}>
            <View style={styles.panelTop}>
              <View style={{ flex: 1 }}>
                <Text style={[type.eyebrow, { color: colors.lime }]}>Character detected nearby</Text>
                <Text style={[styles.distance, { color: close ? colors.lime : colors.white }]}>
                  {distance.toFixed(1)}
                  <Text style={styles.unit}>m</Text>
                </Text>
              </View>
              <Animated.View
                style={[
                  styles.compass,
                  {
                    transform: [
                      { rotate: arrow.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] }) },
                    ],
                  },
                ]}
              >
                <Ionicons name="navigate" size={28} color={colors.ink} style={{ transform: [{ rotate: '-45deg' }] }} />
              </Animated.View>
            </View>
            <View style={styles.bars}>
              {DISTANCES.map((_, i) => (
                <View key={i} style={[styles.bar, { backgroundColor: i <= step ? colors.lime : colors.nightLine }]} />
              ))}
            </View>
            <Text style={[type.body, { color: colors.white, fontSize: 15 }]}>{hint}</Text>
          </View>
          {close ? (
            <Button label="Find character" variant="lime" icon="hand-left" onPress={find} />
          ) : (
            <Button label={moving ? 'Walking…' : 'Move closer'} variant="lime" icon="footsteps" onPress={moveCloser} disabled={moving} />
          )}
          <Text style={[type.caption, styles.protoNote]}>Prototype: “Move closer” simulates you walking.</Text>
        </View>
      ) : null}

      {phase === 'found' ? (
        <FoundOverlay
          hunt={hunt}
          bottomInset={Math.max(insets.bottom, 20)}
          onComplete={() => replace('homeComplete')}
        />
      ) : null}
    </View>
  );
}

function FoundOverlay({
  hunt,
  bottomInset,
  onComplete,
}: {
  hunt: NonNullable<ReturnType<typeof rollHunt>>;
  bottomInset: number;
  onComplete: () => void;
}) {
  const pop = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, damping: 9, stiffness: 140, useNativeDriver: ND }),
      Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: ND }),
    ]).start();
  }, [pop, burst]);

  const sparks = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { dx: Math.cos(a) * 150, dy: Math.sin(a) * 150, e: i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐️' : '•' };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.found]}>
      <View style={styles.foundCenter}>
        {sparks.map((s, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.spark,
              {
                opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.dx] }) },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.dy] }) },
                ],
              },
            ]}
          >
            {s.e}
          </Animated.Text>
        ))}
        <PulseRings color={hunt.character.color} size={320} count={3} style={{ position: 'absolute' }} />
        <Animated.View style={{ transform: [{ scale: pop }] }}>
          <Character character={hunt.character} size={170} />
        </Animated.View>
        <Animated.View style={{ opacity: pop, alignItems: 'center', marginTop: 8 }}>
          <Text style={[type.display, { color: colors.white, textAlign: 'center' }]}>
            {hunt.character.name.toUpperCase()} FOUND!
          </Text>
          <Text style={[type.body, { color: colors.nightText2, marginTop: 8, textAlign: 'center' }]}>
            “{hunt.character.line}”
          </Text>
          <View style={styles.where}>
            <Ionicons name="location" size={13} color={colors.lime} />
            <Text style={[type.caption, { color: colors.white }]}>
              {hunt.room.name}, {hunt.spot}
            </Text>
          </View>
        </Animated.View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: bottomInset }}>
        <Button label="COMPLETE ALARM" variant="lime" icon="checkmark" onPress={onComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  top: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  ringing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.5)',
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  reticleWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  reticle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.lime,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  peek: { position: 'absolute', top: '30%', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', height: 200 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, gap: 10 },
  panel: {
    backgroundColor: 'rgba(7,8,11,0.82)',
    borderRadius: 26,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.nightLine,
  },
  panelTop: { flexDirection: 'row', alignItems: 'center' },
  distance: { fontSize: 64, fontWeight: '800', letterSpacing: -2.5, fontVariant: ['tabular-nums'], marginTop: 2 },
  unit: { fontSize: 28, fontWeight: '700', color: colors.nightText2 },
  compass: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3 },
  protoNote: { color: colors.nightText3, textAlign: 'center' },
  found: { backgroundColor: 'rgba(7,8,11,0.88)', justifyContent: 'space-between' },
  foundCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  spark: { position: 'absolute', fontSize: 22, color: colors.lime },
  where: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: colors.night3,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
});
