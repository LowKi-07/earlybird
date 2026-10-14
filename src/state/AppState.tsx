import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Hunt, Place } from '../data/mock';

export type RouteName =
  | 'home'
  | 'create'
  | 'homeIntro'
  | 'scan'
  | 'homeMapped'
  | 'arSetup'
  | 'homeAlarm'
  | 'arHunt'
  | 'homeComplete'
  | 'travelMap'
  | 'travelActive'
  | 'travelAlarm'
  | 'travelComplete';

type Alarm = { hour: number; minute: number };
type Travel = { place: Place; radius: number; active: boolean };

type AppState = {
  // navigation
  route: RouteName;
  depth: number;
  go: (r: RouteName) => void;
  replace: (r: RouteName) => void;
  back: () => void;
  goHome: () => void;
  reset: (routes: RouteName[]) => void;

  // mock data
  userName: string;
  homeMapped: boolean;
  setHomeMapped: (v: boolean) => void;
  alarm: Alarm | null;
  setAlarm: (a: Alarm | null) => void;
  hunt: Hunt | null;
  setHunt: (h: Hunt | null) => void;
  found: string[];
  markFound: (id: string) => void;
  travel: Travel | null;
  setTravel: (t: Travel | null) => void;
  resetPrototype: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<RouteName[]>(['home']);
  const [homeMapped, setHomeMapped] = useState(false);
  const [alarm, setAlarm] = useState<Alarm | null>({ hour: 7, minute: 0 });
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [found, setFound] = useState<string[]>(['cat']);
  const [travel, setTravel] = useState<Travel | null>(null);

  const go = useCallback((r: RouteName) => setStack((s) => [...s, r]), []);
  const replace = useCallback((r: RouteName) => setStack((s) => [...s.slice(0, -1), r]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const goHome = useCallback(() => setStack(['home']), []);
  const reset = useCallback((routes: RouteName[]) => setStack(routes), []);
  const markFound = useCallback(
    (id: string) => setFound((f) => (f.includes(id) ? f : [...f, id])),
    [],
  );
  const resetPrototype = useCallback(() => {
    setHomeMapped(false);
    setAlarm({ hour: 7, minute: 0 });
    setHunt(null);
    setFound(['cat']);
    setTravel(null);
    setStack(['home']);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      route: stack[stack.length - 1],
      depth: stack.length,
      go,
      replace,
      back,
      goHome,
      reset,
      userName: 'Kishore',
      homeMapped,
      setHomeMapped,
      alarm,
      setAlarm,
      hunt,
      setHunt,
      found,
      markFound,
      travel,
      setTravel,
      resetPrototype,
    }),
    [stack, homeMapped, alarm, hunt, found, travel, go, replace, back, goHome, reset, markFound, resetPrototype],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
