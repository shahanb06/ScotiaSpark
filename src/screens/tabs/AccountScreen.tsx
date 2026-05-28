import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing, typography } from '../../theme';
import { Button, MiniChart, ProgressBar } from '../../components';
import { Toast } from '../../components/Toast';
import { BottomSheet } from '../../components/BottomSheet';
import { DepositSheet } from '../modals/DepositSheet';
import { WithdrawSheet } from '../modals/WithdrawSheet';
import { useDemo } from '../../store/DemoContext';

const allocationDots = [colors.scotiaRed, colors.ink, colors.secondaryText];

function ScotiaMark() {
  return (
    <View style={styles.logoMark}>
      <Text style={styles.logoText}>S</Text>
    </View>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <TouchableOpacity activeOpacity={0.72} style={styles.iconButton}>
      {children}
    </TouchableOpacity>
  );
}

export function AccountScreen() {
  const demo = useDemo();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const intro = useRef(new Animated.Value(0)).current;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [intro]);

  const formatMoney = (n: number) =>
    n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const investableAccounts = demo.accounts.filter(a => a.type !== 'Chequing' && a.type !== 'Savings');
  const chartWidth = Math.min(300, Math.max(220, width - 92));

  const handleMoveIdleCash = () => {
    setShowConfirm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const toasts = demo.moveIdleCash();
    setToastMsg(toasts.length > 0 ? toasts[toasts.length - 1].message : 'Idle cash moved to FHSA');
    setShowToast(true);
  };

  const handleSetupRecurring = () => {
    const toasts = demo.setupRecurring(50, 'Biweekly');
    setToastMsg(toasts.length > 0 ? toasts[toasts.length - 1].message : 'Recurring contributions set up');
    setShowToast(true);
  };

  const animatedStyle = {
    opacity: intro,
    transform: [
      {
        translateY: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Toast message={toastMsg} visible={showToast} onHide={() => setShowToast(false)} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerTop}>
            <ScotiaMark />
            <View style={styles.headerActions}>
              <IconButton>
                <Search color={colors.white} size={21} strokeWidth={2} />
              </IconButton>
              <IconButton>
                <Bell color={colors.white} size={21} strokeWidth={2} />
              </IconButton>
            </View>
          </View>
          <Text style={styles.greeting}>Good afternoon, Alex</Text>
          <Text style={styles.headerSub}>Your investments are growing steadily.</Text>
        </View>

        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.kicker}>Total Investable</Text>
                <Text selectable style={styles.heroBalance}>${formatMoney(demo.totalInvestable)}</Text>
                <Text style={styles.summarySub}>Across {investableAccounts.length} Scotia accounts</Text>
              </View>
              <View style={styles.cdicBadge}>
                <ShieldCheck color={colors.scotiaRed} size={15} strokeWidth={2.2} />
                <Text style={styles.cdicText}>CDIC protected</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryMetricRow}>
              <View style={styles.metricPill}>
                <TrendingUp color={colors.scotiaRed} size={16} strokeWidth={2.2} />
                <Text style={styles.metricText}>+2.4% this month</Text>
              </View>
              <TouchableOpacity activeOpacity={0.72} style={styles.inlineAction} onPress={() => setShowDeposit(true)}>
                <Text style={styles.inlineActionText}>Deposit</Text>
                <ChevronRight color={colors.scotiaRed} size={16} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Investment accounts</Text>
            <TouchableOpacity activeOpacity={0.72} onPress={() => setShowWithdraw(true)}>
              <Text style={styles.sectionAction}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {investableAccounts.map(acct => {
            const progress = acct.goal ? acct.balance / acct.goal : 0;
            const displayType = acct.type === 'Non-registered' ? 'Personal Investing' : acct.type;
            return (
              <TouchableOpacity key={acct.id} activeOpacity={0.88} style={styles.accountCard}>
                <View style={styles.accountTop}>
                  <View style={styles.accountPill}>
                    <Text style={styles.accountPillText}>{displayType}</Text>
                  </View>
                  <ArrowUpRight color={colors.secondaryText} size={18} strokeWidth={2} />
                </View>
                <Text style={styles.accountName}>{acct.name}</Text>
                <Text selectable style={styles.accountBalance}>${formatMoney(acct.balance)}</Text>
                {acct.goal && (
                  <View style={styles.goalBlock}>
                    <View style={styles.goalMeta}>
                      <Text style={styles.goalText}>{Math.round(progress * 100)}% of goal</Text>
                      <Text selectable style={styles.goalText}>${formatMoney(acct.goal)}</Text>
                    </View>
                    <ProgressBar progress={progress} color={colors.scotiaRed} backgroundColor={colors.divider} height={7} />
                  </View>
                )}
                <View style={styles.allocationRow}>
                  {acct.allocation.map((item, index) => (
                    <View key={item} style={styles.allocationItem}>
                      <View style={[styles.dot, { backgroundColor: allocationDots[index] ?? colors.secondaryText }]} />
                      <Text style={styles.allocationText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}

          {!demo.hasDismissedIdleCash && demo.idleCashAmount > 0 && (
            <View style={styles.insightCard}>
              <View style={styles.cardIcon}>
                <Sparkles color={colors.scotiaRed} size={18} strokeWidth={2.2} />
              </View>
              <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>${formatMoney(demo.idleCashAmount)} has been sitting idle in chequing for {demo.idleCashDays} days.</Text>
                <Text style={styles.insightBody}>Move unused cash toward your first home goal while keeping your banking view connected.</Text>
              </View>
              <Button title="Move it forward" onPress={() => setShowConfirm(true)} style={styles.fullButton} />
            </View>
          )}

          <View style={styles.educationCard}>
            <View style={styles.educationHeader}>
              <View>
                <Text style={styles.editorialTitle}>Compounding Time Machine</Text>
                <Text style={styles.educationBody}>What could your investments become in 5, 10, or 20 years?</Text>
              </View>
              <View style={styles.cardIcon}>
                <Clock3 color={colors.scotiaRed} size={18} strokeWidth={2.2} />
              </View>
            </View>
            <View style={styles.chartFrame}>
              <MiniChart
                color={colors.scotiaRed}
                data={[10, 12, 15, 19, 24, 30, 38, 47, 58, 72, 88, 107]}
                width={chartWidth}
                height={74}
              />
            </View>
            <Pressable style={styles.textLink}>
              <Text style={styles.textLinkText}>Explore projections</Text>
              <ChevronRight color={colors.scotiaRed} size={16} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.recurringCard}>
            <View style={styles.recurringHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recurring contributions</Text>
                <Text style={styles.recurringText}>
                  {demo.recurringEnabled
                    ? `$${demo.recurringAmount} ${demo.recurringFrequency} to FHSA`
                    : 'No recurring contributions set up yet.'}
                </Text>
              </View>
              {demo.recurringEnabled && <CheckCircle2 color={colors.scotiaRed} size={22} strokeWidth={2.2} />}
            </View>
            {!demo.recurringEnabled && (
              <Button title="Set up recurring" variant="secondary" onPress={handleSetupRecurring} style={styles.fullButton} />
            )}
          </View>

          <View style={styles.paychequeCard}>
            <Text style={styles.kicker}>Paycheque investing</Text>
            <Text style={styles.paychequeTitle}>Your paycheque landed 2 days ago.</Text>
            <Text style={styles.paychequeBody}>Send $50 to your FHSA?</Text>
            <View style={styles.paychequeActions}>
              <Button
                title="Send $50"
                onPress={() => {
                  demo.deposit(50, 'fhsa');
                  setToastMsg('$50 sent to FHSA');
                  setShowToast(true);
                }}
                style={styles.paychequePrimary}
              />
              <Button title="Not now" variant="tertiary" onPress={() => {}} style={styles.paychequeSecondary} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <BottomSheet visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <Text style={styles.confirmTitle}>Move ${formatMoney(demo.idleCashAmount)} forward?</Text>
        <Text style={styles.confirmBody}>
          This will move idle cash from chequing into your Scotia First Home Savings Account.
        </Text>
        <Button title={`Move $${formatMoney(demo.idleCashAmount)} to FHSA`} onPress={handleMoveIdleCash} style={{ marginBottom: spacing.md }} />
        <Button title="Not yet" variant="tertiary" onPress={() => setShowConfirm(false)} />
      </BottomSheet>

      <DepositSheet
        visible={showDeposit}
        onClose={() => setShowDeposit(false)}
        accounts={demo.accounts}
        onConfirm={(amount, toId) => {
          const toast = demo.deposit(amount, toId);
          setShowDeposit(false);
          setToastMsg(toast.message);
          setShowToast(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />

      <WithdrawSheet
        visible={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        accounts={demo.accounts}
        onConfirm={(amount, fromId) => {
          const toast = demo.withdraw(amount, fromId);
          setShowWithdraw(false);
          setToastMsg(toast.message);
          setShowToast(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    ...(Platform.OS === 'web' ? { alignSelf: 'center', maxWidth: 430, width: '100%' } : null),
  },
  scrollContent: {
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.scotiaRed,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 86,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  logoText: {
    color: colors.scotiaRed,
    fontFamily: 'FrutigerBold',
    fontSize: 24,
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  greeting: {
    color: colors.white,
    fontFamily: 'FrutigerBold',
    fontSize: 25,
    lineHeight: 31,
  },
  headerSub: {
    color: colors.white,
    fontFamily: 'Frutiger',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: -62,
    padding: spacing.xxl,
    boxShadow: '0 10px 28px rgba(51, 51, 51, 0.12)',
  },
  summaryTop: {
    gap: spacing.md,
  },
  kicker: {
    ...typography.kicker,
    marginBottom: spacing.xs,
  },
  heroBalance: {
    ...typography.numberHero,
    fontSize: 38,
    lineHeight: 46,
  },
  summarySub: {
    ...typography.metadata,
    marginTop: spacing.xs,
  },
  cdicBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.lightGrey,
    borderColor: colors.divider,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  cdicText: {
    color: colors.ink,
    fontFamily: 'FrutigerMedium',
    fontSize: 12,
    lineHeight: 16,
  },
  summaryDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.lg,
  },
  summaryMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricText: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 14,
    lineHeight: 20,
  },
  inlineAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    minHeight: 40,
  },
  inlineActionText: {
    color: colors.scotiaRed,
    fontFamily: 'FrutigerBold',
    fontSize: 14,
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 18,
    lineHeight: 24,
  },
  sectionAction: {
    color: colors.scotiaRed,
    fontFamily: 'FrutigerBold',
    fontSize: 14,
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
    boxShadow: '0 6px 18px rgba(51, 51, 51, 0.07)',
  },
  accountTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountPill: {
    backgroundColor: colors.lightGrey,
    borderColor: colors.divider,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  accountPillText: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 12,
    lineHeight: 16,
  },
  accountName: {
    color: colors.ink,
    fontFamily: 'FrutigerMedium',
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  accountBalance: {
    ...typography.monoLarge,
    fontSize: 27,
    lineHeight: 34,
  },
  goalBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalText: {
    ...typography.micro,
  },
  allocationRow: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  allocationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  allocationText: {
    ...typography.micro,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
    boxShadow: '0 6px 18px rgba(51, 51, 51, 0.07)',
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderColor: colors.divider,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  insightCopy: {
    gap: spacing.sm,
  },
  insightTitle: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 18,
    lineHeight: 24,
  },
  insightBody: {
    ...typography.smallBody,
  },
  fullButton: {
    alignSelf: 'stretch',
    minHeight: 48,
  },
  educationCard: {
    backgroundColor: colors.lightGrey,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  educationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  editorialTitle: {
    ...typography.titleCard,
    color: colors.ink,
  },
  educationBody: {
    ...typography.smallBody,
    marginTop: spacing.xs,
    maxWidth: 242,
  },
  chartFrame: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  textLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 2,
    minHeight: 36,
  },
  textLinkText: {
    color: colors.scotiaRed,
    fontFamily: 'FrutigerBold',
    fontSize: 14,
    lineHeight: 20,
  },
  recurringCard: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
    boxShadow: '0 6px 18px rgba(51, 51, 51, 0.06)',
  },
  recurringHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recurringText: {
    ...typography.bodySlate,
    marginTop: spacing.xs,
  },
  paychequeCard: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.xl,
    boxShadow: '0 8px 22px rgba(51, 51, 51, 0.08)',
  },
  paychequeTitle: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 20,
    lineHeight: 26,
  },
  paychequeBody: {
    ...typography.bodySlate,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  paychequeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  paychequePrimary: {
    flex: 1,
    minHeight: 48,
  },
  paychequeSecondary: {
    flex: 1,
    minHeight: 48,
  },
  confirmTitle: {
    color: colors.ink,
    fontFamily: 'FrutigerBold',
    fontSize: 22,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  confirmBody: {
    ...typography.body,
    color: colors.secondaryText,
    marginBottom: spacing.xxl,
  },
});
