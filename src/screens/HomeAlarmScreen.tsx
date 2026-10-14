import React, { useEffect } from 'react';
import { AlarmScreen } from '../components/AlarmScreen';
import { useApp } from '../state/AppState';
import { formatTime, rollHunt } from '../data/mock';

export function HomeAlarmScreen() {
  const { alarm, hunt, setHunt, replace } = useApp();
  const t = formatTime(alarm?.hour ?? 7, alarm?.minute ?? 0);

  // Use the previewed hunt if there is one, otherwise pick a fresh surprise.
  useEffect(() => {
    if (!hunt) setHunt(rollHunt());
  }, [hunt, setHunt]);

  return (
    <AlarmScreen
      tone="home"
      modeLabel="Home AR alarm"
      time={t.time}
      period={t.period}
      title="GOOD MORNING"
      message="Your character is hiding somewhere in your home."
      emphasis="GET UP AND FIND IT."
      ctaLabel="START AR"
      ctaIcon="scan"
      onCta={() => replace('arHunt')}
      noSnooze
    />
  );
}
