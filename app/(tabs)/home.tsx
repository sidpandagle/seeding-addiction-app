import { View, Text, Pressable, Modal, ScrollView, InteractionManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef, memo, useMemo, useCallback, type ReactNode } from 'react';
import Reanimated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useActivityStore } from '../../src/stores/activityStore';
import { useColorScheme } from '../../src/stores/themeStore';
import { useAchievementStore } from '../../src/stores/achievementStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { useToastStore } from '../../src/stores/toastStore';
import RelapseModal from '../../src/components/modals/RelapseModal';
import ActivityModal from '../../src/components/modals/ActivityModal';
import EmergencyHelpModal from '../../src/components/modals/EmergencyHelpModal';
import { JourneyTimerCard } from '../../src/components/home/JourneyTimerCard';
import { QuickActions } from '../../src/components/home/QuickActions';
import { StoicWisdomCard } from '../../src/components/home/StoicWisdomCard';
import AchievementCelebration from '../../src/components/achievements/AchievementCelebration';
import { getNewlyUnlockedAchievements, getGrowthStage, GROWTH_STAGES, Achievement } from '../../src/utils/growthStages';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import { computeStreaks, longestPastStreakMs } from '../../src/utils/streaks';
import { MS_PER_DAY } from '../../src/constants/timeUnits';
// Icon options for Log Activity (current: Sprout)
// Available alternatives: Heart, HeartHandshake, Zap, Award, Trophy, CheckCircle, Star, SmilePlus
import { Sprout, AlertCircle, RotateCcw, TrendingUp, Sparkles, CalendarCheck } from 'lucide-react-native';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { useJourneyStartLoader } from '../../src/hooks/useJourneyStartLoader';
import { useLocalDay } from '../../src/hooks/useClock';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import { useThemeColors, useCardShadow } from '../../src/hooks/useThemeColors';
import { mixHex } from '../../src/constants/palette';

// Milestones under a day get a toast; a day and up get the full celebration
const SMALL_MILESTONE_MS = MS_PER_DAY;
// RN can't present a second page sheet while the first is still closing
const MODAL_HANDOFF_DELAY_MS = 400;

interface StatTileProps {
  label: string;
  value: number;
  unit?: string;
  /** Stat color: tints the tile background and colors the value */
  color: string;
  valueClass: string;
  unitClass?: string;
  /** Lucide icon or stage emoji, shown faintly in the bottom-right corner */
  watermark: ReactNode;
  chip?: string;
}

