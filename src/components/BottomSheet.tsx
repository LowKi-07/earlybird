import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, ND } from '../theme';

type Props = {
  visible: boolean;
  onClose?: () => void;
  dark?: boolean;
  scrim?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

// Slides up from the bottom of its parent. Render it last inside a full-screen container.
export function BottomSheet({ visible, onClose, dark, scrim = true, children, style }: Props) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: ND,
      damping: 22,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [visible, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [700, 0] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'box-none' : 'none'}>
      {scrim ? (
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: anim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
      ) : null}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: dark ? colors.night2 : colors.card,
            paddingBottom: Math.max(insets.bottom, 20),
            transform: [{ translateY }],
          },
          style,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: dark ? colors.nightLine : colors.line }]} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(7,8,11,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 14 },
});
