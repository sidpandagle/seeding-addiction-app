import { View, Text, Pressable, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import Animated, { FadeInDown, SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { setJourneyStart, getJourneyStart } from '../src/db/helpers';
import { useColorScheme } from '../src/stores/themeStore';
import { Shield, Lock, TrendingUp, Heart, ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type JourneyStartMode = 'now' | 'custom';
type NavigationDirection = 'forward' | 'backward';

// Progress Dots Component
const ProgressDots = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <View className="flex-row justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        className="w-2 h-2 transition-colors rounded-full"
        style={{
          backgroundColor: index === currentStep ? '#10b981' : index < currentStep ? '#6ee7b7' : '#d1d5db'
        }}
      />
    ))}
  </View>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState<NavigationDirection>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Journey setup state
  const [isLoading, setIsLoading] = useState(false);
  const [startMode, setStartMode] = useState<JourneyStartMode>('now');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
        // First time user - set journey start timestamp based on mode
        const journeyStartTimestamp = startMode === 'now'
          ? new Date().toISOString()
          : customStartDate.toISOString();

        await setJourneyStart(journeyStartTimestamp);
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

  // Date/Time picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCustomStartDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDateTime = new Date(customStartDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      newDateTime.setSeconds(0);
      setCustomStartDate(newDateTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStartModeChange = async (mode: JourneyStartMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartMode(mode);
  };

  // Features data
  const features = [
    {
      icon: Shield,
      color: '#3b82f6',
      bgColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
      title: 'Track Your Journey',
      description: 'Monitor your progress with real-time tracking and growth milestones'
    },
    {
      icon: Lock,
      color: '#8b5cf6',
      bgColor: colorScheme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
      title: 'Complete Privacy',
      description: 'All your data stays on your device. No cloud, no tracking'
    },
    {
      icon: TrendingUp,
      color: '#10b981',
      bgColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
      title: 'Insights & Analytics',
      description: 'Understand patterns and celebrate achievements along the way'
    },
    {
      icon: Heart,
      color: '#ef4444',
      bgColor: colorScheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      title: 'Emergency Support',
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

      <Text className="mb-4 text-5xl font-bold text-center text-gray-900 dark:text-white">
        Welcome to{'\n'}Seeding
      </Text>

      <Text className="mb-6 text-lg text-center font-regular text-emerald-700 dark:text-emerald-400">
        Your personal growth companion
      </Text>

      <Text className="mb-2 text-base text-center text-gray-600 dark:text-gray-400 font-regular">
        Track, learn, and grow every day
      </Text>

      <Text className="max-w-sm text-base text-center text-gray-600 dark:text-gray-400 font-regular">
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
        <Text className="mb-3 text-3xl font-bold text-center text-gray-900 dark:text-white">
          Everything you need{'\n'}to succeed
        </Text>

        <Text className="mb-5 text-base text-center text-gray-600 dark:text-gray-400 font-regular">
          Privacy-first tools for lasting change
        </Text>

        {/* Benefit Badges */}
        <View className="flex-row flex-wrap justify-center gap-2 mb-6">
          <View className="flex-row items-center px-3 py-2 border rounded-full bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700">
            <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ 100% Private</Text>
          </View>
          <View className="flex-row items-center px-3 py-2 border rounded-full bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700">
            <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ No Account Needed</Text>
          </View>
          <View className="flex-row items-center px-3 py-2 border rounded-full bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700">
            <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ Offline First</Text>
          </View>
        </View>

        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.duration(400).delay(index * 100)}
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="p-5 mb-3 border border-white dark:border-gray-900 rounded-2xl"
            >
              <View className="flex-row items-start">
                <View
                  style={{ backgroundColor: feature.bgColor }}
                  className="items-center justify-center w-12 h-12 mr-4 rounded-xl"
                >
                  <Icon size={24} color={feature.color} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-gray-600 font-regular dark:text-gray-400">
                    {feature.description}
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  // Step 3: Journey Setup
  const renderJourneySetupStep = () => (
    <Animated.View
      key="step-setup"
      entering={enteringAnimation}
      exiting={exitingAnimation}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pb-8"
        >
          <Text className="mb-3 text-3xl font-bold text-center text-gray-900 dark:text-white">
            When did you start{'\n'}your recovery journey?
          </Text>

          <Text className="mb-6 text-sm text-center text-gray-600 dark:text-gray-400 font-regular">
            Setting your start date helps us calculate your progress accurately
          </Text>

          {/* Mode Selection Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => handleStartModeChange('now')}
              className="flex-1"
            >
              <View
                style={{
                  backgroundColor: startMode === 'now'
                    ? '#10b981'
                    : (colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'),
                  borderWidth: 2,
                  borderColor: startMode === 'now' ? '#10b981' : (colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
                }}
                className="p-4 rounded-xl"
              >
                <Text
                  className="text-sm font-bold text-center"
                  style={{
                    color: startMode === 'now'
                      ? '#ffffff'
                      : (colorScheme === 'dark' ? '#6ee7b7' : '#059669')
                  }}
                >
                  Just now
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleStartModeChange('custom')}
              className="flex-1"
            >
              <View
                style={{
                  backgroundColor: startMode === 'custom'
                    ? '#10b981'
                    : (colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'),
                  borderWidth: 2,
                  borderColor: startMode === 'custom' ? '#10b981' : (colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
                }}
                className="p-4 rounded-xl"
              >
                <Text
                  className="text-sm font-bold text-center"
                  style={{
                    color: startMode === 'custom'
                      ? '#ffffff'
                      : (colorScheme === 'dark' ? '#6ee7b7' : '#059669')
                  }}
                >
                  I already started
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Encouraging Message for "Just now" */}
          {startMode === 'now' && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="p-5 mb-6 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-2xl"
            >
              <Text className="mb-2 text-lg font-bold text-center text-emerald-700 dark:text-emerald-300">
                Great! Your journey begins today
              </Text>
              <Text className="text-base font-semibold text-center text-emerald-600 dark:text-emerald-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text className="mt-3 text-sm text-center text-emerald-700 dark:text-emerald-400 font-regular">
                Every journey starts with a single step. You're taking that step right now.
              </Text>
            </Animated.View>
          )}

          {/* Custom Date/Time Pickers */}
          {startMode === 'custom' && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="gap-3 mb-6"
            >
              {/* Date Picker Button */}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}
                className="flex-row items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <View className="flex-row items-center flex-1">
                  <View
                    style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe' }}
                    className="items-center justify-center w-10 h-10 mr-3 rounded-lg"
                  >
                    <Calendar size={20} color="#3b82f6" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-regular">
                      Date
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatDate(customStartDate)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              </Pressable>

              {/* Time Picker Button */}
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}
                className="flex-row items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <View className="flex-row items-center flex-1">
                  <View
                    style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe' }}
                    className="items-center justify-center w-10 h-10 mr-3 rounded-lg"
                  >
                    <Clock size={20} color="#8b5cf6" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-regular">
                      Time
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatTime(customStartDate)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              </Pressable>

              {/* Date Picker Modal */}
              {showDatePicker && (
                <DateTimePicker
                  value={customStartDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date('2000-01-01')}
                  themeVariant={colorScheme}
                />
              )}

              {/* Time Picker Modal */}
              {showTimePicker && (
                <DateTimePicker
                  value={customStartDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                  themeVariant={colorScheme}
                />
              )}
            </Animated.View>
          )}

          {/* Privacy Note Card */}
          <View
            className="p-4 mt-0 border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 rounded-2xl"
          >
            <View className="flex-row items-center justify-center mb-2">
              <Shield size={20} color="#10b981" strokeWidth={2.5} />
              <Text className="ml-2 text-base font-bold text-emerald-700 dark:text-emerald-300">
                100% Private & Secure
              </Text>
            </View>
            <Text className="text-sm text-center text-emerald-700 dark:text-emerald-400 font-regular">
              Your data stays secure on your device.{'\n'}No account required.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
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

      {/* Navigation Buttons */}
      <View className="px-6 pt-4 pb-8 bg-gray-50 dark:bg-gray-950">
        <View className={`flex-row items-center ${currentStep === 0 ? 'justify-center' : 'justify-between gap-4'}`}>
          {/* Back Button */}
          {currentStep > 0 && (
            <Pressable
              onPress={goToPreviousStep}
              disabled={isTransitioning || isLoading}
              className="flex-row items-center px-6 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-2xl active:opacity-70 active:scale-98 disabled:opacity-30"
              style={{
                backgroundColor: colorScheme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.8)'
              }}
            >
              <ChevronLeft size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <Text className="ml-1 text-base font-semibold text-gray-600 dark:text-gray-400">
                Back
              </Text>
            </Pressable>
          )}

          {/* Next/Continue/Start Button */}
          <AnimatedPressable
            onPress={goToNextStep}
            disabled={isTransitioning || isLoading}
            className={`flex-row items-center justify-center py-5 px-6 bg-emerald-600 rounded-2xl active:opacity-90 active:scale-98 disabled:opacity-50 ${currentStep === 0 ? 'w-full' : 'flex-1 max-w-xs'}`}
            style={{
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text
                  className="mr-2 text-lg font-bold text-white"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {getButtonText()}
                </Text>
                <ChevronRight size={24} color="#ffffff" strokeWidth={2.5} />
              </>
            )}
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}
