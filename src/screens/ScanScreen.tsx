import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { useScreenWidth } from '../components/useScreenWidth';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ScanMock, scanningRoomIndex } from '../components/ScanMock';
import { FadeIn } from '../components/Motion';
import { ROOMS } from '../data/mock';
import { useApp } from '../state/AppState';
import { colors, ND, type } from '../theme';

const HINTS = ['Move slowly', 'Point at the floor', 'Sweep across the walls', 'Walk into the next room'];
const DURATION = 9000;

export function ScanScreen() {
  const { back, replace, setHomeMapped } = useApp();
  const width = useScreenWidth();
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  const done = progress >= 1;

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      // slightly uneven pace so it feels like real scanning
      const t = (Date.now() - start) / DURATION;
      const p = Math.min(1, t + Math.sin(t * 18) * 0.012);
      setProgress(p);
      setPoints(Math.floor(p * 48213 + Math.random() * 40));
      if (t >= 1) {
        setProgress(1);
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (done) return;
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: ND }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, done]);

  const roomIdx = scanningRoomIndex(progress);
  const viewW = width - 40;

  return (
    <Screen
      dark
      footer={
        done ? (
          <FadeIn>
            <Button
              label="View my map"
              variant="lime"
              icon="arrow-forward"
              onPress={() => {
                setHomeMapped(true);
                replace('homeMapped');
              }}
            />
          </FadeIn>
        ) : (
          <Text style={[type.caption, styles.hint]}>
            <Ionicons name="information-circle-outline" size={13} /> {HINTS[Math.floor(progress * 12) % HINTS.length]}
          </Text>
        )
      }
    >
      <Header
        onBack={back}
        backIcon="close"
        dark
        right={
          !done ? (
            <View style={styles.rec}>
              <View style={styles.recDot} />
              <Text style={[type.caption, { color: colors.white, fontWeight: '700' }]}>REC</Text>
            </View>
          ) : null
        }
      />

      {/* viewfinder */}
      <View style={styles.viewfinder}>
        {[styles.cTL, styles.cTR, styles.cBL, styles.cBR].map((c, i) => (
          <View key={i} style={[styles.corner, c]} />
        ))}
        <ScanMock progress={progress} width={viewW - 8} />
        {!done ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sweep,
              { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [0, 260] }) }] },
            ]}
          />
        ) : null}
        <Text style={[styles.meta, { left: 14 }]}>MESH {points.toLocaleString()} pts</Text>
        <Text style={[styles.meta, { right: 14 }]}>{done ? '68 m²' : `${(progress * 68).toFixed(1)} m²`}</Text>
      </View>

      <View style={styles.rooms}>
        {ROOMS.map((r, i) => {
          const complete = done || i < roomIdx;
          const active = !done && i === roomIdx;
          return (
            <View
              key={r.id}
              style={[styles.chip, complete && styles.chipDone, active && styles.chipActive]}
            >
              {complete ? <Ionicons name="checkmark" size={12} color={colors.ink} /> : null}
              <Text style={[type.caption, { fontWeight: '700', color: complete ? colors.ink : active ? colors.lime : colors.nightText3 }]}>
                {r.name}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 'auto', marginBottom: 8 }}>
        <ProgressIndicator
          progress={progress}
          label={done ? 'Home mapped ✓' : `Scanning ${ROOMS[roomIdx].name}…`}
        />
      </View>
    </Screen>
  );
}

const C = 22;
const styles = StyleSheet.create({
  viewfinder: {
    marginTop: 4,
    height: 300,
    borderRadius: 24,
    backgroundColor: '#0E1014',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: C, height: C, borderColor: colors.white },
  cTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  cTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  cBL: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  cBR: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  sweep: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.lime,
    opacity: 0.7,
    shadowColor: colors.lime,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  meta: {
    position: 'absolute',
    bottom: 16,
    color: colors.nightText3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  rec: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  rooms: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.nightLine,
  },
  chipDone: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipActive: { borderColor: colors.lime },
  hint: { color: colors.nightText2, textAlign: 'center', height: 60, lineHeight: 60 },
});
