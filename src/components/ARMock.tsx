import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  walk: number; // continuous "distance walked" — moving the floor grid toward the camera
  sway?: number; // -1..1 small sideways camera drift
  color?: string;
  children?: React.ReactNode;
};

const W = 400;
const H = 800;
const VP = { x: 200, y: 360 };
const F = 440; // focal length
const ROOM_HALF = 1.7; // wall X
const FLOOR_Y = 1; // camera height above floor
const CEIL_Y = -0.8;
const SPACING = 0.7;

const rand = (seed: number) => {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

// Fake camera feed: a dark room with an AR wireframe overlay (floor grid, walls, a sofa).
export function ARMock({ walk, sway = 0, color = colors.lime, children }: Props) {
  const vpx = VP.x + sway * 18;
  const proj = (x: number, y: number, z: number) => ({ x: vpx + (x * F) / z, y: VP.y + (y * F) / z });

  const zOffset = (walk * SPACING * 1.6) % SPACING;

  const grid = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; o: number }[] = [];
    // depth lines (parallel to camera) on floor
    for (let k = 0; k < 22; k++) {
      const z = 0.45 + k * SPACING - zOffset;
      if (z <= 0.3) continue;
      const a = proj(-ROOM_HALF, FLOOR_Y, z);
      const b = proj(ROOM_HALF, FLOOR_Y, z);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, o: Math.max(0.08, 0.7 - z * 0.05) });
    }
    // lines running away from camera
    for (let i = -4; i <= 4; i++) {
      const x = (i / 4) * ROOM_HALF;
      const a = proj(x, FLOOR_Y, 0.35);
      const b = proj(x, FLOOR_Y, 16);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, o: 0.35 });
    }
    return lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zOffset, vpx]);

  const corner = (x: number, y: number) => {
    const a = proj(x, y, 0.35);
    const b = proj(x, y, 16);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };
  const backWall = [
    proj(-ROOM_HALF, CEIL_Y, 16),
    proj(ROOM_HALF, CEIL_Y, 16),
    proj(ROOM_HALF, FLOOR_Y, 16),
    proj(-ROOM_HALF, FLOOR_Y, 16),
  ];

  // Sofa box against left wall
  const sofaZ0 = Math.max(0.6, 4.2 - (walk * 0.5) % 3.2);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const p = [
      proj(x0, y0, z0), proj(x1, y0, z0), proj(x1, y1, z0), proj(x0, y1, z0),
      proj(x0, y0, z1), proj(x1, y0, z1), proj(x1, y1, z1), proj(x0, y1, z1),
    ];
    const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    return e.map(([a, b]) => ({ x1: p[a].x, y1: p[a].y, x2: p[b].x, y2: p[b].y }));
  };
  const sofa = box(-ROOM_HALF, -0.9, 0.45, FLOOR_Y, sofaZ0, sofaZ0 + 1.6);

  const points = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => {
        const z = 0.8 + rand(i) * 10;
        const x = (rand(i + 99) * 2 - 1) * ROOM_HALF;
        const p = proj(x, FLOOR_Y, z);
        return { ...p, r: Math.max(1, 3 - z * 0.2) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vpx],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="cam" cx="50%" cy="45%" r="75%">
            <Stop offset="0" stopColor="#2A2B30" />
            <Stop offset="0.6" stopColor="#141519" />
            <Stop offset="1" stopColor="#050506" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={W} height={H} fill="url(#cam)" />

        {/* Detected floor plane */}
        <Polygon
          points={[proj(-ROOM_HALF, FLOOR_Y, 0.35), proj(ROOM_HALF, FLOOR_Y, 0.35), proj(ROOM_HALF, FLOOR_Y, 16), proj(-ROOM_HALF, FLOOR_Y, 16)]
            .map((p) => `${p.x},${p.y}`)
            .join(' ')}
          fill={color}
          fillOpacity={0.05}
        />

        <G stroke={color}>
          {grid.map((l, i) => (
            <Line key={i} {...l} strokeOpacity={l.o} strokeWidth={1} />
          ))}
          {/* room corners */}
          {[corner(-ROOM_HALF, FLOOR_Y), corner(ROOM_HALF, FLOOR_Y), corner(-ROOM_HALF, CEIL_Y), corner(ROOM_HALF, CEIL_Y)].map(
            (l, i) => (
              <Line key={`c${i}`} {...l} strokeOpacity={0.6} strokeWidth={1.4} />
            ),
          )}
          <Polygon
            points={backWall.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            strokeOpacity={0.5}
            strokeWidth={1.2}
          />
          {sofa.map((l, i) => (
            <Line key={`s${i}`} {...l} strokeOpacity={0.8} strokeWidth={1.4} />
          ))}
        </G>

        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color} opacity={0.25 + rand(i + Math.floor(walk * 3)) * 0.6} />
        ))}
      </Svg>
      {children}
    </View>
  );
}
