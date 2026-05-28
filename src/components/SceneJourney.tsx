import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { colors, typography, spacing, radii } from '../theme';
import { ProgressBar } from './Charts';

type Props = {
  currentPoints: number;
  progressPercent: number;
  currentGoalTitle: string;
  currentGoalSubtitle: string;
  nextRewardPoints: number;
  nextRewardSubtext: string;
  lessonsComplete: number;
  lessonsTotal: number;
  earnedTodayText?: string;
};

// Evaluate cubic Bezier at t for two segments
function getPointOnPath(t: number): { x: number; y: number } {
  // Smooth S-curve from bottom-left to top-right
  // Path: M 30 150 C 30 100, 80 80, 140 90 C 200 100, 250 60, 250 30
  // Segment 1 (t 0..0.5): P0(30,150) P1(30,100) P2(80,80) P3(140,90)
  // Segment 2 (t 0.5..1): P0(140,90) P1(200,100) P2(250,60) P3(250,30)
  let st: number;
  let p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number];
  if (t <= 0.5) {
    st = t * 2;
    p0 = [30, 150]; p1 = [30, 100]; p2 = [80, 80]; p3 = [140, 90];
  } else {
    st = (t - 0.5) * 2;
    p0 = [140, 90]; p1 = [200, 100]; p2 = [250, 60]; p3 = [250, 30];
  }
  const u = 1 - st;
  const x = u*u*u*p0[0] + 3*u*u*st*p1[0] + 3*u*st*st*p2[0] + st*st*st*p3[0];
  const y = u*u*u*p0[1] + 3*u*u*st*p1[1] + 3*u*st*st*p2[1] + st*st*st*p3[1];
  return { x, y };
}

export function SceneJourney({
  currentPoints,
  progressPercent,
  currentGoalTitle,
  currentGoalSubtitle,
  nextRewardPoints,
  nextRewardSubtext,
  lessonsComplete,
  lessonsTotal,
  earnedTodayText,
}: Props) {
  const animProgress = useRef(new Animated.Value(0)).current;
  const [markerPos, setMarkerPos] = useState(getPointOnPath(0));
  const flagScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetT = Math.min(progressPercent / 100, 1);
    animProgress.addListener(({ value }) => {
      setMarkerPos(getPointOnPath(value));
    });
    Animated.timing(animProgress, {
      toValue: targetT,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      if (progressPercent >= 100) {
        Animated.sequence([
          Animated.timing(flagScale, { toValue: 1.1, duration: 300, useNativeDriver: false }),
          Animated.timing(flagScale, { toValue: 1.0, duration: 300, useNativeDriver: false }),
        ]).start();
      }
    });
    return () => animProgress.removeAllListeners();
  }, [progressPercent]);

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>SCENE+ × SCOTIA SPARK</Text>
      <Text style={styles.youHave}>You have</Text>
      <Text style={styles.points}>{currentPoints.toLocaleString()} PTS</Text>

      <View style={styles.svgWrap}>
        <Svg viewBox="0 0 280 180" width="100%" height={180}>
          <Path
            d="M 30 150 C 30 100, 80 80, 140 90 C 200 100, 250 60, 250 30"
            stroke={colors.divider}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 30 150 C 30 100, 80 80, 140 90 C 200 100, 250 60, 250 30"
            stroke={colors.scotiaRed}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          {/* Waypoint 1 — quarter mark */}
          <Circle cx={70} cy={98} r={5} fill={colors.sage} />
          <Circle cx={70} cy={98} r={8} fill="none" stroke={colors.warmTint} strokeWidth={1.5} />
          {/* Waypoint 2 — halfway mark */}
          <Circle cx={140} cy={90} r={5} fill={colors.sage} />
          <Circle cx={140} cy={90} r={8} fill="none" stroke={colors.warmTint} strokeWidth={1.5} />
          {/* Waypoint 3 — three-quarter mark */}
          <Circle cx={210} cy={78} r={5} fill={colors.sage} />
          <Circle cx={210} cy={78} r={8} fill="none" stroke={colors.warmTint} strokeWidth={1.5} />
          {/* You marker */}
          <G>
            <Circle cx={markerPos.x} cy={markerPos.y} r={7} fill={colors.terra} />
            <Circle cx={markerPos.x} cy={markerPos.y} r={11} fill="none" stroke={colors.terra} strokeOpacity={0.3} strokeWidth={1.5} />
          </G>
          {/* Destination flag */}
          <G transform="translate(250, 20)">
            <Path
              d="M -6 -10 L -6 6 M -6 -10 L 6 -7 L 0 -4 L 6 -1 L -6 2"
              stroke={colors.terra}
              strokeWidth={1.5}
              fill={colors.terraTint}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
          <SvgText x={232} y={10} fontSize={9} fontFamily="FrutigerMedium" fill={colors.terra}>
            {nextRewardPoints} PTS
          </SvgText>
        </Svg>
      </View>

      <View style={styles.divider} />

      <Text style={styles.workingLabel}>Working toward:</Text>
      <Text style={styles.goalTitle}>{currentGoalTitle}</Text>
      <View style={styles.progressRow}>
        <ProgressBar progress={lessonsComplete / lessonsTotal} color={colors.sage} height={8} />
      </View>
      <Text style={styles.progressText}>{currentGoalSubtitle}</Text>
      <Text style={styles.unlockText}>Unlocks: {nextRewardPoints} Scene+ ({nextRewardSubtext})</Text>
      {earnedTodayText && <Text style={styles.earnedToday}>{earnedTodayText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  kicker: {
    fontFamily: 'FrutigerMedium',
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.slate,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  youHave: {
    fontFamily: 'Frutiger',
    fontSize: 13,
    color: colors.slate,
    marginBottom: 2,
  },
  points: {
    fontFamily: 'FrutigerBold',
    fontSize: 32,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  svgWrap: {
    marginHorizontal: -spacing.sm,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  workingLabel: {
    fontFamily: 'Frutiger',
    fontSize: 13,
    color: colors.slate,
    marginBottom: 4,
  },
  goalTitle: {
    fontFamily: 'ITCCentury',
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  progressRow: {
    marginBottom: spacing.sm,
  },
  progressText: {
    fontFamily: 'FrutigerMedium',
    fontSize: 12,
    color: colors.slate,
    marginBottom: 4,
  },
  unlockText: {
    fontFamily: 'FrutigerMedium',
    fontSize: 12,
    color: colors.slate,
  },
  earnedToday: {
    fontFamily: 'Frutiger',
    fontSize: 13,
    color: colors.slate,
    marginTop: spacing.sm,
  },
});
