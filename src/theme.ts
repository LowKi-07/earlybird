import { Platform, TextStyle } from 'react-native';

// Native driver isn't available on web; fall back to JS animations there.
export const ND = Platform.OS !== 'web';

// SVG <Text> defaults to a serif on web; native already uses the system font.
export const SVG_FONT = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' : undefined;

export const colors = {
  // Strictly black and white. Everyday surfaces: light gray paper + black ink
  paper: '#F2F2F2',
  card: '#FFFFFF',
  ink: '#0A0A0A',
  ink2: '#5C5C5C',
  ink3: '#9A9A9A',
  line: '#E0E0E0',
  soft: '#E8E8E8',

  // AR / alarm surfaces: night
  night: '#000000',
  night2: '#111111',
  night3: '#1E1E1E',
  nightLine: 'rgba(255,255,255,0.10)',
  nightText2: 'rgba(255,255,255,0.62)',
  nightText3: 'rgba(255,255,255,0.38)',

  white: '#FFFFFF',
};

export type Tone = 'home' | 'travel';

// Both modes share one monochrome palette; tone only changes copy and icons.
export const accent = (_tone: Tone) => colors.white; // highlight on dark surfaces
export const accentSoft = (_tone: Tone) => colors.soft; // tinted panel on light surfaces

// Emoji are drawn in color by the OS; desaturate them to keep the app monochrome.
// Works on web and Android; iOS may still show color emoji.
export const MONO_EMOJI = { filter: 'grayscale(1)' } as const;

export const type: Record<string, TextStyle> = {
  mega: { fontSize: 88, fontWeight: '800', letterSpacing: -4, fontVariant: ['tabular-nums'] },
  display: { fontSize: 44, fontWeight: '800', letterSpacing: -1.6, lineHeight: 46 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, lineHeight: 34 },
  heading: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 23 },
  label: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
};

export const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 };
