import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Character as CharacterT } from '../data/mock';
import { useLoop } from './Motion';
import { MONO_EMOJI } from '../theme';

type Props = {
  character?: CharacterT | null; // null → mystery "?"
  size?: number;
  float?: boolean;
  shadow?: boolean;
};

// A chunky "keycap" tile that reads as a 3D object: darker base, highlight, floating bob + ground shadow.
export function Character({ character, size = 120, float = true, shadow = true }: Props) {
  const bob = useLoop(1400, { reverse: true });
  const color = character?.color ?? '#333333';
  const translateY = float ? bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.08] }) : 0;
  const rotate = float ? bob.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) : '0deg';
  const shadowScale = float ? bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) : 1;
  const depth = size * 0.09;

  return (
    <View style={{ width: size, height: size + depth + size * 0.22, alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        {/* base / thickness */}
        <View
          style={[
            styles.tile,
            {
              width: size,
              height: size,
              borderRadius: size * 0.3,
              backgroundColor: shade(color, -0.28),
              position: 'absolute',
              top: depth,
            },
          ]}
        />
        {/* face */}
        <View
          style={[
            styles.tile,
            { width: size, height: size, borderRadius: size * 0.3, backgroundColor: color },
          ]}
        >
          <View
            style={[
              styles.highlight,
              { borderRadius: size * 0.26, top: size * 0.05, left: size * 0.05, right: size * 0.05, height: size * 0.45 },
            ]}
          />
          {character ? (
            <Text style={[{ fontSize: size * 0.58 }, MONO_EMOJI]}>{character.emoji}</Text>
          ) : (
            <Text style={[styles.q, { fontSize: size * 0.5 }]}>?</Text>
          )}
        </View>
      </Animated.View>
      {shadow ? (
        <Animated.View
          style={[
            styles.shadow,
            {
              width: size * 0.7,
              height: size * 0.1,
              borderRadius: size,
              marginTop: depth + size * 0.1,
              transform: [{ scaleX: shadowScale }],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

// Lighten (amt > 0) or darken (amt < 0) a hex color.
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(Math.min(255, Math.max(0, amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  highlight: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)' },
  q: { color: 'rgba(255,255,255,0.85)', fontWeight: '800' },
  shadow: { backgroundColor: 'rgba(0,0,0,0.28)' },
});
