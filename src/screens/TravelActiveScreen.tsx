import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DESTINATION, MapMock, pointAlong, Pt, radiusToPx, ROUTE } from '../components/MapMock';
import { Button } from '../components/Button';
import { FadeIn, useLoop } from '../components/Motion';
import { useApp } from '../state/AppState';
import { colors, type } from '../theme';

const START_KM = 142.6;
const SIM_MS = 4500;

// Remaining part of the route from the user's current position.
function remainingRoute(t: number): Pt[] {
  const here = pointAlong(ROUTE, t);
  const segs = ROUTE.slice(1).map((p, i) => Math.hypot(p.x - ROUTE[i].x, p.y - ROUTE[i].y));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = t * total;
  let idx = 0;
  while (idx < segs.length && d > segs[idx]) {
    d -= segs[idx];
    idx++;
  }
  return [here, ...ROUTE.slice(idx + 1)];
}

export function TravelActiveScreen() {
  const { travel, setTravel, goHome, replace } = useApp();
  const insets = useSafeAreaInsets();
  const [t, setT] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [reached, setReached] = useState(false);
  const raf = useRef<number | null>(null);
  const blink = useLoop(900, { reverse: true });
  const [dots, setDots] = useState(1);
  const [cardH, setCardH] = useState(420);

  const radius = travel?.radius ?? 500;
  const rPx = radiusToPx(radius);
  const user = pointAlong(ROUTE, t);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    return () => {
      clearInterval(id);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    if (!reached) return;
    const id = setTimeout(() => replace('travelAlarm'), 1500);
    return () => clearTimeout(id);
  }, [reached, replace]);

  const simulate = () => {
    if (simulating) return;
    setSimulating(true);
    const start = Date.now();
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / SIM_MS);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setT(e);
      const p = pointAlong(ROUTE, e);
      if (Math.hypot(p.x - DESTINATION.x, p.y - DESTINATION.y) <= rPx) {
        setReached(true);
        return;
      }
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const distLeft = Math.max(0, Math.hypot(user.x - DESTINATION.x, user.y - DESTINATION.y) - rPx);
  const km = reached ? 0 : (START_KM * Math.pow(distLeft / 470, 1.6));
  const radiusLabel = radius >= 1000 ? '1km' : `${radius}m`;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {/* Frame the whole trip in the space above the status card */}
      <View style={[styles.mapArea, { bottom: cardH }]}>
        <MapMock
          user={user}
          destination={DESTINATION}
          radiusPx={rPx}
          showRoute
          routeFrom={remainingRoute(t)}
          focus={{ x: 60, y: 170, w: 290, h: 540 }}
        />
      </View>

      <View style={[styles.top, { paddingTop: Math.max(insets.top, 20) + 4 }]}>
        <Pressable onPress={goHome} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        {reached ? (
          <FadeIn from={-10} style={styles.banner}>
            <Ionicons name="flag" size={18} color={colors.white} />
            <Text style={[type.label, { color: colors.white }]}>Destination reached!</Text>
          </FadeIn>
        ) : null}
      </View>

      <View
        style={[styles.card, { marginBottom: Math.max(insets.bottom, 16) }]}
        onLayout={(e) => setCardH(e.nativeEvent.layout.height + Math.max(insets.bottom, 16))}
      >
        <View style={styles.status}>
          <Animated.View style={[styles.live, { opacity: blink }]} />
          <Text style={[type.eyebrow, { color: colors.coral }]}>Travel alarm active</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[type.caption, { color: colors.nightText3 }]}>Destination</Text>
            <Text style={[type.title, { color: colors.white, fontSize: 26 }]}>{travel?.place.name ?? 'Mysore Palace'}</Text>
            <Text style={[type.caption, { color: colors.nightText2 }]}>{radiusLabel} radius</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.km}>
              {km < 1 ? km.toFixed(2) : km.toFixed(1)}
              <Text style={styles.kmUnit}> km</Text>
            </Text>
            <Text style={[type.caption, { color: colors.nightText3 }]}>to go</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Ionicons name="radio-outline" size={16} color={reached ? colors.coral : colors.nightText2} />
          <Text style={[type.caption, { color: colors.white, flex: 1 }]}>
            {reached ? 'Arrived' : `Monitoring destination${'.'.repeat(dots)}`}
          </Text>
          <Ionicons name="battery-full" size={16} color="#6FDB9B" />
          <Text style={[type.caption, { color: colors.nightText2 }]}>Low power</Text>
        </View>

        <Text style={[type.caption, { color: colors.nightText3 }]}>
          Go to sleep. Your phone will ring when you're within {radiusLabel} of the destination.
        </Text>

        <Button
          label={reached ? 'Arrived' : simulating ? 'Travelling…' : 'Simulate arrival'}
          variant="coral"
          icon="bus"
          onPress={simulate}
          disabled={simulating}
        />
        <Button
          label="Cancel travel alarm"
          variant="glass"
          size="md"
          onPress={() => {
            setTravel(null);
            goHome();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECE9E2', justifyContent: 'flex-end' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.coral,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
  },
  card: {
    marginHorizontal: 12,
    backgroundColor: colors.night,
    borderRadius: 30,
    padding: 20,
    gap: 14,
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral },
  km: { color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  kmUnit: { fontSize: 15, color: colors.nightText2, fontWeight: '700' },
  mapArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.night2,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 40,
  },
});
