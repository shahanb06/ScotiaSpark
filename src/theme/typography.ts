import type { TextStyle } from 'react-native';

const ui = 'Frutiger';
const uiMedium = 'FrutigerMedium';
const uiBold = 'FrutigerBold';
const editorial = 'ITCCentury';
const tabularNums: TextStyle['fontVariant'] = ['tabular-nums'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  card: 18,
  softCard: 14,
  button: 12,
  pill: 999,
  sheet: 28,
  bottomSheet: 28,
};

export const typography = {
  titleHero: { fontFamily: editorial, fontSize: 28, lineHeight: 34, color: '#333333' },
  titleScreen: { fontFamily: editorial, fontSize: 22, lineHeight: 28, color: '#333333' },
  titleCard: { fontFamily: editorial, fontSize: 18, lineHeight: 24, color: '#333333' },
  h1: { fontFamily: editorial, fontSize: 32, lineHeight: 40, color: '#333333' },
  h2: { fontFamily: editorial, fontSize: 22, lineHeight: 30, color: '#333333' },
  callout: { fontFamily: editorial, fontSize: 15, lineHeight: 22, color: '#333333' },

  h3: { fontFamily: uiBold, fontSize: 18, lineHeight: 24, color: '#333333' },
  body: { fontFamily: ui, fontSize: 15, lineHeight: 22, color: '#333333' },
  bodyMedium: { fontFamily: uiMedium, fontSize: 15, lineHeight: 22, color: '#333333' },
  bodyEmphasis: { fontFamily: uiBold, fontSize: 15, lineHeight: 22, color: '#333333' },
  bodySlate: { fontFamily: ui, fontSize: 13, lineHeight: 18, color: '#6B7280' },
  smallBody: { fontFamily: ui, fontSize: 14, lineHeight: 20, color: '#6B7280' },
  micro: { fontFamily: ui, fontSize: 12, lineHeight: 16, color: '#6B7280' },
  metadata: { fontFamily: uiMedium, fontSize: 13, lineHeight: 18, color: '#6B7280' },
  kicker: { fontFamily: uiBold, fontSize: 11, lineHeight: 14, letterSpacing: 0, color: '#6B7280', textTransform: 'uppercase' as const },
  label: { fontFamily: uiBold, fontSize: 11, lineHeight: 15, letterSpacing: 0, textTransform: 'uppercase' as const, color: '#6B7280' },
  button: { fontFamily: uiBold, fontSize: 15, lineHeight: 20 },
  tabLabel: { fontFamily: uiMedium, fontSize: 11, lineHeight: 14 },

  monoHero: { fontFamily: uiBold, fontSize: 34, lineHeight: 40, color: '#333333', fontVariant: tabularNums },
  monoLarge: { fontFamily: uiBold, fontSize: 24, lineHeight: 30, color: '#333333', fontVariant: tabularNums },
  monoMedium: { fontFamily: uiMedium, fontSize: 15, lineHeight: 20, color: '#333333', fontVariant: tabularNums },
  monoSmall: { fontFamily: uiMedium, fontSize: 12, lineHeight: 16, color: '#6B7280', fontVariant: tabularNums },

  numberHero: { fontFamily: uiBold, fontSize: 36, lineHeight: 44, color: '#333333', fontVariant: tabularNums },
  numberBody: { fontFamily: uiMedium, fontSize: 16, lineHeight: 24, color: '#333333', fontVariant: tabularNums },
  numberLarge: { fontFamily: uiBold, fontSize: 34, lineHeight: 42, color: '#333333', fontVariant: tabularNums },
};
