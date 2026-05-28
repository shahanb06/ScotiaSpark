import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'soft' | 'hero';
  heroColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'primary', heroColor, style }: CardProps) {
  return (
    <View style={[
      styles.base,
      variant === 'primary' && styles.primary,
      variant === 'soft' && styles.soft,
      variant === 'hero' && styles.hero,
      style,
    ]}>
      {variant === 'hero' && heroColor && (
        <View style={[styles.heroStrip, { backgroundColor: heroColor }]} />
      )}
      <View style={variant === 'hero' ? styles.heroContent : undefined}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.card,
    padding: spacing.xxl,
    ...shadows.card,
  },
  primary: {
    backgroundColor: colors.cardSurface,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  soft: {
    backgroundColor: colors.softCard,
    borderRadius: radii.softCard,
    ...{ shadowOpacity: 0 },
  },
  hero: {
    backgroundColor: colors.cardSurface,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  heroStrip: {
    width: 3,
    borderTopLeftRadius: radii.card,
    borderBottomLeftRadius: radii.card,
  },
  heroContent: {
    flex: 1,
    padding: spacing.xxl,
  },
});
