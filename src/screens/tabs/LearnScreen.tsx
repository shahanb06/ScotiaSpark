import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '../../theme';
import { Card, Button, ProgressBar } from '../../components';
import { Toast } from '../../components/Toast';
import { SceneJourney } from '../../components/SceneJourney';
import { useDemo } from '../../store/DemoContext';
import { getCurrentGoal, getProgressForGoal, SCENE_REWARD_GOALS } from '../../lib/rewards';

export function LearnScreen() {
  const demo = useDemo();
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const completedCount = demo.lessons.filter(l => l.completed).length;
  const progress = completedCount / demo.lessons.length;

  const rewardState = demo.getRewardState();
  const currentGoal = getCurrentGoal(rewardState);
  const currentProgress = currentGoal ? getProgressForGoal(rewardState, currentGoal.id) / 100 : 1;

  return (
    <SafeAreaView style={styles.container}>
      <Toast message={toastMsg} visible={showToast} onHide={() => setShowToast(false)} />

      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Scene Journey */}
        <SceneJourney
          currentPoints={demo.scenePoints}
          progressPercent={currentProgress * 100}
          currentGoalTitle={currentGoal?.title ?? 'All goals complete!'}
          currentGoalSubtitle={
            currentGoal
              ? `${Math.round(currentProgress * 100)}% complete`
              : 'You\'ve unlocked all rewards'
          }
          nextRewardPoints={currentGoal?.pointsOnUnlock ?? 0}
          nextRewardSubtext={currentGoal ? `≈ $${(currentGoal.pointsOnUnlock * 0.01).toFixed(0)} value` : ''}
          lessonsComplete={completedCount}
          lessonsTotal={12}
        />

        {/* Scotia Basics Progress */}
        <Card style={styles.card}>
          <View style={styles.basicsHeader}>
            <Text style={styles.basicsTitle}>Scotia Basics</Text>
            <Text style={styles.basicsCount}>{completedCount} of 12</Text>
          </View>
          <ProgressBar progress={progress} color={colors.sage} />
          {demo.certificateEarned && (
            <View style={styles.certBadge}>
              <Text style={styles.certText}>Certificate earned</Text>
            </View>
          )}
        </Card>

        {/* Lessons */}
        <Text style={styles.sectionTitle}>
          {completedCount === 12 ? 'All lessons complete' : 'Upcoming lessons'}
        </Text>
        {demo.lessons.map(lesson => (
          <Card key={lesson.id} style={[styles.card, lesson.completed && styles.cardCompleted]}>
            <View style={styles.lessonHeader}>
              <View style={[styles.lessonPill, lesson.completed && styles.lessonPillDone]}>
                <Text style={[styles.lessonPillText, lesson.completed && styles.lessonPillTextDone]}>
                  {lesson.completed ? 'Complete' : `Lesson ${lesson.id}`}
                </Text>
              </View>
            </View>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDesc}>{lesson.description}</Text>
            {!lesson.completed && (
              <>
                <Text style={styles.lessonMeta}>60 seconds · advances your journey</Text>
                <Button
                  title="Start lesson"
                  variant="secondary"
                  onPress={() => {
                    const toasts = demo.completeLesson(lesson.id);
                    if (toasts.length > 0) {
                      setToastMsg(toasts[toasts.length - 1].message);
                    } else {
                      setToastMsg(`Lesson complete · ${lesson.title}`);
                    }
                    setShowToast(true);
                  }}
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}
          </Card>
        ))}

        {/* Watchlist */}
        <Text style={styles.sectionTitle}>Watchlist</Text>
        {demo.watchlist.length === 0 ? (
          <Card variant="soft" style={styles.card}>
            <Text style={styles.emptyText}>
              Nothing here yet. Tap "+ Watchlist" on any Spark card to start.
            </Text>
          </Card>
        ) : (
          demo.watchlist.map(item => (
            <Card key={item.symbol} style={styles.card}>
              <View style={styles.watchlistRow}>
                <View>
                  <Text style={styles.watchSymbol}>{item.symbol}</Text>
                  <Text style={styles.watchName}>{item.name}</Text>
                </View>
                <View style={styles.watchPriceBlock}>
                  <Text style={styles.watchPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={[styles.watchChange, { color: item.change >= 0 ? colors.sage : colors.terra }]}>
                    {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Glossary */}
        <TouchableOpacity style={styles.glossaryLink}>
          <Text style={styles.glossaryText}>Open glossary →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.titleHero,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  sectionTitle: {
    ...typography.titleScreen,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  // Basics progress
  basicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  basicsTitle: {
    ...typography.titleCard,
  },
  basicsCount: {
    ...typography.micro,
  },
  certBadge: {
    backgroundColor: colors.sageTint,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  certText: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 12,
    color: colors.sage,
  },
  // Lessons
  lessonHeader: {
    marginBottom: spacing.sm,
  },
  lessonPill: {
    backgroundColor: colors.warmTint,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  lessonPillDone: {
    backgroundColor: colors.sageTint,
  },
  lessonPillText: {
    fontFamily: 'NunitoSans_500Medium',
    fontSize: 12,
    color: colors.slate,
  },
  lessonPillTextDone: {
    color: colors.sage,
  },
  lessonTitle: {
    ...typography.titleCard,
    marginBottom: 4,
  },
  lessonDesc: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.slate,
    lineHeight: 22,
  },
  lessonMeta: {
    ...typography.micro,
    marginTop: spacing.sm,
  },
  // Watchlist
  emptyText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.slate,
    fontStyle: 'italic',
  },
  watchlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchSymbol: {
    fontFamily: 'RobotoMono_500Medium',
    fontSize: 18,
    color: colors.ink,
  },
  watchName: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.slate,
  },
  watchPriceBlock: {
    alignItems: 'flex-end',
  },
  watchPrice: {
    fontFamily: 'RobotoMono_400Regular',
    fontSize: 16,
    color: colors.ink,
  },
  watchChange: {
    fontFamily: 'RobotoMono_400Regular',
    fontSize: 13,
  },
  glossaryLink: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  glossaryText: {
    fontFamily: 'NunitoSans_500Medium',
    color: colors.slate,
    fontSize: 14,
  },
});
