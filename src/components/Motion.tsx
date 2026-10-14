import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { ND } from '../theme';

// Looping 0→1 animated value.
export function useLoop(duration: number, opts: { reverse?: boolean; delay?: number } = {}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const seq = opts.reverse
      ? Animated.sequence([
          Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
          Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        ])
      : Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: ND });
    const loop = Animated.loop(opts.delay ? Animated.sequence([Animated.delay(opts.delay), seq]) : seq);
    loop.start();
    return () => loop.stop();
  }, [v, duration, opts.reverse, opts.delay]);
  return v;
}

// Expanding rings — used for alarm states, map markers and AR signal.
export function PulseRings({
  color,
  size,
  count = 3,
  duration = 2400,
  style,
}: {
  color: string;
  size: number;
  count?: number;
  duration?: number;
  style?: ViewStyle;
}) {
  return (
    <View pointerEvents="none" style={[styles.center, { width: size, height: size }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <Ring key={i} color={color} size={size} duration={duration} delay={(duration / count) * i} />
      ))}
    </View>
  );
}

function Ring({ color, size, duration, delay }: { color: string; size: number; duration: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: ND }),
        Animated.delay(Math.max(0, duration - delay)),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.8, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        },
      ]}
    />
  );
}

// Fades + lifts children in on mount.
export function FadeIn({
  children,
  delay = 0,
  from = 16,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 480,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: ND,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
