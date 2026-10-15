import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider, RouteName, useApp } from './src/state/AppState';
import { WEB_FRAME } from './src/components/useScreenWidth';
import { colors, ND } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateAlarmScreen } from './src/screens/CreateAlarmScreen';
import { HomeIntroScreen } from './src/screens/HomeIntroScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { HomeMappedScreen } from './src/screens/HomeMappedScreen';
import { ARSetupScreen } from './src/screens/ARSetupScreen';
import { HomeAlarmScreen } from './src/screens/HomeAlarmScreen';
import { ARHuntScreen } from './src/screens/ARHuntScreen';
import { HomeCompleteScreen, TravelCompleteScreen } from './src/screens/CompleteScreen';
import { TravelMapScreen } from './src/screens/TravelMapScreen';
import { TravelActiveScreen } from './src/screens/TravelActiveScreen';
import { TravelAlarmScreen } from './src/screens/TravelAlarmScreen';

const SCREENS: Record<RouteName, React.ComponentType> = {
  home: HomeScreen,
  create: CreateAlarmScreen,
  homeIntro: HomeIntroScreen,
  scan: ScanScreen,
  homeMapped: HomeMappedScreen,
  arSetup: ARSetupScreen,
  homeAlarm: HomeAlarmScreen,
  arHunt: ARHuntScreen,
  homeComplete: HomeCompleteScreen,
  travelMap: TravelMapScreen,
  travelActive: TravelActiveScreen,
  travelAlarm: TravelAlarmScreen,
  travelComplete: TravelCompleteScreen,
};

// Screens with a night background — the container matches so dark→dark transitions don't flash.
const DARK: RouteName[] = ['homeIntro', 'scan', 'homeMapped', 'homeAlarm', 'arHunt', 'travelAlarm'];

// Minimal navigator: render the top route and fade/slide it in whenever it changes.
function Navigator() {
  const { route, depth } = useApp();
  const anim = useRef(new Animated.Value(1)).current;
  const prevDepth = useRef(depth);
  const dir = useRef(1);

  useEffect(() => {
    dir.current = depth >= prevDepth.current ? 1 : -1;
    prevDepth.current = depth;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  }, [route, depth, anim]);

  const Current = SCREENS[route];
  return (
    <View style={[styles.fill, { backgroundColor: DARK.includes(route) ? colors.night : colors.paper }]}>
      <Animated.View
        key={`${route}-${depth}`}
        style={[
          styles.fill,
          {
            opacity: anim,
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [dir.current * 24, 0] }) }],
          },
        ]}
      >
        <Current />
      </Animated.View>
    </View>
  );
}

// On a desktop browser, show the app inside a phone-sized frame so it reads like a mobile app.
function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width <= 500) return <>{children}</>;
  const h = Math.min(WEB_FRAME.height, height - 40);
  return (
    <View style={styles.webBg}>
      <View style={[styles.phone, { width: WEB_FRAME.width, height: h }]}>{children}</View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <DeviceFrame>
          <Navigator />
        </DeviceFrame>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  webBg: { flex: 1, backgroundColor: '#D6D6D6', alignItems: 'center', justifyContent: 'center' },
  phone: {
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: colors.night,
    backgroundColor: colors.paper,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
});
