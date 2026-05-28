import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, typography } from '../theme';

interface RiskPillProps {
  level: 'lower' | 'medium' | 'higher';
}

export function RiskPill({ level }: RiskPillProps) {
  const colorMap = {
    lower: colors.sage,
    medium: colors.softAmber,
    higher: colors.terracotta,
  };
  const bgMap = {
    lower: colors.sageTint,
    medium: colors.softAmberTint,
    higher: colors.terracottaTint,
  };

  return (
    <View style={[styles.pill, { backgroundColor: bgMap[level] }]}>
      <Text style={[styles.text, { color: colorMap[level] }]}>
        {level.charAt(0).toUpperCase() + level.slice(1)} risk
      </Text>
    </View>
  );
}

interface TimeHorizonPillProps {
  horizon: string;
}

export function TimeHorizonPill({ horizon }: TimeHorizonPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: colors.infoTealTint }]}>
      <Text style={[styles.text, { color: colors.infoTeal }]}>{horizon}</Text>
    </View>
  );
}

interface TypePillProps {
  type: string;
  color?: string;
  bgColor?: string;
}

export function TypePill({ type, color = colors.secondaryText, bgColor = colors.softCard }: TypePillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    fontFamily: 'FrutigerMedium',
    fontSize: 12,
    lineHeight: 16,
  },
});
