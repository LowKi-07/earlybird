import React from 'react';
import { AlarmScreen } from '../components/AlarmScreen';
import { useApp } from '../state/AppState';
import { formatTime } from '../data/mock';

export function TravelAlarmScreen() {
  const { travel, replace } = useApp();
  const now = new Date();
  const t = formatTime(now.getHours(), now.getMinutes());
  const name = travel?.place.name ?? 'your destination';

  return (
    <AlarmScreen
      tone="travel"
      modeLabel="Travel alarm"
      time={t.time}
      period={t.period}
      title="WAKE UP"
      message="You have arrived at your destination."
      emphasis={name.toUpperCase()}
      ctaLabel="STOP ALARM"
      ctaIcon="stop"
      onCta={() => replace('travelComplete')}
    />
  );
}
