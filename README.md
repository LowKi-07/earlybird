# Earlybird: alarm prototype

A clickable UX prototype for an alarm you can't dismiss without physically doing something.
Everything is simulated: no AR, camera, GPS, maps API, or real alarms.

## Run

```bash
npm install
npm run web      # opens in the browser inside a phone frame
npm start        # scan the QR code with Expo Go to try it on a phone
```

## Flows

**Home AR:** Home → Create Alarm → Home AR → *Let's map your home* → fake scan → floor plan →
alarm setup (7:00, preview tomorrow's surprise) → Simulate alarm → *GOOD MORNING* → START AR →
Move closer ×3 → Find character → *FOUND!* → Complete alarm → *You're awake!*

**Travel:** Home → Travel → search "Mysore" → Mysore Palace → radius → Activate →
Simulate arrival → *WAKE UP* → Stop alarm.

Shortcuts: the **Simulate** pill on the home alarm card jumps straight to the ringing alarm.
**Reset** at the bottom of Home restores first-run state (unmapped home, no travel alarm).

## Structure

```
App.tsx                 tiny stack navigator + web phone frame
src/theme.ts            colors, type scale (lime = Home AR, coral = Travel)
src/data/mock.ts        characters, rooms, places, random hunt
src/state/AppState.tsx  local mock state + navigation
src/components/         AlarmCard, AlarmScreen, ARMock, BottomSheet, Button, Character,
                        FloorPlan, MapMock, ProgressIndicator, ScanMock, Screen, Motion
src/screens/            one file per screen
```
