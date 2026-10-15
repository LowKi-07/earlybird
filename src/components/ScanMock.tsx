import React, { useMemo } from 'react';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { DOORS, ROOMS } from '../data/mock';
import { colors, SVG_FONT } from '../theme';

type Props = {
  progress: number; // 0..1
  width: number;
};

const WALL = 38;
const VB = { x: -260, y: -70, w: 570, h: 400 };

// Isometric projection of floor-plan coordinates.
const iso = (x: number, y: number, z = 0) => ({ X: (x - y) * 0.866, Y: (x + y) * 0.5 - z });

// Deterministic pseudo-random so the point cloud doesn't jitter between renders.
const rand = (seed: number) => {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
};

type Edge = [number, number, number, number];

function roomEdges(x: number, y: number, w: number, h: number): Edge[] {
  const c = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const edges: Edge[] = [];
  // floor outline
  for (let i = 0; i < 4; i++) {
    const a = iso(c[i][0], c[i][1]);
    const b = iso(c[(i + 1) % 4][0], c[(i + 1) % 4][1]);
    edges.push([a.X, a.Y, b.X, b.Y]);
  }
  // vertical wall edges
  for (let i = 0; i < 4; i++) {
    const a = iso(c[i][0], c[i][1]);
    const b = iso(c[i][0], c[i][1], WALL);
    edges.push([a.X, a.Y, b.X, b.Y]);
  }
  // wall top outline
  for (let i = 0; i < 4; i++) {
    const a = iso(c[i][0], c[i][1], WALL);
    const b = iso(c[(i + 1) % 4][0], c[(i + 1) % 4][1], WALL);
    edges.push([a.X, a.Y, b.X, b.Y]);
  }
  return edges;
}

// Fake LiDAR-style scan: rooms get "drawn" one after another as progress increases.
export function ScanMock({ progress, width }: Props) {
  const height = (width * VB.h) / VB.w;
  const n = ROOMS.length;

  const rooms = useMemo(
    () =>
      ROOMS.map((r, ri) => {
        const { x, y, w, h } = r.rect;
        const floor = [iso(x, y), iso(x + w, y), iso(x + w, y + h), iso(x, y + h)]
          .map((p) => `${p.X},${p.Y}`)
          .join(' ');
        const points = Array.from({ length: 26 }).map((_, i) => {
          const px = x + rand(ri * 100 + i) * w;
          const py = y + rand(ri * 100 + i + 50) * h;
          const pz = rand(ri * 100 + i + 77) < 0.35 ? rand(ri * 7 + i) * WALL : 0;
          return iso(px, py, pz);
        });
        const label = iso(x + w / 2, y + h / 2);
        return { room: r, edges: roomEdges(x, y, w, h), floor, points, label };
      }),
    [],
  );

  return (
    <Svg width={width} height={height} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
      {/* doorways appear once both neighbours are mostly scanned */}
      {progress > 0.6
        ? DOORS.map(([x1, y1, x2, y2], i) => {
            const a = iso(x1, y1);
            const b = iso(x2, y2);
            return (
              <Line key={i} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={colors.white} strokeWidth="1.5" strokeDasharray="2 3" />
            );
          })
        : null}

      {rooms.map(({ room, edges, floor, points, label }, i) => {
        const local = Math.min(1, Math.max(0, (progress - i / n) * n));
        if (local <= 0) return null;
        const scanning = local < 0.999;
        const shown = Math.max(1, Math.floor(local * edges.length));
        return (
          <G key={room.id}>
            <Polygon points={floor} fill={colors.white} fillOpacity={scanning ? 0.06 + local * 0.08 : 0.1} />
            {points.slice(0, Math.ceil(local * points.length)).map((p, j) => (
              <Circle key={j} cx={p.X} cy={p.Y} r={1.3} fill={colors.white} opacity={scanning ? 0.9 : 0.45} />
            ))}
            {edges.slice(0, shown).map(([x1, y1, x2, y2], j) => (
              <Line
                key={j}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.white}
                strokeWidth={j >= 8 ? 1 : 1.6}
                strokeOpacity={j >= 8 ? 0.55 : 1}
              />
            ))}
            {!scanning ? (
              <SvgText fontFamily={SVG_FONT} x={label.X} y={label.Y + 4} fill="rgba(255,255,255,0.8)" fontSize="12" fontWeight="600" textAnchor="middle">
                {room.name}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}

// Which room the fake scanner is currently in.
export function scanningRoomIndex(progress: number) {
  return Math.min(ROOMS.length - 1, Math.floor(progress * ROOMS.length));
}
