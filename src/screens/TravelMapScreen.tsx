import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DESTINATION, MapMock, radiusToPx } from '../components/MapMock';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { Place, PLACES, RADII } from '../data/mock';
import { colors, type } from '../theme';

export function TravelMapScreen() {
  const { back, reset, setTravel } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [radius, setRadius] = useState(500);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLACES.slice(0, 3);
    return PLACES.filter((p) => `${p.name} ${p.area}`.toLowerCase().includes(q));
  }, [query]);

  const select = (p: Place) => {
    setPlace(p);
    setQuery(p.name);
    setFocused(false);
  };

  const showResults = focused && !place;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <MapMock destination={place ? DESTINATION : null} radiusPx={radiusToPx(radius)} />

      <View style={[styles.top, { paddingTop: Math.max(insets.top, 20) + 4 }]}>
        <View style={styles.searchRow}>
          <Pressable onPress={back} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.ink3} />
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setPlace(null);
              }}
              onFocus={() => setFocused(true)}
              placeholder="Search destination"
              placeholderTextColor={colors.ink3}
              style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
              returnKeyType="search"
              onSubmitEditing={() => results[0] && select(results[0])}
            />
            {query ? (
              <Pressable
                onPress={() => {
                  setQuery('');
                  setPlace(null);
                  setFocused(true);
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.ink3} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {!place && !focused ? (
          <FadeIn style={styles.prompt}>
            <Text style={[type.eyebrow, { color: colors.ink2 }]}>Travel alarm</Text>
            <Text style={[type.title, { color: colors.ink, marginTop: 6 }]}>Where are you going?</Text>
            <Text style={[type.caption, { color: colors.ink2, marginTop: 6 }]}>
              We'll wake you up when you get close. Perfect for buses, trains and long drives.
            </Text>
          </FadeIn>
        ) : null}

        {showResults ? (
          <FadeIn from={8} style={styles.results}>
            <Text style={[type.eyebrow, { color: colors.ink3, paddingHorizontal: 16, paddingTop: 14 }]}>
              {query ? 'Results' : 'Suggested'}
            </Text>
            {results.length === 0 ? (
              <Text style={[type.caption, { color: colors.ink2, padding: 16 }]}>No matches. Try “Mysore Palace”.</Text>
            ) : (
              results.map((p) => (
                <Pressable key={p.id} onPress={() => select(p)} style={({ pressed }) => [styles.result, pressed && { backgroundColor: colors.paper }]}>
                  <View style={styles.resultIcon}>
                    <Ionicons name="location" size={16} color={colors.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.label, { color: colors.ink }]}>{p.name}</Text>
                    <Text style={[type.caption, { color: colors.ink2 }]}>{p.area}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={colors.ink3} />
                </Pressable>
              ))
            )}
          </FadeIn>
        ) : null}
      </View>

      <BottomSheet visible={!!place} scrim={false}>
        {place ? (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <View style={styles.saved}>
                <Ionicons name="checkmark-circle" size={14} color={colors.ink} />
                <Text style={[type.caption, { color: colors.ink, fontWeight: '700' }]}>Destination saved</Text>
              </View>
              <View>
                <Text style={[type.title, { color: colors.ink }]}>{place.name}</Text>
                <Text style={[type.caption, { color: colors.ink2, marginTop: 2 }]}>{place.area}</Text>
              </View>
            </View>

            <View style={styles.coords}>
              <View style={styles.coord}>
                <Text style={[type.eyebrow, { color: colors.ink3, fontSize: 10 }]}>Latitude</Text>
                <Text style={styles.coordN}>{place.lat.toFixed(4)}</Text>
              </View>
              <View style={styles.coord}>
                <Text style={[type.eyebrow, { color: colors.ink3, fontSize: 10 }]}>Longitude</Text>
                <Text style={styles.coordN}>{place.lng.toFixed(4)}</Text>
              </View>
            </View>

            <View>
              <Text style={[type.label, { color: colors.ink, marginBottom: 10 }]}>Wake me within</Text>
              <View style={styles.segment}>
                {RADII.map((r) => {
                  const on = r.meters === radius;
                  return (
                    <Pressable key={r.label} onPress={() => setRadius(r.meters)} style={[styles.segBtn, on && styles.segOn]}>
                      <Text style={[type.label, { color: on ? colors.white : colors.ink2 }]}>{r.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.power}>
              <Ionicons name="leaf" size={18} color={colors.ink} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.label, { color: colors.ink }]}>Low-power destination monitoring</Text>
                <Text style={[type.caption, { color: colors.ink2 }]}>
                  Your destination is saved on this device. No continuous location tracking is required.
                </Text>
              </View>
            </View>

            <Button
              label="Activate Travel Alarm"
              variant="primary"
              icon="navigate"
              onPress={() => {
                setTravel({ place, radius, active: true });
                reset(['home', 'travelActive']);
              }}
            />
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDEDED' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  search: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: { flex: 1, fontSize: 16, color: colors.ink, height: '100%' },
  prompt: { backgroundColor: colors.card, borderRadius: 24, padding: 18 },
  results: { backgroundColor: colors.card, borderRadius: 24, overflow: 'hidden', paddingBottom: 6 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  resultIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  saved: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.soft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  coords: { flexDirection: 'row', gap: 10 },
  coord: { flex: 1, backgroundColor: colors.paper, borderRadius: 16, padding: 12, gap: 2 },
  coordN: { fontSize: 20, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'], letterSpacing: -0.4 },
  segment: { flexDirection: 'row', backgroundColor: colors.paper, borderRadius: 16, padding: 4 },
  segBtn: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.ink },
  power: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.paper, borderRadius: 16, padding: 14 },
});
