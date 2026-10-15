import React from 'react';
import Svg, { Circle, G, Line, Pattern, Rect, Text as SvgText, Defs } from 'react-native-svg';
import { DOORS, ROOMS, RoomId } from '../data/mock';
import { colors, SVG_FONT } from '../theme';

type Props = {
  width: number;
  highlight?: RoomId | null;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
};

const VB_W = 350;
const VB_H = 290;

// Top-down wireframe floor plan of the mock apartment.
export function FloorPlan({ width, highlight, color = colors.white, showGrid = true, showLabels = true }: Props) {
  const height = (width * VB_H) / VB_W;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <Pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <Line x1="0" y1="0" x2="14" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <Line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </Pattern>
      </Defs>
      {showGrid ? <Rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#grid)" /> : null}

      {DOORS.map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeDasharray="2 3" />
      ))}

      {ROOMS.map((r) => {
        const hot = highlight === r.id;
        const { x, y, w, h } = r.rect;
        return (
          <G key={r.id}>
            <Rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="6"
              fill={hot ? color : 'rgba(255,255,255,0.05)'}
              fillOpacity={hot ? 0.22 : 1}
              stroke={color}
              strokeWidth={hot ? 2.2 : 1.2}
              strokeOpacity={hot ? 1 : 0.8}
            />
            {/* corner nodes */}
            {[
              [x, y],
              [x + w, y],
              [x, y + h],
              [x + w, y + h],
            ].map(([cx, cy], j) => (
              <Circle key={j} cx={cx} cy={cy} r="2.2" fill={color} />
            ))}
            {showLabels ? (
              <SvgText
                fontFamily={SVG_FONT}
                x={x + w / 2}
                y={y + h / 2 + 4}
                fill={hot ? colors.white : 'rgba(255,255,255,0.75)'}
                fontSize={r.id === 'hall' ? 10 : 11}
                fontWeight="600"
                textAnchor="middle"
              >
                {r.name}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}
