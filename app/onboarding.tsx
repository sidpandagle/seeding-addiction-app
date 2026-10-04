import { View, Text, Pressable, ActivityIndicator, ScrollView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import Animated, { FadeInDown, SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { setJourneyStart, getJourneyStart } from '../src/db/helpers';
import { useAchievementStore } from '../src/stores/achievementStore';
import { useColorScheme } from '../src/stores/themeStore';
import { useThemeColors, useCardShadow } from '../src/hooks/useThemeColors';
import { Shield, Lock, TrendingUp, Heart, ChevronRight, ChevronLeft, CalendarDays, Check, Sprout } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NavigationDirection = 'forward' | 'backward';
type StartMode = 'today' | 'earlier';

// How far back a journey start can be set
const EARLIEST_START_YEARS = 5;

function earliestStartDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - EARLIEST_START_YEARS);
  return d;
}

/** Yesterday at 9:00 PM, a sensible first guess for "I started earlier" */
function defaultEarlierStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(21, 0, 0, 0);
  return d;
}

function withDate(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

function withTime(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

/** Never later than now: a picked time later today is pulled back to the current moment */
function clampToNow(date: Date): Date {
  const now = Date.now();
  return date.getTime() > now ? new Date(now) : date;
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatStartTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Calendar days back from today: yesterday 9 PM is "Yesterday", even if under 24 hours ago */
function daysAgoLabel(date: Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / (24 * 60 * 60 * 1000));
  if (days < 1) return 'Earlier today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

// Progress Dots Component
const ProgressDots = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <View className="flex-row justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        className={`w-2 h-2 transition-colors rounded-full ${
          index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/45' : 'bg-border-strong'
        }`}
      />
    ))}
  </View>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState<NavigationDirection>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Journey setup state
  const [isLoading, setIsLoading] = useState(false);
  const [startMode, setStartMode] = useState<StartMode>('today');
  const [customStart, setCustomStart] = useState<Date>(defaultEarlierStart);
  // Android shows date and time as separate dialogs, one after the other
  const [androidPicker, setAndroidPicker] = useState<'date' | 'time' | null>(null);

  const totalSteps = 3;

  // Navigation handlers
  const goToNextStep = async () => {
    if (isTransitioning) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTransitioning(true);
    setNavigationDirection('forward');

    if (currentStep < totalSteps - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 50);
    } else {
      // Final step - start journey
      handleStartJourney();
    }
  };

  const goToPreviousStep = async () => {
    if (isTransitioning) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTransitioning(true);
    setNavigationDirection('backward');

    if (currentStep > 0) {
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 50);
    }
  };

  const handleStartJourney = async () => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Check if journey has already started
      const existingJourneyStart = await getJourneyStart();

      if (!existingJourneyStart) {
        // First time user - start now, or at the date they picked
        const start = startMode === 'earlier' ? clampToNow(customStart) : new Date();
        await setJourneyStart(start.toISOString());

        // Milestones already passed by a backdated start count as reached,
        // without replaying a celebration for each one on the first Home visit
        if (startMode === 'earlier') {
          useAchievementStore.getState().setLastCheckedElapsedTime(Math.max(0, Date.now() - start.getTime()));
        }
      }

      // Wait a small amount to ensure database transaction is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to start journey:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)/home');
    } finally {
      setIsLoading(false);
    }
  };


  const chooseStartMode = (mode: StartMode) => {
    if (mode === startMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartMode(mode);
  };

  const handleAndroidPick = (event: DateTimePickerEvent, picked?: Date) => {
    const current = androidPicker;
    setAndroidPicker(null);
    if (event.type !== 'set' || !picked) return;
    if (current === 'date') {
      setCustomStart((d) => clampToNow(withDate(d, picked)));
      setAndroidPicker('time'); // then ask for the time
    } else {
      setCustomStart((d) => clampToNow(withTime(d, picked)));
    }
  };

  const handleIosPick = (_event: DateTimePickerEvent, picked?: Date) => {
    if (picked) setCustomStart(clampToNow(picked));
  };

  // Features data
  const features = [
    {
      icon: Sprout,
      title: 'Track your journey',
      description: 'Monitor your progress with real-time tracking and growth milestones'
    },
    {
      icon: Lock,
      title: 'Complete privacy',
      description: 'All your data stays on your device. No cloud, no tracking'
    },
    {
      icon: TrendingUp,
      title: 'Insights & analytics',
      description: 'Understand patterns and celebrate achievements along the way'
    },
    {
      icon: Heart,
      title: 'Support in hard moments',
      description: 'Access helpful resources when you need them most'
    }
  ];

  // Animation variants based on direction
  const enteringAnimation = navigationDirection === 'forward'
    ? SlideInRight.duration(300)
    : SlideInLeft.duration(300);

  const exitingAnimation = navigationDirection === 'forward'
    ? SlideOutLeft.duration(300)
    : SlideOutRight.duration(300);

  // Get button text based on step
  const getButtonText = () => {
    if (currentStep === 0) return "Let's Begin";
    if (currentStep === 1) return 'Continue';
    return 'Start Your Journey';
  };

  // Step 1: Welcome Screen
  const renderWelcomeStep = () => (
    <Animated.View
      key="step-welcome"
      entering={enteringAnimation}
      exiting={exitingAnimation}
      className="items-center justify-center flex-1 px-6"
    >
      <Image
        source={require('../assets/app-icon.png')}
        style={{
          width: 96,
          height: 96,
          marginBottom: 32,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
        resizeMode="contain"
      />

      <Text className="mb-4 text-5xl font-bold text-center text-fg">
        Welcome to{'\n'}Seeding
      </Text>

      <Text className="mb-6 text-lg text-center font-regular text-primary-ink">
        Your personal growth companion
      </Text>

      <Text className="mb-2 text-base text-center text-muted font-regular">
        Track, learn, and grow every day
      </Text>

      <Text className="max-w-sm text-base text-center text-muted font-regular">
        A privacy-first app to help you track your recovery journey, celebrate milestones, and build lasting change.
      </Text>
    </Animated.View>
  );

  // Step 2: Features Overview
  const renderFeaturesStep = () => (
    <Animated.View
      key="step-features"
      entering={enteringAnimation}
      exiting={exitingAnimation}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pb-8"
      >
        <Text className="mb-3 text-3xl font-bold text-center text-fg">
          Everything you need{'\n'}to succeed
        </Text>

        <Text className="mb-5 text-base text-center text-muted font-regular">
          Privacy-first tools for lasting change
        </Text>

        {/* Benefit Badges */}
        <View className="flex-row flex-wrap justify-center gap-2 mb-6">
          {['100% private', 'No account needed', 'Works offline'].map((label) => (
            <View key={label} className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-subtle">
              <Check size={14} color={colors.primary} strokeWidth={3} />
              <Text className="text-sm font-semibold text-body">{label}</Text>
            </View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(400)} style={cardShadow} className="rounded-[20px]">
          <View className="overflow-hidden border bg-surface border-border rounded-[20px]">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View
                  key={feature.title}
                  className={`flex-row items-center gap-3 px-4 py-4 ${index === 0 ? '' : 'border-t border-border'}`}
                >
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                    <Icon size={20} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-fg">{feature.title}</Text>
                    <Text className="text-sm text-muted font-regular">{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );

  // Step 3: Journey Setup
  const renderJourneySetupStep = () => (
    <Animated.View
      key="step-setup"
      entering={enteringAnimation}
      exiting={exitingAnimation}
      className="items-center justify-center flex-1 px-6"
    >
      <Text className="mb-3 text-3xl font-bold text-center text-fg">
        Ready to start{'\n'}your journey?
      </Text>

      <Text className="mb-8 text-base text-center text-muted font-regular">
        Start today, or pick the day you already began
      </Text>

      {/* Start date */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={cardShadow}
        className="w-full p-5 mb-6 border bg-surface border-border rounded-[20px]"
      >
        <View className="flex-row gap-1 p-1 mb-4 rounded-2xl bg-subtle" accessibilityRole="radiogroup">
          {([
            { value: 'today', label: 'Today' },
            { value: 'earlier', label: 'Earlier date' },
          ] as const).map(({ value, label }) => {
            const selected = startMode === value;
            return (
              <Pressable
                key={value}
                onPress={() => chooseStartMode(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={selected ? cardShadow : undefined}
                className={`items-center justify-center flex-1 h-11 rounded-xl ${selected ? 'bg-surface' : ''}`}
              >
                <Text className={`text-base ${selected ? 'font-bold text-fg' : 'font-semibold text-muted'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {startMode === 'today' ? (
          <>
            <Text className="text-xl font-bold text-center text-fg">Your journey begins today</Text>
            <Text className="mt-1 text-base font-semibold text-center text-primary-ink">
              {formatLongDate(new Date())}
            </Text>
            <Text className="mt-3 text-sm text-center text-muted font-regular">
              Every journey starts with a single step. You're taking that step right now.
            </Text>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-3">
              <View className="items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                <CalendarDays size={20} color={colors.primary} strokeWidth={2.25} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-fg">{formatLongDate(customStart)}</Text>
                <Text className="font-regular text-sm text-muted">
                  {formatStartTime(customStart)} · {daysAgoLabel(customStart)}
                </Text>
              </View>
            </View>

            {Platform.OS === 'ios' ? (
              <View className="flex-row items-center justify-between mt-4">
                <Text className="text-sm font-semibold text-muted">Started on</Text>
                <DateTimePicker
                  value={customStart}
                  mode="datetime"
                  display="compact"
                  maximumDate={new Date()}
                  minimumDate={earliestStartDate()}
                  onChange={handleIosPick}
                  accentColor={colors.primary}
                />
              </View>
            ) : (
              <View className="flex-row gap-2 mt-4">
                <Pressable
                  onPress={() => setAndroidPicker('date')}
                  accessibilityRole="button"
                  className="items-center flex-1 py-3 border rounded-xl border-border-strong active:bg-subtle"
                >
                  <Text className="text-sm font-bold text-primary-ink">Change date</Text>
                </Pressable>
                <Pressable
                  onPress={() => setAndroidPicker('time')}
                  accessibilityRole="button"
                  className="items-center flex-1 py-3 border rounded-xl border-border-strong active:bg-subtle"
                >
                  <Text className="text-sm font-bold text-primary-ink">Change time</Text>
                </Pressable>
              </View>
            )}

            <Text className="mt-3 text-sm text-muted font-regular">
              Your timer counts from this moment, and milestones you've already passed show as reached.
            </Text>
          </>
        )}
      </Animated.View>

      {/* Privacy Note Card */}
      <View className="flex-row items-center w-full gap-3 px-4 py-3.5 rounded-2xl bg-subtle">
        <Shield size={20} color={colors.primary} strokeWidth={2.5} />
        <Text className="font-regular flex-1 text-sm text-body">
          <Text className="font-bold text-fg">100% private. </Text>
          Your data stays on your device. No account required.
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Progress Indicator */}
      <View className="pt-16">
        <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {/* Step Content */}
      <View className="flex-1">
        {currentStep === 0 && renderWelcomeStep()}
        {currentStep === 1 && renderFeaturesStep()}
        {currentStep === 2 && renderJourneySetupStep()}
      </View>

      {/* Android date, then time, for an earlier start */}
      {androidPicker && (
        <DateTimePicker
          key={androidPicker}
          value={customStart}
          mode={androidPicker}
          display="default"
          maximumDate={new Date()}
          minimumDate={earliestStartDate()}
          onChange={handleAndroidPick}
        />
      )}

      {/* Navigation Buttons */}
      <View className="px-6 pt-4 pb-8 bg-bg">
        <View className={`flex-row items-center ${currentStep === 0 ? 'justify-center' : 'justify-between gap-4'}`}>
          {/* Back Button */}
          {currentStep > 0 && (
            <Pressable
              onPress={goToPreviousStep}
              disabled={isTransitioning || isLoading}
              className="flex-row items-center px-5 py-4 border bg-surface border-border-strong rounded-2xl active:bg-subtle disabled:opacity-30"
            >
              <ChevronLeft size={20} color={colors.muted} />
              <Text className="ml-1 text-base font-bold text-body">
                Back
              </Text>
            </Pressable>
          )}

          {/* Next/Continue/Start Button */}
          <AnimatedPressable
            onPress={goToNextStep}
            disabled={isTransitioning || isLoading}
            className={`flex-row items-center justify-center py-4 px-6 bg-primary rounded-2xl active:bg-primary-ink disabled:opacity-50 ${currentStep === 0 ? 'w-full' : 'flex-1 max-w-xs'}`}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text
                  className="mr-2 text-lg font-bold text-primary-on"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {getButtonText()}
                </Text>
                <ChevronRight size={24} color={colors.onPrimary} strokeWidth={2.5} />
              </>
            )}
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}
