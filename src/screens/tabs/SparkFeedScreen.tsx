import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii, shadows } from '../../theme';
import { Card, Button, MiniChart, RiskPill, TimeHorizonPill, TypePill } from '../../components';
import { Toast } from '../../components/Toast';
import { Logo } from '../../components/Logo';
import { useDemo } from '../../store/DemoContext';
import { AskScotiaAI } from '../modals/AskScotiaAI';
import { BuySheet } from '../modals/BuySheet';
import { FEED_TICKERS, getQuotesSync, searchInstruments } from '../../lib/quotes';
import type { Quote } from '../../lib/quotes';
import * as Haptics from 'expo-haptics';

export function SparkFeedScreen({ navigation }: any) {
  const demo = useDemo();
  const [showAI, setShowAI] = useState(false);
  const [aiTicker, setAiTicker] = useState('XEQT');
  const [aiName, setAiName] = useState('iShares Core Equity ETF Portfolio');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [buyQuote, setBuyQuote] = useState<Quote | null>(null);
  const [showBuy, setShowBuy] = useState(false);

  const etfQuotes = useMemo(() => getQuotesSync(FEED_TICKERS), []);
  const searchResults = useMemo(() => searchQuery.length >= 1 ? searchInstruments(searchQuery) : [], [searchQuery]);

  const formatMoney = (n: number) => n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleBuyConfirm = (dollarAmount: number, fromAccountId: string) => {
    if (!buyQuote) return;
    const toast = demo.buyShares(buyQuote.ticker, dollarAmount, fromAccountId, {
      price: buyQuote.price,
      name: buyQuote.name,
      type: buyQuote.type as 'etf' | 'stock' | 'bond',
    });
    setShowBuy(false);
    setBuyQuote(null);
    setToastMsg(toast.message);
    setShowToast(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const completedLessons = demo.lessons.filter(l => l.completed).length;
  const nextLesson = demo.lessons.find(l => !l.completed);
  const fhsa = demo.accounts.find(a => a.type === 'FHSA');
  const goalProgress = fhsa?.goal ? (fhsa.balance / fhsa.goal) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Toast message={toastMsg} visible={showToast} onHide={() => setShowToast(false)} />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <Image source={require('../../../assets/logos/spark-logo.jpeg')} style={styles.navLogo} />
        <Text style={styles.todayTitle}>Today</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{demo.userName[0]}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ETFs, stocks, lessons..."
            placeholderTextColor={colors.mute}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
        </View>

        {/* Search Results Overlay */}
        {searchFocused && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.slice(0, 6).map(q => {
              const isUp = q.change >= 0;
              return (
                <TouchableOpacity
                  key={q.ticker}
                  style={styles.searchResultRow}
                  onPress={() => {
                    setBuyQuote(q);
                    setShowBuy(true);
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                >
                  <View style={styles.searchResultLeft}>
                    <Text style={styles.searchResultTicker}>{q.ticker}</Text>
                    <Text style={styles.searchResultName} numberOfLines={1}>{q.name}</Text>
                  </View>
                  <View style={styles.searchResultRight}>
                    <Text style={styles.searchResultPrice}>${q.price.toFixed(2)}</Text>
                    <Text style={[styles.searchResultChange, { color: isUp ? colors.sage : colors.terra }]}>
                      {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Idle Cash Detector */}
        {!demo.hasDismissedIdleCash && demo.idleCashAmount > 0 && (
          <Card variant="hero" heroColor={colors.terra} style={styles.card}>
            <Text style={styles.idleCashLabel}>IDLE CASH DETECTED</Text>
            <Text style={styles.idleCashTitle}>
              You've kept ${formatMoney(demo.idleCashAmount)} in chequing for {demo.idleCashDays} days.
            </Text>
            <Text style={styles.idleCashBody}>
              In a Scotia FHSA Essentials Portfolio, that could grow to roughly $5,300 in 5 years.
            </Text>
            <View style={styles.projectionMini}>
              <MiniChart color={colors.terra} data={[42, 43, 44, 46, 48, 47, 50, 53]} width={200} height={32} />
            </View>
            <Button
              title="See what it could become"
              onPress={() => navigation.navigate('AccountTab')}
              style={styles.idleCashCTA}
            />
          </Card>
        )}

        {/* Briefing Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's briefing</Text>
          <Text style={styles.sectionSub}>{etfQuotes.length + 3} cards · about 4 minutes</Text>
        </View>

        {/* ETF Spotlight Cards */}
        {etfQuotes.map((q, idx) => {
          const isUp = q.change >= 0;
          const isOnWatchlist = demo.watchlist.some(w => w.symbol === q.ticker);
          return (
            <Card key={q.ticker} style={styles.card}>
              <View style={styles.cardHeader}>
                <TypePill type="ETF SPOTLIGHT" color={colors.infoTeal} bgColor={colors.infoTealTint} />
              </View>
              <View style={styles.etfRow}>
                <View style={styles.etfInfo}>
                  <Text style={styles.etfSymbol}>{q.ticker}</Text>
                  <Text style={styles.etfName}>{q.name}</Text>
                  <Text style={styles.etfPrice}>
                    <Text style={styles.mono}>${q.price.toFixed(2)}</Text>
                    <Text style={[styles.etfChange, { color: isUp ? colors.sage : colors.terra }]}>
                      {' '}{isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </Text>
                  </Text>
                </View>
                <MiniChart color={isUp ? colors.sage : colors.terra} width={80} height={36} />
              </View>
              {(q as any).risk && (
                <View style={styles.pillRow}>
                  <RiskPill level={(q as any).risk} />
                  <TimeHorizonPill horizon={(q as any).horizon ?? '5+ years'} />
                </View>
              )}
              {(q as any).oneLiner && (
                <Text style={styles.oneLiner}>{(q as any).oneLiner}</Text>
              )}
              {idx === 0 && (
                <View style={styles.cohortSignal}>
                  <Text style={styles.cohortText}>Investors like you are researching {q.ticker} this week</Text>
                </View>
              )}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => {
                    setAiTicker(q.ticker);
                    setAiName(q.name);
                    setShowAI(true);
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>Ask Scotia AI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setBuyQuote(q);
                    setShowBuy(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.actionBtn, styles.buyBtn]}
                >
                  <Text style={[styles.actionText, { color: colors.sage }]}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!isOnWatchlist) {
                      demo.addToWatchlist({ symbol: q.ticker, name: q.name, price: q.price, change: q.change, changePercent: q.changePercent });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={[styles.actionText, isOnWatchlist && { color: colors.sage }]}>
                    {isOnWatchlist ? '✓ Watchlist' : '+ Watchlist'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.disclaimer}>Worth researching, not a recommendation</Text>
            </Card>
          );
        })}

        {/* Scotia Basics */}
        {nextLesson && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <TypePill type="SCOTIA BASICS" color={colors.sage} bgColor={colors.sageTint} />
            </View>
            <Text style={styles.lessonTitle}>{nextLesson.title}</Text>
            <Text style={styles.lessonDesc}>{nextLesson.description}</Text>
            <Text style={styles.lessonMeta}>60 seconds · Lesson {nextLesson.id} of 12 · advances your journey</Text>
            <Button
              title="Start lesson"
              variant="secondary"
              onPress={() => {
                const toasts = demo.completeLesson(nextLesson.id);
                if (toasts.length > 0) {
                  setToastMsg(toasts[toasts.length - 1].message);
                  setShowToast(true);
                }
              }}
              style={styles.lessonCTA}
            />
          </Card>
        )}

        {/* Cohort Signal */}
        <Card variant="soft" style={styles.card}>
          <Text style={styles.cohortLabel}>INVESTORS LIKE YOU</Text>
          <Text style={styles.cohortTitle}>
            This week, investors aged 22–28 in Toronto are researching FHSA contribution strategies.
          </Text>
        </Card>

        {/* Goal Progress */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <TypePill type="GOAL PROGRESS" color={colors.softAmber} bgColor={colors.softAmberTint} />
          </View>
          <Text style={styles.goalTitle}>
            Your First Home goal is {Math.round(goalProgress * 100)}% of the way there
          </Text>
          <View style={styles.goalBar}>
            <View style={[styles.goalBarFill, { width: `${Math.max(goalProgress * 100, 2)}%` }]} />
          </View>
          <Text style={styles.goalMeta}>
            ${formatMoney(fhsa?.balance || 0)} of ${formatMoney(fhsa?.goal || 40000)}
          </Text>
        </Card>

        {/* Advisor Nudge */}
        <Card variant="soft" style={styles.card}>
          <Text style={styles.advisorTitle}>
            Two of this week's questions are ones a Scotia advisor can answer in 15 minutes.
          </Text>
          <TouchableOpacity style={styles.advisorLink}>
            <Text style={styles.advisorLinkText}>Book a 15-min call →</Text>
          </TouchableOpacity>
        </Card>

        {/* End State */}
        <View style={styles.endState}>
          <Text style={styles.endIcon}>✉️</Text>
          <Text style={styles.endTitle}>You're caught up.</Text>
          <Text style={styles.endSub}>Come back tomorrow. Nothing to scroll past.</Text>
        </View>
      </ScrollView>

      {/* Ask Scotia AI Modal */}
      <Modal visible={showAI} animationType="slide" presentationStyle="pageSheet">
        <AskScotiaAI
          symbol={aiTicker}
          name={aiName}
          onClose={() => setShowAI(false)}
          onAddWatchlist={() => {
            demo.addToWatchlist({ symbol: aiTicker, name: aiName, price: 0, change: 0, changePercent: 0 });
          }}
          isOnWatchlist={demo.watchlist.some(w => w.symbol === aiTicker)}
        />
      </Modal>

      {/* Buy Sheet */}
      <BuySheet
        visible={showBuy}
        onClose={() => { setShowBuy(false); setBuyQuote(null); }}
        quote={buyQuote}
        accounts={demo.accounts}
        onConfirm={handleBuyConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  navLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  todayTitle: {
    ...typography.titleScreen,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  searchBar: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radii.button,
    marginBottom: spacing.xl,
  },
  searchInput: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchResults: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  searchResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  searchResultLeft: { flex: 1 },
  searchResultTicker: { fontFamily: 'RobotoMono_500Medium', fontSize: 15, color: colors.ink },
  searchResultName: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: colors.slate, marginTop: 2 },
  searchResultRight: { alignItems: 'flex-end' },
  searchResultPrice: { fontFamily: 'RobotoMono_500Medium', fontSize: 15, color: colors.ink },
  searchResultChange: { fontFamily: 'RobotoMono_400Regular', fontSize: 13 },
  card: {
    marginBottom: spacing.md,
  },
  // Idle cash
  idleCashLabel: {
    ...typography.kicker,
    color: colors.terra,
    marginBottom: spacing.sm,
  },
  idleCashTitle: {
    ...typography.titleCard,
    marginBottom: spacing.sm,
  },
  idleCashBody: {
    ...typography.body,
    color: colors.slate,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  projectionMini: {
    marginBottom: spacing.lg,
  },
  idleCashCTA: {
    marginTop: 0,
  },
  // Section
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleScreen,
  },
  sectionSub: {
    ...typography.micro,
    marginTop: 4,
  },
  // ETF
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  etfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  etfInfo: {
    flex: 1,
  },
  etfSymbol: {
    fontFamily: 'RobotoMono_500Medium',
    fontSize: 20,
    color: colors.ink,
    marginBottom: 2,
  },
  etfName: {
    fontFamily: 'LibreBaskerville_400Regular',
    fontSize: 14,
    color: colors.slate,
    marginBottom: 4,
  },
  etfPrice: {
    flexDirection: 'row',
  },
  mono: {
    fontFamily: 'RobotoMono_400Regular',
    fontSize: 16,
    color: colors.ink,
  },
  etfChange: {
    fontFamily: 'RobotoMono_400Regular',
    fontSize: 14,
  },
  oneLiner: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.slate,
    lineHeight: 19,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  cohortSignal: {
    backgroundColor: colors.warmTint,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cohortText: {
    ...typography.micro,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: 'center',
  },
  buyBtn: {
    borderColor: colors.sage,
  },
  actionText: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 13,
    color: colors.ink,
  },
  disclaimer: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 11,
    color: colors.mute,
    fontStyle: 'italic',
  },
  // Lesson
  lessonTitle: {
    ...typography.titleCard,
    marginBottom: 4,
  },
  lessonDesc: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.slate,
    marginBottom: spacing.sm,
  },
  lessonMeta: {
    ...typography.micro,
    marginBottom: spacing.md,
  },
  lessonCTA: {
    marginTop: 0,
  },
  // Cohort
  cohortLabel: {
    ...typography.kicker,
    marginBottom: spacing.sm,
  },
  cohortTitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.slate,
    fontStyle: 'italic',
  },
  // Goal
  goalTitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  goalBar: {
    height: 6,
    backgroundColor: colors.warmTint,
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: 6,
    backgroundColor: colors.sage,
    borderRadius: 3,
  },
  goalMeta: {
    ...typography.micro,
  },
  // Advisor
  advisorTitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  advisorLink: {
    alignSelf: 'flex-start',
  },
  advisorLinkText: {
    fontFamily: 'NunitoSans_500Medium',
    color: colors.scotia,
    fontSize: 14,
  },
  // End state
  endState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  endIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  endTitle: {
    ...typography.titleCard,
    marginBottom: 4,
  },
  endSub: {
    ...typography.micro,
  },
});
