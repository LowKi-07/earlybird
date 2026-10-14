import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/Screen';
import { HomeModeArt, TravelModeArt } from '../components/AlarmCard';
import { FadeIn } from '../components/Motion';
import { useApp } from '../state/AppState';
import { accent, accentSoft, colors, Tone, type } from '../theme';

type OptionProps = {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  rule: string;
  art: React.ReactNode;
  onPress: () => void;
};

function Option({ tone, eyebrow, title, body, rule, art, onPress }: OptionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.optionArt, { backgroundColor: accentSoft(tone) }]}>{art}</View>
      <View style={{ gap: 6 }}>
        <Text style={[type.eyebrow, { color: tone === 'home' ? '#5E7A08' : colors.coral }]}>{eyebrow}</Text>
        <Text style={[type.title, { color: colors.ink, fontSize: 26 }]}>{title}</Text>
        <Text style={[type.body, { color: colors.ink2 }]}>{body}</Text>
      </View>
      <View style={styles.rule}>
        <Ionicons name={tone === 'home' ? 'walk' : 'navigate'} size={16} color={tone === 'home' ? colors.ink : accent(tone)} />
        <Text style={[type.caption, { color: colors.ink, fontWeight: '600', flex: 1 }]}>{rule}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.ink} />
      </View>
    </Pressable>
  );
}

export function CreateAlarmScreen() {
  const { back, go, homeMapped } = useApp();
  return (
    <Screen scroll>
      <Header onBack={back} backIcon="close" />
      <FadeIn>
        <Text style={[type.display, { color: colors.ink }]}>How do you{'\n'}want to wake up?</Text>
      </FadeIn>
      <View style={{ gap: 14, marginTop: 28 }}>
        <FadeIn delay={80}>
          <Option
            tone="home"
            eyebrow="Home AR"
            title="Find the hidden character"
            body="Every morning a surprise character hides somewhere in your home."
            rule="You can't dismiss it. You have to get up and find it."
            art={<HomeModeArt />}
            onPress={() => go(homeMapped ? 'arSetup' : 'homeIntro')}
          />
        </FadeIn>
        <FadeIn delay={160}>
          <Option
            tone="travel"
            eyebrow="Travel"
            title="Wake me when I arrive"
            body="Pick a destination. Fall asleep on the bus. We'll wake you when you're close."
            rule="Rings when you enter the destination radius."
            art={<TravelModeArt />}
            onPress={() => go('travelMap')}
          />
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { backgroundColor: colors.card, borderRadius: 28, padding: 18, gap: 16 },
  optionArt: { height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 14,
  },
});
