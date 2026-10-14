import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors, SVG_FONT } from '../theme';

export type Pt = { x: number; y: number };

const W = 400;
const H = 800;

export const USER_START: Pt = { x: 110, y: 660 };
export const DESTINATION: Pt = { x: 285, y: 250 };
// Route along the mock roads from the user to the destination.
export const ROUTE: Pt[] = [USER_START, { x: 110, y: 470 }, { x: 220, y: 470 }, { x: 220, y: 330 }, { x: 285, y: 330 }, DESTINATION];

// Visual radius on the stylised map (not to scale — just needs to read as bigger/smaller).
export const radiusToPx = (m: number) => (m <= 100 ? 26 : m <= 300 ? 46 : m <= 500 ? 66 : 104);

export function pointAlong(route: Pt[], t: number): Pt {
  const segs = route.slice(1).map((p, i) => Math.hypot(p.x - route[i].x, p.y - route[i].y));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const k = segs[i] === 0 ? 0 : d / segs[i];
      return { x: route[i].x + (route[i + 1].x - route[i].x) * k, y: route[i].y + (route[i + 1].y - route[i].y) * k };
    }
    d -= segs[i];
  }
  return route[route.length - 1];
}

type Props = {
  user?: Pt;
  destination?: Pt | null;
  radiusPx?: number;
  showRoute?: boolean;
  routeFrom?: Pt[]; // remaining route to draw
  dim?: boolean;
  // Optional region to frame (map coordinates). Defaults to the whole map, cropped to fill.
  focus?: { x: number; y: number; w: number; h: number };
};

const MAJOR = ['M0 470 L400 470', 'M220 0 L220 800', 'M0 160 L400 160'];
const MINOR = [
  'M110 380 L110 800',
  'M150 330 L400 330',
  'M285 250 L285 330',
  'M40 0 L40 800',
  'M350 0 L350 800',
  'M0 620 L400 620',
  'M0 740 L220 740',
  'M300 470 L300 800',
  'M150 0 L150 330',
];

// Stylised, hand-drawn-feeling city map. No tiles, no API — just SVG.
export function MapMock({ user = USER_START, destination, radiusPx = 66, showRoute, routeFrom, dim, focus }: Props) {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 0.04) % 1), 50);
    return () => clearInterval(id);
  }, []);

  const routePts = (routeFrom ?? ROUTE).map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox={focus ? `${focus.x} ${focus.y} ${focus.w} ${focus.h}` : `0 0 ${W} ${H}`}
        preserveAspectRatio={focus ? 'xMidYMid meet' : 'xMidYMid slice'}
      >
        <Rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#ECE9E2" />

        {/* city blocks */}
        <G fill="#E3DFD6">
          {[
            [50, 170, 92, 120], [160, 170, 52, 150], [50, 340, 52, 120], [120, 340, 92, 120],
            [230, 340, 62, 120], [310, 340, 32, 120], [50, 480, 52, 130], [120, 480, 92, 130],
            [230, 480, 62, 130], [310, 480, 32, 130], [50, 630, 52, 100], [120, 630, 92, 100],
            [230, 630, 62, 160], [310, 630, 32, 160], [230, 10, 112, 140], [50, 10, 92, 140],
          ].map(([x, y, w, h], i) => (
            <Rect key={i} x={x} y={y} width={w} height={h} rx="6" />
          ))}
        </G>

        {/* lake + palace grounds */}
        <Ellipse cx="90" cy="236" rx="46" ry="32" fill="#CFE2EE" />
        <Rect x="234" y="178" width="104" height="138" rx="14" fill="#D7E6C6" />
        <SvgText fontFamily={SVG_FONT} x="244" y="194" fill="#7E9670" fontSize="9" fontWeight="600">
          PALACE GROUNDS
        </SvgText>
        <SvgText fontFamily={SVG_FONT} x="90" y="240" fill="#7C9AB0" fontSize="9" fontWeight="600" textAnchor="middle">
          Lake
        </SvgText>

        {/* roads */}
        <G stroke="#D8D3C8" strokeLinecap="round" fill="none">
          {MAJOR.map((d, i) => <Path key={i} d={d} strokeWidth="18" />)}
          {MINOR.map((d, i) => <Path key={i} d={d} strokeWidth="10" />)}
        </G>
        <G stroke="#FFFFFF" strokeLinecap="round" fill="none">
          {MAJOR.map((d, i) => <Path key={i} d={d} strokeWidth="14" />)}
          {MINOR.map((d, i) => <Path key={i} d={d} strokeWidth="7" />)}
        </G>
        <SvgText fontFamily={SVG_FONT} x="330" y="465" fill="#A19C90" fontSize="9" fontWeight="600" textAnchor="middle">
          Sayyaji Rao Rd
        </SvgText>
        <SvgText fontFamily={SVG_FONT} x="226" y="760" fill="#A19C90" fontSize="9" fontWeight="600" transform="rotate(-90 226 760)">
          Albert Victor Rd
        </SvgText>

        {/* route */}
        {showRoute ? (
          <G>
            <Polyline points={routePts} fill="none" stroke={colors.ink} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeOpacity={0.85} />
            <Polyline points={routePts} fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round" />
          </G>
        ) : null}

        {/* destination */}
        {destination ? (
          <G>
            <Circle cx={destination.x} cy={destination.y} r={radiusPx} fill={colors.coral} fillOpacity={0.12} stroke={colors.coral} strokeWidth="1.5" strokeDasharray="5 4" />
            <Ellipse cx={destination.x} cy={destination.y + 2} rx="7" ry="3" fill="rgba(0,0,0,0.2)" />
            <Path
              d={`M${destination.x} ${destination.y} c-4 -10 -14 -16 -14 -27 a14 14 0 0 1 28 0 c0 11 -10 17 -14 27z`}
              fill={colors.coral}
            />
            <Circle cx={destination.x} cy={destination.y - 27} r="5" fill="#FFFFFF" />
          </G>
        ) : null}

        {/* user */}
        <Circle cx={user.x} cy={user.y} r={10 + pulse * 22} fill="#2F7BFF" fillOpacity={0.25 * (1 - pulse)} />
        <Circle cx={user.x} cy={user.y} r="10" fill="#FFFFFF" />
        <Circle cx={user.x} cy={user.y} r="7" fill="#2F7BFF" />

        {dim ? <Rect x="0" y="0" width={W} height={H} fill={colors.night} fillOpacity={0.35} /> : null}
      </Svg>
    </View>
  );
}
