import { Platform, TextStyle } from 'react-native';

// Native driver isn't available on web; fall back to JS animations there.
export const ND = Platform.OS !== 'web';

// SVG <Text> defaults to a serif on web; native already uses the system font.
export const SVG_FONT = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' : undefined;

export const colors = {
  // Everyday app surfaces: warm paper + ink
  paper: '#F3F1EC',
  card: '#FFFFFF',
  ink: '#0E0F12',
  ink2: '#5B5E66',
  ink3: '#9A9CA3',
  line: '#E4E1DA',

  // AR / alarm surfaces: night
  night: '#07080B',
  night2: '#12141A',
  night3: '#1C1F27',
  nightLine: 'rgba(255,255,255,0.10)',
  nightText2: 'rgba(255,255,255,0.62)',
  nightText3: 'rgba(255,255,255,0.38)',

  // Mode accents — Home AR = lime, Travel = coral
  lime: '#C8F53C',
  limeSoft: '#EEF9C9',
  limeDim: 'rgba(200,245,60,0.35)',
  coral: '#FF5A36',
  coralSoft: '#FFE3DA',
  coralDim: 'rgba(255,90,54,0.35)',

  white: '#FFFFFF',
  danger: '#FF3B30',
};

export type Tone = 'home' | 'travel';

export const accent = (tone: Tone) => (tone === 'home' ? colors.lime : colors.coral);
export const accentSoft = (tone: Tone) => (tone === 'home' ? colors.limeSoft : colors.coralSoft);
export const accentDim = (tone: Tone) => (tone === 'home' ? colors.limeDim : colors.coralDim);
// Text that sits on top of an accent fill
export const onAccent = (tone: Tone) => (tone === 'home' ? colors.ink : colors.white);

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
