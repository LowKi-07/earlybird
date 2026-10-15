import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { Character } from '../components/Character';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { CHARACTERS, formatTime, Hunt, ROOMS, rollHunt } from '../data/mock';
import { colors, type } from '../theme';

function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onUp} hitSlop={8} style={styles.stepBtn}>
        <Ionicons name="chevron-up" size={22} color={colors.ink3} />
      </Pressable>
      <Text style={styles.timeDigits}>{value}</Text>
      <Pressable onPress={onDown} hitSlop={8} style={styles.stepBtn}>
        <Ionicons name="chevron-down" size={22} color={colors.ink3} />
      </Pressable>
    </View>
  );
}

export function ARSetupScreen() {
  const { back, goHome, go, alarm, setAlarm, hunt, setHunt } = useApp();
  const [hour, setHour] = useState(alarm?.hour ?? 7);
  const [minute, setMinute] = useState(alarm?.minute ?? 0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const t = formatTime(hour, minute);
  const hh = t.time.split(':')[0];

  const save = () => {
    setAlarm({ hour, minute });
    goHome();
  };
  const simulate = () => {
    setAlarm({ hour, minute });
    go('homeAlarm');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scroll
        footer={
          <>
            <Button label="Simulate alarm" icon="play" onPress={simulate} />
            <Button label="Preview tomorrow's alarm" variant="secondary" icon="dice-outline" onPress={() => setPreviewOpen(true)} />
          </>
        }
      >
        <Header
          onBack={back}
          title="Home AR alarm"
          right={
            <Pressable onPress={save} hitSlop={10}>
              <Text style={[type.label, { color: colors.ink, fontWeight: '800' }]}>Save</Text>
            </Pressable>
          }
        />

        <FadeIn style={styles.timeCard}>
          <Stepper value={hh} onUp={() => setHour((h) => (h + 1) % 24)} onDown={() => setHour((h) => (h + 23) % 24)} />
          <Text style={styles.colon}>:</Text>
          <Stepper
            value={String(minute).padStart(2, '0')}
            onUp={() => setMinute((m) => (m + 5) % 60)}
            onDown={() => setMinute((m) => (m + 55) % 60)}
          />
          <Pressable onPress={() => setHour((h) => (h + 12) % 24)} style={styles.period}>
            <Text style={[styles.periodText, t.period === 'AM' && styles.periodOn]}>AM</Text>
            <Text style={[styles.periodText, t.period === 'PM' && styles.periodOn]}>PM</Text>
          </Pressable>
        </FadeIn>
        <Text style={[type.caption, { color: colors.ink3, textAlign: 'center', marginTop: 10 }]}>Every day · No snooze</Text>

        <FadeIn delay={100} style={styles.challenge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Character size={64} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[type.eyebrow, { color: colors.white }]}>Challenge</Text>
              <Text style={[type.heading, { color: colors.white }]}>Find the hidden character</Text>
            </View>
          </View>
          <Text style={[type.body, { color: colors.nightText2, fontSize: 15 }]}>
            When the alarm rings, a random character hides in a random room. The only way to turn it off is to walk there and find it.
          </Text>
          <View style={styles.how}>
            {[
              ['alarm-outline', 'It rings'],
              ['walk-outline', 'You get up'],
              ['checkmark-circle-outline', 'Find it = off'],
            ].map(([icon, label], i) => (
              <View key={label} style={styles.howStep}>
                <Ionicons name={icon as any} size={20} color={colors.white} />
                <Text style={[type.caption, { color: colors.white, textAlign: 'center' }]}>{label}</Text>
                {i < 2 ? <Ionicons name="chevron-forward" size={14} color={colors.nightText3} style={styles.howArrow} /> : null}
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <Text style={[type.eyebrow, { color: colors.ink3, marginTop: 24, marginBottom: 10 }]}>Possible hiding places</Text>
          <View style={styles.chips}>
            {ROOMS.filter((r) => r.id !== 'bedroom').map((r) => (
              <View key={r.id} style={styles.chip}>
                <Text style={[type.caption, { color: colors.ink, fontWeight: '600' }]}>{r.name}</Text>
              </View>
            ))}
            <View style={[styles.chip, { backgroundColor: 'transparent' }]}>
              <Text style={[type.caption, { color: colors.ink3 }]}>Never your bedroom</Text>
            </View>
          </View>
        </FadeIn>
      </Screen>

      <PreviewSheet
        visible={previewOpen}
        hunt={hunt}
        timeLabel={`${t.time} ${t.period}`}
        onRoll={setHunt}
        onClose={() => setPreviewOpen(false)}
        onSimulate={() => {
          setPreviewOpen(false);
          simulate();
        }}
      />
    </View>
  );
}

// Slot-machine style roll so the random pick feels like a surprise.
function PreviewSheet({
  visible,
  hunt,
  timeLabel,
  onRoll,
  onClose,
  onSimulate,
}: {
  visible: boolean;
  hunt: Hunt | null;
  timeLabel: string;
  onRoll: (h: Hunt) => void;
  onClose: () => void;
  onSimulate: () => void;
}) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(0);
  const [roomFace, setRoomFace] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const roll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const result = rollHunt(hunt);
    setRolling(true);
    let elapsed = 0;
    for (let i = 0; i < 18; i++) {
      elapsed += 50 + i * i * 1.6; // decelerate
      timers.current.push(
        setTimeout(() => {
          setFace((f) => (f + 1) % CHARACTERS.length);
          setRoomFace((r) => (r + 1) % ROOMS.length);
        }, elapsed),
      );
    }
    timers.current.push(
      setTimeout(() => {
        onRoll(result);
        setRolling(false);
      }, elapsed + 120),
    );
  };

  useEffect(() => {
    if (visible) roll();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shownChar = rolling || !hunt ? CHARACTERS[face] : hunt.character;
  const shownRoom = rolling || !hunt ? ROOMS[roomFace].name : hunt.room.name;

  return (
    <BottomSheet visible={visible} onClose={onClose} dark>
      <Text style={[type.eyebrow, { color: colors.white, textAlign: 'center' }]}>
        {rolling ? 'Rolling tomorrow’s surprise…' : `Tomorrow at ${timeLabel}`}
      </Text>
      <View style={styles.slot}>
        <Character character={shownChar} size={110} float={!rolling} />
      </View>
      <Text style={[type.title, { color: colors.white, textAlign: 'center' }]}>
        {rolling ? '· · ·' : `${shownChar.name}`}
      </Text>
      <Text style={[type.body, { color: colors.nightText2, textAlign: 'center', marginTop: 6 }]}>
        {rolling ? `Hiding in the ${shownRoom}?` : `Hiding in the ${hunt?.room.name}, ${hunt?.spot}.`}
      </Text>
      <View style={styles.peek}>
        <Ionicons name="eye-off-outline" size={14} color={colors.nightText3} />
        <Text style={[type.caption, { color: colors.nightText3, flex: 1 }]}>
          Prototype peek. In the real app this stays secret until the alarm rings.
        </Text>
      </View>
      <View style={{ gap: 10, marginTop: 8 }}>
        <Button label="Simulate this alarm" variant="inverse" icon="play" onPress={onSimulate} disabled={rolling} />
        <Button label="Roll again" variant="glass" icon="dice-outline" onPress={roll} disabled={rolling} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingVertical: 12,
    marginTop: 8,
  },
  stepper: { alignItems: 'center' },
  stepBtn: { padding: 4 },
  timeDigits: { fontSize: 76, fontWeight: '800', letterSpacing: -3, color: colors.ink, fontVariant: ['tabular-nums'] },
  colon: { fontSize: 64, fontWeight: '800', color: colors.ink3, marginHorizontal: 2, marginTop: -8 },
  period: { marginLeft: 14, gap: 6 },
  periodText: { fontSize: 15, fontWeight: '800', color: colors.ink3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, overflow: 'hidden' },
  periodOn: { color: colors.white, backgroundColor: colors.ink },
  challenge: { backgroundColor: colors.night, borderRadius: 28, padding: 20, gap: 14, marginTop: 20 },
  how: { flexDirection: 'row', backgroundColor: colors.night2, borderRadius: 18, paddingVertical: 14 },
  howStep: { flex: 1, alignItems: 'center', gap: 6 },
  howArrow: { position: 'absolute', right: -7, top: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.card, paddingHorizontal: 14, height: 34, borderRadius: 17, justifyContent: 'center' },
  slot: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  peek: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: colors.night3,
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
  },
});