function StatTile({ label, value, unit, color, valueClass, unitClass, watermark, chip }: StatTileProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const cardShadow = useCardShadow();
  const backgroundColor = mixHex(color, colorScheme === 'dark' ? 10 : 7, colors.surface);

  return (
    // Shadow on the outer view: iOS clips shadows on overflow-hidden views
    <View style={[cardShadow, { backgroundColor }]} className="flex-1 rounded-2xl">
      <View
        style={{ backgroundColor }}
        className="relative grow overflow-hidden border border-border rounded-2xl"
      >
        <View className="p-4">
          <Text className="mb-2 text-xs font-medium tracking-wide uppercase text-muted">
            {label}
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-3xl font-bold ${valueClass}`}>{value}</Text>
            {unit && <Text className={`text-sm font-medium ${unitClass}`}>{unit}</Text>}
          </View>
          {chip && (
            <Text className="mt-1 text-xs font-bold tracking-wide uppercase text-primary-ink">
              {chip}
            </Text>
          )}
        </View>
        {/* Background icon or emoji */}
        <View className="absolute bottom-[-8px] right-[-8px] opacity-15 dark:opacity-10">{watermark}</View>
      </View>
    </View>
  );
}

function StageWatermark({ ms }: { ms: number }) {
  return <Text style={{ fontSize: 56, lineHeight: 66 }}>{getGrowthStage(ms).emoji}</Text>;
}

function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const reducedMotion = useReducedMotion();

  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [preSelectedCategories, setPreSelectedCategories] = useState<string[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const relapses = useRelapseStore((state) => state.relapses);
  const { journeyStart: journeyStartTime } = useJourneyStartLoader();
  const activities = useActivityStore((state) => state.activities);
  const loadActivities = useActivityStore((state) => state.loadActivities);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const showToast = useToastStore((state) => state.showToast);

  // Achievement tracking store
  const lastCheckedElapsedTime = useAchievementStore((state) => state.lastCheckedElapsedTime);
  const setLastCheckedElapsedTime = useAchievementStore((state) => state.setLastCheckedElapsedTime);
  const achievementStoreHydrated = useAchievementStore((state) => state._hasHydrated);

  // Notification store for milestone scheduling - use specific selectors to prevent unnecessary re-renders
  const notificationsEnabled = useNotificationStore((state) => state.isEnabled);
  const milestoneNotificationsEnabled = useNotificationStore((state) => state.milestoneNotificationsEnabled);
  const scheduleUpcomingMilestones = useNotificationStore((state) => state.scheduleUpcomingMilestones);

  // Re-renders only when the latest relapse changes or a new growth stage is reached
  const stats = useJourneyStats();
  // Changes at midnight, so "Days kept" and day counts stay current
  const today = useLocalDay();

  // Remember the stage on screen at mount; the header emoji only pops when it changes after that
  const initialStageIdRef = useRef(stats.growthStage.id);

  // Defer activity loading until after screen is fully rendered (performance optimization)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadActivities();
    });

    return () => task.cancel();
  }, [relapses, loadActivities]);

  // Schedule milestone notifications when journey data is available
  useEffect(() => {
    if (!journeyStartTime || !notificationsEnabled || !milestoneNotificationsEnabled) return;

    const task = InteractionManager.runAfterInteractions(() => {
      // Relapses are kept newest first
      const lastRelapseTime = relapses.length > 0
        ? new Date(relapses[0].timestamp).getTime()
        : null;

      scheduleUpcomingMilestones(
        new Date(journeyStartTime).getTime(),
        lastRelapseTime
      );
    });

    return () => task.cancel();
  }, [journeyStartTime, relapses, notificationsEnabled, milestoneNotificationsEnabled, scheduleUpcomingMilestones]);

  // Small milestones become a toast; bigger ones queue the full celebration
  const celebrate = useCallback((unlocked: Achievement[]) => {
    const small = unlocked.filter((a) => a.threshold < SMALL_MILESTONE_MS);
    const big = unlocked.filter((a) => a.threshold >= SMALL_MILESTONE_MS);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (small.length > 0 && big.length === 0) {
      const latest = small[small.length - 1];
      showToast(`${latest.emoji} ${latest.title} reached`);
    }

    if (big.length > 0) {
      setPendingAchievements((prev) => [...prev, ...big]);
      setCelebrationAchievement((current) => current ?? big[0]);
    }
  }, [showToast]);

  // Check for missed achievements on app open (runs once after hydration, and after each relapse)
  useEffect(() => {
    if (!stats.startTime || !achievementStoreHydrated) return;

    const currentElapsed = Math.max(0, Date.now() - new Date(stats.startTime).getTime());
    const missedAchievements = getNewlyUnlockedAchievements(currentElapsed, lastCheckedElapsedTime);

    if (missedAchievements.length > 0) {
      celebrate(missedAchievements);
    }

    setLastCheckedElapsedTime(currentElapsed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.startTime, achievementStoreHydrated]);

  // While the app is open: useJourneyStats re-renders exactly when a stage is reached
  const liveCheckRef = useRef<{ startTime: string | null; elapsed: number }>({ startTime: null, elapsed: 0 });
  useEffect(() => {
    if (!stats.startTime) return;

    const elapsed = Math.max(0, stats.now - new Date(stats.startTime).getTime());
    const previous = liveCheckRef.current;

    // A new streak (relapse, undo or edit) starts fresh without replaying milestones
    if (previous.startTime === stats.startTime) {
      const unlocked = getNewlyUnlockedAchievements(elapsed, previous.elapsed);
      if (unlocked.length > 0) {
        celebrate(unlocked);
        setLastCheckedElapsedTime(elapsed);
      }
    }

    liveCheckRef.current = { startTime: stats.startTime, elapsed };
  }, [stats.startTime, stats.now, celebrate, setLastCheckedElapsedTime]);

  // Stats grid. Uses the real journey start (not the latest relapse) so the first streak counts
  const userStats = useMemo(
    () => calculateUserStats(relapses, journeyStartTime, activities),
    // `today` and `stats.now` refresh day counts at midnight and on stage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [relapses, journeyStartTime, activities, today, stats.now]
  );

  // Furthest stage reached by any finished streak, for "Back at ..." messages
  const bestPastStageIndex = useMemo(() => {
    if (relapses.length === 0) return -1;
    const bestPastMs = longestPastStreakMs(computeStreaks(relapses, journeyStartTime));
    return GROWTH_STAGES.indexOf(getGrowthStage(bestPastMs));
  }, [relapses, journeyStartTime]);

  const celebrationNote = useMemo(() => {
    if (!celebrationAchievement || bestPastStageIndex < 0) return undefined;
    const index = GROWTH_STAGES.findIndex((s) => s.id === celebrationAchievement.id);
    if (index < 0) return undefined;
    const stage = GROWTH_STAGES[index];
    const best = GROWTH_STAGES[bestPastStageIndex];
    if (bestPastStageIndex > index) {
      return `Back at ${stage.emoji} ${stage.label}. Your best is ${best.emoji} ${best.label}.`;
    }
    if (bestPastStageIndex === index) {
      const next = GROWTH_STAGES[index + 1];
      return next ? `You've matched your best. ${next.emoji} ${next.label} would be new ground.` : undefined;
    }
    return 'New personal best! 🌱';
  }, [celebrationAchievement, bestPastStageIndex]);

  const handleRelapsePress = () => {
    setShowModal(true);
  };

  const handleActivityPress = (categories: string[] = []) => {
    setPreSelectedCategories(categories);
    setShowActivityModal(true);
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  // "Not yet" on the relapse check-in: swap to the urge help screen
  const handleNeedUrgeHelp = () => {
    setShowModal(false);
    setTimeout(() => setShowHelpModal(true), MODAL_HANDOFF_DELAY_MS);
  };

  const handleActivityModalClose = () => {
    setShowActivityModal(false);
    setPreSelectedCategories([]); // Reset pre-selected categories
  };

  const handleCelebrationClose = () => {
    // Remove the current achievement from the queue and show next one
    setPendingAchievements(prev => {
      const remaining = prev.slice(1);

      if (remaining.length > 0) {
        // Show next achievement
        setCelebrationAchievement(remaining[0]);
      } else {
        // No more achievements to show
        setCelebrationAchievement(null);
      }

      return remaining;
    });
  };

  const stageChangedSinceMount = stats.growthStage.id !== initialStageIdRef.current;

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4 ml-1">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0">
              <Text className="text-2xl font-semibold tracking-wide text-fg">
                {stats.growthStage.achievementTitle}
              </Text>
              <Reanimated.Text
                key={stats.growthStage.id}
                entering={stageChangedSinceMount && !reducedMotion ? ZoomIn.springify().damping(9) : undefined}
                style={{ fontSize: 24, lineHeight: 32 }}
              >
                {stats.growthStage.emoji}
              </Reanimated.Text>
            </View>
            <Text className="pr-2 mt-0 text-sm tracking-wide font-regular text-primary-ink">
              {stats.growthStage.description}
            </Text>
          </View>

          {/* Emergency Help Button. Icon only; the label tells screen readers what it does */}
          <Pressable
            onPress={handleHelpPress}
            className="items-center justify-center w-14 h-14 rounded-2xl bg-urge-soft active:scale-95"
            accessibilityLabel="Having an urge? Get help"
            accessibilityHint="Opens crisis resources and coping strategies"
            accessibilityRole="button"
          >
            <AlertCircle size={26} color={colors.urge} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Hero Section - Journey Timer Card */}
        <View className="py-6 -mt-4">
          {stats.startTime && <JourneyTimerCard startTime={stats.startTime} />}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-6">
            {/* Log a win - Primary Action */}
            <Pressable
              onPress={() => handleActivityPress()}
              style={cardShadow}
              className="flex-1 border bg-primary border-primary rounded-2xl"
              accessibilityRole="button"
            >
              <View className="items-center px-4 py-6">
                <View className="items-center justify-center mb-3 rounded-lg w-14 h-14">
                  <Sprout size={40} color={colors.onPrimary} strokeWidth={2} />
                </View>
                <Text className="mb-0 text-base font-bold text-center text-primary-on">
                  Log a win
                </Text>
                <Text className="text-xs text-center font-regular text-primary-on/85">
                  Something healthy you did
                </Text>
              </View>
            </Pressable>

            {/* Record Relapse - Secondary Action */}
            <Pressable
              onPress={handleRelapsePress}
              style={cardShadow}
              className="flex-1 border bg-surface border-border rounded-2xl"
              accessibilityRole="button"
            >
              <View className="items-center px-4 py-6">
                <View className="items-center justify-center mb-3 w-14 h-14 rounded-xl bg-primary-soft">
                  <RotateCcw size={28} color={colors.primary} strokeWidth={2.5} />
                </View>
                <Text className="mb-1 text-base font-bold text-center text-fg">
                  Log Relapse
                </Text>
                <Text className="text-xs text-center text-muted font-regular">
                  Track what happened
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <TrendingUp size={20} strokeWidth={2.5} color={colors.primary} />
              <Text className="text-lg font-semibold text-fg">
                Keep growing
              </Text>
            </View>
          </View>

          <View className="flex-row gap-6 mb-6">
            <StatTile
              label="Days kept"
              value={userStats.daysKept}
              color={colors.primary}
              valueClass="text-primary-ink"
              chip="Never resets"
              watermark={<CalendarCheck size={70} color={colors.primary} strokeWidth={2} />}
            />
            <StatTile
              label="Best streak"
              value={userStats.bestStreak}
              unit={userStats.bestStreak === 1 ? 'day' : 'days'}
              color={colors.relapse}
              valueClass="text-relapse"
              unitClass="text-relapse/80"
              watermark={<StageWatermark ms={userStats.bestStreakMs} />}
            />
          </View>

          <View className="flex-row gap-6">
            <StatTile
              label="Wins logged"
              value={userStats.activitiesLogged}
              color={colors.info}
              valueClass="text-info"
              watermark={<Sparkles size={70} color={colors.info} strokeWidth={2} />}
            />
            <StatTile
              label="Avg streak"
              value={userStats.averageStreak}
              unit={userStats.averageStreak === 1 ? 'day' : 'days'}
              color={colors.plum}
              valueClass="text-plum"
              unitClass="text-plum/80"
              watermark={<StageWatermark ms={userStats.averageStreakMs} />}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActions onActionPress={handleActivityPress} />

        {/* Stoic Wisdom */}
        <StoicWisdomCard />

        {/* Relapse Modal */}
        <Modal
          visible={showModal}
          animationType={reducedMotion ? 'none' : 'slide'}
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <RelapseModal onClose={() => setShowModal(false)} onNeedUrgeHelp={handleNeedUrgeHelp} />
        </Modal>

        {/* Activity Modal */}
        <Modal
          visible={showActivityModal}
          animationType={reducedMotion ? 'none' : 'slide'}
          presentationStyle="pageSheet"
          onRequestClose={handleActivityModalClose}
        >
          <ActivityModal
            onClose={handleActivityModalClose}
            preSelectedCategories={preSelectedCategories}
          />
        </Modal>

        {/* Emergency Help Modal */}
        <Modal
          visible={showHelpModal}
          animationType={reducedMotion ? 'none' : 'slide'}
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <EmergencyHelpModal onClose={() => setShowHelpModal(false)} />
        </Modal>

        {/* Achievement Celebration Modal (milestones of a day and up) */}
        <AchievementCelebration
          achievement={celebrationAchievement}
          visible={!!celebrationAchievement}
          onClose={handleCelebrationClose}
          note={celebrationNote}
        />
      </ScrollView>
    </View>
  );
}

// Memoize to prevent unnecessary re-renders on tab switches
export default memo(DashboardScreen);
