import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export interface RingSegment {
  value: number;
  color: string;
}

interface DonutRingProps {
  segments: RingSegment[];
  /** Color of the empty ring behind the segments */
  trackColor: string;
  size?: number;
  strokeWidth?: number;
  /** Visible space between two segments, in px */
  gap?: number;
  /** Shown in the middle of the ring */
  children?: ReactNode;
}

/**
 * Thin ring chart with rounded segment ends, drawn clockwise from the top.
 * Used by Engagement Ratio and Activity Insights so both charts look the same.
 */
export function DonutRing({ segments, trackColor, size = 150, strokeWidth = 14, gap = 7, children }: DonutRingProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const parts = segments.filter((s) => s.value > 0);
  const total = parts.reduce((sum, s) => sum + s.value, 0);
  const split = parts.length > 1;
  // Round caps reach half a stroke past each end, so leave room for them
  const cut = split ? gap + strokeWidth : 0;

  // A slice shorter than the caps would draw as a lone dot; give it a short visible arc,
  // taken from the slices that can spare it
  const minLength = split ? cut + strokeWidth / 2 : 0;
  const raw = parts.map((s) => (s.value / total) * circumference);
  const needed = raw.reduce((sum, l) => sum + Math.max(minLength - l, 0), 0);
  const spare = raw.reduce((sum, l) => sum + Math.max(l - minLength, 0), 0);
  const lengths =
    needed > 0 && spare > needed
      ? raw.map((l) => (l < minLength ? minLength : l - (l - minLength) * (needed / spare)))
      : raw;

  let start = 0;
  const arcs = parts.map((s, i) => {
    const length = lengths[i];
    const arc = (
      <Circle
        key={i}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeLinecap={split ? 'round' : 'butt'}
        strokeDasharray={`${Math.max(length - cut, 0.1)} ${circumference}`}
        strokeDashoffset={-(start + cut / 2)}
        transform={`rotate(-90 ${center} ${center})`}
      />
    );
    start += length;
    return arc;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {arcs}
      </Svg>
      <View className="absolute inset-0 items-center justify-center">{children}</View>
    </View>
  );
}
