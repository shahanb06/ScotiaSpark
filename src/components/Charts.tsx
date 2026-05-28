import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import Svg, { Line, Path } from 'react-native-svg';

interface MiniChartProps {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function MiniChart({ 
  data = [40, 42, 38, 45, 48, 44, 50, 52, 49, 55, 58, 54, 60, 62, 58, 65, 68, 64, 70, 72],
  color = colors.scotiaRed,
  width = 120,
  height = 40,
}: MiniChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * (height * 0.8) - height * 0.1,
  }));

  // Create smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    pathD += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
  }

  return (
    <Svg width={width} height={height}>
      <Line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke={colors.divider} strokeWidth={1} />
      <Line x1="0" y1={Math.round(height * 0.52)} x2={width} y2={Math.round(height * 0.52)} stroke={colors.divider} strokeWidth={1} />
      <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.scotiaRed, backgroundColor = colors.divider, height = 6 }: ProgressBarProps) {
  return (
    <View style={[styles.progressBg, { backgroundColor, height, borderRadius: height / 2 }]}>
      <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.min(progress * 100, 100)}%`, height, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressBg: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
