# Earlybird — notes for Claude sessions

Clickable UX prototype (Expo + React Native + TypeScript). Everything is simulated with local mock
state: no real AR, camera, GPS, maps API, alarms, backend or auth. See README.md for the flows.

The owner often works from the Claude mobile app (cloud sessions), so they can't run a dev server or
Expo Go against this machine. **After any visible change, rebuild and republish the phone preview.**

## Phone preview (claude.ai Artifact)

Live preview: https://claude.ai/artifact/K8Do9JB2sLpH8WqTFN5w2z

1. Dependencies: a SessionStart hook runs `npm ci` in cloud sessions; run it yourself if
   `node_modules` is missing
2. `npx tsc --noEmit`
3. `npm run preview:build` — static web export into `dist/` with relative paths (`_expo/` is renamed
   to `expo/` because the artifact host reserves names starting with `_`).
4. Publish with the Artifact tool, updating the existing artifact:
   - `url`: the live preview link above (read it first if this conversation hasn't)
   - `file_path`: `dist/index.html`, `root`: `dist`
   - `files`: every file under `dist/` except `index.html` and `metadata.json`
     (`find dist -type f ! -name index.html ! -name metadata.json`). The JS bundle name changes
     every build, so include the new one and set the old bundle path to `null`.
5. Commit, push the branch, and tell the owner the preview link.

## Conventions

- Navigation is a deliberately tiny stack in `App.tsx` + `src/state/AppState.tsx` (the owner asked
  not to over-engineer). Prefer extending it over migrating to Expo Router unless asked.
- **The app is strictly black and white.** Use only the gray tokens in `src/theme.ts` (no hues, not
  even for success/error states). Everyday screens are light with black accents; alarm/AR screens
  are dark with white accents (`Button variant="inverse"`). Home AR vs Travel are told apart by
  copy and icons, not color. Wrap any emoji in the `MONO_EMOJI` style so it renders grayscale.
- Animations: pass `useNativeDriver: ND` from `src/theme.ts` (native driver isn't available on web).
- Use `useScreenWidth()` rather than `useWindowDimensions()` for layout widths (web phone frame).
